import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { getBalance, createDeposit, getDeposits, getSpins, logout } from "@/api";
import type { User } from "./AuthModal";

type Props = {
  user: User;
  onLogout: () => void;
  onBalanceUpdate: (b: number) => void;
};

type Deposit = {
  id: number;
  amount: number;
  status: "pending" | "confirmed" | "rejected";
  comment: string | null;
  created_at: string;
};

type SpinRecord = {
  id: number;
  case: string;
  prize: string;
  emoji: string;
  rarity: string;
  cost: number;
  seed_hash: string;
  client_seed: string;
  is_claimed: boolean;
  created_at: string;
};

const RARITY_COLOR: Record<string, string> = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};

export default function Cabinet({ user, onLogout, onBalanceUpdate }: Props) {
  const [tab, setTab] = useState<"overview" | "deposit" | "history">("overview");
  const [balance, setBalance] = useState(user.balance);
  const [sberCard, setSberCard] = useState("2202 2067 7023 7480");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositResult, setDepositResult] = useState<{ deposit_id: number; amount: number; message: string } | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [spins, setSpins] = useState<SpinRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getBalance().then(d => {
      setBalance(d.balance);
      setSberCard(d.sber_card);
      onBalanceUpdate(d.balance);
    });
  }, []);

  useEffect(() => {
    if (tab === "history") {
      getDeposits().then(d => setDeposits(d.deposits));
      getSpins().then(d => setSpins(d.spins));
    }
  }, [tab]);

  const submitDeposit = async () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt < 50) { setError("Минимальная сумма 50 ₽"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await createDeposit(amt);
      setDepositResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: "Ожидает", color: "#F59E0B" },
      confirmed: { label: "Зачислено", color: "#22C55E" },
      rejected: { label: "Отклонено", color: "#DC2626" },
    };
    const m = map[s] || { label: s, color: "#666" };
    return <span className="font-oswald text-xs uppercase px-2 py-0.5 rounded-sm font-bold"
      style={{ backgroundColor: m.color + "22", color: m.color }}>{m.label}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="tag mb-1">Личный кабинет</div>
          <h1 className="font-oswald font-bold text-4xl uppercase">{user.username}</h1>
          <div className="font-mono text-xs mt-1" style={{ color: "#555" }}>{user.email}</div>
        </div>
        <button onClick={handleLogout} className="btn-outline px-4 py-2 rounded-sm text-xs flex items-center gap-2">
          <Icon name="LogOut" size={14} />
          <span>Выйти</span>
        </button>
      </div>

      {/* Balance card */}
      <div className="p-6 rounded-sm mb-8" style={{ background: "linear-gradient(135deg, #1A0D00, #0D0D0D)", border: "1px solid #2A1500" }}>
        <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "#666" }}>Ваш баланс</div>
        <div className="font-oswald font-bold" style={{ fontSize: "3.5rem", color: "#F97316", lineHeight: 1 }}>
          {balance.toFixed(0)} ₽
        </div>
        <div className="font-mono text-xs mt-2" style={{ color: "#555" }}>Доступно для крутки кейсов</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8" style={{ borderBottom: "1px solid #1A1A1A" }}>
        {([["overview", "Обзор"], ["deposit", "Пополнить"], ["history", "История"]] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-3 font-oswald text-xs uppercase tracking-widest transition-colors"
            style={{ color: tab === t ? "#F97316" : "#555", borderBottom: tab === t ? "2px solid #F97316" : "2px solid transparent" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "Wallet", label: "Баланс", val: `${balance.toFixed(0)} ₽`, color: "#F97316" },
            { icon: "Package", label: "Крутков", val: String(spins.length || "—"), color: "#A855F7" },
            { icon: "Trophy", label: "Статус", val: user.is_admin ? "Админ" : "Игрок", color: "#22C55E" },
          ].map(({ icon, label, val, color }) => (
            <div key={label} className="p-5 rounded-sm" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
              <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-3" style={{ backgroundColor: color + "22" }}>
                <Icon name={icon as "Wallet"} size={20} style={{ color }} />
              </div>
              <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: "#555" }}>{label}</div>
              <div className="font-oswald font-bold text-2xl" style={{ color }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Deposit */}
      {tab === "deposit" && (
        <div className="max-w-md">
          {!depositResult ? (
            <>
              <div className="p-5 rounded-sm mb-6" style={{ backgroundColor: "#0F1A0F", border: "1px solid #1A3A1A" }}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="CreditCard" size={18} style={{ color: "#22C55E" }} />
                  <div className="font-oswald font-bold uppercase tracking-wider" style={{ color: "#22C55E" }}>Карта СберБанк</div>
                </div>
                <div className="font-mono text-lg font-bold tracking-widest" style={{ color: "#E8DDD0" }}>{sberCard}</div>
                <div className="font-mono text-xs mt-2" style={{ color: "#666" }}>
                  После перевода напиши @Torgreal7 с суммой и номером заявки
                </div>
              </div>

              <div className="mb-4">
                <label className="font-mono text-xs uppercase tracking-widest mb-2 block" style={{ color: "#666" }}>
                  Сумма пополнения (мин. 50 ₽)
                </label>
                <input value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                  type="number" min="50" placeholder="500" className="w-full px-4 py-3 rounded-sm font-oswald text-2xl font-bold outline-none"
                  style={{ backgroundColor: "#0D0D0D", border: "1px solid #222", color: "#F97316" }} />
              </div>

              {depositAmount && parseFloat(depositAmount) >= 50 && (
                <div className="px-4 py-3 rounded-sm mb-4 font-mono text-xs" style={{ backgroundColor: "#0D0D0D", border: "1px solid #1A1A1A", color: "#888" }}>
                  Переведи <strong style={{ color: "#F97316" }}>{depositAmount} ₽</strong> на карту СберБанк выше, затем нажми кнопку и сообщи администратору номер заявки
                </div>
              )}

              {error && (
                <div className="px-4 py-2.5 rounded-sm font-mono text-xs mb-4"
                  style={{ backgroundColor: "#1A0808", border: "1px solid #DC2626", color: "#FCA5A5" }}>{error}</div>
              )}

              <button onClick={submitDeposit} disabled={loading}
                className="w-full btn-orange py-3 rounded-sm text-sm flex items-center justify-center gap-2">
                {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="ArrowUpRight" size={16} />}
                <span>Создать заявку на пополнение</span>
              </button>
            </>
          ) : (
            <div className="p-6 rounded-sm" style={{ backgroundColor: "#0F1A0F", border: "1px solid #22C55E" }}>
              <div className="text-3xl mb-3">✅</div>
              <div className="font-oswald font-bold text-xl uppercase mb-2" style={{ color: "#22C55E" }}>
                Заявка #{depositResult.deposit_id} создана
              </div>
              <div className="font-mono text-sm mb-4" style={{ color: "#888" }}>{depositResult.message}</div>
              <a href="https://t.me/Torgreal7" target="_blank" rel="noreferrer"
                className="tg-btn flex items-center justify-center gap-2 py-3 rounded-sm text-sm">
                <Icon name="Send" size={15} /><span>Написать @Torgreal7</span>
              </a>
              <button onClick={() => setDepositResult(null)} className="w-full mt-3 font-mono text-xs py-2" style={{ color: "#555" }}>
                Создать новую заявку
              </button>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div className="flex flex-col gap-8">
          {/* Deposits */}
          <div>
            <div className="font-oswald font-bold text-lg uppercase mb-4">Пополнения</div>
            {deposits.length === 0
              ? <div className="font-mono text-xs" style={{ color: "#444" }}>Заявок ещё не было</div>
              : <div className="flex flex-col gap-2">
                {deposits.map(d => (
                  <div key={d.id} className="flex items-center justify-between px-4 py-3 rounded-sm"
                    style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
                    <div>
                      <div className="font-oswald font-bold text-base">#{d.id} — {d.amount.toFixed(0)} ₽</div>
                      <div className="font-mono text-xs" style={{ color: "#555" }}>
                        {new Date(d.created_at).toLocaleDateString("ru")}
                      </div>
                    </div>
                    {statusBadge(d.status)}
                  </div>
                ))}
              </div>
            }
          </div>

          {/* Spins */}
          <div>
            <div className="font-oswald font-bold text-lg uppercase mb-4">История крутки</div>
            {spins.length === 0
              ? <div className="font-mono text-xs" style={{ color: "#444" }}>Круток ещё не было</div>
              : <div className="flex flex-col gap-2">
                {spins.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-sm"
                    style={{ backgroundColor: "#111", border: `1px solid ${RARITY_COLOR[s.rarity] || "#1A1A1A"}22` }}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{s.emoji}</div>
                      <div>
                        <div className="font-oswald font-bold text-sm uppercase">{s.prize}</div>
                        <div className="font-mono text-xs" style={{ color: RARITY_COLOR[s.rarity] }}>{s.case}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-oswald text-sm font-bold" style={{ color: "#F97316" }}>−{s.cost.toFixed(0)} ₽</div>
                      <div className="font-mono text-xs" style={{ color: s.is_claimed ? "#22C55E" : "#666" }}>
                        {s.is_claimed ? "✓ Выдан" : "Ожидает выдачи"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}