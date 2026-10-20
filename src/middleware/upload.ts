import multer from 'multer';

/**
 * Nama field foto/video dinamis (mis. `photos[outside][front]`), jadi kami pakai
 * `upload.any()` lalu mengelompokkan file berdasarkan `fieldname`.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // sedikit di atas batas 1 MB agar bisa memberi respons 413 yang ramah
    fileSize: 1_100_000,
    files: 20,
    fields: 200,
    fieldSize: 1_000_000,
  },
});

export const PHOTO_FIELD_RE =
  /^photos\[(outside|inside)\]\[(front|back|left|right|top|bottom)\]$/;

export const VIDEO_FIELD_RE = /^videos\[\]$/;
