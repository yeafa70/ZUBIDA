(function () {
    window.AvatarWidget = window.AvatarWidget || {};

    // 1. 配置中心：精確讀取原作者定義的 data-* 屬性與預設自然聲線
    const scriptTag = document.currentScript;
    const config = {
        widgetUrl: scriptTag.getAttribute('data-widget') || 'widget.html',
        model: scriptTag.getAttribute('data-model') || '',
        vrm: scriptTag.getAttribute('data-vrm') || '',
        engine: scriptTag.getAttribute('data-engine') || '2d',
        // 【肉】神經語音核心端點：若未指定則自動導向原作者主站或您部署的端點
        api: scriptTag.getAttribute('data-api') || 'https://ai-avatar-bot-two.vercel.app/api/tts',
        voice: scriptTag.getAttribute('data-voice') || 'zh-TW-HsiaoChenNeural', // 預設高自然度曉臻女聲
        baseWidth: parseInt(scriptTag.getAttribute('data-width')) || 360,
        baseHeight: parseInt(scriptTag.getAttribute('data-height')) || 520,
        isOpenByDefault: scriptTag.getAttribute('data-open') === 'true'
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

    // 2. 注入原作者開源標準的「右下角懸浮與彈出收合樣式」
    function injectCoreStyles() {
        const style = document.createElement('style');
        style.id = 'zubida-avatar-core-style';
        style.innerHTML = `
            #zubida-ai-avatar-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: ${config.baseWidth}px;
                height: ${config.baseHeight}px;
                z-index: 999999;
                box-shadow: 0 12px 36px rgba(0,0,0,0.15);
                border-radius: 16px;
                overflow: hidden;
                background: transparent;
                transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
                transform-origin: bottom right;
            }

            #zubida-ai-avatar-iframe {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                background: transparent !important;
            }

            /* 【手機端極致最佳化】比照原作者開源 RWD，限定最大邊界，確保不吃滿 2/3 畫面 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    bottom: 15px;
                    right: 15px;
                    width: 310px !important;  /* 緊湊防擠壓寬度 */
                    height: 460px !important; /* 緊湊防擠壓高度 */
                }
            }

            @media screen and (max-width: 375px) {
                #zubida-ai-avatar-container {
                    width: 285px !important;
                    height: 420px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 3. 建立網頁元件與 URL 參數鏈結（這步錯了，語音就會死板）
    function createPerfectWidget() {
        const container = document.createElement('div');
        container.id = 'zubida-ai-avatar-container';

        const iframe = document.createElement('iframe');
        iframe.id = 'zubida-ai-avatar-iframe';
        
        // 【核心關鍵】必須將 data-api 與 data-voice 透過 URL 參數餵給內層的 widget.html 核心
        const srcParams = new URLSearchParams({
            model: config.model,
            vrm: config.vrm,
            engine: config.engine,
            api: config.api,
            voice: config.voice,
            origin: window.location.origin
        });
        
        iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
        iframe.allow = "microphone; autoplay"; // 賦予麥克風與語音自動播放權限

        container.appendChild(iframe);
        document.body.appendChild(container);

        // 4. 對外暴露與原作者完全對接的 window.AvatarWidget 控制 API
        window.AvatarWidget.close = () => { 
            container.style.transform = 'scale(0)';
            container.style.opacity = '0';
        };
        window.AvatarWidget.open = () => { 
            container.style.transform = 'scale(1)';
            container.style.opacity = '1';
        };
        window.AvatarWidget.say = (text) => {
            if (iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'AVATAR_SAY', text: text }, '*');
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
