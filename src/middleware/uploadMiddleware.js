const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================
// FOLDER UPLOAD
// =========================

const uploadPath = path.join(__dirname, "../../uploads/products");

// Buat folder kalau belum ada
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

// =========================
// STORAGE
// =========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const filename = `product-${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${extension}`;

    cb(null, filename);
  },
});

// =========================
// FILE FILTER
// =========================

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File harus berupa JPG, PNG, atau WEBP"), false);
  }
};

// =========================
// MULTER
// =========================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = upload;
