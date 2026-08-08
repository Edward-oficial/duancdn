const express = require('express');
const supabase = require('../utils/supabaseClient');

const router = express.Router();
const BUCKET = 'photos';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

async function cleanupExpired() {
  const cutoff = new Date(Date.now() - MAX_AGE_MS).toISOString();
  const { data: expired } = await supabase.from('duan_cdn_files').select('id').lt('created_at', cutoff);

  if (!expired || !expired.length) return;

  await supabase.from('duan_cdn_files').delete().in('id', expired.map((r) => r.id));
}

router.get('/', async (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    return res.status(400).json({ status: false, creator: 'Duan CDN', error: 'Falta uid' });
  }

  await cleanupExpired();

  const { data, error } = await supabase
    .from('duan_cdn_files')
    .select('*')
    .eq('uid', uid)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ status: false, creator: 'Duan CDN', error: error.message });
  }

  const files = data.map((row) => ({
    filename: row.filename,
    mimetype: row.mimetype,
    createdAt: row.created_at,
    expiresAt: new Date(new Date(row.created_at).getTime() + MAX_AGE_MS).toISOString(),
    url: `${req.protocol}://${req.get('host')}/cdn/${row.filename}`,
  }));

  res.json({ status: true, creator: 'Duan CDN', files });
});

router.delete('/:filename', async (req, res) => {
  const { filename } = req.params;
  const uid = req.query.uid;

  if (!uid) {
    return res.status(400).json({ status: false, creator: 'Duan CDN', error: 'Falta uid' });
  }

  const { data: row } = await supabase
    .from('duan_cdn_files')
    .select('id')
    .eq('filename', filename)
    .eq('uid', uid)
    .maybeSingle();

  if (!row) {
    return res.status(404).json({ status: false, creator: 'Duan CDN', error: 'No encontrado' });
  }

  await supabase.storage.from(BUCKET).remove([filename]);
  await supabase.from('duan_cdn_files').delete().eq('id', row.id);

  res.json({ status: true, creator: 'Duan CDN' });
});

module.exports = { router, cleanupExpired };
