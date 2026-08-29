// dsh-photos — browser half.
// Photo upload for the composer: a 📷 button (next to the voice mic) opens
// the native file picker (on iPhone: Photo Library / Camera / Files) and
// feeds the chosen images into the composer's OWN paste pipeline — so stock
// validation (media type, count, size limits), thumbnails, and send flow all
// behave exactly as if the user pasted.
//
// House rules honored:
//  - No DOM mutation inside React's tree: the button and input are
//    position:fixed / hidden overlays (file-mentions crash class avoided).
//  - Reuse the stock handler instead of reimplementing admission: a synthetic
//    ClipboardEvent('paste') with a DataTransfer carrying the picked files.
window.__ModuleLoader__.load({ id: 'dsh-photos', factory: () => {
  var module = { exports: {} };

  var CSS = ''
    + '.dsh-photos-btn{position:fixed;z-index:40;width:30px;height:30px;border-radius:50%;'
    + 'border:1px solid var(--dsw-alias-border-inverted,#555);background:var(--dsw-specific-menu,#1e2129);'
    + 'color:var(--dsw-alias-label-secondary,#bbb);cursor:pointer;display:flex;align-items:center;'
    + 'justify-content:center;padding:0;font-size:14px;line-height:1;transition:all .15s ease;'
    + 'box-shadow:var(--dsw-shadow-lv2,0 1px 4px rgba(0,0,0,.3))}'
    + '.dsh-photos-btn:hover{color:var(--dsw-alias-label-primary,#fff)}';

  function ensureCss() {
    if (document.getElementById('dsh-photos-css')) return;
    var tag = document.createElement('style');
    tag.id = 'dsh-photos-css';
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }

  function findComposer() {
    var tas = document.querySelectorAll('textarea');
    for (var i = 0; i < tas.length; i++) {
      var ta = tas[i];
      if (ta.offsetWidth > 80 && ta.offsetHeight > 20) return ta;
    }
    return null;
  }

  function apply() {
    ensureCss();

    var btn = null;
    var input = null;

    function ensure() {
      if (btn) return;
      input = document.createElement('input');
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
        // Feed the files through the composer's own paste path: the stock
        // handler validates limits, mints draft attachments, and renders
        // thumbnails — identical to a real clipboard paste.
        var dt = new DataTransfer();
        files.forEach(function (f) { dt.items.add(f); });
        var ev = new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt });
        ta.dispatchEvent(ev);
      });
      document.body.appendChild(input);

      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dsh-photos-btn';
      btn.setAttribute('aria-label', 'Attach photos');
      btn.title = 'Attach photos to the message';
      btn.textContent = '📷';
      btn.addEventListener('click', function () { input.click(); });
      document.body.appendChild(btn);
    }

    function position() {
      if (!btn) return;
      var ta = findComposer();
      if (!ta) { btn.style.display = 'none'; return; }
      var r = ta.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) { btn.style.display = 'none'; return; }
      btn.style.display = 'flex';
      // Left of the voice mic (mic parks at right-38, top-34).
      btn.style.left = Math.min(window.innerWidth - 74, Math.max(6, r.right - 72)) + 'px';
      btn.style.top = Math.max(6, r.top - 34) + 'px';
    }

    ensure();
    position();
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', position);
    setInterval(position, 1500);
  }

  module.exports = { apply: apply };
  return module.exports;
} });
