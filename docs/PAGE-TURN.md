# V0.3｜翻頁動畫

## 操作

- 下一頁：右往左；上一頁：反向翻回。
- 桌機：左右兩半以中央書脊為軸；封面、單頁與滿版也保留相同外框。
- 手機：整張書頁從側邊翻開；上一頁以反向動作覆回。
- 點擊換頁按鈕或鍵盤 ← / → 操作，不是跟隨拖曳的頁角模擬。
- 字型、圖片、出牌、地圖與拼圖的當頁操作不會觸發翻頁。

## 檔案

`css/page-turn.css` 處理投影、紙張背面、正反面隱藏及固定快照。`js/page-turn.js` 暴露 `window.NDPageTurn.capture / play / finish`，`app.js` 保留應用程式唯一狀態。

可調的常數在 `page-turn.js` 頂端：

```js
const OPTIONS = Object.freeze({
  duration: 820,            // 桌機翻頁毫秒
  mobileDuration: 680,      // 手機翻頁毫秒
  mobileBreakpoint: 680,    // 單頁模式的視窗寬度上限
  imageWait: 200            // 圖片解碼的最長額外等待
});
```

## 實作邊界

這是 CSS 3D 旋轉＋動態光影，不是紙張材質的物理模擬，也不是預錄影片。用即時頁面內容建立短暫快照，隱藏真實目標頁，旋轉完成後立即移除快照。快照不參與遊戲結算，沒有重複 ID，可聚焦控制項全部排除，並標成 inert / aria-hidden。

只有換頁進入此流程。連點防護與狀態更新由 `app.js` 處理。來源與目標尺寸不合、缺少動畫 API、使用者或系統要求減少動態，均直接換頁。Escape、寬度變更或頁面隱藏時立即完成；安全計時器可避免動畫中斷後永久鎖定。

前後頁高度不同時容器高度同步過渡；所有頁的寬度不變。不限制長文高度，也不讓單頁退回較窄外框。

## 技術參照

開發時核對的官方文件（查閱日 2026-10-07）：

- MDN：Element.animate() — https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
- MDN：transform-style — https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style
- MDN：prefers-reduced-motion — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

3D 容器本身不使用會攤平 preserve-3d 的 opacity / filter / overflow:hidden；裁切設於外層 viewport，光影在獨立子層。減少動態同時在 JavaScript 檢查，因為單靠 CSS 的 animation:none 不足以停止 Web Animations API 動畫。

## 上傳

與前版相同，不需 npm、建置、CDN、伺服器函式或新套件。將上傳包解壓縮後的全部內容放在發布根目錄，包含新增的 `css/page-turn.css`、`js/page-turn.js` 與新版 `index.html`。本包未替使用者上傳或發布任何網站。
