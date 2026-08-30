// dsh-photos — browser half.
// Photo upload for the composer: camera button in the shared composer-tools
// toolbar opens the native file picker (iPhone: Photo Library / Camera /
// Files) and feeds the chosen images into the composer's OWN paste pipeline —
// stock validation, thumbnails, and send flow behave exactly like a real paste.
//
// House rules honored:
//  - No DOM mutation inside React's tree: toolbar is position:fixed; the file
//    input is hidden (file-mentions crash class avoided).
//  - Reuse the stock handler: a synthetic ClipboardEvent('paste') carrying a
//    DataTransfer with the picked files.
//  - Clean SVG icons only — no emoji.
window.__ModuleLoader__.load({ id: 'dsh-photos', factory: () => {
  var module = { exports: {} };

  var CAMERA_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/></svg>';

  // ── Shared composer-tools toolbar (idempotent; any plugin may create it) ──
  var TOOLBAR_CSS = ''
    + '#dsh-composer-tools{position:fixed;z-index:40;display:flex;align-items:center;gap:4px;padding:4px;'
    + 'border-radius:20px;border:1px solid var(--dsw-alias-border-inverted,rgba(255,255,255,.12));'
    + 'background:var(--dsw-specific-menu,rgba(20,22,28,.85));backdrop-filter:blur(8px);'
    + 'box-shadow:var(--dsw-shadow-lv2,0 2px 8px rgba(0,0,0,.35))}'
    + '#dsh-composer-tools .dsh-ct-btn{width:32px;height:32px;border-radius:50%;border:none;background:transparent;'
    + 'color:var(--dsw-alias-label-secondary,#bbb);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}'
    + '#dsh-composer-tools .dsh-ct-btn:hover{color:var(--dsw-alias-label-primary,#fff);'
    + 'background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08))}'
    + '#dsh-composer-tools .dsh-ct-btn svg{width:17px;height:17px;display:block}'
    + "html[data-dsh-menu-open='1'] #dsh-composer-tools{visibility:hidden}";

  function findComposer() {
    var tas = document.querySelectorAll('textarea');
    for (var i = 0; i < tas.length; i++) {
      var ta = tas[i];
      if (ta.offsetWidth > 80 && ta.offsetHeight > 20) return ta;
    }
    return null;
  }

  function positionToolbar(tb) {
    var ta = findComposer();
    if (!ta) { tb.style.display = 'none'; return; }
    var r = ta.getBoundingClientRect();
    // iOS: fixed positioning follows the VISUAL viewport, but
    // getBoundingClientRect is layout-viewport-relative. With the keyboard
    // open or a pinch-zoom pan, the two diverge and the toolbar detaches
    // from the composer (floats mid-screen over the submit area). Convert
    // via visualViewport offsets; on desktop offsets are 0 (no-op).
    var vv = window.visualViewport;
    var offT = vv ? vv.offsetTop : 0;
    var offL = vv ? vv.offsetLeft : 0;
    var vw = vv ? vv.width : window.innerWidth;
    var vh = vv ? vv.height : window.innerHeight;
    var topV = r.top - offT;
    if (r.bottom - offT < 0 || topV > vh) { tb.style.display = 'none'; return; }
    tb.style.display = 'flex';
    tb.style.left = 'auto';
    tb.style.right = Math.max(6, vw - (r.right - offL)) + 'px';
    tb.style.top = Math.max(6, topV - 42) + 'px';
  }

  function ensureToolbar() {
    if (!document.getElementById('dsh-composer-tools-css')) {
      var tag = document.createElement('style');
      tag.id = 'dsh-composer-tools-css';
      tag.textContent = TOOLBAR_CSS;
      document.head.appendChild(tag);
    }
    var tb = document.getElementById('dsh-composer-tools');
    if (tb) return tb;
    tb = document.createElement('div');
    tb.id = 'dsh-composer-tools';
    document.body.appendChild(tb);
    var pos = function () { positionToolbar(tb); };
    window.addEventListener('resize', pos);
    window.addEventListener('scroll', pos, true);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', pos);
      window.visualViewport.addEventListener('scroll', pos); // iOS keyboard pan
    }
    setInterval(pos, 1500);
    pos();
    return tb;
  }
  // ─────────────────────────────────────────────────────────────────────────

  function apply() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.style.display = 'none';
    input.addEventListener('change', function () {
      var files = Array.prototype.slice.call(input.files || []);
      input.value = '';
      if (!files.length) return;
      var ta = findComposer();
      if (!ta) return;
      var dt = new DataTransfer();
      files.forEach(function (f) { dt.items.add(f); });
      var ev = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt });
      ta.dispatchEvent(ev);
    });
    document.body.appendChild(input);

    var tb = ensureToolbar();
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dsh-ct-btn';
    btn.setAttribute('aria-label', 'Attach photos');
    btn.title = 'Attach photos to the message';
    btn.innerHTML = CAMERA_SVG;
    btn.addEventListener('click', function () { input.click(); });
    tb.appendChild(btn);
  }

  module.exports = { apply: apply };
  return module.exports;
} });
