// @ts-nocheck
import { useState } from "react";
import { motion } from "motion/react";
import Cropper from "react-easy-crop";

export default function ImageCropModal({ image, onSave, onCancel }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const createCroppedImage = async () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = image;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;

            ctx.drawImage(
                img,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height
            );

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.95);
            });
        } catch (e) {
            console.error('Crop error:', e);
            return null;
        }
    };

    const handleSave = async () => {
        const croppedBlob = await createCroppedImage();
        if (croppedBlob) {
            onSave(croppedBlob);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black  mb-15"
        >
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={3 / 4}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>

            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "24px",
                background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#fff", fontSize: "14px", minWidth: "50px" }}>Zoom</span>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        style={{ flex: 1 }}
                    />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: "14px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.2)",
                            background: "rgba(255,255,255,0.1)",
                            color: "#fff",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        style={{
                            flex: 1,
                            padding: "14px",
                            borderRadius: "12px",
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                            fontSize: "14px",
                            fontWeight: "600",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Save & Upload
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}