import { getStore } from '@netlify/blobs';
const out = (body, status=200) => new Response(JSON.stringify(body), { status, headers:{'content-type':'application/json','cache-control':'no-store'} });
export default async (request) => {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i,'');
  const session = token ? await getStore('admin-sessions').get(token,{type:'json'}) : null;
  if (!(session?.expiresAt > Date.now()) && request.headers.get('x-admin-key') !== process.env.ADMIN_PANEL_KEY) return out({error:'Unauthorized'},401);
  if (request.method !== 'PATCH') return out({error:'Method not allowed'},405);
  const { id, status } = await request.json();
  if (!id || !['New','In review','Closed'].includes(status)) return out({error:'Invalid update'},400);
  const store = getStore('boston-enquiries'); const record = await store.get(id,{type:'json'});
  if (!record) return out({error:'Not found'},404); record.status=status; await store.setJSON(id,record); return out({ok:true,record});
};
