# 🚀 Deploy 指南（Supabase + 前端靜態站）

這份文件說明怎麼把 N3 Dojo 上線：後端用 Supabase（Auth + Database），前端打包成靜態檔後丟到 Cloudflare Pages / Vercel / Netlify。

> Supabase 本身**不托管 SPA 前端**，只提供 Auth、Database、Storage、Edge Functions。所以前端要另外找靜態站。

---

## 架構總覽

```
┌──────────────────────┐         ┌──────────────────────┐
│  Cloudflare Pages    │  HTTPS  │  Supabase Project    │
│  (Vite SPA, dist/)   │ ──────► │  - Auth (Email)      │
│  VITE_SUPABASE_URL   │         │  - Postgres          │
│  VITE_SUPABASE_*KEY  │         │    └ user_mistakes   │
└──────────────────────┘         └──────────────────────┘
```

- 前端只拿 **anon public key**，安全靠 Postgres 的 **Row Level Security (RLS)** 把關
- 每個使用者只能讀寫自己的 `user_mistakes` row，由 `auth.uid() = user_id` 限制

---

## 1. 建立 Supabase Project

1. 登入 [supabase.com](https://supabase.com) → **New Project**
2. 填 project name、資料庫密碼、region（選離你使用者近的，例如 `Tokyo` / `Singapore`）
3. 等 2 分鐘專案建好，到 **Settings → API** 抄下：
   - `Project URL` → 之後要填 `VITE_SUPABASE_URL`
   - `anon public` key → 之後要填 `VITE_SUPABASE_ANON_KEY`

> ⚠️ **絕對不要**把 `service_role` key 放進前端，那個是給 server-side 用的，有完全 bypass RLS 的能力。

---

## 2. 設定 Email Auth

位置：**Authentication → Providers → Email**

- ✅ 啟用 Email provider（預設已啟用）
- **Confirm email** 選項：
  - 開發／內部測試：先**關掉**，註冊完馬上能登入，省掉收信流程
  - 正式上線：**務必開啟**，避免亂註冊

位置：**Authentication → URL Configuration**

- **Site URL**：填你的正式網域（例如 `https://n3-dojo.pages.dev`）
- **Redirect URLs**：把所有會用到的網域都加進去，例如：
  - `http://localhost:5173`（本機開發）
  - `https://n3-dojo.pages.dev`（正式）
  - `https://*.n3-dojo.pages.dev`（Cloudflare Pages 的 preview branch，如果有用）

沒設好的話，email confirm 或 reset password 的連結會跳到預設頁面，使用者就回不來你的站了。

---

## 3. 建立 Database Schema

位置：**SQL Editor → New query**，貼下面整段執行一次：

```sql
-- 每個 user 一筆 row，mistakes 存成 jsonb 陣列
create table public.user_mistakes (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  mistakes   jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 啟用 RLS（重要！沒啟用的話 anon key 會直接讀到全部資料）
alter table public.user_mistakes enable row level security;

-- 只能讀自己的 row
create policy "own rows select"
  on public.user_mistakes for select
  using (auth.uid() = user_id);

-- 只能 insert 自己的 row
create policy "own rows insert"
  on public.user_mistakes for insert
  with check (auth.uid() = user_id);

-- 只能 update 自己的 row
create policy "own rows update"
  on public.user_mistakes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 自動維護 updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger user_mistakes_touch_updated_at
  before update on public.user_mistakes
  for each row execute function public.touch_updated_at();

-- ─── Mastery：每題答對次數，>=3 視為已掌握，之後不再出題 ───
create table public.user_mastery (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  mastery    jsonb not null default '{}'::jsonb,  -- { "combo": { "v1": 2 }, "timed": { "g3": 1 } }
  updated_at timestamptz not null default now()
);

alter table public.user_mastery enable row level security;

create policy "own rows select" on public.user_mastery
  for select using (auth.uid() = user_id);
create policy "own rows insert" on public.user_mastery
  for insert with check (auth.uid() = user_id);
create policy "own rows update" on public.user_mastery
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger user_mastery_touch_updated_at
  before update on public.user_mastery
  for each row execute function public.touch_updated_at();
```

跑完到 **Table Editor** 應該看得到 `user_mistakes` 和 `user_mastery` 兩張表。

### 驗證 RLS

在 SQL Editor 用下面這條測試（應該要 **0 rows**，因為沒有登入身份）：

```sql
select * from public.user_mistakes;
```

如果回傳很多 row，表示 RLS 沒開，**立刻回去檢查 `enable row level security`**。

---

## 4. 本機環境設定

專案根目錄建立 [.env](.env)（從 [.env.example](.env.example) 複製）：

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

`.env` 已經在 `.gitignore` 裡（Vite 預設排除），不會被 commit。

```bash
npm install
npm run dev
```

打開 `http://localhost:5173`，走完一次**註冊 → 登入 → 故意答錯一題 → 重整頁面 → 錯題還在**，就代表 auth + db 都通了。

---

## 5. 前端 Deploy

### 選項 A：Cloudflare Pages（推薦，免費額度大）

**GitHub 連結法**：

1. 把 repo push 到 GitHub
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**
3. 選 repo，設定：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
4. **Environment variables**（Production + Preview 都要加）：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `NODE_VERSION` = `20`
5. Save and Deploy

**Wrangler CLI 法**：

```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name=n3-dojo
```

環境變數要先在 Cloudflare Dashboard 設好，不然 build 會缺 `VITE_SUPABASE_*`。

### 選項 B：Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import GitHub repo
2. Framework 會自動偵測成 Vite
3. **Environment Variables** 加 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
4. Deploy

### 選項 C：Netlify

類似 Vercel，`Build command: npm run build`、`Publish directory: dist`，加環境變數。

---

## 6. Deploy 後收尾

1. 回 Supabase **Authentication → URL Configuration**，把正式網域加到 **Site URL** 和 **Redirect URLs**
2. 正式開啟 **Confirm email**（如果之前關掉）
3. 用一個新 email 從正式網域跑一次完整流程：註冊 → 收信 → 驗證 → 登入 → 答題 → 錯題本同步
4. （選配）在 Supabase **Database → Backups** 確認自動備份有開（免費方案有每日備份保留 7 天）

---

## 疑難排解

| 症狀 | 原因 | 解法 |
|---|---|---|
| 登入後錯題本是空的，重整就回到 demo 資料 | `user_mistakes` table 還沒建，或 RLS policy 名字打錯 | 重跑 schema SQL，確認 Table Editor 看得到表 |
| Console 出現 `new row violates row-level security policy` | RLS 開了但 insert policy 缺了 | 確認三條 policy（select / insert / update）都有 |
| 點 email 驗證連結跳到 `localhost:3000` | Site URL 還是預設值 | 到 Authentication → URL Configuration 改掉 |
| `Missing Supabase environment variables` build 失敗 | 部署平台上沒設環境變數 | 到 Cloudflare / Vercel 的 env var 設定裡加 `VITE_SUPABASE_*` |
| 可以註冊但收不到驗證信 | Supabase 免費方案 SMTP 有量限制，或被當垃圾信 | 先檢查垃圾信匣；正式上線建議接自己的 SMTP（Resend / SendGrid） |

---

## 後續可擴充

- **自訂 SMTP**：Authentication → Email Templates → SMTP Settings，改接 Resend / SendGrid，發信品質比較穩
- **社群登入**：Google / GitHub OAuth，在 `AuthScreen.tsx` 加 `supabase.auth.signInWithOAuth({ provider: 'google' })`
- **Realtime 錯題同步**：多裝置即時同步，用 `supabase.channel(...).on('postgres_changes', ...)`
- **把題庫搬上 Supabase**：現在題庫寫死在 `src/data/`，之後可以建 `questions` 表從後端拉，就能線上更新題目不用重新 deploy

---

有問題先看 Supabase Dashboard 左下的 **Logs**（Auth logs / Postgres logs / API logs），90% 的 deploy 問題都能從那邊找到原因。
