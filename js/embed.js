/* ZUBIDA compact AI customer-service widget loader */
(function () {
  'use strict';
  var me = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      if (/embed\.js(\?|$)/.test(scripts[i].src || '')) return scripts[i];
    }
    return null;
  })();
  function attr(name, fallback) {
    if (!me) return fallback;
    var value = me.getAttribute(name);
    return value === null || value === '' ? fallback : value;
  }
  var base = me ? me.src.replace(/[^/]*$/, '') : '';
  var widgetUrl = attr('data-widget', base + 'widget.html');
  var expandedWidth = parseInt(attr('data-width', '292'), 10) || 292;
  var expandedHeight = parseInt(attr('data-height', '330'), 10) || 330;
  var rightOffset = parseInt(attr('data-right', '16'), 10) || 16;
  var bottomOffset = parseInt(attr('data-bottom', '16'), 10) || 16;
  var startOpen = attr('data-open', 'true') === 'true';
  var widgetOrigin = (function () { try { return new URL(widgetUrl, location.href).origin; } catch (err) { return '*'; } })();

  var cfg = new URLSearchParams();
  ['knowledge','model','api','voice','text','brand','title'].forEach(function (key) {
    var value = attr('data-' + key, '');
    if (value) cfg.set(key, value);
  });
  var iframeSrc = widgetUrl + (cfg.toString() ? (widgetUrl.indexOf('?') < 0 ? '?' : '&') + cfg.toString() : '');

  var style = document.createElement('style');
  style.textContent =
    '#zubida-avatar-root{position:fixed;right:' + rightOffset + 'px;bottom:' + bottomOffset + 'px;z-index:2147483000;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}' +
    '#zubida-avatar-root .zaw-bubble{transition:transform .16s,box-shadow .16s;}' +
    '#zubida-avatar-root .zaw-bubble:hover{transform:scale(1.06);}' +
    '#zubida-avatar-root .zaw-bubble:active{transform:scale(.96);}' +
    '#zubida-avatar-root .zaw-bubble::after{content:"";position:absolute;inset:0;border-radius:50%;animation:zawpulse 2.4s ease-out infinite;pointer-events:none;}' +
    '@keyframes zawpulse{0%{box-shadow:0 0 0 0 rgba(30,58,138,.42);}70%{box-shadow:0 0 0 14px rgba(30,58,138,0);}100%{box-shadow:0 0 0 0 rgba(30,58,138,0);}}' +
    '@media (max-width:480px){#zubida-avatar-root{right:12px!important;bottom:14px!important;}}';
  (document.head || document.documentElement).appendChild(style);

  var root = document.createElement('div');
  root.id = 'zubida-avatar-root';

  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.title = '租必達 AI 客服助理';
  iframe.setAttribute('allow', 'microphone; autoplay');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = 'width:100%;height:100%;border:0;background:transparent;color-scheme:normal;display:block;';

  var bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'zaw-bubble';
  bubble.setAttribute('aria-label', '開啟租必達 AI 客服');
  bubble.innerHTML = '<span style="font-size:26px;line-height:1">💬</span>';
  bubble.style.cssText = [
    'position:absolute','right:0','bottom:0','width:62px','height:62px',
    'border:0','border-radius:999px','cursor:pointer',
    'background:linear-gradient(135deg,#1e3a8a,#3b82f6)','color:#fff',
    'box-shadow:0 10px 24px rgba(15,23,42,.28)',
    'display:none','align-items:center','justify-content:center'
  ].join(';');

  root.appendChild(iframe);
  root.appendChild(bubble);
  (document.body || document.documentElement).appendChild(root);

  function getOpenSize() {
    var vw = window.innerWidth || document.documentElement.clientWidth || 360;
    var vh = window.innerHeight || document.documentElement.clientHeight || 640;
    return { w: Math.min(expandedWidth, Math.max(268, vw - 24)), h: Math.min(expandedHeight, Math.max(308, vh - 96)) };
  }
  function setOpen(open) {
    if (open) {
      var size = getOpenSize();
      root.style.width = size.w + 'px';
      root.style.height = size.h + 'px';
      iframe.style.display = 'block';
      bubble.style.display = 'none';
    } else {
      root.style.width = '62px';
      root.style.height = '62px';
      iframe.style.display = 'none';
      bubble.style.display = 'flex';
    }
  }
  bubble.addEventListener('click', function () { setOpen(true); });
  window.addEventListener('message', function (event) {
    if (widgetOrigin !== '*' && event.origin !== widgetOrigin) return;
    var data = event.data || {};
    if (data.ns !== 'avatar-widget') return;
    if (data.type === 'close') setOpen(false);
    if (data.type === 'error' && window.console) console.warn('[ZUBIDA AI widget]', data.message || data);
  });
  window.addEventListener('resize', function () { if (iframe.style.display !== 'none') setOpen(true); });
  setOpen(startOpen);
  window.AvatarWidget = {
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    say: function (text) {
      setOpen(true);
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ ns: 'avatar-widget-host', type: 'say', text: String(text || '').slice(0, 600) }, widgetOrigin);
      }
    }
  };
})();
