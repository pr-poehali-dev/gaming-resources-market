import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  adminGetDeposits, adminConfirmDeposit,
  adminGetUsers, adminAdjustBalance,
  adminGetSpins, adminClaimSpin
} from "@/api";

type Deposit = { id: number; user_id: number; username: string; amount: number; status: string; created_at: string };
type UserRow = { id: number; username: string; email: string; balance: number; is_admin: boolean; created_at: string };
type SpinRow = { id: number; username: string; case: string; prize: string; emoji: string; rarity: string; cost: number; seed_hash: string; is_claimed: boolean; created_at: string };

const RARITY_COLOR: Record<string, string> = { common: "#9CA3AF", rare: "#3B82F6", epic: "#A855F7", legendary: "#F59E0B" };

export default function AdminPanel() {
  const [tab, setTab] = useState<"deposits" | "users" | "spins">("deposits");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [spins, setSpins] = useState<SpinRow[]>([]);
  const [adjustTarget, setAdjustTarget] = useState<UserRow | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    if (tab === "deposits") setDeposits((await adminGetDeposits()).deposits);
    if (tab === "users") setUsers((await adminGetUsers()).users);
    if (tab === "spins") setSpins((await adminGetSpins()).spins);
  };

  useEffect(() => { load(); }, [tab]);

  const confirm = async (id: number, action: "confirm" | "reject") => {
    await adminConfirmDeposit(id, action);
    setMsg(action === "confirm" ? "✅ Баланс пополнен" : "❌ Заявка отклонена");
    load();
    setTimeout(() => setMsg(""), 3000);
  };

  const doAdjust = async () => {
    if (!adjustTarget || !adjustDelta) return;
    await adminAdjustBalance(adjustTarget.id, parseFloat(adjustDelta), adjustReason);
    setMsg(`✅ Баланс ${adjustTarget.username} изменён на ${adjustDelta} ₽`);
    setAdjustTarget(null);
    setAdjustDelta("");
    setAdjustReason("");
    load();
    setTimeout(() => setMsg(""), 3000);
  };

  const claimSpin = async (id: number) => {
    await adminClaimSpin(id);
    setMsg("✅ Отмечено как выдано");
    load();
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="tag mb-2">Управление</div>
      <h1 className="font-oswald font-bold text-5xl uppercase mb-8">Админ-панель</h1>

      {msg && (
        <div className="px-4 py-3 rounded-sm font-mono text-sm mb-6 animate-fade-in"
          style={{ backgroundColor: "#0F1A0F", border: "1px solid #22C55E", color: "#22C55E" }}>{msg}</div>
      )}

      <div className="flex gap-1 mb-8" style={{ borderBottom: "1px solid #1A1A1A" }}>
        {([["deposits", "Пополнения", "CreditCard"], ["users", "Пользователи", "Users"], ["spins", "Крутки", "Dice5"]] as const).map(([t, l, icon]) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-3 font-oswald text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
            style={{ color: tab === t ? "#F97316" : "#555", borderBottom: tab === t ? "2px solid #F97316" : "2px solid transparent" }}>
            <Icon name={icon} size={14} />{l}
          </button>
        ))}
      </div>

      {/* DEPOSITS */}
      {tab === "deposits" && (
        <div>
          <div className="font-oswald font-bold text-lg uppercase mb-4">Ожидают подтверждения</div>
          {deposits.length === 0
            ? <div className="font-mono text-sm py-8 text-center" style={{ color: "#444" }}>Нет ожидающих заявок 🎉</div>
            : <div className="flex flex-col gap-3">
              {deposits.map(d => (
                <div key={d.id} className="p-5 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{ backgroundColor: "#111", border: "1px solid #2A2A00" }}>
                  <div>
                    <div className="font-oswald font-bold text-lg">#{d.id} — {d.amount.toFixed(0)} ₽</div>
                    <div className="font-mono text-sm" style={{ color: "#888" }}>{d.username}</div>
                    <div className="font-mono text-xs" style={{ color: "#555" }}>
                      {new Date(d.created_at).toLocaleString("ru")}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => confirm(d.id, "confirm")}
                      className="px-4 py-2 rounded-sm font-oswald font-bold uppercase text-sm"
                      style={{ backgroundColor: "#14532D", color: "#22C55E", border: "1px solid #22C55E" }}>
                      ✅ Подтвердить
                    </button>
                    <button onClick={() => confirm(d.id, "reject")}
                      className="px-4 py-2 rounded-sm font-oswald font-bold uppercase text-sm"
                      style={{ backgroundColor: "#450A0A", color: "#DC2626", border: "1px solid #DC2626" }}>
                      ❌ Отклонить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div>
          <div className="font-oswald font-bold text-lg uppercase mb-4">Все пользователи ({users.length})</div>
          <div className="flex flex-col gap-2">
            {users.map(u => (
              <div key={u.id} className="px-4 py-3 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
                <div>
                  <div className="font-oswald font-bold text-base flex items-center gap-2">
                    {u.username}
                    {u.is_admin && <span className="text-xs px-2 py-0.5 rounded-sm" style={{ backgroundColor: "#F9731622", color: "#F97316" }}>ADMIN</span>}
                  </div>
                  <div className="font-mono text-xs" style={{ color: "#666" }}>{u.email}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-oswald font-bold text-xl" style={{ color: "#F97316" }}>{u.balance.toFixed(0)} ₽</div>
                  <button onClick={() => setAdjustTarget(u)}
                    className="px-3 py-1.5 rounded-sm font-mono text-xs"
                    style={{ backgroundColor: "#1A1A1A", border: "1px solid #333", color: "#888" }}>
                    Изменить баланс
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Adjust modal */}
          {adjustTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setAdjustTarget(null)}>
              <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
              <div className="relative w-full max-w-sm rounded-sm overflow-hidden animate-fade-up"
                style={{ backgroundColor: "#111", border: "1px solid #2A2A2A" }}
                onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4" style={{ borderBottom: "1px solid #1A1A1A" }}>
                  <div className="font-oswald font-bold text-xl uppercase">Изменить баланс</div>
                  <div className="font-mono text-xs" style={{ color: "#666" }}>{adjustTarget.username} — текущий: {adjustTarget.balance.toFixed(0)} ₽</div>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest mb-1 block" style={{ color: "#666" }}>
                      Сумма (+ добавить / - вычесть)
                    </label>
                    <input value={adjustDelta} onChange={e => setAdjustDelta(e.target.value)}
                      type="number" placeholder="+500 или -100"
                      className="w-full px-4 py-2.5 rounded-sm font-mono text-xl outline-none"
                      style={{ backgroundColor: "#0D0D0D", border: "1px solid #222", color: "#F97316" }} />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase tracking-widest mb-1 block" style={{ color: "#666" }}>Причина</label>
                    <input value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                      placeholder="Пополнение по переводу"
                      className="w-full px-4 py-2.5 rounded-sm font-mono text-sm outline-none"
                      style={{ backgroundColor: "#0D0D0D", border: "1px solid #222", color: "#E8DDD0" }} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={doAdjust} className="flex-1 btn-orange py-2.5 rounded-sm text-sm">Применить</button>
                    <button onClick={() => setAdjustTarget(null)} className="flex-1 btn-outline py-2.5 rounded-sm text-sm">Отмена</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SPINS */}
      {tab === "spins" && (
        <div>
          <div className="font-oswald font-bold text-lg uppercase mb-4">Все выигрыши ({spins.length})</div>
          <div className="flex flex-col gap-2">
            {spins.map(s => (
              <div key={s.id} className="px-4 py-3 rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{ backgroundColor: "#111", border: `1px solid ${RARITY_COLOR[s.rarity] || "#1A1A1A"}33` }}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{s.emoji}</div>
                  <div>
                    <div className="font-oswald font-bold text-sm uppercase flex items-center gap-2">
                      {s.prize}
                      {s.is_claimed && <span className="text-xs px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: "#0F2A0F", color: "#22C55E" }}>Выдан</span>}
                    </div>
                    <div className="font-mono text-xs" style={{ color: "#666" }}>
                      {s.username} · {s.case} · {new Date(s.created_at).toLocaleDateString("ru")}
                    </div>
                    <div className="font-mono text-xs mt-0.5" style={{ color: "#333" }}>
                      hash: {s.seed_hash.slice(0, 24)}...
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-oswald font-bold text-base" style={{ color: "#F97316" }}>
                    {s.cost.toFixed(0)} ₽
                  </div>
                  {!s.is_claimed && (
                    <button onClick={() => claimSpin(s.id)}
                      className="px-3 py-1.5 rounded-sm font-mono text-xs"
                      style={{ backgroundColor: "#0F2A0F", border: "1px solid #22C55E", color: "#22C55E" }}>
                      Отметить выданным
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
