# 2026-10-07 固定書高驗證

- Chrome 1440×900：全部 15 頁高度 620px；390×900：全部 15 頁高度 660px。
- 長規則可在書內捲至最後的教學入口；當頁操作保留位置，新頁從頂端開始。
- 實際翻頁動畫完成、無 JS 錯誤或水平溢出；手機外框視覺檢查通過。

---

# 2026-10-07 小遊戲靜態介紹驗證

- 1440px／390px 檢查第 8、9、10、11、15 頁：截圖正常解碼，無水平溢出或 JavaScript 錯誤。
- 第 9、10 頁內容區沒有按鈕、旋轉路塊、交換圖塊或提示／重設操作；翻頁控制保留。
- 原遊戲截圖視覺核對：鐘樓 5×5 街區、礦坑地圖 2/4 已就位；圖文與實際玩法一致。
- 移除舊小遊戲狀態與事件；JS 語法檢查通過。

---

# 2026-10-07 故事暮晶規則修正驗證

本節為現行結果；下方卡牌教學與自由對戰規則頁的測試屬於已替換版本。

- `node tests/story-training.cjs` 通過：暮晶 0→1→2、普攻／技能額度、敵方只在結束回合後行動、殘影閃遠距且不反擊、重新載入不重擲、四回合結束、重新開始、無效存檔、直接略過行動。
- Chrome 1440px／390px 全部 15 頁無壞圖、水平溢出與 JS 錯誤；詳細規則展開、四回合互動、途中重載與反思頁 4/4 狀態通過。
- 故事引擎副本逐位元比對來源一致，SHA-256 與複製資訊見 `js/vendor/story-energy-source.json`。原遊戲檔案未改動。
- 規則以現行程式為準：全隊倒下才失敗；舊 story-energy-v1-contract.md 的主角死亡条件已過時。
- 此作品集只展示研究室四回合；未對原遊戲所有 Boss、覺醒與增援關卡重新驗證。

---

# 2026-10-07 詳細規則頁驗證

- 對照 Game_claude/src/js/game.js 的 deck、startGame、canPlay、damage、applyCard、resolveRound、nextRound、endCheck。
- Chrome 1440px／390px：七個展開項目、基礎卡牌切換且保留展開狀態、直接進入教學及第一回合 0.75 傷害驗證通過。
- 規則頁無壞圖、水平溢出或 JavaScript 錯誤；人工檢視手機排版。
- 本次只有說明與版面變更，未變更戰鬥引擎；未全面重跑原遊戲技能機率測試。

---

# 2026-10-07 美術替換驗證

- 本機 Chrome（file://）：1440px 與 390px，各檢查 15 頁。
- 頁面圖片皆可解碼，無水平溢出及 JavaScript 執行錯誤。
- 5 位角色切換、路線提示／旋轉／完成、六塊拼圖提示／交換／完成通過。
- 人工檢視桌機人物／研究室、手機戰鬥／拼圖截圖；人物未拉伸，研究室熱點對應新插畫。
- 複製資產 SHA-256 與 Game_claude 原檔一致；CSS 圖片路徑存在；JS 語法檢查通過。
- 本輪未發布 GitHub Pages；未重新驗證所有戰鬥機率與翻頁動畫。

---

# V0.3 實際檢查紀錄

## 測試環境與邊界

測試使用容器內 Chromium 與 Playwright。工作環境的瀏覽器管理政策阻擋 `file://` 導覽；未移除政策、未關閉瀏覽器安全機制。檢查時將交付的 HTML、CSS、JS 及原圖位元組載入記憶體內預覽，僅轉換素材 URL；**交付檔仍為正常的分檔、相對路徑網站**。

沒有上傳 GitHub、沒有驗證正式 URL，沒有真實網站 origin 的本機儲存／剪貼簿測試。沒有實體手機、Safari 或 Firefox 測試。頁內狀態跨翻頁保留已驗證；不可把它混同於跨瀏覽器、重啟或跨裝置同步。

## 15 頁等寬與動畫模式

| 視窗寬度 | 各頁一致的書頁外框寬度 | 翻頁模式 | 結果 |
|---:|---:|---|---|
| 320 px | 285 px | 整張單頁 | 15/15，無水平溢出 |
| 390 px | 349 px | 整張單頁 | 15/15，無水平溢出 |
| 768 px | 711 px | 中央書脊雙頁 | 15/15，無水平溢出 |
| 1024 px | 949 px | 中央書脊雙頁 | 15/15，無水平溢出 |
| 1440 px | 1180 px | 中央書脊雙頁 | 15/15，無水平溢出 |

所有測試尺寸均檢查左緣與寬度一致、所有頁面、轉場暫存節點無重複 ID、轉場完成後恢復標題焦點。圖片依既有版型重排，高度不強制相等。

## 操作回歸

- Rapid clicks / repeated arrows do not skip pages; snapshot IDs are unique.
- Backward flip has reverse direction; boundary previous button disabled.
- Escape commits the target, removes snapshots and restores focus.
- Resize during a flip immediately commits and restores responsive width.
- Five character tabs change in place without page turning.
- Three laboratory hotspots remain usable without flipping.
- Four teaching rounds completed; HP/history survive forward/back turns.
- Pipe puzzle solved, status retained after turning away and back.
- Jigsaw original modal, swapping, solving and progress retained across turns.
- All three themes and page 14 author/contact links preserved.
- App reduced-motion setting gives immediate navigation, including last-page boundary.
- System reduced-motion and large text supported independently.
- Live OS reduced-motion change completes an already-running turn.
- TOC navigation closes modal and opens the right chapter.
- Popstate during animation follows history destination without stale-focus lock.
- Reset-all restores cover and clears state without leaving the shell inert.

## 動畫本身

額外以正常速度檢查桌機、手機的正向與反向完成，不只以測試指令跳到終點。其餘多頁版面巡檢為節省時間，會呼叫正常的「立即完成」入口。中途擷取畫面時固定原始 Web Animations API 的時間；不使用繪圖軟體偽造翻頁畫面。GIF 是同一組正式 keyframes 的取樣，開頭和結尾加上停留時間。

已測試 Escape、快速連點、目錄、瀏覽歷史事件、視窗寬度變更、僅高度變更、減少動態、執行途中切換系統減少動態，以及移除動畫 API 的降級情境。未遇到 JavaScript 例外。

## 檔案與素材

所有入口檔與 CSS 引用資源經相對路徑存在性、大小寫檢查。`assets/` 每個檔案與 V0.2 原檔逐位元組比對相同，`js/content.js` 也未更動。原始生成圖稿及素材 prompt 沿用 V0.2，不宣稱新增美術。

機器可讀紀錄：`layout-results.json`、`interaction-results.json`、`timing-results.json`、`static-validation.json`。
