(function () {
  window.AvatarWidget = window.AvatarWidget || {};

  // 1. 配置中心：直接對接原作者開源且運作正常的 Vercel 端點
  const config = {
    widgetUrl: 'https://ai-avatar-bot-two.vercel.app/widget.html',
    apiUrl: 'https://ai-avatar-bot-two.vercel.app/api/tts',
    voiceName: 'zh-TW-HsiaoChenNeural',
    modelUrl: 'https://ai-avatar-bot-two.vercel.app/pics/Haru.model3.json',
    baseWidth: 380,
    baseHeight: 540
  };

  function init() {
    try {
      if (document.getElementById('zubida-ai-avatar-container')) return;
      injectCoreStyles();
      createPerfectWidget();
    } catch (error) {
      console.error('[Zubida AI Avatar Error]:', error);
    }
  }

  // 2. 控制外層容器在電腦版與手機版（RWD）的物理大小與縮放
  function injectCoreStyles() {
    const style = document.createElement('style');
    style.id = 'zubida-avatar-perfect-rwd';
    style.innerHTML = `
      /* 電腦桌面版：維持原作者最完美的寬高比例 */
      #zubida-ai-avatar-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: ${config.baseWidth}px;
        height: ${config.baseHeight}px;
        z-index: 999999;
        box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        border-radius: 16px;
        overflow: hidden;
        background: transparent;
        transform-origin: bottom right;
        transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
      }

      #zubida-ai-avatar-iframe {
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        background: transparent !important;
      }

      /* 【手機端縮放關鍵】當螢幕寬度小於 768px（手機）時，強制進行等比例縮小 */
      @media screen and (max-width: 768px) {
        #zubida-ai-avatar-container {
          transform: scale(0.65) !important; /* 降低至 65%，確保不會遮擋 2/3 螢幕 */
          bottom: 5px !important;
          right: 5px !important;
        }
      }

      /* 針對更小螢幕手機（如 iPhone SE）進行加強縮小保護 */
      @media screen and (max-width: 375px) {
        #zubida-ai-avatar-container {
          transform: scale(0.58) !important; /* 縮小至 58% */
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 3. 建立網頁元件，並將知識庫與神經語音參數精確傳遞過去
  function createPerfectWidget() {
    const container = document.createElement('div');
    container.id = 'zubida-ai-avatar-container';

    const iframe = document.createElement('iframe');
    iframe.id = 'zubida-ai-avatar-iframe';

    // 【核心修正：防快取機制】
    // 在知識庫網址後方強行加上時間戳記 (?v=當下時間)，確保手機瀏覽器一定會去抓最新修改的知識庫，而不是舊快取。
    const localKnowledgeUrl = window.location.origin + '/ZUBIDA/js/knowledge.js?v=' + Date.now();

    const srcParams = new URLSearchParams({
      model: config.modelUrl,
      api: config.apiUrl,
      voice: config.voiceName,
      knowledge: localKnowledgeUrl, // 帶有時間戳記的最新知識庫
      origin: window.location.origin
    });

    iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
    iframe.allow = "microphone; autoplay; encrypted-media"; 

    container.appendChild(iframe);
    document.body.appendChild(container);

    // 對外暴露標準控制函數
    window.AvatarWidget.close = () => { container.style.display = 'none'; };
    window.AvatarWidget.open = () => { container.style.display = 'block'; };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
