# 🐕 N3 修行道場

給 7 月 JLPT 考試準備的複習小遊戲網頁。由像素貝雷帽狗陪你一起修行！

## ✨ 功能

- **四種題型**：單字選擇題、文法填空、句型配對、閃卡翻面記憶
- **兩種模式**：
  - 🔥 **連擊模式**：連答越多分越高，錯一題 combo 歸零
  - ⏱ **計時挑戰**：60 秒內答對越多越好
- **錯題本**：答錯自動收集到錯題本（`localStorage` 永久儲存）
- **可愛狗狗陪伴**：更多表情與更柔和的造型，讓介面看起來更親切
- **評等系統**：結算顯示 S/A/B/C/D 等級
- **📱 全裝置 RWD**：從 iPhone SE（360px）、iPhone 16 系列（393–440px）到桌機都最佳化
  - 支援 iOS safe-area（瀏海 / 動態島 / home indicator）
  - 所有觸控目標 ≥ 44px（符合 Apple HIG）
  - 句型配對在手機改單欄堆疊，避免擠版
  - 主要斷點：`sm: 640px`（手機→平板／桌面）

## 🛠 技術棧

- Vite + React 18 + TypeScript
- Tailwind CSS
- Zustand（狀態管理 + 錯題本持久化）
- Framer Motion（動畫，備用）

## 🚀 本地執行

```bash
npm install
npm run dev
```

打開 `http://localhost:5173` 即可。

## 📦 打包

```bash
npm run build
```

輸出在 `dist/` 目錄。

## ☁️ 部署到 Cloudflare Pages

### 方法一：從 GitHub 連結（推薦）

1. 把這個資料夾推到你的 GitHub repo
2. 登入 Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
3. 選你的 repo，設定：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - **Node version**：`18` 或以上（在環境變數加 `NODE_VERSION=20`）
4. 點 Save and Deploy，幾分鐘後就會拿到 `xxx.pages.dev` 網址 🎉

### 方法二：Wrangler CLI 直接上傳

```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name=n3-dojo
```

## 📝 如何擴充題目

demo 題庫都在 `src/data/` 下，分四個檔：

```
src/data/
├── vocabulary.ts   # 單字選擇題
├── grammar.ts      # 文法填空題
├── sentence.ts     # 句型配對題
└── flashcards.ts   # 閃卡
```

把你每週的學習範圍照格式新增到這些檔案就好。型別定義在 `src/types.ts`。

## 🧠 自訂學習內容 YAML

你現在也可以透過 `public/learning.yml` 直接輸入學習內容：

- `vocabulary`：單字、讀音、中文意思、例句
- `grammar`：文法型、說明、例句
- `sentence`：句型配對提示、左欄 / 右欄選項
- `flashcards`：正面、讀音、背面、例句

AI 可以讀取此 YAML 檔案，根據你填入的內容生成題目與練習項目。

## 🎨 專案結構

```
n3-dojo/
├── src/
│   ├── components/     # 可重複用的 UI 元件
│   │   ├── PixelDog.tsx      # 貝雷帽像素狗
│   │   ├── SpeechBubble.tsx  # 對話泡泡
│   │   ├── ComboMeter.tsx    # 連擊顯示
│   │   ├── Timer.tsx         # 倒數計時器
│   │   ├── ProgressBar.tsx   # 進度條
│   │   ├── ScoreBar.tsx      # 分數列組合
│   │   └── ChoiceQuiz.tsx    # 選擇題共用邏輯
│   ├── screens/        # 各個畫面
│   │   ├── HomeScreen.tsx
│   │   ├── VocabularyQuiz.tsx
│   │   ├── GrammarQuiz.tsx
│   │   ├── SentenceMatch.tsx
│   │   ├── Flashcards.tsx
│   │   ├── ResultScreen.tsx
│   │   └── MistakeBook.tsx
│   ├── data/           # 題庫資料
│   ├── store/          # Zustand store
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── favicon.svg     # 像素狗頭 icon
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 🎯 待辦 / 可擴充方向

- [ ] 加更多 N3 題目（目前 demo 各題型 3-10 題）
- [ ] 音效（答對 / 答錯 / combo）
- [ ] 每日登入連續天數紀錄
- [ ] 分享成績（OG image）
- [ ] 更多狗狗表情（驕傲、害羞、想睡覺…）
- [ ] 錯題本也能當練習題重考

---

7 月 N3 合格まであと少し、一緒にがんばろう！🍀
