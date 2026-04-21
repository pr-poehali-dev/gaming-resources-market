import { useState } from "react";
import Icon from "@/components/ui/icon";
import { login, registerUser } from "@/api";

type Props = {
  onClose: () => void;
  onSuccess: (user: User) => void;
};

export type User = {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  balance: number;
};

export default function AuthModal({ onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      let user;
      if (tab === "login") {
        user = await login(form.email, form.password);
      } else {
        user = await registerUser(form.username, form.email, form.password);
      }
      onSuccess(user);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} />
      <div className="relative w-full max-w-sm rounded-sm overflow-hidden animate-fade-up"
        style={{ backgroundColor: "#111", border: "1px solid #2A2A2A" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1A1A1A" }}>
          <div>
            <div className="font-oswald font-bold text-xl uppercase tracking-widest">
              {tab === "login" ? "Вход" : "Регистрация"}
            </div>
            <div className="font-mono text-xs" style={{ color: "#555" }}>PreyDay Shop</div>
          </div>
          <button onClick={onClose}><Icon name="X" size={18} style={{ color: "#555" }} /></button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid #1A1A1A" }}>
          {(["login", "register"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-3 font-oswald text-xs uppercase tracking-widest transition-colors"
              style={{ color: tab === t ? "#F97316" : "#555", borderBottom: tab === t ? "2px solid #F97316" : "2px solid transparent" }}>
              {t === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="p-6 flex flex-col gap-4">
          {tab === "register" && (
            <div>
              <label className="font-mono text-xs uppercase tracking-widest mb-1 block" style={{ color: "#666" }}>Никнейм</label>
              <input value={form.username} onChange={e => set("username", e.target.value)}
                placeholder="survivor_123" className="w-full px-4 py-2.5 rounded-sm font-mono text-sm outline-none"
                style={{ backgroundColor: "#0D0D0D", border: "1px solid #222", color: "#E8DDD0" }} />
            </div>
          )}
          <div>
            <label className="font-mono text-xs uppercase tracking-widest mb-1 block" style={{ color: "#666" }}>Email</label>
            <input value={form.email} onChange={e => set("email", e.target.value)}
              type="email" placeholder="you@example.com" className="w-full px-4 py-2.5 rounded-sm font-mono text-sm outline-none"
              style={{ backgroundColor: "#0D0D0D", border: "1px solid #222", color: "#E8DDD0" }} />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest mb-1 block" style={{ color: "#666" }}>Пароль</label>
            <input value={form.password} onChange={e => set("password", e.target.value)}
              type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-sm font-mono text-sm outline-none"
              style={{ backgroundColor: "#0D0D0D", border: "1px solid #222", color: "#E8DDD0" }}
              onKeyDown={e => e.key === "Enter" && submit()} />
          </div>

          {error && (
            <div className="px-4 py-2.5 rounded-sm font-mono text-xs" style={{ backgroundColor: "#1A0808", border: "1px solid #DC2626", color: "#FCA5A5" }}>
              {error}
            </div>
          )}

          <button onClick={submit} disabled={loading}
            className="w-full btn-orange py-3 rounded-sm text-sm flex items-center justify-center gap-2 mt-1">
            {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="LogIn" size={16} />}
            <span>{tab === "login" ? "Войти" : "Зарегистрироваться"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
