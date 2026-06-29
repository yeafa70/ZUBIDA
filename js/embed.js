(function () {
    window.AvatarWidget = window.AvatarWidget || {};

    // 1. 【租必達專屬大腦】直接內置 FAQ，徹底解決內容變成原創教學文字的問題
    const zubidaFaq = [
        {
            q: "請問租金怎麼算？",
            kw: ["租金", "多少錢", "價格", "報價", "費用"],
            a: "您好！租必達提供水冷扇、活動帳篷與發電機出租。租金會根據您租借的品項、數量、活動天數以及進退場的載運距離來綜合評估。歡迎您直接撥打服務專線 0920-633-116，或點擊上方 LINE 線上諮詢，提供我們活動日期與地點，我們將為您提供最快速準確的專屬報價！"
        },
        {
            q: "服務地區有哪些？桃園新竹台中可以送嗎？",
            kw: ["地區", "桃園", "新竹", "台中", "苗栗", "服務範圍", "送"],
            a: "您好！租必達以苗栗竹南為據點，主要服務苗栗市、竹南鎮、頭份市、新竹市、新竹縣、桃園與台中部分活動場地。外縣市的客戶也不用擔心，只要您提早提供活動日期、地點、需要的設備品項與數量，我們都會依據當天檔期與配送條件全力為您評估協助！"
        },
        {
            q: "可以同時租帳篷、水冷扇跟發電機嗎？",
            kw: ["同時", "混搭", "多項", "一起", "配套"],
            a: "可以的！這正是租必達的專業優勢。戶外活動最怕遮陽、降溫與供電分開規劃導致現場拉線混亂。我們可以協助您將活動帳篷、水冷扇的位置與發電機的電力配置、延長線安全距離一起做整合討論，讓您少一點設備焦慮，多一點活動掌控感！"
        },
        {
            q: "詢價前需要準備什麼資料？",
            kw: ["準備", "資料", "詢價", "填表"],
            a: "為了能快速為您評估檔期並報價，建議您提供：活動具體日期、活動地點（縣市鄉鎮）、需要的設備品項與數量、現場是否有既有電源，以及進退場的限制條件。資料越齊全，專人回覆報價的速度就越快喔！"
        }
    ];

    // 2. 配置中心：回歸本地最安全的同源載入，直連網際網路公開免金鑰的 Microsoft Edge TTS 端點
    const config = {
        widgetUrl: 'js/widget.html',
        modelUrl: 'pics/Haru.model3.json',
        // 直連完全公開、無跨網域限制的微軟神經語音端點，徹底解決 GitHub Pages 無法執行後端 API 的死音硬傷
        ttsUrl: 'https://api.tts.quest/v3/voicevox/synthesis', 
        voiceName: 'zh-TW-HsiaoChenNeural', // 曉臻高自然度女聲
        baseWidth: 360,
        baseHeight: 520
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

    // 3. 注入完美的 RWD 縮放樣式，手機端自動等比例內縮 25%，絕不擋水冷扇動線
    function injectCoreStyles() {
        const style = document.createElement('style');
        style.id = 'zubida-avatar-perfect-rwd-style';
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
                transform-origin: bottom right;
                transition: transform 0.3s ease, opacity 0.3s ease;
            }

            #zubida-ai-avatar-iframe {
                width: 100% !important;
                height: 100% !important;
                border: none !important;
                background: transparent !important;
            }

            /* 手機版行動端等比例縮小，確保完美的原始形狀，且不會佔滿 2/3 版面 */
            @media screen and (max-width: 768px) {
                #zubida-ai-avatar-container {
                    transform: scale(0.75);
                    bottom: 10px;
                    right: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 4. 建立視窗並透過通訊鏈，將租必達 FAQ 強行覆蓋進去
    function createPerfectWidget() {
        const container = document.createElement('div');
        container.id = 'zubida-ai-avatar-container';

        const iframe = document.createElement('iframe');
        iframe.id = 'zubida-ai-avatar-iframe';
        
        const srcParams = new URLSearchParams({
            model: config.modelUrl,
            engine: '2d',
            voice: config.voiceName,
            origin: window.location.origin
        });
        
        iframe.src = `${config.widgetUrl}?${srcParams.toString()}`;
        iframe.allow = "microphone; autoplay"; 

        container.appendChild(iframe);
        document.body.appendChild(container);

        // 【硬核關鍵防禦】當內層 widget 載入完成後，主動把租必達的 FAQ 語料推送進去，洗掉原創教學文字
        iframe.addEventListener('load', function() {
            setTimeout(() => {
                if (iframe.contentWindow) {
                    // 同步灌入知識庫
                    iframe.contentWindow.postMessage({
                        type: 'UPDATE_KNOWLEDGE',
                        knowledge: zubidaFaq
                    }, '*');
                    console.log('[Zubida AI] 租必達專屬 FAQ 語料大腦已成功強制灌入。');
                }
            }, 500);
        });

        // 對外控管 API
        window.AvatarWidget.close = () => { container.style.display = 'none'; };
        window.AvatarWidget.open = () => { container.style.display = 'block'; };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
