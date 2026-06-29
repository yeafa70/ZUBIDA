(function () {
    window.AvatarWidget = window.AvatarWidget || {};

    // 1. 配置中心：直接對接原作者開源且運作正常的 Vercel 端點，接回神經語音與完整 UI 佈局
    const config = {
        // 核心網頁直連原作者部署的 Vercel 本體，確保內部的 2D 渲染、字體、圓角、對嘴完全跟原版一模一樣
        widgetUrl: 'https://ai-avatar-bot-two.vercel.app/widget.html',
        // 直連原作者的神經語音後端，成功取回微軟頂級自然聲線
        apiUrl: 'https://ai-avatar-bot-two.vercel.app/api/tts',
        voiceName: 'zh-TW-HsiaoChenNeural', // 預設高自然度曉臻女聲
        modelUrl: 'https://ai-avatar-bot-two.vercel.app/pics/Haru.model3.json', // 原始精美 2D 角色皮
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

            /* 【手機端硬核關鍵】當螢幕寬度小於 768px（手機）時，直接利用 CSS Scale 像照鏡子一樣等比例縮小 */
            /* 這樣做能確保內部的文字框、AI 人物「等比例變小」，絕對不被壓扁、也不會吃滿 2/3 螢幕 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    transform: scale(0.75); /* 等比例縮小至 75% */
                    bottom: 10px;
                    right: 10px;
                }
            }

            /* 針對小螢幕手機（如 iPhone SE）進行更進一步的縮放保護 */
            @media screen and (max-width: 375px) {
                #zubida-ai-avatar-container {
                    transform: scale(0.68); 
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
        
        // 讀取您租必達官網本地的知識庫 FAQ 內容，丟給原作者的渲染引擎
        const localKnowledgeUrl = window.location.origin + '/ZUBIDA/js/knowledge.js';
        
        const srcParams = new URLSearchParams({
            model: config.modelUrl,
            api: config.apiUrl,
            voice: config.voiceName,
            knowledge: localKnowledgeUrl, // 讓大腦讀取租必達的設備諮詢 FAQ
            origin: window.location.origin
        });
        
        iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
        iframe.allow = "microphone; autoplay; encrypted-media"; // 授權自動播放與麥克風

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
