// pubspec.yaml
//   camera: ^0.11.0
//   google_mlkit_face_detection: ^0.13.0
//
// Android: minSdk 21, and the ML Kit face model adds ~few MB (or use the
// unbundled model to download on demand).
// iOS: add NSCameraUsageDescription to Info.plist.

import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

/// Why the shutter hasn't fired yet. Drives the hint text and frame colour.
enum FaceGuide {
  noCamera,
  searching,
  multipleFaces,
  tooFar,
  tooClose,
  offCentre,
  turned,
  eyesClosed,
  holdStill,
  captured,
}

extension FaceGuideText on FaceGuide {
  String get hint {
    switch (this) {
      case FaceGuide.noCamera:
        return 'Camera unavailable';
      case FaceGuide.searching:
        return 'Position your face in the oval';
      case FaceGuide.multipleFaces:
        return 'Only one face in the frame';
      case FaceGuide.tooFar:
        return 'Move a little closer';
      case FaceGuide.tooClose:
        return 'Move back slightly';
      case FaceGuide.offCentre:
        return 'Centre your face in the oval';
      case FaceGuide.turned:
        return 'Look straight at the camera';
      case FaceGuide.eyesClosed:
        return 'Keep your eyes open';
      case FaceGuide.holdStill:
        return 'Hold still…';
      case FaceGuide.captured:
        return 'Got it';
    }
  }

  bool get isReady => this == FaceGuide.holdStill || this == FaceGuide.captured;
}

/// Runs face detection on the preview stream and fires the capture itself
/// once the face has been correctly framed for [requiredStableFrames] in a row.
class FaceScanController extends ChangeNotifier {
  FaceScanController({
    this.requiredStableFrames = 10,
    this.ovalRatio = 1.35,
    // Face height as a fraction of the frame height. Widen this band if
    // people keep getting told to move.
    this.minFaceHeight = 0.30,
    this.maxFaceHeight = 0.62,
    this.centreTolerance = 0.11,
    this.maxHeadAngle = 14,
    this.onCaptured,
  });

  final int requiredStableFrames;
  final double ovalRatio;
  final double minFaceHeight;
  final double maxFaceHeight;
  final double centreTolerance;
  final double maxHeadAngle;
  final ValueChanged<XFile>? onCaptured;

  final FaceDetector _detector = FaceDetector(
    options: FaceDetectorOptions(
      // Fast mode is what you want on a live stream — accurate mode drops
      // the frame rate hard on mid-range Android.
      performanceMode: FaceDetectorMode.fast,
      enableClassification: true, // eye-open probabilities
      enableTracking: true,
      minFaceSize: 0.15,
    ),
  );

  CameraController? _camera;
  CameraController? get camera => _camera;

  FaceGuide _status = FaceGuide.searching;
  FaceGuide get status => _status;

  int _stable = 0;
  double get progress => (_stable / requiredStableFrames).clamp(0.0, 1.0);

  XFile? photo;

  bool _busy = false; // a frame is mid-detection
  bool _capturing = false;
  bool _disposed = false;
  CameraDescription? _description;

  Future<void> init() async {
    final cameras = await availableCameras();
    if (cameras.isEmpty) return _set(FaceGuide.noCamera);

    _description = cameras.firstWhere(
      (c) => c.lensDirection == CameraLensDirection.front,
      orElse: () => cameras.first,
    );

    final controller = CameraController(
      _description!,
      ResolutionPreset.high,
      enableAudio: false,
      // nv21 on Android and bgra8888 on iOS are the two formats ML Kit takes
      // directly, which skips any manual YUV plane juggling.
      imageFormatGroup: Platform.isAndroid
          ? ImageFormatGroup.nv21
          : ImageFormatGroup.bgra8888,
    );

    await controller.initialize();
    if (_disposed) {
      await controller.dispose();
      return;
    }
    _camera = controller;
    notifyListeners();

    await controller.startImageStream(_onFrame);
  }

  Future<void> _onFrame(CameraImage image) async {
    if (_busy || _capturing || _disposed) return;
    _busy = true;
    try {
      final input = _toInputImage(image);
      if (input == null) return;
      final faces = await _detector.processImage(input);
      _evaluate(faces, input.metadata!.size, input.metadata!.rotation);
    } catch (e) {
      debugPrint('face detection failed: $e');
    } finally {
      _busy = false;
    }
  }

  void _evaluate(
      List<Face> faces, Size imageSize, InputImageRotation rotation) {
    if (faces.isEmpty) return _reset(FaceGuide.searching);
    if (faces.length > 1) return _reset(FaceGuide.multipleFaces);

    final face = faces.first;

    // ML Kit reports coordinates in the *rotated* image, so swap the
    // dimensions when the sensor is sideways.
    final upright = rotation == InputImageRotation.rotation90deg ||
            rotation == InputImageRotation.rotation270deg
        ? Size(imageSize.height, imageSize.width)
        : imageSize;

    final box = face.boundingBox;
    var cx = box.center.dx / upright.width;
    final cy = box.center.dy / upright.height;
    final faceHeight = box.height / upright.height;

    // The front preview is mirrored on screen; mirror x so "off to the left"
    // matches what the user sees.
    if (_description?.lensDirection == CameraLensDirection.front) {
      cx = 1 - cx;
    }

    final yaw = face.headEulerAngleY ?? 0;
    final roll = face.headEulerAngleZ ?? 0;
    if (yaw.abs() > maxHeadAngle || roll.abs() > maxHeadAngle) {
      return _reset(FaceGuide.turned);
    }

    final left = face.leftEyeOpenProbability;
    final right = face.rightEyeOpenProbability;
    if ((left != null && left < 0.35) || (right != null && right < 0.35)) {
      return _reset(FaceGuide.eyesClosed);
    }

    // Distance from centre, measured against the oval: the vertical axis is
    // longer, so it gets proportionally more slack.
    final dx = (cx - 0.5) / centreTolerance;
    final dy = (cy - 0.5) / (centreTolerance * ovalRatio);
    if (dx * dx + dy * dy > 1) return _reset(FaceGuide.offCentre);

    if (faceHeight < minFaceHeight) return _reset(FaceGuide.tooFar);
    if (faceHeight > maxFaceHeight) return _reset(FaceGuide.tooClose);

    _stable++;
    _set(FaceGuide.holdStill);
    if (_stable >= requiredStableFrames) _capture();
  }

  void _reset(FaceGuide status) {
    _stable = 0;
    _set(status);
  }

  void _set(FaceGuide status) {
    if (_status == status && _status != FaceGuide.holdStill) return;
    _status = status;
    if (!_disposed) notifyListeners();
  }

  Future<void> _capture() async {
    final controller = _camera;
    if (controller == null || _capturing) return;
    _capturing = true;
    try {
      HapticFeedback.mediumImpact();
      // Stop the stream first — takePicture while streaming throws on
      // several Android devices.
      await controller.stopImageStream();
      photo = await controller.takePicture();
      _set(FaceGuide.captured);
      if (photo != null) onCaptured?.call(photo!);
    } catch (e) {
      debugPrint('capture failed: $e');
      _capturing = false;
      _reset(FaceGuide.searching);
      if (!controller.value.isStreamingImages) {
        await controller.startImageStream(_onFrame);
      }
    }
  }

  /// Discard the shot and go back to scanning (for a "Retake" button).
  Future<void> retake() async {
    photo = null;
    _capturing = false;
    _reset(FaceGuide.searching);
    final controller = _camera;
    if (controller != null && !controller.value.isStreamingImages) {
      await controller.startImageStream(_onFrame);
    }
  }

  InputImage? _toInputImage(CameraImage image) {
    final description = _description;
    final controller = _camera;
    if (description == null || controller == null) return null;

    final rotation = _rotationFor(description, controller);
    if (rotation == null) return null;

    final format = InputImageFormatValue.fromRawValue(image.format.raw);
    if (format == null) return null;
    if (Platform.isAndroid && format != InputImageFormat.nv21) return null;
    if (Platform.isIOS && format != InputImageFormat.bgra8888) return null;
    if (image.planes.length != 1) return null;

    return InputImage.fromBytes(
      bytes: image.planes.first.bytes,
      metadata: InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: rotation,
        format: format,
        bytesPerRow: image.planes.first.bytesPerRow,
      ),
    );
  }

  static const _orientations = {
    DeviceOrientation.portraitUp: 0,
    DeviceOrientation.landscapeLeft: 90,
    DeviceOrientation.portraitDown: 180,
    DeviceOrientation.landscapeRight: 270,
  };

  InputImageRotation? _rotationFor(
      CameraDescription description, CameraController controller) {
    if (Platform.isIOS) {
      return InputImageRotationValue.fromRawValue(
          description.sensorOrientation);
    }
    final device = _orientations[controller.value.deviceOrientation];
    if (device == null) return null;
    final rotation = description.lensDirection == CameraLensDirection.front
        ? (description.sensorOrientation + device) % 360
        : (description.sensorOrientation - device + 360) % 360;
    return InputImageRotationValue.fromRawValue(rotation);
  }

  @override
  void dispose() {
    _disposed = true;
    final controller = _camera;
    _camera = null;
    () async {
      if (controller != null) {
        if (controller.value.isStreamingImages) {
          await controller.stopImageStream();
        }
        await controller.dispose();
      }
      await _detector.close();
    }();
    super.dispose();
  }
}
