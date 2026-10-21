// Access code for the admin pages (index.html, posts.html).
// The page stays hidden until  ?key=YOURCODE  (or the code typed in the box) matches HVL_CONFIG.adminHash.
// adminHash = SHA-256 of your code. To get it: open  index.html?sethash=YOURCODE  and copy the value into js/config.js.
(function () {
  const root = document.documentElement; root.style.visibility = 'hidden';
  const P = new URLSearchParams(location.search), want = (window.HVL_CONFIG || {}).adminHash || '';
  const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const G = '#hvl-gate';
  const css = `${G}{position:fixed;inset:0;z-index:2147483647;visibility:visible;overflow:auto;background:#11161f!important;color:#e9edf3;font:14px/1.5 Averta,"Segoe UI",system-ui,sans-serif;text-align:left}
    ${G} *{box-sizing:border-box;border-radius:0!important;font-family:inherit}
    ${G} .hvl-g{min-height:100vh;display:grid;place-items:center}
    ${G} .hvl-b{width:min(380px,90vw);background:#1a212d;border:1px solid #2f394b;border-top:2px solid #99f5fd;padding:26px;margin:0}
    ${G} h1{margin:0 0 4px;font-size:15px;font-weight:800;letter-spacing:.6px;color:#e9edf3}
    ${G} p{margin:0 0 16px;color:#8d98ab;font-size:13px}
    ${G} input{width:100%;font-size:14px;color:#e9edf3;background:#11161f;border:1px solid #3a4558;padding:9px 10px;outline:none;min-height:38px}
    ${G} input:focus{border-color:#99f5fd}
    ${G} button{margin-top:10px;width:100%;font-size:14px;font-weight:700;min-height:38px;border:0;background:#99f5fd;color:#1b2230;cursor:pointer}
    ${G} .hvl-e{color:#ff6b6b;font-size:12px;margin-top:8px;min-height:18px}${G} code{word-break:break-all;color:#99f5fd}`;
  // page stays hidden; the lock box is an overlay that alone is visible
  const lock = (msg, html) => {
    const show = () => {
      document.getElementById('hvl-gate')?.remove();
      const st = document.createElement('style'); st.textContent = css;
      const d = document.createElement('div'); d.id = 'hvl-gate';
      d.innerHTML = `<div class="hvl-g"><form class="hvl-b" id="hvl-f">${html || `<h1>ΠΕΡΙΟΡΙΣΜΕΝΗ ΠΡΟΣΒΑΣΗ</h1><p>Εισάγετε τον κωδικό πρόσβασης.</p><input id="hvl-k" type="password" autocomplete="off"><button>Είσοδος</button><div class="hvl-e">${msg || ''}</div>`}</form></div>`;
      d.prepend(st); root.appendChild(d);
      const f = document.getElementById('hvl-f'), k = document.getElementById('hvl-k');
      if (k) k.focus();
      if (f && !html) f.onsubmit = (e) => { e.preventDefault(); const u = new URL(location.href); u.searchParams.set('key', k.value); location.replace(u); };
    };
    if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
  };
  if (P.has('sethash')) { sha(P.get('sethash')).then((h) => lock('', `<h1>HASH ΚΩΔΙΚΟΥ</h1><p>Βάλτε την τιμή στο js/config.js ως <b>adminHash</b>:</p><code>${h}</code>`)); return; }
  if (!want) { root.style.visibility = ''; return; }                 // no code configured → open
  let stored = ''; try { stored = sessionStorage.getItem('hvl-key') || ''; } catch {}
  const key = P.get('key') || stored;
  if (!key) { lock(); return; }
  sha(key).then((h) => {
    if (h === want) { try { sessionStorage.setItem('hvl-key', key); } catch {} root.style.visibility = ''; }
    else { try { sessionStorage.removeItem('hvl-key'); } catch {} lock('Λάθος κωδικός.'); }
  });
})();
