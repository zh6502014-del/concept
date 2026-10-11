# GitHub Pages 發布說明

本包為靜態網站。沒有部署到你的帳號，沒有建立 repository，也沒有代你更動 GitHub 設定。

## 最少需要上傳的內容

```text
index.html
.nojekyll
css/
js/
assets/
```

`README.md`、`docs/` 可一起上傳。`source-art/` 是生成PNG原稿與prompt，不是執行必要檔案；要讓網站repo輕量，可只保留在本機。不要把原稿當成WebP替代品，也不要只上傳ZIP。

## 使用網頁上傳

1. 在 GitHub 建立或打開這個作品的 repository。
2. 解壓縮本包，進入有 `index.html` 的那一層。透過 **Add file → Upload files** 上傳必要檔案與資料夾，保持相對目錄；提交 commit。
3. 打開 **Settings → Pages**。
4. 在 **Build and deployment** 選 **Deploy from a branch**，再選實際存放檔案的分支（例如 `main`）和 **/(root)**，按 Save。
5. 依 Pages 頁面顯示的網址開啟；等待發布流程完成。不要用 GitHub 的原始碼頁當成網站網址。

`index.html` 必須位於所選發布來源的最上層。倉庫如為 `nightfall-storybook`，網址通常形如：

```text
https://<你的帳號>.github.io/nightfall-storybook/
```

本版使用 `./css/...`、`./js/...`、`./assets/...`，CSS中的圖片則使用 `../assets/...`。沒有 `/assets/...` 這類會跳到網域根目錄的路徑，也不預先綁定你的repository名稱。

每頁網址使用 `#page-1` 至 `#page-15`，不需要伺服器端rewrite規則。

## 關於 .nojekyll

根目錄已放入空白 `.nojekyll`，用於靜態檔案發布。部分作業系統會隱藏點號開頭檔案；上傳時確認它存在，或在repository根目錄另外建立同名空白檔案。沒有使用Jekyll主題、Gemfile或npm編譯。

## 發布後檢查

- 首頁、第三頁人物、第五頁研究室、第六頁戰鬥、第九頁水管、第十頁拼圖、第十四頁作者資訊。
- 直接開啟 `#page-14` 是否正確跳到作者頁。
- 手機瀏覽是否出現左右捲動；卡牌與拼圖能否點選。
- 重新整理是否保留同一瀏覽器的進度；私密模式或清除網站資料可能使進度消失。
- 檔名大小寫要與程式一致，不能把 `rin.webp` 改成 `Rin.webp` 而不更新路徑。

公開網站會展示第14頁的姓名、電子郵件和作品集網址。發布前請核對這些就是你願意公開的聯絡資訊。不要把API key、帳密或私人資料放進前端。

## 官方資料

資料核對日期：2026-10-07。

- GitHub Docs — Configuring a publishing source for your GitHub Pages site: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Docs — Creating a GitHub Pages site: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

說明依官方發布方式整理；repo權限與方案是否可用，仍以你的GitHub設定為準。
