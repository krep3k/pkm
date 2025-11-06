import { sql } from '../_lib/db.js';
import { verifyGoogleIdToken, createSession } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { credential } = req.body || {};
    if (!credential) return res.status(400).json({ error: 'missing credential' });

    const p = await verifyGoogleIdToken(credential);
    const { sub, email, name, picture } = p;

    const user = await sql`
      insert into users (google_sub, email, name, picture)
      values (${sub}, ${email}, ${name}, ${picture})
      on conflict (google_sub) do update set email = excluded.email, name = excluded.name, picture = excluded.picture
      returning id, email, name, picture
    `;
    await createSession(res, user.rows[0].id);
    res.json({ user: user.rows[0] });
  } catch (e) {
    res.status(400).json({ error: 'invalid token', detail: e.message });
  }
}
