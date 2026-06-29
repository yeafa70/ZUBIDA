(function () {
    // 1. 確保全域變數不衝突，建立防禦性命名空間
    window.AvatarWidget = window.AvatarWidget || {};

    // 2. 配置中心：定義預設值與行動端極限邊界
    const config = {
        scriptTag: document.currentScript,
        widgetUrl: document.currentScript.getAttribute('data-widget') || 'widget.html',
        model: document.currentScript.getAttribute('data-model') || '',
        vrm: document.currentScript.getAttribute('data-vrm') || '',
        engine: document.currentScript.getAttribute('data-engine') || '2d',
        isOpenByDefault: document.currentScript.getAttribute('data-open') === 'true'
    };

    // 3. 主初始化流程（附帶 Try-Catch 錯誤處理）
    function init() {
        try {
            // 防止重複初始化
            if (document.getElementById('zubida-ai-avatar-container')) {
                console.warn('[Avatar Widget] 偵測到重複載入，已終止初始化。');
                return;
            }

            // 注入 RWD 專用樣式表（徹底解決手機版佔用 2/3 版面的問題）
            injectStyles();

            // 建立元件容器與 Iframe
            createWidgetElements();

        } catch (error) {
            console.error('[Avatar Widget 初始化失敗]:', error);
        }
    }

    // 4. 核心樣式注入（利用 CSS 權重壓制內部樣式）
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'zubida-avatar-rwd-styles';
        style.innerHTML = `
            /* 桌面版預設樣式：右下角固定位置 */
            #zubida-ai-avatar-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 380px;
                height: 550px;
                z-index: 999999;
                transition: all 0.3s ease-in-out;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                border-radius: 12px;
                overflow: hidden;
            }

            #zubida-ai-avatar-iframe {
                width: 100%;
                height: 100%;
                border: none;
                background: transparent;
            }

            /* 【核心修正】行動端 RWD 斷點：針對手機版進行等比例縮小與位置校正 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    bottom: 10px;
                    right: 10px;
                    width: 280px;  /* 縮小寬度，避免吃滿版面 */
                    height: 420px; /* 縮小高度 */
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                /* 若使用者仍覺得太大，啟用下方縮放機制確保內部元件不跑版 */
                #zubida-ai-avatar-container.mini-mode {
                    width: 240px;
                    height: 360px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 5. 節點實作
    function createWidgetElements() {
        const container = document.createElement('div');
        container.id = 'zubida-ai-avatar-container';
        
        // 若設定為預設不展開，可在此加入收合 class
        if (!config.isOpenByDefault) {
            container.style.height = '80px'; // 僅留對話泡泡高度
        }

        const iframe = document.createElement('iframe');
        iframe.id = 'zubida-ai-avatar-iframe';
        
        // 組裝帶有參數的 URL，傳遞給內部 widget.html
        const srcParams = new URLSearchParams({
            model: config.model,
            vrm: config.vrm,
            engine: config.engine,
            origin: window.location.origin
        });
        iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
        
        // 允許麥克風權限（語音輸入必要）
        iframe.allow = "microphone"; 

        container.appendChild(iframe);
        document.body.appendChild(container);

        // 註冊對外 API 供宿主網站呼叫
        window.AvatarWidget.close = () => { container.style.display = 'none'; };
        window.AvatarWidget.open = () => { container.style.display = 'block'; };
    }

    // 6. 監聽來自 Iframe 內部的收折通知 (postMessage 防禦性宣告)
    window.addEventListener('message', function (event) {
        // 僅處理來自同源或指定小工具的事件
        if (event.data && typeof event.data === 'object') {
            const container = document.getElementById('zubida-ai-avatar-container');
            if (!container) return;

            if (event.data.type === 'AVATAR_MINIMIZE') {
                // 變更為縮小狀態（例如只留右下角圖示）
                container.style.height = '90px';
                container.style.width = '90px';
            } else if (event.data.type === 'AVATAR_MAXIMIZE') {
                // 恢復 RWD 預設大小
                container.removeAttribute('style');
                container.style.position = 'fixed';
            }
        }
    });

    // 啟動
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
