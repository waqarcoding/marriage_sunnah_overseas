// @ts-nocheck
// upload.middleware.js — generic image upload using .fields() only
import multer from "multer";
import path from "path";
import fs from "fs";

// ── Local storage ─────────────────────────────────────────────────────────────
const LOCAL_DIR = "uploads/profiles";
if (!fs.existsSync(LOCAL_DIR)) fs.mkdirSync(LOCAL_DIR, { recursive: true });

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, LOCAL_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `img_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
    },
});

// ── Lazy Spaces storage ───────────────────────────────────────────────────────
let _s3Storage = null;

const getS3Storage = async () => {
    if (_s3Storage) return _s3Storage;
    const { S3Client } = await import("@aws-sdk/client-s3");
    const multerS3 = (await import("multer-s3")).default;
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
        bucket: process.env.DO_SPACES_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const key = `uploads/profiles/img_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
            console.log(`☁️  Spaces: ${key}`);
            cb(null, key);
        },
    });
    return _s3Storage;
};

// ── Storage selector: always local in development ─────────────────────────────
const useSpaces = () => true;

const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        console.log(`🖼️  ${file.fieldname}: ${file.originalname}`);
        cb(null, true);
    } else {
        cb(new Error(`Only images allowed. Got: ${file.mimetype}`));
    }
};

// ── Single export: upload.fields([...]) ──────────────────────────────────────
// Handles both single and multiple images via fields array
// Single:   upload.fields([{ name: 'image',  maxCount: 1  }])
// Multiple: upload.fields([{ name: 'images', maxCount: 10 }])
// Mixed:    upload.fields([{ name: 'front_id', maxCount: 1 }, { name: 'back_id', maxCount: 1 }])
const upload = {
    fields: (fields = []) => async (req, res, next) => {
        try {
            const storage = useSpaces() ? await getS3Storage() : localStorage;
            console.log(`📦 ${useSpaces() ? "DO Spaces" : "Local disk"}`);
            multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFilter })
                .fields(fields)(req, res, next);
        } catch (err) {
            next(err);
        }
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
// Get URL from single file
export const getUploadedUrl = (file) => {
    if (!file) return null;
    if (useSpaces()) {
        const cdn = process.env.DO_SPACES_CDN_URL;
        return cdn ? `${cdn}/${file.key}` : file.location;
    }
    return `/uploads/profiles/${file.filename}`;
};

// Get URLs from multiple files
export const getUploadedUrls = (files) => {
    if (!files) return [];
    const arr = Array.isArray(files) ? files : Object.values(files).flat();
    return arr.map(getUploadedUrl).filter(Boolean);
};

export default upload;