(async () => {
  const token = sessionStorage.getItem('bostonAdminSession');
  if (!token) { location.replace('/admin-login.html'); return; }
  const auth = { authorization: `Bearer ${token}` };
  const response = await fetch('/api/enquiries', { headers: auth });
  if (!response.ok) { document.getElementById('rows').innerHTML = '<div class="empty-admin">Admin access was not accepted.</div>'; return; }
  records = await response.json(); render();
  document.querySelectorAll('[data-status]').forEach((select) => {
    select.onchange = async () => {
      const id = select.dataset.status;
      const result = await fetch('/api/enquiry', { method: 'PATCH', headers: { 'content-type': 'application/json', ...auth }, body: JSON.stringify({ id, status: select.value }) });
      if (result.ok) { const record = records.find((item) => item.id === id); if (record) record.status = select.value; render(); }
    };
  });
})();
