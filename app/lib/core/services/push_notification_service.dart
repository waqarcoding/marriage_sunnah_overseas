// lib/core/services/push_notification_service.dart
//
// Handles Firebase Cloud Messaging (FCM) push notifications.
// Works in all three app states:
//   • Foreground  → shows local notification banner via flutter_local_notifications
//   • Background  → FCM delivers the notification automatically (OS handles UI)
//   • Killed      → FCM delivers via system tray; getInitialMessage() picks it up on relaunch
//
// Play Console / App Store compliance:
//   • Requests permission politely (no force)
//   • Only alerts, sounds, badges — no background data harvesting
//   • FCM token is sent to your server; revoked on logout
//   • No tracking or ad identifiers used
//
import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import '../../data/providers/api_client.dart';

// ── Background handler — MUST be a top-level function ────────────────────────
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Firebase must be initialised even in isolate
  await Firebase.initializeApp();
  print('[FCM] 🔔 Background message: ${message.messageId}  type=${message.data['type']}');
  // No UI here — the system tray already shows the notification.
  // Heavy work (DB writes etc.) can be done here if needed.
}

class PushNotificationService extends GetxService {
  final _fcm   = FirebaseMessaging.instance;
  final _local = FlutterLocalNotificationsPlugin();

  // Android notification channel — must match the one declared in AndroidManifest
  static const _channel = AndroidNotificationChannel(
    'ms_high_importance',              // id
    'Marriage Sunnah Notifications',   // name (shown in device settings)
    description: 'Interests, matches, messages and more',
    importance: Importance.high,
    playSound: true,
    enableVibration: true,
  );

  // ── Init ──────────────────────────────────────────────────────────────────
  Future<PushNotificationService> init() async {
    // 1. Request permission (iOS + Android 13+)
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,        // provisional = silent delivery on iOS
    );

    print('[FCM] Permission: ${settings.authorizationStatus}');

    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      print('[FCM] ⚠️ Permission denied — push notifications disabled');
      return this;
    }

    // 2. Create Android high-importance channel
    await _local
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    // 3. Initialise flutter_local_notifications
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit     = DarwinInitializationSettings(
      requestAlertPermission: false, // already requested via FCM above
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    await _local.initialize(
      const InitializationSettings(android: androidInit, iOS: iosInit),
      onDidReceiveNotificationResponse: _onLocalTap,
    );

    // 4. Register background handler (must be done before any other FCM calls)
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    // 5. Foreground presentation options (iOS)
    await _fcm.setForegroundNotificationPresentationOptions(
      alert: false, // we show our own local notification instead
      badge: true,
      sound: false,
    );

    // 6. Foreground message → show local notification
    FirebaseMessaging.onMessage.listen(_handleForeground);

    // 7. Background tap → app opened from background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleTap);

    // 8. Killed tap → app launched from system tray
    final initial = await _fcm.getInitialMessage();
    if (initial != null) _handleTap(initial);

    // 9. Get & register FCM token
    await _registerToken();

    // 10. Token refresh
    _fcm.onTokenRefresh.listen((token) {
      print('[FCM] 🔄 Token refreshed');
      _saveAndSendToken(token);
    });

    print('[FCM] ✅ Push notification service ready');
    return this;
  }

  // ── Foreground handler ────────────────────────────────────────────────────
  void _handleForeground(RemoteMessage message) {
    print('[FCM] 📱 Foreground message: ${message.data['type']}');
    _showLocalNotification(message);
  }

  // ── Tap handler (background / killed) ────────────────────────────────────
  void _handleTap(RemoteMessage message) {
    print('[FCM] 👆 Notification tapped: ${message.data['type']}');
    _routeFromPayload(message.data);
  }

  // ── Local notification tap ─────────────────────────────────────────────────
  void _onLocalTap(NotificationResponse response) {
    print('[FCM] 👆 Local tap payload: ${response.payload}');
    if (response.payload != null) {
      _routeFromPayload({'type': response.payload});
    }
  }

  // ── Show local notification (foreground only) ─────────────────────────────
  Future<void> _showLocalNotification(RemoteMessage message) async {
    final n = message.notification;
    if (n == null) return;

    final title = n.title ?? _defaultTitle(message.data['type']);
    final body  = n.body  ?? message.data['message'] ?? '';
    final type  = message.data['type']?.toString() ?? '';
    final icon  = _notifIcon(type);

    final androidDetails = AndroidNotificationDetails(
      _channel.id,
      _channel.name,
      channelDescription: _channel.description,
      importance: Importance.high,
      priority: Priority.high,
      icon: icon,
      styleInformation: BigTextStyleInformation(body),
      // Comply with Play Console: no misleading actions
    );

    final iosDetails = const DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    await _local.show(
      message.hashCode,
      title,
      body,
      NotificationDetails(android: androidDetails, iOS: iosDetails),
      payload: type,
    );
  }

  // ── Route navigation based on notification type ───────────────────────────
  void _routeFromPayload(Map<String, dynamic> data) {
    final type = data['type']?.toString() ?? '';
    switch (type) {
      case 'interest_received':
      case 'interest_accepted':
      case 'interest_declined':
      case 'interest_cancelled':
      case 'guardian_new_interest':
      case 'guardian_approved':
      case 'guardian_rejected':
        // Navigate to interests tab
        // Get.toNamed('/interests');  ← uncomment when routes wired
        break;
      case 'new_message':
        // Get.toNamed('/chats');
        break;
      case 'new_match':
        // Get.toNamed('/interests');
        break;
      default:
        break;
    }
  }

  // ── FCM token ─────────────────────────────────────────────────────────────
  Future<void> _registerToken() async {
    try {
      // APNS token must be retrieved first on iOS
      if (Platform.isIOS) {
        final apns = await _fcm.getAPNSToken();
        print('[FCM] APNS token: $apns');
        if (apns == null) {
          // APNS not ready yet — token fetch will retry via onTokenRefresh
          return;
        }
      }

      final token = await _fcm.getToken();
      print('[FCM] 📲 FCM token: $token');
      if (token != null) await _saveAndSendToken(token);
    } catch (e) {
      print('[FCM] ❌ Token error: $e');
    }
  }

  Future<void> _saveAndSendToken(String token) async {
    GetStorage().write('fcmToken', token);
    try {
      final api = Get.find<ApiClient>();
      await api.post('/profile/fcm-token', data: {
        'token': token,
        'platform': Platform.isIOS ? 'ios' : 'android',
      });
      print('[FCM] ✅ Token sent to server');
    } catch (e) {
      print('[FCM] ⚠️ Failed to send token to server: $e');
    }
  }

  // Call on logout — removes token from server so no stale notifications
  Future<void> removeToken() async {
    try {
      await _fcm.deleteToken();
      final api = Get.find<ApiClient>();
      await api.delete('/profile/fcm-token');
      GetStorage().remove('fcmToken');
      print('[FCM] 🗑 Token removed');
    } catch (e) {
      print('[FCM] ⚠️ Failed to remove token: $e');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  String _notifIcon(String type) {
    // Use default launcher icon — custom per-type icons can be added to
    // android/app/src/main/res/drawable/
    return '@mipmap/ic_launcher';
  }

  String _defaultTitle(dynamic type) {
    switch (type?.toString()) {
      case 'interest_received':   return '💌 New Interest';
      case 'interest_accepted':   return '🎉 Interest Accepted';
      case 'interest_declined':   return 'Interest Declined';
      case 'new_message':         return '📨 New Message';
      case 'new_match':           return '💞 New Match';
      case 'guardian_new_interest': return '🕌 Guardian Interest';
      case 'guardian_approved':   return '✅ Guardian Approved';
      default:                    return 'Marriage Sunnah';
    }
  }
}
