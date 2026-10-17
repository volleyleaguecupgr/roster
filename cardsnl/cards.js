/* Shared renderer for broadcast cards.
 * Static mode : all content comes from URL params   (?p1=...&r1=...&c1=...)
 * Live mode   : ?live=1 -> content comes from the editor (index.html) via localStorage,
 *               updates instantly when the editor is open as an OBS Custom Browser Dock.
 */
(function () {
  const KEY = 'bcards-state-v1';
  const BRAND = { logo: 'logo.png', c1: '#0B3A5E', c2: '#4EC1EA', c3: '#FFFFFF', t: 'NATIONAL LEAGUE 1', s: '' };
  const hex = (v, d) => { if (!v) return d; v = String(v).trim(); return /^[0-9a-f]{3,8}$/i.test(v) ? '#' + v : v; };

  window.initCard = function (kind, defaults) {
    const Q = new URLSearchParams(location.search);
    const live = Q.get('live') === '1';
    const $ = id => document.getElementById(id);
    let first = true, prevVis = true, lastRaw = null;

    const fromUrl = () => { const o = {}; for (const [k, v] of Q) o[k] = v; return o; };
    const readStore = () => { try { return localStorage.getItem(KEY) || '{}'; } catch (e) { return '{}'; } };
    const fromStore = raw => { try { const s = JSON.parse(raw); return Object.assign({}, s.brand || {}, s[kind] || {}); } catch (e) { return {}; } };

    function render() {
      const raw = live ? readStore() : '';
      lastRaw = raw;
      const src = Object.assign({}, BRAND, defaults, live ? fromStore(raw) : {}, fromUrl());
      const rs = document.documentElement.style;
      rs.setProperty('--c1', hex(src.c1, BRAND.c1));
      rs.setProperty('--c2', hex(src.c2, BRAND.c2));
      rs.setProperty('--c3', hex(src.c3, BRAND.c3));
      rs.setProperty('--scale', parseFloat(src.scale) || 1);
      document.body.dataset.pos = src.pos || 'bl';

      const lb = $('logoBox'), img = $('logo');
      if (src.logo) { if (img.getAttribute('src') !== src.logo) img.src = src.logo; lb.hidden = false; }
      else lb.hidden = true;

      $('h').textContent = src.h || '';
      $('t').textContent = src.t || '';
      $('s').textContent = src.s || '';
      $('s').hidden = !src.s;

      const vis = !(live && (src.vis === false || src.vis === 'false'));
      const justShown = vis && !prevVis;
      prevVis = vis;
      document.body.classList.toggle('noanim', String(src.anim) === '0' || !(first || justShown));
      if (justShown) { const c = $('card'); c.style.animation = 'none'; void c.offsetWidth; c.style.animation = ''; }
      document.body.classList.toggle('out', !vis);
      first = false;

      const box = $('people'); box.innerHTML = '';
      let n = 0;
      for (let i = 1; i <= 6; i++) {
        const name = src['p' + i]; if (!name) continue;
        const d = document.createElement('div');
        d.className = 'person'; d.style.setProperty('--i', n++);
        d.innerHTML = '<div class="name"></div><div class="role"></div>';
        d.children[0].textContent = name;
        d.children[1].textContent = src['r' + i] || '';
        box.appendChild(d);
      }
      const cols = parseInt(src.cols, 10) || (kind === 'refs' ? (n <= 3 ? n : 2) : Math.min(n, 3)) || 1;
      box.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    }

    render();
    if (live) {
      addEventListener('storage', e => { if (e.key === KEY) render(); });
      setInterval(() => { if (readStore() !== lastRaw) render(); }, 1000); // fallback
    }
  };
})();
