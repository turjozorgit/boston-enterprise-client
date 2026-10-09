import { getStore } from '@netlify/blobs';
const out = (body, status=200) => new Response(JSON.stringify(body), { status, headers:{'content-type':'application/json','cache-control':'no-store'} });
export default async (request) => {
  if (request.method !== 'POST') return out({error:'Method not allowed'},405);
  const { phone, pin } = await request.json().catch(() => ({}));
  if (!phone || !pin || phone !== process.env.ADMIN_PHONE || pin !== process.env.ADMIN_PIN) return out({error:'Invalid phone number or PIN'},401);
  const token = crypto.randomUUID();
  await getStore('admin-sessions').setJSON(token, { expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
  return out({ ok:true, token });
};
