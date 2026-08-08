const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const supabase = require('../utils/supabaseClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const BUCKET = 'photos';

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: false, creator: 'Duan CDN', error: 'Falta el archivo' });
  }

  const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const filename = `${crypto.randomBytes(12).toString('hex')}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filename, req.file.buffer, {
    contentType: req.file.mimetype,
    upsert: false,
  });

  if (error) {
    return res.status(500).json({ status: false, creator: 'Duan CDN', error: error.message });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  res.json({
    status: true,
    creator: 'Duan CDN',
    filename,
    urlDirecta: data.publicUrl,
    urlPropia: `${req.protocol}://${req.get('host')}/cdn/${filename}`,
  });
});

module.exports = router;
