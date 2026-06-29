(function () {
    window.AvatarWidget = window.AvatarWidget || {};

    // 配置中心：直接對接開源百分之百穩定的 Vercel 本體，徹底阻斷本地 widget.html 的遞迴錯誤
    const config = {
        // 靈魂：直連雲端原版組件，確保字體、圓角、LINE 按鈕、Live2D 人物與對嘴完全正常
        widgetUrl: 'https://ai-avatar-bot-two.vercel.app/widget.html',
        // 聲音：直連微軟 Edge 高自然度神經語音端點
        apiUrl: 'https://ai-avatar-bot-two.vercel.app/api/tts',
        voiceName: 'zh-TW-HsiaoChenNeural', // 曉臻自然女聲
        modelUrl: 'https://ai-avatar-bot-two.vercel.app/pics/Haru.model3.json', // 原始精美 2D 皮
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

    // CSS 隔離與行動端 RWD 完美縮放
    function injectCoreStyles() {
        const style = document.createElement('style');
        style.id = 'zubida-avatar-perfect-rwd';
        style.innerHTML = `
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

            /* 手機版行動端：等比例縮小至 75%，確保不吃滿 2/3 螢幕，絕不壓扁跑版 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    transform: scale(0.75);
                    bottom: 10px;
                    right: 10px;
                }
            }

            @media screen and (max-width: 375px) {
                #zubida-ai-avatar-container {
                    transform: scale(0.68); 
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createPerfectWidget() {
        const container = document.createElement('div');
        container.id = 'zubida-ai-avatar-container';

        const iframe = document.createElement('iframe');
        iframe.id = 'zubida-ai-avatar-iframe';
        
        // 讀取您租必達官網本地的知識庫 FAQ 內容（同源讀取）
        const localKnowledgeUrl = window.location.origin + '/ZUBIDA/js/knowledge.js';
        
        const srcParams = new URLSearchParams({
            model: config.modelUrl,
            api: config.apiUrl,
            voice: config.voiceName,
            knowledge: localKnowledgeUrl, // 注入租必達的 FAQ 語料大腦
            origin: window.location.origin
        });
        
        iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
        iframe.allow = "microphone; autoplay; encrypted-media"; 

        container.appendChild(iframe);
        document.body.appendChild(container);

        window.AvatarWidget.close = () => { container.style.display = 'none'; };
        window.AvatarWidget.open = () => { container.style.display = 'block'; };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
