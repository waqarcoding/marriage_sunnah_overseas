// uploadfilemulter.js
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const dir = "uploads/profiles"
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        cb(null, `profile_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`)
    },
})

const uploadPublic = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true)
        else cb(new Error("Only images allowed"))
    },
})

module.exports = uploadPublic