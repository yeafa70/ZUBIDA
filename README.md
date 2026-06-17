# ZUBIDA 租必達網站

這是可直接上傳到 GitHub Pages 的靜態網站版本。

## 主要網址

- 首頁：https://yeafa70.github.io/ZUBIDA/
- 水冷扇：https://yeafa70.github.io/ZUBIDA/cooler.html
- 活動帳篷：https://yeafa70.github.io/ZUBIDA/tent.html
- 發電機：https://yeafa70.github.io/ZUBIDA/generator.html

## 檔案說明

- `index.html`：首頁
- `cooler.html`：水冷扇主頁
- `tent.html`：活動帳篷主頁
- `generator.html`：發電機主頁
- `event-tent.html`：舊網址導向 `tent.html`
- `water-cooler.html`：舊網址導向 `cooler.html`
- `style.css`：全站樣式
- `js/main.js`：GA4 事件、手機選單、表單送出模擬
- `pics/`：圖片資料夾
- `sitemap.xml`：網站地圖
- `robots.txt`：搜尋引擎爬蟲設定
- `llms.txt`：AI 搜尋摘要友善說明

## GA4

已加入 GA4 測量 ID：

```text
G-F5CL3D5FT1
```

## 修改圖片

將圖片放進 `pics/` 資料夾，再到 HTML 修改：

```html
<img src="pics/你的圖片.jpg" alt="圖片說明">
```

## 表單

目前表單是模擬送出。
若要正式收單，請到 `js/main.js` 找到：

```js
const GAS_URL = "請貼上你的_Google_Apps_Script_網頁應用程式網址";
```

改成你的 GAS 網頁應用程式網址。
