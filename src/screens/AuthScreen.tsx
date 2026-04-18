import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { PixelDog } from "../components/PixelDog";
import { SpeechBubble } from "../components/SpeechBubble";

export function AuthScreen() {
  const signIn = useGameStore((s) => s.signIn);
  const signUp = useGameStore((s) => s.signUp);
  const authLoading = useGameStore((s) => s.authLoading);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setMessage(null);
    if (!email || !password) {
      setMessage("請輸入有效的 email 和密碼。");
      return;
    }

    const action = mode === "login" ? signIn : signUp;
    const error = await action(email, password);
    if (error) {
      setMessage(error);
      return;
    }

    setMessage("成功！現在載入你的錯題資料...\n");
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-cream text-ink">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3 rounded-full bg-white p-4 shadow-pixel">
            <PixelDog mood="happy" size={90} />
          </div>
          <h1 className="font-display text-2xl text-ink mb-2">N3 Dojo Login</h1>
          <p className="text-sm text-ink/70">
            使用 Supabase 電子郵件認證，登入後會把你的錯題存起來，之後可以反覆複習。
          </p>
        </header>

        <div className="grid gap-3 mb-4">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`pixel-btn pixel-border p-3 text-sm font-display ${
              mode === "login" ? "bg-mint text-ink" : "bg-white text-ink/80"
            }`}
          >
            登入
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`pixel-btn pixel-border p-3 text-sm font-display ${
              mode === "register" ? "bg-mint text-ink" : "bg-white text-ink/80"
            }`}
          >
            註冊
          </button>
        </div>

        <div className="pixel-border bg-white shadow-pixel p-5">
          <div className="mb-4">
            <label className="block text-xs font-display text-ink/70 mb-2">電子郵件</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@mail.com"
              className="w-full rounded border border-ink/10 px-3 py-2 text-sm"
            />
          </div>
          <div className="mb-5">
            <label className="block text-xs font-display text-ink/70 mb-2">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 6 個字"
              className="w-full rounded border border-ink/10 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={authLoading}
            className="pixel-btn pixel-border w-full bg-beret text-white p-3 font-display text-sm shadow-pixelSm disabled:opacity-50"
          >
            {authLoading ? "處理中..." : mode === "login" ? "登入" : "註冊"}
          </button>
          {message ? (
            <div className="mt-4 text-xs text-ink/80 whitespace-pre-line">{message}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
