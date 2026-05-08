// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit3, Check, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProfileService from "../../services/ProfileService";
import GuardianService from "../../../guardian/services/GuardianService";
import AuthService from "../../../auth/services/AuthService";
import MediaViewer from "../components/media_viewer";
import ProfileCard from "../components/profile_info_section";
// Components
import ProfileHeader from "../components/profile_header";
import MediaSection from "../components/media_section";
import StatsSection from "../components/stats_section";
import GuardianSection from "../components/guardian_section";
import SettingsSection from "../components/settings_section";
import ImageCropModal from "../components/image_crop_model";
import SuccessDialog from "../../../../ui/success_dialogue";

export default function MyProfilePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // State
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ Starts as true
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [uploadingIdx, setUploadingIdx] = useState(null);
    const [uploadingVideoIdx, setUploadingVideoIdx] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [videos, setVideos] = useState([]);
    const [interests, setInterests] = useState([]);
    const [isPremium, setIsPremium] = useState(false);
    const [counts, setCounts] = useState({ likes_sent: 0, likes_received: 0, matches: 0 });
    const [mediaViewer, setMediaViewer] = useState(null);
    const [cropImage, setCropImage] = useState(null);
    const [guardian, setGuardian] = useState(null);
    const [hasGuardian, setHasGuardian] = useState(false);

    const [form, setForm] = useState({
        name: "", age: "", profession: "", education: "", bio: "",
    });

    useEffect(() => { fetchProfile(); loadGuardian(); }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await ProfileService.getCurrentUser();
            setCounts(res?.counts || {});

            const p = res?.profile || res?.data?.profile || res?.data || res;
            setProfile(p);

            let imgs = [];
            try {
                imgs = typeof p?.images === "string"
                    ? JSON.parse(p.images || "[]")
                    : Array.isArray(p?.images) ? p.images : [];
            } catch { imgs = []; }
            setPhotos(imgs.filter(Boolean));

            let vids = [];
            try {
                vids = typeof p?.videos === "string"
                    ? JSON.parse(p.videos || "[]")
                    : Array.isArray(p?.videos) ? p.videos : [];
            } catch { vids = []; }
            setVideos(vids.filter(Boolean));

            setIsPremium(await AuthService.isPro());

            setForm({
                name: p?.name || "",
                age: p?.age || "",
                profession: p?.profession || "",
                education: p?.education || "",
                bio: p?.bio || "",
            });

            setInterests(parseInterests(p));

        } catch (err) {
            console.error("fetchProfile error:", err);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const loadGuardian = () => {
        GuardianService.getMyGuardian({
            onSuccess: (res) => {
                const data = res?.data;
                if (data && data.guardianUser) {
                    setGuardian(data);
                    setHasGuardian(true);
                } else {
                    setHasGuardian(false);
                }
            },
            onFailed: () => {
                setHasGuardian(false);
            },
        });
    };

    const parseInterests = (p) => {
        if (!p?.interests) return [];
        if (Array.isArray(p.interests)) return p.interests;
        try { const parsed = JSON.parse(p.interests); return Array.isArray(parsed) ? parsed : []; }
        catch { return []; }
    };

    const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await ProfileService.updateProfile({ ...form, interests: JSON.stringify(interests) });
            setProfile((prev) => ({ ...prev, ...form, interests: JSON.stringify(interests) }));
            setEditMode(false);
            setShowSuccess(true);
        } catch { toast.error("Failed to save changes"); }
        finally { setSaving(false); }
    };

    const handleCancel = () => {
        if (profile) {
            setForm({
                name: profile.name || "",
                age: profile.age || "",
                profession: profile.profession || "",
                education: profile.education || "",
                bio: profile.bio || ""
            });
            setInterests(parseInterests(profile));
        }
        setEditMode(false);
    };

    const handlePhotoClick = (idx) => {
        if (idx > photos.length) return;
        fileInputRef.current._idx = idx;
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const idx = fileInputRef.current._idx;

        const reader = new FileReader();
        reader.onload = () => {
            setCropImage({ url: reader.result, index: idx });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleCroppedImage = async (croppedBlob) => {
        const idx = cropImage.index;
        setCropImage(null);

        const blobUrl = URL.createObjectURL(croppedBlob);
        setPhotos((prev) => { const n = [...prev]; n[idx] = blobUrl; return n; });
        setUploadingIdx(idx);

        try {
            const file = new File([croppedBlob], "photo.jpg", { type: "image/jpeg" });
            const data = await ProfileService.uploadImage(file, idx);
            if (data.success) {
                const url = data.imageUrl?.startsWith("http")
                    ? data.imageUrl
                    : `${import.meta.env.VITE_BASE_URL}${data.imageUrl}`;
                setPhotos((prev) => { const n = [...prev]; n[idx] = url; return n; });
                toast.success("Photo uploaded! (5 credits deducted)");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch {
            toast.error("Upload failed");
        }
        finally { setUploadingIdx(null); }
    };

    const handleDeletePhoto = async (idx) => {
        try {
            await ProfileService.deleteImage(idx);
            setPhotos((prev) => prev.filter((_, i) => i !== idx));
            toast.success("Photo deleted");
        } catch {
            toast.error("Failed to delete photo");
        }
    };

    const handleReorderPhotos = async (newPhotos) => {
        setPhotos(newPhotos);
        try {
            await ProfileService.updateProfile({ images: JSON.stringify(newPhotos) });
            toast.success("Photo order updated");
        } catch {
            toast.error("Failed to update photo order");
            fetchProfile();
        }
    };

    const handleVideoClick = (idx) => {
        if (!isPremium) { navigate("/subscription"); return; }
        if (idx > videos.length) return;
        videoInputRef.current._idx = idx;
        videoInputRef.current.click();
    };

    const handleVideoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const idx = videoInputRef.current._idx;
        setUploadingVideoIdx(idx);
        try {
            const data = await ProfileService.uploadVideo(file, idx);
            if (data.success) {
                const updatedVideos = data.videos || [];
                setVideos(updatedVideos);
                toast.success("Video uploaded! (20 credits deducted)");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch {
            toast.error("Video upload failed");
        }
        finally {
            setUploadingVideoIdx(null);
            e.target.value = "";
        }
    };

    const handleDeleteVideo = async (idx) => {
        try {
            await ProfileService.deleteVideo(idx);
            setVideos((prev) => prev.filter((_, i) => i !== idx));
            toast.success("Video deleted");
        } catch {
            toast.error("Failed to delete video");
        }
    };

    const handleViewMedia = (idx, type) => {
        const allMedia = [
            ...photos.map(url => ({ type: "image", url })),
            ...videos.map(url => ({ type: "video", url }))
        ];
        const startIdx = type === "image" ? idx : photos.length + idx;
        setMediaViewer({ media: allMedia, initialIdx: startIdx });
    };

    // ✅ Updated loading UI
    if (loading) return (
        <div style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--secondary)"
        }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center">
                {/* Circular Spinner */}
                <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 opacity-20"
                        style={{ borderColor: 'var(--primary)' }} />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
                        style={{
                            borderTopColor: 'var(--primary)',
                            borderRightColor: 'var(--primary)',
                        }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                    Loading profile...
                </p>
                <p className="text-xs text-gray-400 mt-1">Please wait</p>
            </motion.div>
        </div>
    );

    const location = [profile?.city, profile?.country].filter(Boolean).join(", ");

    return (
        <div style={{ height: "100%", overflowY: "auto", padding: 10 }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
            <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoChange} />

            <AnimatePresence>
                {showSuccess && <SuccessDialog onClose={() => setShowSuccess(false)} />}
                {cropImage && (
                    <ImageCropModal
                        image={cropImage.url}
                        onSave={handleCroppedImage}
                        onCancel={() => setCropImage(null)}
                    />
                )}
                {mediaViewer && (
                    <MediaViewer
                        media={mediaViewer.media}
                        initialIdx={mediaViewer.initialIdx}
                        onClose={() => setMediaViewer(null)}
                    />
                )}
            </AnimatePresence>

            <div style={{ maxWidth: 640, margin: "0 auto", paddingBottom: 60 }}>
                <ProfileHeader
                    editMode={editMode}
                    saving={saving}
                    isPremium={isPremium}
                    onEditToggle={() => setEditMode(!editMode)}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />

                <MediaSection
                    photos={photos}
                    videos={videos}
                    uploadingIdx={uploadingIdx}
                    uploadingVideoIdx={uploadingVideoIdx}
                    isPremium={isPremium}
                    onPhotoClick={handlePhotoClick}
                    onDeletePhoto={handleDeletePhoto}
                    onReorderPhotos={handleReorderPhotos}
                    onVideoClick={handleVideoClick}
                    onDeleteVideo={handleDeleteVideo}
                    onViewMedia={handleViewMedia}
                />
                <StatsSection counts={counts} />

                <ProfileCard
                    form={form}
                    location={location}
                    bio={form.bio}
                    interests={interests}
                    editMode={editMode}
                    onFieldChange={setField}
                    onBioChange={(val) => setField("bio", val)}
                    onInterestsChange={setInterests}
                    onSave={handleSave}
                    saving={saving}
                />

                <GuardianSection
                    guardian={guardian}
                    hasGuardian={hasGuardian}
                    onGuardianRemoved={() => {
                        setHasGuardian(false);
                        setGuardian(null);
                        loadGuardian();
                    }}
                />
            </div>

            {/* ✅ Add spin animation */}
            <style>{`
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
            `}</style>
        </div>
    );
}