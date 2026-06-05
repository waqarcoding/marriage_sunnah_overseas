import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/user_profile_controller.dart';

class MediaSectionWidget extends StatefulWidget {
  const MediaSectionWidget({Key? key}) : super(key: key);

  @override
  State<MediaSectionWidget> createState() => _MediaSectionWidgetState();
}

class _MediaSectionWidgetState extends State<MediaSectionWidget> {
  int? _draggedIdx;
  int? _dragOverIdx;

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.find<UserProfileController>();

    return Container(
      padding: EdgeInsets.all(16),
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
      ),
      child: Obx(() {
        final photos  = ctrl.photos;
        final videos  = ctrl.videos;
        final isPro   = ctrl.isPremium.value;
        final upIdx   = ctrl.uploadingIdx.value;
        final upVidIdx = ctrl.uploadingVideoIdx.value;

        return Column(
          children: [
            // ── Photos 4-grid ──────────────────────────────────────────────
            GridView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                childAspectRatio: 3 / 4,
              ),
              itemCount: 4,
              itemBuilder: (_, idx) {
                final hasPhoto  = idx < photos.length;
                final photo     = hasPhoto ? photos[idx] : null;
                final uploading = upIdx == idx;
                final canAdd    = idx <= photos.length;
                final isDragOver = _dragOverIdx == idx;

                if (hasPhoto && photo != null) {
                  return _PhotoCell(
                    photo: photo,
                    idx: idx,
                    isUploading: uploading,
                    isMain: idx == 0,
                    isDragOver: isDragOver,
                    onTap: () => _viewMedia(ctrl, idx, 'image'),
                    onDelete: () => ctrl.deletePhoto(idx),
                    onDragStart: () => setState(() => _draggedIdx = idx),
                    onDragAccept: () => _handleDrop(ctrl, idx),
                    onDragOver: () => setState(() => _dragOverIdx = idx),
                    onDragLeave: () => setState(() => _dragOverIdx = null),
                  );
                }
                return _EmptyPhotoCell(
                  idx: idx,
                  isUploading: uploading,
                  canAdd: canAdd,
                  onTap: canAdd ? () => ctrl.pickAndUploadPhoto(idx) : null,
                );
              },
            ),
            SizedBox(height: 10),

            // ── Video section ──────────────────────────────────────────────
            if (videos.isEmpty)
              _VideoAddSlot(
                isPremium: isPro,
                isUploading: upVidIdx == 0,
                onTap: () => ctrl.pickAndUploadVideo(0),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  crossAxisSpacing: 8,
                  childAspectRatio: 3 / 4,
                ),
                itemCount: 4,
                itemBuilder: (_, idx) {
                  final hasVideo  = idx < videos.length;
                  final video     = hasVideo ? videos[idx] : null;
                  final uploading = upVidIdx == idx;
                  final canAdd    = isPro && idx <= videos.length;

                  if (hasVideo && video != null) {
                    return _VideoCell(
                      idx: idx,
                      onTap: () => _viewMedia(ctrl, idx, 'video'),
                      onDelete: () => ctrl.deleteVideo(idx),
                    );
                  }
                  return _EmptyVideoCell(
                    idx: idx,
                    isPremium: isPro,
                    isUploading: uploading,
                    canAdd: canAdd,
                    onTap: canAdd ? () => ctrl.pickAndUploadVideo(idx) : null,
                  );
                },
              ),
          ],
        );
      }),
    );
  }

  void _handleDrop(UserProfileController ctrl, int dropIdx) {
    if (_draggedIdx == null || _draggedIdx == dropIdx) {
      setState(() { _draggedIdx = null; _dragOverIdx = null; });
      return;
    }
    final newPhotos = List<String>.from(ctrl.photos);
    final dragged = newPhotos.removeAt(_draggedIdx!);
    newPhotos.insert(dropIdx, dragged);
    setState(() { _draggedIdx = null; _dragOverIdx = null; });
    ctrl.reorderPhotos(newPhotos);
  }

  void _viewMedia(UserProfileController ctrl, int idx, String type) {
    final allMedia = [
      ...ctrl.photos.map((url) => {'type': 'image', 'url': url}),
      ...ctrl.videos.map((url) => {'type': 'video', 'url': url}),
    ];
    final startIdx = type == 'image' ? idx : ctrl.photos.length + idx;
    Get.to(() => MediaViewerPage(media: allMedia, initialIdx: startIdx),
        transition: Transition.fadeIn);
  }
}

// ─── Photo cell (filled) ─────────────────────────────────────────────────────
class _PhotoCell extends StatefulWidget {
  final String photo;
  final int idx;
  final bool isUploading, isMain, isDragOver;
  final VoidCallback onTap, onDelete, onDragStart, onDragAccept, onDragOver, onDragLeave;

  const _PhotoCell({required this.photo, required this.idx,
    required this.isUploading, required this.isMain, required this.isDragOver,
    required this.onTap, required this.onDelete, required this.onDragStart,
    required this.onDragAccept, required this.onDragOver, required this.onDragLeave});

  @override
  State<_PhotoCell> createState() => _PhotoCellState();
}

class _PhotoCellState extends State<_PhotoCell> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: DragTarget<int>(
        onAccept: (_) => widget.onDragAccept(),
        onWillAccept: (_) { widget.onDragOver(); return true; },
        onLeave: (_) => widget.onDragLeave(),
        builder: (_, __, ___) => Draggable<int>(
          data: widget.idx,
          onDragStarted: widget.onDragStart,
          feedback: Opacity(
            opacity: 0.7,
            child: SizedBox(
              width: 80, height: 107,
              child: _buildCell(),
            ),
          ),
          child: AnimatedContainer(
            duration: Duration(milliseconds: 200),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: widget.isDragOver ? Color(0xFF1B4D3E) : Colors.transparent,
                width: 2,
              ),
            ),
            child: _buildCell(),
          ),
        ),
      ),
    );
  }

  Widget _buildCell() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Image.network(widget.photo, fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(color: Color(0xFF1B4D3E).withOpacity(0.1))),
          if (widget.isUploading)
            Container(
              color: Colors.black.withOpacity(0.45),
              child: Center(child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
            ),
          if (widget.isMain)
            Positioned(top: 5, left: 5,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                decoration: BoxDecoration(color: Color(0xFF1B4D3E), borderRadius: BorderRadius.circular(5)),
                child: Text('Main', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600)),
              )),
          Positioned(top: 5, right: 5,
            child: Container(
              padding: EdgeInsets.all(3),
              decoration: BoxDecoration(color: Colors.black.withOpacity(0.6), borderRadius: BorderRadius.circular(6)),
              child: Icon(Icons.drag_indicator, size: 14, color: Colors.white),
            )),
          Positioned(bottom: 5, right: 5,
            child: GestureDetector(
              onTap: widget.onDelete,
              child: Container(
                width: 24, height: 24,
                decoration: BoxDecoration(
                  color: Color(0xFFEF4444).withOpacity(0.95),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.delete, size: 11, color: Colors.white),
              ),
            )),
        ],
      ),
    );
  }
}

// ─── Empty photo slot ─────────────────────────────────────────────────────────
class _EmptyPhotoCell extends StatelessWidget {
  final int idx;
  final bool isUploading, canAdd;
  final VoidCallback? onTap;

  const _EmptyPhotoCell({required this.idx, required this.isUploading,
      required this.canAdd, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: Color(0xFFFAFAFA),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            style: BorderStyle.solid,
            color: canAdd ? Color(0xFF1B4D3E) : Color(0xFFD1D5DB),
            width: 2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isUploading)
              CircularProgressIndicator(color: Color(0xFF1B4D3E), strokeWidth: 2)
            else ...[
              Icon(Icons.camera_alt,
                  size: 20, color: canAdd ? Color(0xFF1B4D3E) : Color(0xFFD1D5DB)),
              SizedBox(height: 4),
              Text(idx == 0 ? 'Add Main' : 'Photo ${idx + 1}',
                  style: TextStyle(
                      fontSize: 9,
                      color: canAdd ? Color(0xFF9CA3AF) : Color(0xFFD1D5DB),
                      fontWeight: FontWeight.w500)),
              if (canAdd)
                Text('5 credits',
                    style: TextStyle(fontSize: 8, color: Color(0xFF1B4D3E), fontWeight: FontWeight.w600)),
            ],
          ],
        ),
      ),
    );
  }
}

// ─── Video add slot (horizontal banner) ──────────────────────────────────────
class _VideoAddSlot extends StatelessWidget {
  final bool isPremium, isUploading;
  final VoidCallback onTap;

  const _VideoAddSlot({required this.isPremium, required this.isUploading, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isPremium ? onTap : null,
      child: Container(
        height: 100,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: isPremium
              ? LinearGradient(colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)],
                  begin: Alignment.topLeft, end: Alignment.bottomRight)
              : null,
          color: isPremium ? null : Color(0xFFE5E7EB),
          border: Border.all(
            color: isPremium ? Colors.white.withOpacity(0.3) : Color(0xFFD1D5DB),
            style: BorderStyle.solid, width: 2,
          ),
        ),
        child: Center(
          child: isUploading
              ? CircularProgressIndicator(
                  color: isPremium ? Colors.white : Color(0xFF9CA3AF), strokeWidth: 2.5)
              : Column(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.video_camera_back,
                      size: 28, color: isPremium ? Colors.white : Color(0xFF9CA3AF)),
                  SizedBox(height: 6),
                  Text(isPremium ? 'Add Intro Video' : '🔒 Pro Feature',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isPremium ? Colors.white : Color(0xFF9CA3AF))),
                  Text(isPremium ? 'Max 50MB • Portrait recommended' : 'Upgrade to Premium to unlock',
                      style: TextStyle(
                          fontSize: 10,
                          color: isPremium ? Colors.white.withOpacity(0.7) : Color(0xFF9CA3AF))),
                  if (isPremium) ...[
                    SizedBox(height: 4),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4)),
                      child: Text('20 credits',
                          style: TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ]),
        ),
      ),
    );
  }
}

// ─── Video cell (filled) ──────────────────────────────────────────────────────
class _VideoCell extends StatelessWidget {
  final int idx;
  final VoidCallback onTap, onDelete;

  const _VideoCell({required this.idx, required this.onTap, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Container(color: Color(0xFF111111)),
            Center(child: Icon(Icons.play_circle_fill, size: 32, color: Colors.white)),
            Positioned(top: 6, left: 6,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(color: Color(0xFF1B4D3E), borderRadius: BorderRadius.circular(6)),
                child: Text(idx == 0 ? 'Intro' : 'Video ${idx + 1}',
                    style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
              )),
            Positioned(bottom: 5, right: 5,
              child: GestureDetector(
                onTap: onDelete,
                child: Container(
                  width: 24, height: 24,
                  decoration: BoxDecoration(
                    color: Color(0xFFEF4444).withOpacity(0.95),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.delete, size: 11, color: Colors.white),
                ),
              )),
          ],
        ),
      ),
    );
  }
}

// ─── Empty video slot ─────────────────────────────────────────────────────────
class _EmptyVideoCell extends StatelessWidget {
  final int idx;
  final bool isPremium, isUploading, canAdd;
  final VoidCallback? onTap;

  const _EmptyVideoCell({required this.idx, required this.isPremium,
      required this.isUploading, required this.canAdd, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: isPremium && canAdd
              ? LinearGradient(colors: [Color(0xFF1B4D3E), Color(0xFF2d7a5f)])
              : null,
          color: isPremium && canAdd ? null : Color(0xFFE5E7EB),
          border: Border.all(
            color: isPremium && canAdd ? Colors.white.withOpacity(0.3) : Color(0xFFD1D5DB),
            style: BorderStyle.solid, width: 2,
          ),
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          if (isUploading)
            CircularProgressIndicator(color: isPremium ? Colors.white : Color(0xFF9CA3AF), strokeWidth: 2)
          else ...[
            Icon(Icons.video_camera_back, size: 18,
                color: isPremium && canAdd ? Colors.white : Color(0xFF9CA3AF)),
            SizedBox(height: 4),
            Text(!isPremium ? '🔒 Pro' : 'Video ${idx + 1}',
                style: TextStyle(fontSize: 9,
                    color: isPremium && canAdd ? Colors.white : Color(0xFF9CA3AF),
                    fontWeight: FontWeight.w500)),
            if (isPremium && canAdd) ...[
              SizedBox(height: 2),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4)),
                child: Text('20 credits',
                    style: TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.w600)),
              ),
            ],
          ],
        ]),
      ),
    );
  }
}

// ─── Media Viewer Page ────────────────────────────────────────────────────────
class MediaViewerPage extends StatefulWidget {
  final List<Map<String, String>> media;
  final int initialIdx;

  const MediaViewerPage({Key? key, required this.media, required this.initialIdx})
      : super(key: key);

  @override
  State<MediaViewerPage> createState() => _MediaViewerPageState();
}

class _MediaViewerPageState extends State<MediaViewerPage> {
  late int _cur;

  @override
  void initState() { super.initState(); _cur = widget.initialIdx; }

  @override
  Widget build(BuildContext context) {
    final item = widget.media[_cur];
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Media content
          Positioned.fill(
            child: Center(
              child: item['type'] == 'video'
                  ? Container(
                      color: Colors.black,
                      child: Center(child: Icon(Icons.play_circle_outline, size: 64, color: Colors.white)))
                  : InteractiveViewer(
                      child: Image.network(item['url'] ?? '',
                          fit: BoxFit.contain)),
            ),
          ),

          // Header
          Positioned(top: 0, left: 0, right: 0,
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    GestureDetector(
                      onTap: () => Get.back(),
                      child: Container(
                        width: 44, height: 44,
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withOpacity(0.15)),
                        ),
                        child: Icon(Icons.close, color: Colors.white, size: 22),
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withOpacity(0.15)),
                      ),
                      child: Text('${_cur + 1} / ${widget.media.length}',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
                    ),
                    SizedBox(width: 44),
                  ],
                ),
              ),
            )),

          // Prev/Next
          if (widget.media.length > 1) ...[
            Positioned(left: 16, top: 0, bottom: 0,
              child: Center(
                child: GestureDetector(
                  onTap: () => setState(() => _cur = (_cur - 1 + widget.media.length) % widget.media.length),
                  child: Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.chevron_left, color: Colors.white, size: 24),
                  ),
                ),
              )),
            Positioned(right: 16, top: 0, bottom: 0,
              child: Center(
                child: GestureDetector(
                  onTap: () => setState(() => _cur = (_cur + 1) % widget.media.length),
                  child: Container(
                    width: 44, height: 44,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.chevron_right, color: Colors.white, size: 24),
                  ),
                ),
              )),
          ],

          // Dot indicators
          if (widget.media.length > 1)
            Positioned(bottom: 0, left: 0, right: 0,
              child: SafeArea(
                child: Padding(
                  padding: EdgeInsets.only(bottom: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(widget.media.length, (i) {
                      return GestureDetector(
                        onTap: () => setState(() => _cur = i),
                        child: AnimatedContainer(
                          duration: Duration(milliseconds: 250),
                          margin: EdgeInsets.symmetric(horizontal: 4),
                          width: i == _cur ? 24 : 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: i == _cur ? Colors.white : Colors.white.withOpacity(0.35),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
