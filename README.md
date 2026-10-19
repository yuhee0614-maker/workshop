# 公司員工足浴預約系統 (Company Footbath Reservation System)

企業內部員工專屬舒活足浴坊線上預約與體驗回饋管理系統。專為落實員工健康關懷、舒緩產線現場同仁長時站立下肢疲勞而設計。

![專案預覽](src/assets/images/bright_zen_lounge_1792374327616.jpg)

---

## 🌟 核心特色 (Key Features)

1. **即時席位與時段看板 (Live Timetable)**
   - 體驗地點：**六樓淋浴間**
   - 使用時間：每日 **12:00 至 17:00**，共 10 個時段，每時段 **30 分鐘足浴**。
   - 席位配置：每時段 4 席獨立檜木足浴桶（**男A、男B、女A、女B**），支援性別席位標註與防呆。

2. **產線現場同仁關懷機制 (Direct vs. Indirect Roles)**
   - **直接人員（現場作業員）優先時段**：`12:00~13:00` 及 `15:00~15:30` 為現場作業員專屬時段。
   - 間接人員（內勤、研發、辦公室同仁）若嘗試預約，系統會親切提示並自動推薦其他尚有空位的開放時段。

3. **3 步驟自主使用規範 (3-Step Self-Care Flow)**
   - **步驟 1 線上登記**：依工號、部門與身分完成登記。
   - **步驟 2 準時抵達六樓淋浴間入座**：依預約席位入座享受 30 分鐘足浴時段。
   - **步驟 3 結束後的處理**：於時段內將水倒至排水孔、沖洗乾淨獨立足浴桶並復原環境。

4. **落地評估體驗回饋問卷 (Colleague Experience Feedback)**
   - 包含滿意度評分（1~5 星）、未來落地意願、每週預期使用頻率、30 分鐘時長評估、動線與耗材建議、上一手桶況與自主清潔復原確認。

5. **管理者統計分析後台 (Admin Dashboard & Analytics)**
   - 需管理員 PIN 碼（預設：`8888`，亦可自訂）。
   - 提供整體滿意度指標、直接 vs. 間接同仁佔比、時段偏好熱力分析、自主清潔復原率統計。
   - 支援將全部回饋問卷資料**一鍵匯出為標準 CSV 報表**。

---

## 🛠 技術棧 (Tech Stack)

- **前端框架**：React 19 (TypeScript)
- **建構工具**：Vite 6 / 8
- **樣式庫**：Tailwind CSS v4
- **圖示庫**：Lucide React
- **資料儲存**：瀏覽器端 LocalStorage 自動儲存與版本同步機制，開箱即用無需額外佈署資料庫。

---

## 🚀 快速開始 (Getting Started)

### 1. 安裝相依套件

```bash
npm install
```

### 2. 啟動本地開發伺服器

```bash
npm run dev
```

啟動後即可在瀏覽器開啟 `http://localhost:3000` 預覽。

### 3. 編譯生產環境 (Build)

```bash
npm run build
```

產生的靜態網頁檔案將位於 `dist/` 目錄中，可直接佈署至 GitHub Pages、Vercel、Netlify 或任何靜態主機。

---

## 📁 專案架構 (Project Structure)

```text
├── index.html                  # HTML 入口
├── package.json                # 專案相依與 Scripts
├── tsconfig.json               # TypeScript 設定
├── vite.config.ts              # Vite 6 設定
├── src/
│   ├── main.tsx                # React 程式進入點
│   ├── App.tsx                 # 主頁面與全域狀態整合
│   ├── index.css               # Tailwind CSS 全域樣式
│   ├── types.ts                # TypeScript 型別定義
│   ├── assets/
│   │   └── images/             # 足浴休閒空間日式禪風高畫質圖資
│   ├── data/
│   │   └── constants.ts        # 時段、席位、身分限制與預設資料
│   ├── services/
│   │   └── bookingManager.ts   # 預約狀態管理、驗證與回饋儲存核心
│   └── components/
│       ├── Header.tsx          # 頂部導覽列（含六樓淋浴間標示）
│       ├── WellnessHero.tsx    # 主視覺橫幅（3 步驟指引、30分鐘規範）
│       ├── SlotTimetable.tsx   # 即時時段與席位狀態看板
│       ├── BookingModal.tsx    # 預約登記彈窗與確認通行證
│       ├── MyBookingsModal.tsx # 我的預約票券與 QR 憑證
│       ├── FeedbackModal.tsx   # 同仁體驗回饋表單
│       ├── AdminFeedbackModal.tsx # 管理者後台統計圖表與 CSV 匯出
│       ├── AdminAuthModal.tsx  # 管理者安全認證彈窗
│       └── RulesExplanation.tsx # 完整使用流程與規範說明
```

---

## 📄 授權 (License)

內部專案使用，保留所有權利。
