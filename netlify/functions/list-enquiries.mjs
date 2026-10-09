import { getStore } from '@netlify/blobs';
const out = (body, status=200) => new Response(JSON.stringify(body), { status, headers:{'content-type':'application/json','cache-control':'no-store'} });
export default async (request) => {
  if (request.headers.get('x-admin-key') !== process.env.ADMIN_PANEL_KEY) return out({error:'Unauthorized'},401);
  const store = getStore('boston-enquiries');
  const items = [];
  for await (const page of store.list({ paginate: true })) for (const item of page.blobs) items.push(await store.get(item.key, { type:'json' }));
  return out(items.filter(Boolean).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
};
