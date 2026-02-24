import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve("uploads", "leave-attachments");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${unique}-${safeName}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported attachment type"));
  }
};

export const leaveAttachmentUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,
    fileSize: 25 * 1024 * 1024,
  },
});
