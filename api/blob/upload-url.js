import { generateUploadUrl } from '../_lib/blob.js';
import { requireAuth } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const sess = await requireAuth(req, res); if (!sess) return;
  const { url } = await generateUploadUrl(); // client pakai PUT ke URL ini
  res.json({ uploadUrl: url });
}
