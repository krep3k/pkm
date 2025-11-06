const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const dashBtn = document.getElementById('dashBtn');

async function refreshUI() {
  const me = await (await fetch('/api/me')).json();
  const logged = !!me.user;
  if (loginBtn) loginBtn.style.display = logged ? 'none' : 'inline-block';
  if (logoutBtn) logoutBtn.style.display = logged ? 'inline-block' : 'none';
  if (dashBtn) dashBtn.style.display = logged ? 'inline-block' : 'none';
}
refreshUI();

if (window.google) {
  window.google.accounts.id.initialize({
    client_id: window.GOOGLE_CLIENT_ID || (document.querySelector('meta[name="google-client-id"]')?.content),
    callback: async (resp) => {
      const r = await fetch('/api/auth/google',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({credential:resp.credential})});
      if (r.ok) { await refreshUI(); } else { alert('Login gagal'); }
    }
  });
}
if (loginBtn) loginBtn.addEventListener('click', ()=>{
  if (!window.google?.accounts?.id) return alert('Google Identity belum siap.');
  google.accounts.id.prompt(); // tampilkan one-tap / dialog
});

if (logoutBtn) logoutBtn.addEventListener('click', async ()=>{
  await fetch('/api/auth/logout',{method:'POST'});
  await refreshUI();
});
