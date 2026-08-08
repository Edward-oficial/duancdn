const express = require('express');
const supabase = require('../utils/supabaseClient');

const router = express.Router();
const BUCKET = 'photos';

router.get('/:filename', async (req, res) => {
  const { filename } = req.params;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  try {
    const upstream = await fetch(data.publicUrl);

    if (!upstream.ok) {
      return res.status(404).sendFile(require('path').join(__dirname, '..', 'public', '404.html'));
    }

    res.set('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ status: false, creator: 'Duan CDN', error: err.message });
  }
});

module.exports = router;
