import { sql } from './_lib/db.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { q } = req.query;
    const rows = q
      ? (await sql`select p.*, s.slug as store_slug from products p join stores s on p.store_id=s.id where p.title ilike ${'%' + q + '%'} order by p.created_at desc`).rows
      : (await sql`select p.*, s.slug as store_slug from products p join stores s on p.store_id=s.id order by p.created_at desc`).rows;
    res.json({ products: rows });
  } else if (req.method === 'POST') {
    const sess = await requireAuth(req, res); if (!sess) return;
    const { store_slug, title, description, price_cents, image_url } = req.body || {};
    if (!store_slug || !title || !price_cents) return res.status(400).json({ error: 'missing fields' });
    const store = (await sql`select id, owner_id from stores where slug=${store_slug}`).rows[0];
    if (!store || store.owner_id !== sess.userId) return res.status(403).json({ error: 'not your store' });
    const r = await sql`
      insert into products (store_id, title, description, price_cents, image_url)
      values (${store.id}, ${title}, ${description || ''}, ${price_cents}, ${image_url || null})
      returning *
    `;
    res.json({ product: r.rows[0] });
  } else { res.status(405).end(); }
}
