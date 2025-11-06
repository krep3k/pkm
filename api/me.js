import { getSession } from './_lib/auth.js';
import { sql } from './_lib/db.js';

export default async function handler(req, res) {
  const sess = await getSession(req);
  if (!sess) return res.json({ user: null });
  const u = await sql`select id, email, name, picture from users where id=${sess.userId}`;
  res.json({ user: u.rows[0] || null });
}
