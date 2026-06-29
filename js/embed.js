(function () {
    window.AvatarWidget = window.AvatarWidget || {};

    // 1. 配置中心：精確讀取 HTML 上的 data 屬性作為基礎尺寸
    const scriptTag = document.currentScript;
    const config = {
        widgetUrl: scriptTag.getAttribute('data-widget') || 'widget.html',
        model: scriptTag.getAttribute('data-model') || '',
        vrm: scriptTag.getAttribute('data-vrm') || '',
        engine: scriptTag.getAttribute('data-engine') || '2d',
        baseWidth: parseInt(scriptTag.getAttribute('data-width')) || 320,
        baseHeight: parseInt(scriptTag.getAttribute('data-height')) || 490,
        isOpenByDefault: scriptTag.getAttribute('data-open') === 'true'
    };

    function init() {
        try {
            if (document.getElementById('zubida-ai-avatar-container')) return;

            // 注入完美的等比例縮放 RWD 樣式
            injectResponsiveStyles();
            createWidget();
        } catch (error) {
            console.error('[Avatar Widget Error]:', error);
        }
    }

    function injectResponsiveStyles() {
        const style = document.createElement('style');
        style.id = 'zubida-avatar-perfect-scale';
        style.innerHTML = `
            /* 桌面版標準尺寸與定位 */
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
                transform-origin: bottom right; /* 設定等比例縮放的錨點為右下角 */
                transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
                background: transparent;
            }

            #zubida-ai-avatar-iframe {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                background: transparent !important;
            }

            /* 【硬核關鍵】當螢幕寬度小於 768px（手機端）時，實施整體等比例縮放 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    /* 將整體元件等比例縮小至 0.78 倍，內部文字框、對話框、人物會同步縮小，絕不壓扁 */
                    transform: scale(0.78); 
                    bottom: 12px;
                    right: 12px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }
            }

            /* 針對超小螢幕手機（如 iPhone SE）進行極限縮放，確保不佔用 2/3 版面 */
            @media screen and (max-width: 380px) {
                #zubida-ai-avatar-container {
                    transform: scale(0.7); 
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
        
        // 解析並傳遞參數，確保 iframe 內部取得正確大小
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

        // 控制介面
        window.AvatarWidget.close = () => { 
            container.style.transform = 'scale(0)';
            container.style.opacity = '0';
        };
        window.AvatarWidget.open = () => { 
            container.style.opacity = '1';
            // 手機版與桌面版分流恢復縮放
            if (window.innerWidth <= 768) {
                container.style.transform = 'scale(0.78)';
            } else {
                container.style.transform = 'scale(1)';
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
