(function () {
    window.AvatarWidget = window.AvatarWidget || {};

    // 1. 配置中心：採用相對路徑進行同源對接，徹底根除 Network error 跨網域錯誤
    const scriptTag = document.currentScript;
    const config = {
        widgetUrl: scriptTag.getAttribute('data-widget') || 'widget.html',
        model: scriptTag.getAttribute('data-model') || 'pics/Haru.model3.json',
        knowledge: scriptTag.getAttribute('data-knowledge') || 'knowledge.js',
        engine: scriptTag.getAttribute('data-engine') || '2d',
        baseWidth: 360,
        baseHeight: 520
    };

    function init() {
        try {
            if (document.getElementById('zubida-ai-avatar-container')) return;

            // 注入完全遵循開源標準的物理寬高與手機版自適應樣式
            injectStyles();
            createWidget();
        } catch (error) {
            console.error('[Zubida AI Avatar Error]:', error);
        }
    }

    // 2. 注入原作者最引以為傲的右下角自適應彈出樣式（手機版不擋 2/3 版面）
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'zubida-avatar-core-rwd';
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
                transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
                transform-origin: bottom right;
            }

            #zubida-ai-avatar-iframe {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                background: transparent !important;
            }

            /* 【手機端最佳化】當螢幕小於 768px 時，自動縮小物理框架尺寸，確保不遮擋水冷扇動線 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    bottom: 15px;
                    right: 15px;
                    width: 300px !important;  
                    height: 450px !important; 
                }
            }

            /* 極小螢幕手機防線 */
            @media screen and (max-width: 380px) {
                #zubida-ai-avatar-container {
                    width: 275px !important;
                    height: 410px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 3. 建立並透過同源 URL Params 餵給 widget.html
    function createWidget() {
        const container = document.createElement('div');
        container.id = 'zubida-ai-avatar-container';

        const iframe = document.createElement('iframe');
        iframe.id = 'zubida-ai-avatar-iframe';
        
        // 建立乾淨的內部通訊參數鏈
        const srcParams = new URLSearchParams({
            model: config.model,
            knowledge: config.knowledge,
            engine: config.engine,
            origin: window.location.origin
        });
        
        // 使用同源的絕對/相對路徑
        iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
        iframe.allow = "microphone; autoplay"; 

        container.appendChild(iframe);
        document.body.appendChild(container);

        // 完美對接原作者公開的 window 控管 API
        window.AvatarWidget.close = () => { 
            container.style.transform = 'scale(0)';
            container.style.opacity = '0';
        };
        window.AvatarWidget.open = () => { 
            container.style.transform = 'scale(1)';
            container.style.opacity = '1';
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
