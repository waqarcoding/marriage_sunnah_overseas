// @ts-nocheck
import { useState } from "react";
import { motion } from "motion/react";
import { Camera, Video, Play, Trash2, GripVertical, Loader2 } from "lucide-react";

export default function MediaSection({
    photos,
    videos,
    uploadingIdx,
    uploadingVideoIdx,
    isPremium,
    onPhotoClick,
    onDeletePhoto,
    onReorderPhotos,
    onVideoClick,
    onDeleteVideo,
    onViewMedia
}) {
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [dragOverIdx, setDragOverIdx] = useState(null);

    const handleDragStart = (e, idx) => {
        setDraggedIdx(idx);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (draggedIdx !== null && draggedIdx !== idx) {
            setDragOverIdx(idx);
        }
    };

    const handleDragLeave = () => {
        setDragOverIdx(null);
    };

    const handleDrop = async (e, dropIdx) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === dropIdx) {
            setDraggedIdx(null);
            setDragOverIdx(null);
            return;
        }

        const newPhotos = [...photos];
        const [draggedPhoto] = newPhotos.splice(draggedIdx, 1);
        newPhotos.splice(dropIdx, 0, draggedPhoto);

        setDraggedIdx(null);
        setDragOverIdx(null);
        onReorderPhotos(newPhotos);
    };

    const handleDragEnd = () => {
        setDraggedIdx(null);
        setDragOverIdx(null);
    };

    const hasVideos = videos.length > 0;

    return (
        <div style={{ backgroundColor: "#fff", padding: 16, marginBottom: 12, borderRadius: "0 0 16px 16px" }}>
            {/* Photos Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {Array.from({ length: 4 }).map((_, idx) => {
                    const photo = photos[idx];
                    const isUploading = uploadingIdx === idx;
                    const isDragging = draggedIdx === idx;
                    const isDragOver = dragOverIdx === idx;

                    if (photo) {
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: isDragging ? 0.5 : 1,
                                    scale: isDragOver ? 1.05 : 1,
                                }}
                                transition={{ delay: idx * 0.05 }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, idx)}
                                onDragEnd={handleDragEnd}
                                style={{
                                    borderRadius: 14,
                                    overflow: "hidden",
                                    position: "relative",
                                    aspectRatio: "3/4",
                                    cursor: "grab",
                                    background: "#111",
                                    border: isDragOver ? "2px solid #1B4D3E" : "2px solid transparent",
                                    transition: "all 0.2s"
                                }}>
                                <img src={photo} alt={`Photo ${idx + 1}`}
                                    onClick={() => onViewMedia(idx, "image")}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
                                    loading="eager" />
                                {isUploading && (
                                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Loader2 style={{ width: 22, height: 22, color: "#fff" }} className="animate-spin" />
                                    </div>
                                )}
                                {idx === 0 && (
                                    <div style={{ position: "absolute", top: 5, left: 5, padding: "2px 5px", borderRadius: 5, background: "#1B4D3E", color: "#ffffff", fontSize: 9, fontWeight: 600 }}>
                                        Main
                                    </div>
                                )}
                                <div style={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    padding: "4px",
                                    borderRadius: "6px",
                                    backgroundColor: "rgba(0,0,0,0.6)",
                                    cursor: "grab"
                                }}>
                                    <GripVertical style={{ width: 14, height: 14, color: "#fff" }} />
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); onDeletePhoto(idx); }}
                                    style={{
                                        position: "absolute",
                                        bottom: 5,
                                        right: 5,
                                        width: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(239, 68, 68, 0.95)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "none",
                                        cursor: "pointer"
                                    }}>
                                    <Trash2 style={{ width: 11, height: 11, color: "#fff" }} />
                                </motion.button>
                            </motion.div>
                        );
                    } else {
                        return (
                            <motion.button key={idx}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onPhotoClick(idx)}
                                disabled={idx > photos.length}
                                style={{
                                    borderRadius: 14,
                                    border: "2px dashed",
                                    borderColor: idx <= photos.length ? "#1B4D3E" : "#d1d5db",
                                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                                    aspectRatio: "3/4", background: "#fafafa",
                                    cursor: idx <= photos.length ? "pointer" : "default",
                                    opacity: idx <= photos.length ? 1 : 0.35,
                                }}>
                                {isUploading
                                    ? <Loader2 style={{ width: 20, height: 20, color: "#1B4D3E" }} className="animate-spin" />
                                    : <>
                                        <Camera style={{ width: 20, height: 20, color: idx <= photos.length ? "#1B4D3E" : "#d1d5db" }} />
                                        <span style={{ fontSize: 9, color: idx <= photos.length ? "#9ca3af" : "#d1d5db", fontWeight: 500 }}>
                                            {idx === 0 ? "Add Main" : `Photo ${idx + 1}`}
                                        </span>
                                        {idx <= photos.length && (
                                            <span style={{ fontSize: 8, color: "var(--primary-foreground)", fontWeight: 600 }}>5 credits</span>
                                        )}
                                    </>
                                }
                            </motion.button>
                        );
                    }
                })}
            </div>

            {/* Videos Section */}
            {!hasVideos ? (
                // Intro Video Slot (Horizontal) - Only shown when no videos exist
                <div style={{ marginTop: 10 }}>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onVideoClick(0)}
                        disabled={!isPremium}
                        style={{
                            width: "100%",
                            borderRadius: 14,
                            overflow: "hidden",
                            position: "relative",
                            height: 100,
                            cursor: isPremium ? "pointer" : "default",
                            background: isPremium ? "linear-gradient(135deg, #1B4D3E, #2d7a5f)" : "#e5e7eb",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            border: "2px dashed",
                            borderColor: isPremium ? "rgba(255,255,255,0.3)" : "#d1d5db",
                            opacity: isPremium ? 1 : 0.5,
                        }}>
                        {uploadingVideoIdx === 0 ? (
                            <Loader2 style={{ width: 24, height: 24, color: isPremium ? "#fff" : "#9ca3af" }} className="animate-spin" />
                        ) : (
                            <>
                                <Video style={{ width: 28, height: 28, color: isPremium ? "#fff" : "#9ca3af" }} />
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 13, color: isPremium ? "#fff" : "#9ca3af", fontWeight: 600 }}>
                                        {!isPremium ? "🔒 Pro Feature" : "Add Intro Video"}
                                    </div>
                                    <div style={{ fontSize: 10, color: isPremium ? "rgba(255,255,255,0.7)" : "#9ca3af", marginTop: 2 }}>
                                        {isPremium ? "Max 50MB • Portrait recommended" : "Upgrade to Premium to unlock"}
                                    </div>
                                </div>
                                {isPremium && (
                                    <span style={{ fontSize: 9, color: "var(--primary-foreground)", fontWeight: 700 }}>20 credits</span>
                                )}
                            </>
                        )}
                    </motion.button>
                </div>
            ) : (
                // Portrait Video Grid (4 slots) - Shown when videos exist
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {Array.from({ length: 4 }).map((_, idx) => {
                        const video = videos[idx];
                        const isUploading = uploadingVideoIdx === idx;

                        if (video) {
                            return (
                                <motion.div key={idx}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onViewMedia(idx, "video")}
                                    style={{
                                        borderRadius: 14,
                                        overflow: "hidden",
                                        position: "relative",
                                        aspectRatio: "3/4",
                                        cursor: "pointer",
                                        background: "#111",
                                    }}>
                                    <video
                                        src={video}
                                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                        muted
                                    />
                                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Play style={{ width: 24, height: 24, color: "#fff", fill: "#fff" }} />
                                    </div>
                                    <div style={{ position: "absolute", top: 6, left: 6, padding: "2px 7px", borderRadius: 6, background: "#1B4D3E", color: "#ffffff", fontSize: 9, fontWeight: 700 }}>
                                        {idx === 0 ? "Intro" : `Video ${idx + 1}`}
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => { e.stopPropagation(); onDeleteVideo(idx); }}
                                        style={{
                                            position: "absolute",
                                            bottom: 5,
                                            right: 5,
                                            width: 24,
                                            height: 24,
                                            borderRadius: "50%",
                                            backgroundColor: "rgba(239, 68, 68, 0.95)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "none",
                                            cursor: "pointer"
                                        }}>
                                        <Trash2 style={{ width: 11, height: 11, color: "#fff" }} />
                                    </motion.button>
                                </motion.div>
                            );
                        } else {
                            return (
                                <motion.button key={idx}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => onVideoClick(idx)}
                                    disabled={!isPremium || idx > videos.length}
                                    style={{
                                        borderRadius: 14,
                                        overflow: "hidden",
                                        position: "relative",
                                        aspectRatio: "3/4",
                                        cursor: isPremium && idx <= videos.length ? "pointer" : "default",
                                        background: isPremium ? "linear-gradient(135deg, #1B4D3E, #2d7a5f)" : "#e5e7eb",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 4,
                                        border: "2px dashed",
                                        borderColor: isPremium && idx <= videos.length ? "rgba(255,255,255,0.3)" : "#d1d5db",
                                        opacity: isPremium && idx <= videos.length ? 1 : 0.35,
                                    }}>
                                    {isUploading ? (
                                        <Loader2 style={{ width: 20, height: 20, color: isPremium ? "#fff" : "#9ca3af" }} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Video style={{ width: 18, height: 18, color: isPremium ? "#fff" : "#9ca3af" }} />
                                            <span style={{ fontSize: 9, color: isPremium ? "#fff" : "#9ca3af", fontWeight: 500 }}>
                                                {!isPremium ? "🔒 Pro" : `Video ${idx + 1}`}
                                            </span>
                                            {isPremium && idx <= videos.length && (
                                                <span style={{ fontSize: 8, color: "var(--primary-foreground)", fontWeight: 600 }}>20 credits</span>
                                            )}
                                        </>
                                    )}
                                </motion.button>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
}