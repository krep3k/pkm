import { requireAuth } from './_lib/auth.js';
import { sql } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const sess = await requireAuth(req, res); if (!sess) return;

  const { items } = req.body || {}; // [{product_id, qty}]
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'items required' });

  const ids = items.map(i => i.product_id);
  const products = (await sql`select id, price_cents from products where id = any(${ids})`).rows;
  if (products.length !== ids.length) return res.status(400).json({ error: 'invalid product' });

  const total = items.reduce((sum, i) => {
    const p = products.find(x => x.id === i.product_id);
    return sum + (p.price_cents * i.qty);
  }, 0);

  const order = (await sql`insert into orders (buyer_id, total_cents) values (${sess.userId}, ${total}) returning id, total_cents`).rows[0];
  for (const i of items) {
    const p = products.find(x => x.id === i.product_id);
    await sql`insert into order_items (order_id, product_id, qty, price_cents) values (${order.id}, ${p.id}, ${i.qty}, ${p.price_cents})`;
  }
  res.json({ order_id: order.id, total_cents: order.total_cents, status: 'created' });
}
