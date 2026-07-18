import multer from "multer";
import { httpError } from "../utils/httpError.js";

// File-upload middleware (Multer). Uses in-memory storage — the file lands on
// req.file as a Buffer, which we then stream straight to Supabase Storage without
// ever touching local disk (see utils/avatarUpload.js). This is the brief's
// recommended memoryStorage() setup, hardened with a size cap and an image-only
// filter.
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(httpError(400, "Only image files are allowed for the avatar"));
  },
});
