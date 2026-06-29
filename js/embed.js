/* ZUBIDA Live2D voice avatar widget loader */
(function () {
  'use strict';

  var NS_FROM_WIDGET = 'avatar-widget';
  var NS_TO_WIDGET = 'avatar-widget-host';
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
  var expandedWidth = parseInt(attr('data-width', '320'), 10) || 320;
  var expandedHeight = parseInt(attr('data-height', '400'), 10) || 400;
  var rightOffset = parseInt(attr('data-right', '16'), 10) || 16;
  var bottomOffset = parseInt(attr('data-bottom', '16'), 10) || 16;
  var startOpen = attr('data-open', 'false') === 'true';
  var widgetOrigin = (function () {
    try { return new URL(widgetUrl, location.href).origin; } catch (err) { return '*'; }
  })();

  var params = new URLSearchParams();
  ['knowledge', 'model', 'api', 'voice', 'text', 'brand', 'title'].forEach(function (key) {
    var value = attr('data-' + key, '');
    if (value) params.set(key, value);
  });
  var iframeSrc = widgetUrl + (params.toString() ? (widgetUrl.indexOf('?') < 0 ? '?' : '&') + params.toString() : '');

  var style = document.createElement('style');
  style.textContent =
    '#zubida-avatar-root{position:fixed;right:' + rightOffset + 'px;bottom:' + bottomOffset + 'px;z-index:2147483000;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}' +
    '#zubida-avatar-root .zaw-bubble{transition:transform .16s,box-shadow .16s;}' +
    '#zubida-avatar-root .zaw-bubble:hover{transform:scale(1.06);box-shadow:0 14px 28px rgba(30,58,138,.36);}' +
    '#zubida-avatar-root .zaw-bubble:active{transform:scale(.96);}' +
    '#zubida-avatar-root .zaw-bubble:focus-visible{outline:3px solid rgba(245,158,11,.55);outline-offset:4px;}' +
    '#zubida-avatar-root .zaw-bubble::after{content:"";position:absolute;inset:0;border-radius:999px;animation:zawpulse 2.4s ease-out infinite;pointer-events:none;}' +
    '@keyframes zawpulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,.45);}70%{box-shadow:0 0 0 15px rgba(59,130,246,0);}100%{box-shadow:0 0 0 0 rgba(59,130,246,0);}}' +
    '@media (max-width:480px){#zubida-avatar-root{right:12px!important;bottom:12px!important;}}';
  (document.head || document.documentElement).appendChild(style);

  var root = document.createElement('div');
  root.id = 'zubida-avatar-root';

  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.title = 'ZUBIDA 租必達 AI 設備租賃客服';
  iframe.setAttribute('allow', 'microphone; autoplay');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = 'width:100%;height:100%;border:0;background:transparent;color-scheme:normal;display:block;';

  var bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'zaw-bubble';
  bubble.setAttribute('aria-label', '開啟 ZUBIDA 租必達 AI 設備租賃客服');
  bubble.innerHTML = '<span style="font-size:24px;line-height:1">租</span><span style="position:absolute;right:-4px;top:-5px;background:#f97316;color:#fff;border-radius:999px;font-size:15px;width:24px;height:24px;display:grid;place-items:center;border:2px solid #fff">🎤</span>';
  bubble.style.cssText = [
    'position:absolute', 'right:0', 'bottom:0', 'width:64px', 'height:64px',
    'border:0', 'border-radius:999px', 'cursor:pointer', 'font-weight:900',
    'background:linear-gradient(135deg,#1e3a8a,#3b82f6)', 'color:#fff',
    'box-shadow:0 10px 24px rgba(15,23,42,.28)',
    'display:none', 'align-items:center', 'justify-content:center'
  ].join(';');

  root.appendChild(iframe);
  root.appendChild(bubble);
  (document.body || document.documentElement).appendChild(root);

  function getOpenSize() {
    var vw = window.innerWidth || document.documentElement.clientWidth || 360;
    var vh = window.innerHeight || document.documentElement.clientHeight || 640;
    var isMobile = vw <= 640;
    var maxWidth = Math.max(280, vw - 24);
    var maxHeight = isMobile ? Math.max(330, Math.floor(vh * 0.58)) : Math.max(360, vh - 48);
    return {
      w: Math.min(expandedWidth, maxWidth),
      h: Math.min(expandedHeight, maxHeight)
    };
  }

  function setOpen(open) {
    if (open) {
      var size = getOpenSize();
      root.style.width = size.w + 'px';
      root.style.height = size.h + 'px';
      iframe.style.display = 'block';
      bubble.style.display = 'none';
    } else {
      root.style.width = '64px';
      root.style.height = '64px';
      iframe.style.display = 'none';
      bubble.style.display = 'flex';
    }
  }

  bubble.addEventListener('click', function () { setOpen(true); });

  window.addEventListener('message', function (event) {
    if (widgetOrigin !== '*' && event.origin !== widgetOrigin) return;
    var data = event.data || {};
    if (data.ns !== NS_FROM_WIDGET) return;
    if (data.type === 'close') setOpen(false);
    if (data.type === 'ready') return;
    if (data.type === 'error' && window.console) console.warn('[ZUBIDA AI widget]', data.message || data);
  });

  window.addEventListener('resize', function () {
    if (iframe.style.display !== 'none') setOpen(true);
  });

  setOpen(startOpen);

  window.AvatarWidget = {
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    say: function (text) {
      setOpen(true);
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          ns: NS_TO_WIDGET,
          type: 'say',
          text: String(text || '').slice(0, 600)
        }, widgetOrigin);
      }
    }
  };
})();
