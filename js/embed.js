(function () {
    window.AvatarWidget = window.AvatarWidget || {};

    // 1. 配置中心：強制將語音與模型參數校正回原作者的開源核心與自然聲線
    const scriptTag = document.currentScript;
    const config = {
        // 直連原作者部署在 Vercel 的 widget 本體，確保內部的 2D/3D 渲染與對嘴完全正常
        widgetUrl: 'https://ai-avatar-bot-two.vercel.app/widget.html',
        // 直連原作者的神經語音後端，借用微軟 Edge 頂級自然聲線
        apiUrl: 'https://ai-avatar-bot-two.vercel.app/api/tts',
        voiceName: 'zh-TW-HsiaoChenNeural', // 曉臻自然女聲
        modelUrl: 'https://ai-avatar-bot-two.vercel.app/pics/Haru.model3.json', // 原始精美 2D 角色皮
        baseWidth: 360,
        baseHeight: 520
    };

    function init() {
        try {
            if (document.getElementById('zubida-ai-avatar-container')) return;

            injectCoreStyles();
            createPerfectIframe();
        } catch (error) {
            console.error('[Zubida AI Avatar Error]:', error);
        }
    }

    // 2. 完美的物理尺寸收納（徹底解決手機版佔用 2/3 螢幕的問題）
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
                transition: opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
            }

            #zubida-ai-avatar-iframe {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                background: transparent !important;
            }

            /* 【手機端 RWD 限制】縮小實體尺寸，文字框、輸入框、角色完美等比例內縮，絕不吃滿版面 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    bottom: 12px;
                    right: 12px;
                    width: 300px !important;  
                    height: 450px !important; 
                }
            }

            @media screen and (max-width: 380px) {
                #zubida-ai-avatar-container {
                    width: 280px !important;
                    height: 410px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 3. 建立並強行注入原作者的「神經語音大腦與皮膚參數」
    function createPerfectIframe() {
        const container = document.createElement('div');
        container.id = 'zubida-ai-avatar-container';

        const iframe = document.createElement('iframe');
        iframe.id = 'zubida-ai-avatar-iframe';
        
        // 關鍵：將模型、API、聲音參數透過網址傳遞給原作者的 Vercel 核心
        const srcParams = new URLSearchParams({
            model: config.modelUrl,
            api: config.apiUrl,
            voice: config.voiceName,
            origin: window.location.origin
        });
        
        iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
        // 賦予跨網域自動播放語音與麥克風權限
        iframe.allow = "microphone; autoplay; encrypted-media"; 

        container.appendChild(iframe);
        document.body.appendChild(container);

        // API 控制項
        window.AvatarWidget.close = () => { container.style.display = 'none'; };
        window.AvatarWidget.open = () => { container.style.display = 'block'; };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
