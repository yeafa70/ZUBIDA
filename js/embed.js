(function () {
    window.AvatarWidget = window.AvatarWidget || {};

    // 1. 配置中心：精確讀取 HTML 上的 data 屬性
    const scriptTag = document.currentScript;
    const config = {
        widgetUrl: scriptTag.getAttribute('data-widget') || 'widget.html',
        model: scriptTag.getAttribute('data-model') || '',
        vrm: scriptTag.getAttribute('data-vrm') || '',
        engine: scriptTag.getAttribute('data-engine') || '2d',
        baseWidth: parseInt(scriptTag.getAttribute('data-width')) || 360,
        baseHeight: parseInt(scriptTag.getAttribute('data-height')) || 520,
        isOpenByDefault: scriptTag.getAttribute('data-open') === 'true'
    };

    function init() {
        try {
            if (document.getElementById('zubida-ai-avatar-container')) return;

            // 注入物理尺寸精準定位樣式
            injectStyles();
            createWidget();
        } catch (error) {
            console.error('[Avatar Widget Error]:', error);
        }
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'zubida-avatar-fixed-rwd';
        style.innerHTML = `
            /* 桌面版：保持最完美的原始精緻外觀與完整對話框 */
            #zubida-ai-avatar-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: ${config.baseWidth}px;
                height: ${config.baseHeight}px;
                z-index: 999999;
                box-shadow: 0 12px 32px rgba(0,0,0,0.15);
                border-radius: 16px;
                overflow: hidden;
                background: transparent;
                transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
            }

            #zubida-ai-avatar-iframe {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                background: transparent !important;
            }

            /* 【硬核關鍵】手機版 RWD：放棄橫向縮放，改用「實體收納物理尺寸」 */
            /* 調整手機版容器大小，既能容納完整的人物與文字框，又絕不吃滿 2/3 螢幕 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    bottom: 10px;
                    right: 10px;
                    width: 290px;   /* 物理緊湊寬度：確保文字框不被截斷且不阻擋網頁 */
                    height: 440px;  /* 物理緊湊高度：給予人物與輸入框最完美的防跑版空間 */
                }
            }

            /* 超小螢幕手機特別優化 */
            @media screen and (max-width: 360px) {
                #zubida-ai-avatar-container {
                    width: 270px;
                    height: 410px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createWidget() {
        const container = document.createElement('div');
        container.id = 'zubida-ai-avatar-container';

        const iframe = document.createElement('iframe');
        iframe.id = 'zubida-ai-avatar-iframe';
        
        const srcParams = new URLSearchParams({
            model: config.model,
            vrm: config.vrm,
            engine: config.engine,
            origin: window.location.origin
        });
        iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
        iframe.allow = "microphone";

        container.appendChild(iframe);
        document.body.appendChild(container);

        // API 介面控管
        window.AvatarWidget.close = () => { 
            container.style.opacity = '0';
            container.style.pointerEvents = 'none';
        };
        window.AvatarWidget.open = () => { 
            container.style.opacity = '1';
            container.style.pointerEvents = 'auto';
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
