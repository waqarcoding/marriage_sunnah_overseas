// uploadVideo.middleware.js — video only, uploads/videos directory
import multer from "multer";
import path from "path";
import fs from "fs";

const VIDEO_DIR = "uploads/videos";
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

// ── Local storage ─────────────────────────────────────────────────────────────
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, VIDEO_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `vid_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

// ── Lazy Spaces storage ───────────────────────────────────────────────────────
let _s3Storage = null;

const getS3Storage = async () => {
    if (_s3Storage) return _s3Storage;
    const { S3Client } = await import("@aws-sdk/client-s3");
    const multerS3 = (await import("multer-s3")).default;
    // @ts-ignore
    const s3 = new S3Client({
        endpoint: process.env.DO_SPACES_ENDPOINT,
        region: process.env.DO_SPACES_REGION || "sgp1",
        credentials: {
            accessKeyId: process.env.DO_SPACES_KEY,
            secretAccessKey: process.env.DO_SPACES_SECRET,
        },
        forcePathStyle: false,
    });
    _s3Storage = multerS3({
        s3,
        // @ts-ignore
        bucket: process.env.DO_SPACES_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const key = `uploads/videos/vid_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            console.log(`☁️  Spaces video: ${key}`);
            cb(null, key);
        },
    });
    return _s3Storage;
};

// ── Storage selector: always local in development ─────────────────────────────
const useSpaces = () => true;

// ✅ Video filter — rejects non-video files
const videoFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
        console.log(`🎬  ${file.fieldname}: ${file.originalname}`);
        cb(null, true);
    } else {
        cb(new Error(`Only video files allowed. Got: ${file.mimetype}`));
    }
};

// ── Export same interface as upload.middleware.js ─────────────────────────────
const videoupload = {
    fields: (fields = []) => async (req, res, next) => {
        try {
            const storage = useSpaces() ? await getS3Storage() : localStorage;
            console.log(`📦 Video → ${useSpaces() ? "DO Spaces" : "Local disk"}`);
            multer({
                storage,
                limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
                fileFilter: videoFilter,
            }).fields(fields)(req, res, next);
        } catch (err) { next(err); }
    },
};

// ── URL helper ────────────────────────────────────────────────────────────────
export const getVideoUrl = (file) => {
    if (!file) return null;
    if (useSpaces()) {
        const cdn = process.env.DO_SPACES_CDN_URL;
        return cdn ? `${cdn}/${file.key}` : file.location;
    }
    return `/${file.path.replace(/\\/g, "/")}`;
};

export default videoupload;