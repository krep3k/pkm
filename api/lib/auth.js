import { OAuth2Client } from 'google-auth-library';
import { kv } from './kv.js';
import crypto from 'node:crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SESSION_PREFIX = 'sess:';
const COOKIE = 'sid';

export async function verifyGoogleIdToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  return ticket.getPayload(); // {sub, email, name, picture, ...}
}

export async function createSession(res, userId) {
  const sid = crypto.randomUUID();
  const ttl = 60 * 60 * 24 * 7; // 7 hari
  await kv.set(SESSION_PREFIX + sid, { userId }, { ex: ttl });
  res.setHeader('Set-Cookie', `${COOKIE}=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ttl}`);
}

export async function getSession(req) {
  const cookie = (req.headers.cookie || '').split(';').find(c => c.trim().startsWith('sid='));
  if (!cookie) return null;
  const sid = cookie.split('=')[1];
  const data = await kv.get(SESSION_PREFIX + sid);
  return data ? { sid, ...data } : null;
}

export async function destroySession(req, res) {
  const cookie = (req.headers.cookie || '').split(';').find(c => c.trim().startsWith('sid='));
  if (cookie) {
    const sid = cookie.split('=')[1];
    await kv.del(SESSION_PREFIX + sid);
  }
  res.setHeader('Set-Cookie', `sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

export async function requireAuth(req, res) {
  const sess = await getSession(req);
  if (!sess) {
    res.status(401).json({ error: 'login required' });
    return null;
  }
  return sess;
}
