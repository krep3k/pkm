import { requireAuth } from './_lib/auth.js';
import { sql } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const sess = await requireAuth(req, res); if (!sess) return;
    const { slug, display_name, description } = req.body || {};
    if (!slug || !display_name) return res.status(400).json({ error: 'slug & display_name required' });
    try {
      const r = await sql`
        insert into stores (owner_id, slug, display_name, description)
        values (${sess.userId}, ${slug}, ${display_name}, ${description || ''})
        returning id, slug, display_name, description
      `;
      res.json({ store: r.rows[0] });
    } catch (e) {
      res.status(400).json({ error: 'slug taken?' });
    }
  } else { res.status(405).end(); }
}
