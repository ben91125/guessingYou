# 你猜猜看

單頁網頁遊戲 MVP，使用純 HTML、CSS、JavaScript，不依賴後端。資料保存在 `localStorage`，可匯出與匯入 JSON。

## 目前功能

- 規則介紹頁
- 四種模式：朋友模式、熟人模式、情侶模式、自訂題庫
- 模式以遊玩對象彼此熟悉度為第一層，分類為第二層
- 題號下拉選擇，兩人各自切到同一題
- 答案口頭進行，網頁只作為桌遊輔助道具
- 留下對方猜測的評分與評語
- 追蹤已完成題數
- 收藏題目
- HOSTER 模式可選，預設關閉
- 題庫獨立維護於 `questions.json`，並提供 `questions-data.js` 讓直接開 HTML 也可使用

## 使用方式

直接用 Chrome 開啟 `index.html` 即可遊玩。

部署到 GitHub Pages 時，保留以下檔案即可：

- `index.html`
- `styles.css`
- `app.js`
- `questions-data.js`
- `questions.json`

## 題庫策略

目前保留兩個題包：

- `personal-starter`：已挑選的個人版 36 題
- `candidate-general`：先前通用候選題，未來可再挑選是否進入預設題庫

玩家端不提供新增題目入口，題庫最終決定權保留在產品方。候選題會保留在資料檔中，未來可整理成正式題包、活動題包或 HOSTER 題包。

未來若要做營利模式，可以把 HOSTER 提示、活動題包、專業題包做成可加購內容層。
