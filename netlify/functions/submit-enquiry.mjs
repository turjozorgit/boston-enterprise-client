import { getStore } from '@netlify/blobs';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
});

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const payload = await request.json();
    if (!payload?.data || !Array.isArray(payload.data)) return json({ error: 'Invalid enquiry' }, 400);
    const id = `BE-${Date.now().toString(36).toUpperCase()}`;
    const createdAt = new Date().toISOString();
    const record = { id, createdAt, status: 'New', data: payload.data };
    const store = getStore('boston-enquiries');
    await store.setJSON(id, record);

    const pixelId = process.env.META_DATASET_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    if (pixelId && accessToken) {
      const eventId = payload.eventId || id;
      const event = {
        event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId,
        action_source: 'website', event_source_url: payload.sourceUrl || request.url,
        user_data: { client_user_agent: request.headers.get('user-agent') || undefined },
        custom_data: { service: payload.service || 'general_guidance' }
      };
      const response = await fetch(`https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: [event] })
      });
      if (!response.ok) console.error('Meta CAPI rejected event', await response.text());
    }
    return json({ ok: true, id, eventId: payload.eventId || id });
  } catch (error) {
    console.error(error);
    return json({ error: 'Unable to save enquiry' }, 500);
  }
};
