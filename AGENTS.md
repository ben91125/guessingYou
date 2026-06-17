# Project Handoff Guide

這份文件給另一台工作機、另一個 Codex session，或未來接手此專案的人使用。  
`README.md` 說明產品目前狀態，`HISTORY.md` 記錄演進脈絡；本檔則記錄協作規則與容易踩到的產品 / 技術決策。

## 專案定位

「你猜猜看」是純前端桌遊輔助工具，不是線上同步遊戲，也不是分析儀表板。

核心場景：

- 兩個人面對面玩。
- 各自用手機切到同一題。
- 答案與猜測以口頭進行。
- 網頁只負責列題、對題號、留下對方猜測的準確度與評語。

## 使用者與 Codex 分工

使用者角色：

- 發想產品方向
- 審核玩法與 UI 是否符合直覺
- 決定題庫內容、敏感度與是否入庫
- 決定哪些功能進主線
- 決定 push / 部署到 GitHub

Codex 角色：

- 實作功能與修 bug
- 整理檔案與資料結構
- 維護 `README.md`、`HISTORY.md` 與本檔
- 建 branch / commit
- 檢查匿名 sample 不暴露關鍵資訊
- 不自行 push

## Git 規則

- 不准自行 push。Push 由使用者決定。
- 每次 commit message 必須明確標示 AI-edited。
- Commit message 格式：

```text
AI-edited: <summary>

Model: GPT-5
Reasoning: not exposed
```

- 若環境未暴露模型或 reasoning，不要猜，寫 `not exposed`。
- 若有產品或協作決策變更，同步更新 `README.md` / `HISTORY.md` / `AGENTS.md` 中相關內容。

## 目前重要 Branch

- `main`：部署主線，是否 push / deploy 由使用者決定。
- `feature/source-question-browser`：目前主要開發線，整合 L1 / L2 題庫瀏覽、匿名 sample、評語紀錄修正。
- `feature/designer-anonymous-prototypes`：已合回 `feature/source-question-browser`，可保留或之後清理。

## 核心產品規則

- 一局通常只跟一個人玩。
- `partnerName` 是一局紀錄的核心識別。
- 留下評語後會鎖定對象名稱，避免同一局中途誤改。
- 若真的要改對象名稱，需要使用解鎖流程。
- 匯入資料可能包含多個 `partnerName`，下方評語紀錄需依對象分組顯示。
- 「已完成」題數依目前 `partnerName` 計算，不是全域總數。
- 評語紀錄排序需優先顯示目前 `partnerName` 的紀錄群組。

## 紀錄資料模型

每筆評語紀錄是 `state.rounds[]` 中的一筆資料。

同一筆紀錄的判斷 key 是：

```text
partnerName + questionId
```

重要：不能只用 `questionId`。  
否則 A 玩第 10 題、B 也玩第 10 題時，兩人的紀錄會互相覆蓋。

目前邏輯重點：

- `completeRound()` 新增或更新目前對象的目前題目。
- `draftForQuestion()` 只載入目前對象的該題舊評語。
- `roundsForPartner()` 計算目前對象完成題數。
- `groupRoundsByPartner()` 依對象分組，並讓目前對象排在最前面。

## 題庫與資料夾

- `questions-data.js`：早期可直接載入的題庫資料。
- `questions.json`：保留給未來整理、擴充與外部維護。
- `SOURCE/`：候選題來源庫，供產品方審核與篩選。
- `source-questions-data.js`：由 `SOURCE/categories/*.md` 轉出的前端讀取資料。

注意：

- `SOURCE/` 暫時不要改成小寫。Windows / Git 對大小寫 rename 容易出現權限或追蹤問題。
- 玩家端實際讀取的是 `source-questions-data.js`，不是直接讀 `SOURCE/`。
- 若未來重新產生 `source-questions-data.js`，要確認來源路徑仍與實際資料夾一致。

## 介面資料結構

選題是兩層：

- L1：親密關係定義，例如朋友模式、熟人模式、情侶模式。
- L2：題目類型，例如生活習慣、消費觀、人際關係等。

切換 L1 時：

- 優先保留目前 L2 題目類型。
- 只有新 L1 沒有該 L2 時，才退回第一個可用類型。

## Sample 與 Prototype

- `prototypes/`：給設計協作者重新發想的匿名版型原型。
- `style-samples/`：展示目前已有視覺風格與商品氣氛。
- `product-samples/`：貼近實際 `index.html` UI 層級的匿名產品畫面。

保密規則：

- 不顯示正式產品名稱。
- 不放真實題目內容。
- 不載入正式題庫或正式遊戲程式。
- 不暴露 `SOURCE` 題庫細節。

## Assets

- 目前正式 UI 與 sample 多使用 inline SVG 或外部 Iconify 圖示。
- 未使用但想保留脈絡的 SVG 放在 `assets/deprecated/`。
- 不要把未使用素材混進正式引用路徑。

## 部署

此專案可直接部署到 GitHub Pages：

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

部署入口是根目錄 `index.html`。

## 接手前檢查清單

1. 先跑 `git status --short --branch`，確認目前 branch 與工作區狀態。
2. 讀 `README.md` 理解目前功能。
3. 讀 `HISTORY.md` 理解演進脈絡。
4. 讀本檔確認協作與資料模型規則。
5. 修改 `app.js` 後至少跑 `node --check .\app.js`。
6. 若新增 DOM ref，檢查 `dom.xxx` 是否都有在 `const dom = {}` 宣告。
7. 不啟動 server，除非使用者明確要求。使用者可直接用 Chrome 開 HTML 預覽。
8. 不 push。
