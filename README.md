# 你猜猜看

一個溫馨桌遊式的默契問答工具。

這不是線上同步遊戲，也不是分析儀表板。它的定位比較像桌上的題卡輔助器：兩個人面對面，各自用自己的手機切到同一題，口頭猜、口頭揭曉，再把對方猜測的準確度與評語留在自己的裝置裡。

## 專案狀態

目前是可部署的靜態 MVP。

- 純 `HTML + CSS + JavaScript`
- 不依賴後端
- 可直接用瀏覽器開啟 `index.html`
- 資料自動保存在瀏覽器本機
- 支援匯出 / 匯入當次遊戲紀錄
- 可部署到 GitHub Pages

## 核心玩法

1. 選擇 L1 親密關係定義
2. 選擇 L2 題目類型
3. 兩人各自切到同一個 SOURCE 題號
4. 一方口頭猜，另一方口頭揭曉
5. 玩家在自己的手機留下對方猜測的準確度與評語
6. 遊戲結束後，若彼此願意，可以交換手機看看筆記

## 目前功能

- 規則介紹頁
- L1 親密關係定義：朋友模式、熟人模式、情侶模式
- L2 題目類型：生活習慣、興趣嗜好、工作與學習、消費觀、人際關係、愛情觀、人生觀、自我認識、家庭與成長、情緒壓力、界線與衝突
- 依關係與題目類型顯示 SOURCE 候選題
- 指定題號下拉選單
- 0 到 100 分的猜測準確度評分
- 評語紀錄
- 已完成題數追蹤
- 風格切換樣板
  - 溫馨桌遊
  - 朋友派對
  - 情侶約會
  - 復古題卡
- 匯出紀錄
- 匯入紀錄
- 手機、平板、桌機 RWD

## 題庫

題庫獨立維護在資料檔中：

- `questions-data.js`：讓直接開啟 `index.html` 也能使用
- `questions.json`：保留給未來整理、擴充與外部維護
- `SOURCE/`：候選題來源庫，供產品方篩選入庫
- `source-questions-data.js`：由 `SOURCE/categories/*.md` 轉出的前端讀取資料

目前玩家端不提供新增題目。題庫的挑選、分類與正式上架會保留給產品方維護。

## 部署

這個專案可以直接用 GitHub Pages 部署。

建議設定：

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

部署後入口會讀取根目錄的 `index.html`。

## 未來方向

- 更完整的題庫篩選與分級
- 付費題包或活動題包
- 主持人 / Hoster 題包提示
- 遊戲結果摘要
- 更完整的「你以為對方是什麼樣的人 vs 對方真實是什麼樣的人」認知偏差分析
- Google Drive 匯出或同步

## 授權與素材

目前頁面使用的線上插圖樣式來自 Iconify 上的 Fluent Emoji SVG。若未來要商用或離線部署，建議將最終選定的素材清單與授權資訊整理進正式文件。

## 匿名設計原型

`prototypes/` 是給設計協作者討論用的匿名靜態稿，不載入正式題庫、不顯示正式產品名稱，也不放真實題目內容。

這個資料夾同時服務兩種合作方式：

- 給網頁設計師：可直接調整 `prototypes/index.html` 與 `prototypes/styles.css`
- 給一般美術或視覺協作者：可從瀏覽器輸出 PDF / PNG 後標註配色、插圖、字體、間距與情緒方向

其中 `prototypes/index1.html`、`prototypes/index2.html`、`prototypes/index3.html` 是單一風格輸出版，方便分別輸出給不同協作者討論。

## 匿名 Sample

專案目前保留兩種匿名 sample，兩者都不載入正式題庫、不放正式產品名稱，也不顯示真實題目。

- `style-samples/`：展示目前已有的視覺風格與商品氣氛，適合給美術、設計協作者或 Sales 看風格方向
- `product-samples/`：貼近實際 `index.html` 的 UI 層級，適合 Sales 或內部討論實際操作畫面

風格 sample 中的插圖使用專案內 inline SVG，不依賴外部圖片來源。

`style-samples/` 包含：

- `style-samples/index1.html`：溫馨桌遊
- `style-samples/index2.html`：朋友派對
- `style-samples/index3.html`：情侶約會
- `style-samples/index4.html`：復古題卡

`product-samples/` 包含：

- `product-samples/index1.html`：溫馨桌遊產品畫面
- `product-samples/index2.html`：朋友派對產品畫面
- `product-samples/index3.html`：情侶約會產品畫面
- `product-samples/index4.html`：復古題卡產品畫面

## 資產封存

未使用但仍想保留脈絡的 SVG 會放在 `assets/deprecated/`。這些檔案不是目前正式頁面或 sample 的引用素材，只作為歷史設計資產封存。
