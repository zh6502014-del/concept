# 現行小遊戲素材：原遊戲截圖

2026-10-07：小遊戲介紹改用兩張原生 PNG 截圖，完整保留 Game_claude 對話框、圖塊、介面與文字，未重繪。

- `assets/images/screenshots/story-route.webp`：朔・鐘樓逃生路線，5×5 街區初始畫面。
- `assets/images/screenshots/story-map-puzzle.webp`：迪普霍姆・礦坑地圖，工坊試玩已拼合 2/4 畫面。
- `assets/images/screenshots/story-shield-rhythm.webp`：格蘭・撐盾救援（坦克第 3 章），節奏小遊戲遊玩中畫面。
- 以上三張皆於 2026-10-11 由最新版 Game_claude 的 story.html 重新擷取（1440×1400 視窗，未修圖），來源見 manifest.json。
- 在獨立瀏覽器中開啟原遊戲內建試玩，未讀取或改動使用者遊戲存檔。來源及雜湊见同目錄 `manifest.json`。
- 原作品集世界地圖與路塊資產仍保存在素材資料夾，但不再用作可操作小遊戲。下方清單為素材匯入紀錄。

---

# Game_claude 素材與內容對照

2026-10-07 更新。所有內容插畫、角色立繪與卡牌均直接複製自相鄰的 `Game_claude/assets/`；不重新繪製、不重新壓縮、不放大。網站使用自己的副本，不依賴相鄰資料夾，仍可獨立部署至 GitHub Pages。

| 作品集用途 | Game_claude 原始來源（相對 assets/） | 對照結果 |
|---|---|---|
| 封面、世界、尾聲、封底 | story/complete-020/chapters/prologue-vesperland.webp | 維斯珀蘭全景；文字區分整片土地與暮城 |
| 戰鬥背景 | story/backgrounds/lab.webp | 曜火研究室 |
| 研究室探索 | story/complete-020/chapters/a2-lab-standoff.webp | 左側凜、右側赫爾曼、中央裝置；標記依插畫調整 |
| 凜、朔、格蘭、伊芙、磷、赫爾曼 | story/actors/{rin,shuo,gran,eve,phosphor,herman}.webp | 與 story-stage-assets.js 人物登錄一致；保留透明立繪 |
| 拼圖與模組介紹 | maps/nightfall-world-map-v1.webp | 世界地圖；說明改為山脈、河流、城市與羅盤；六塊拼圖按原圖比例呈現 |
| 攻擊、防禦、閃躲 | cards/basic-v2/{attack,defense,dodge}.webp | 與 card-art.js 登錄一致；目前故事教學不使用 |
| 蓋牌 | cards/back-gold-v2.webp | 遊戲金色卡背；目前故事教學不使用 |
| 路線旋轉 | src/js/story-maze.js、src/css/story-maze.css（相對專案） | 匯出原生道路／街區 SVG 與原配色；紅色表示連通 |
| 共用介面圖示 | icons/ 下對應 SVG | 關閉、設定、戰鬥等採用遊戲圖示 |

複製素材逐檔路徑與 SHA-256 見 `assets/game-claude-manifest.json`。14 張點陣原圖（10 張內容圖、4 張卡牌）均與來源逐位元一致。通用閱讀控制與作品集 favicon 保留；不屬於故事美術。

## 內容校正

- 依 `story-chapters.js` 現行序章校正夜域、暮晶及「八座城市中只有暮城受暮鐘保護」的設定。
- 研究室赫爾曼台詞改為現行 A1 的「是國王派你們來的吧。」
- 移除未出現在新插畫對應位置的出口／封存樣本標记；改以畫中人物與實驗裝置導覽。
- 移除「作品集另行生成肖像／共振裝置概念圖」的過期來源文字。
- 故事規則以現行 `story-energy-engine.js` 與 `story-campaign.js` 為準；`game.js` 只用於自由對戰差異表。研究室已改成四回合暮晶體驗。
- 舊契約的「主角死亡立即失敗」已與現行引擎不同；此作品集使用目前「我方全數倒下才失敗」的規則，特殊牽制目標另計。

## 改編邊界

作品集保留 4 × 4 路塊與 3 × 2 拼圖。遊戲的街區關卡與拼裝關卡有不同的尺寸、目標及情境，不宣稱兩者是相同關卡。角色頁的主題提問是作品集解讀，不是遊戲逐字對白。沒有修改 Game_claude 原始專案。

- 2026-10-11：`story-gun`、`story-nameless`、`lab-dialogue`、`lab-battle`、`story-archive` 亦已由最新版遊戲重拍，`assets/images/screenshots/` 內八張截圖全部為當日擷取。`story-archive` 因 C4 劇情改寫，改用章節最後一句對話的畫面。
