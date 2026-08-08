const express = require('express');
const path = require('path');
const supabase = require('../utils/supabaseClient');

const router = express.Router();
const BUCKET = 'photos';

router.get('/:filename', async (req, res) => {
  const { filename } = req.params;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  try {
    const headers = {};
    if (req.headers.range) headers.Range = req.headers.range;

    const upstream = await fetch(data.publicUrl, { headers });

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
    }

    res.status(upstream.status);
    res.set('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    res.set('Accept-Ranges', 'bytes');

    const contentRange = upstream.headers.get('content-range');
    if (contentRange) res.set('Content-Range', contentRange);

    const contentLength = upstream.headers.get('content-length');
    if (contentLength) res.set('Content-Length', contentLength);

    res.set('Cache-Control', 'public, max-age=31536000, immutable');

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ status: false, creator: 'Duan CDN', error: err.message });
  }
});

module.exports = router;
