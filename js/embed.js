/* =====================================================================
 * embed.js — ZUBIDA AI 助理嵌入載入器（穩定輕量版）
 * - 建立右下角 iframe widget
 * - 支援 data-width / data-height / data-bottom / data-open
 * - 預設收合，避免擋住手機畫面與右下角電話 CTA
 * ===================================================================== */
(function () {
  'use strict';

  var me = document.currentScript || (function () {
    var ss = document.getElementsByTagName('script');
    for (var i = ss.length - 1; i >= 0; i -= 1) {
      if (/embed\.js(\?|$)/.test(ss[i].src || '')) return ss[i];
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

  var expandedWidth = parseInt(attr('data-width', '300'), 10) || 300;
  var expandedHeight = parseInt(attr('data-height', '420'), 10) || 420;
  var bottomOffset = parseInt(attr('data-bottom', '92'), 10) || 92;
  var rightOffset = parseInt(attr('data-right', '16'), 10) || 16;
  var startOpen = attr('data-open', 'false') === 'true';

  var widgetOrigin = (function () {
    try { return new URL(widgetUrl, location.href).origin; }
    catch (err) { return '*'; }
  })();

  var cfg = new URLSearchParams();
  ['knowledge', 'text'].forEach(function (key) {
    var value = attr('data-' + key, '');
    if (value) cfg.set(key, value);
  });

  var iframeSrc = widgetUrl + (cfg.toString() ? (widgetUrl.indexOf('?') < 0 ? '?' : '&') + cfg.toString() : '');

  var style = document.createElement('style');
  style.textContent =
    '#avatar-widget-root{position:fixed;right:' + rightOffset + 'px;bottom:' + bottomOffset + 'px;z-index:2147483000;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}' +
    '#avatar-widget-root .aw-bubble{transition:transform .15s,box-shadow .15s;}' +
    '#avatar-widget-root .aw-bubble:hover{transform:scale(1.06);}' +
    '#avatar-widget-root .aw-bubble:active{transform:scale(.96);}' +
    '#avatar-widget-root .aw-bubble::after{content:"";position:absolute;inset:0;border-radius:50%;animation:awpulse 2.3s ease-out infinite;pointer-events:none;}' +
    '@keyframes awpulse{0%{box-shadow:0 0 0 0 rgba(30,58,138,.45);}70%{box-shadow:0 0 0 14px rgba(30,58,138,0);}100%{box-shadow:0 0 0 0 rgba(30,58,138,0);}}' +
    '@media (max-width:480px){#avatar-widget-root{right:12px!important;bottom:86px!important;}}';
  (document.head || document.documentElement).appendChild(style);

  var root = document.createElement('div');
  root.id = 'avatar-widget-root';

  var iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.title = '租必達 AI 助理';
  iframe.setAttribute('allow', 'microphone; autoplay');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = 'width:100%;height:100%;border:0;background:transparent;color-scheme:normal;display:block;';

  var bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.className = 'aw-bubble';
  bubble.setAttribute('aria-label', '開啟租必達 AI 助理');
  bubble.innerHTML = '<span style="font-size:25px;line-height:1">💬</span>';
  bubble.style.cssText = [
    'position:absolute',
    'right:0',
    'bottom:0',
    'width:62px',
    'height:62px',
    'border:0',
    'border-radius:999px',
    'cursor:pointer',
    'background:linear-gradient(135deg,#1e3a8a,#3b82f6)',
    'color:#fff',
    'box-shadow:0 10px 24px rgba(15,23,42,.28)',
    'display:none',
    'align-items:center',
    'justify-content:center'
  ].join(';');

  root.appendChild(iframe);
  root.appendChild(bubble);
  (document.body || document.documentElement).appendChild(root);

  function clampForMobile() {
    var vw = window.innerWidth || document.documentElement.clientWidth || 360;
    var vh = window.innerHeight || document.documentElement.clientHeight || 640;
    var w = Math.min(expandedWidth, Math.max(280, vw - 24));
    var h = Math.min(expandedHeight, Math.max(340, vh - 130));
    return { w: w, h: h };
  }

  function setOpen(open) {
    if (open) {
      var size = clampForMobile();
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
    if (data.type === 'ready') {
      // 保留擴充點：widget ready 後可觸發歡迎語或 GA 事件。
    }
    if (data.type === 'error' && window.console) {
      console.warn('[ZUBIDA AI widget]', data.message || data);
    }
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
          ns: 'avatar-widget-host',
          type: 'say',
          text: String(text || '').slice(0, 600)
        }, widgetOrigin);
      }
    }
  };
})();
