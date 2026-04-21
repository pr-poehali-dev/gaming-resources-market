import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { cubeRoll, cubeHistory } from "@/api";
import type { User } from "./AuthModal";

type Props = {
  user: User | null;
  onAuthRequired: () => void;
  onBalanceUpdate: (b: number) => void;
};

type GameResult = {
  game_id: number;
  player_roll: number;
  server_roll: number;
  result: "win" | "lose" | "tie";
  bet: number;
  payout: number;
  new_balance: number;
};

type HistoryItem = {
  id: number;
  bet: number;
  player_roll: number;
  server_roll: number;
  result: "win" | "lose" | "tie";
  payout: number;
  created_at: string;
};

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

const RESULT_CONFIG = {
  win:  { label: "ПОБЕДА!",   color: "#22C55E", bg: "#052010", border: "#22C55E" },
  lose: { label: "ПРОИГРЫШ",  color: "#DC2626", bg: "#1A0505", border: "#DC2626" },
  tie:  { label: "НИЧЬЯ",     color: "#F59E0B", bg: "#1A1200", border: "#F59E0B" },
};

const BET_PRESETS = [10, 25, 50, 100, 200, 500];

export default function CubePage({ user, onAuthRequired, onBalanceUpdate }: Props) {
  const [bet, setBet] = useState(50);
  const [customBet, setCustomBet] = useState("");
  const [rolling, setRolling] = useState(false);
  const [animDie, setAnimDie] = useState<number | null>(null);
  const [serverAnimDie, setServerAnimDie] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user && showHistory) loadHistory();
  }, [user, showHistory]);

  const loadHistory = async () => {
    try {
      const d = await cubeHistory();
      setHistory(d.games || []);
    } catch (_) {
      setHistory([]);
    }
  };

  const effectiveBet = customBet !== "" ? parseFloat(customBet) || 0 : bet;

  const roll = async () => {
    if (!user) { onAuthRequired(); return; }
    if (rolling) return;
    if (effectiveBet < 10) { setError("Минимальная ставка 10 ₽"); return; }
    if (effectiveBet > user.balance) { setError("Недостаточно средств на балансе"); return; }

    setError("");
    setRolling(true);
    setLastResult(null);

    // анимация кубиков
    let frame = 0;
    const animInterval = setInterval(() => {
      setAnimDie(Math.floor(Math.random() * 6));
      setServerAnimDie(Math.floor(Math.random() * 6));
      frame++;
      if (frame > 20) clearInterval(animInterval);
    }, 80);

    try {
      const res = await cubeRoll(effectiveBet);
      clearInterval(animInterval);
      setAnimDie(res.player_roll - 1);
      setServerAnimDie(res.server_roll - 1);
      setLastResult(res);
      onBalanceUpdate(res.new_balance);
    } catch (e: unknown) {
      clearInterval(animInterval);
      setAnimDie(null);
      setServerAnimDie(null);
      setError(e instanceof Error ? e.message : "Ошибка броска");
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      <div className="max-w-2xl mx-auto px-5 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="tag mb-3 text-center">Испытай удачу</div>
          <h1 className="font-oswald font-bold mb-3" style={{ fontSize: "clamp(2.5rem,8vw,5rem)" }}>
            🎲 КУБИК РУБИКА
          </h1>
          <p className="font-mono text-sm" style={{ color: "#555" }}>
            Твой кубик против кубика сервера · Больше — ставка ×2
          </p>
        </div>

        {/* Rules */}
        <div className="p-5 rounded-sm mb-8" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
          <div className="font-oswald text-sm uppercase tracking-widest mb-3" style={{ color: "#F97316" }}>Правила</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-sm" style={{ backgroundColor: "#0D0D0D", border: "1px solid #22C55E22" }}>
              <div className="text-2xl mb-1">🎲 &gt; 🎲</div>
              <div className="font-oswald text-xs uppercase tracking-wide" style={{ color: "#22C55E" }}>Победа</div>
              <div className="font-mono text-xs mt-1" style={{ color: "#555" }}>Ставка ×2</div>
            </div>
            <div className="p-3 rounded-sm" style={{ backgroundColor: "#0D0D0D", border: "1px solid #F59E0B22" }}>
              <div className="text-2xl mb-1">🎲 = 🎲</div>
              <div className="font-oswald text-xs uppercase tracking-wide" style={{ color: "#F59E0B" }}>Ничья</div>
              <div className="font-mono text-xs mt-1" style={{ color: "#555" }}>Возврат</div>
            </div>
            <div className="p-3 rounded-sm" style={{ backgroundColor: "#0D0D0D", border: "1px solid #DC262622" }}>
              <div className="text-2xl mb-1">🎲 &lt; 🎲</div>
              <div className="font-oswald text-xs uppercase tracking-wide" style={{ color: "#DC2626" }}>Проигрыш</div>
              <div className="font-mono text-xs mt-1" style={{ color: "#555" }}>Ставка списана</div>
            </div>
          </div>
        </div>

        {/* Dice arena */}
        <div className="p-6 rounded-sm mb-8" style={{ backgroundColor: "#080808", border: "1px solid #1F1F1F" }}>
          <div className="flex items-center justify-around">
            {/* Player */}
            <div className="flex flex-col items-center gap-3">
              <div className="font-oswald text-xs uppercase tracking-widest" style={{ color: "#666" }}>Твой бросок</div>
              <div className="text-8xl select-none transition-all duration-75"
                style={{ filter: lastResult?.result === "win" ? "drop-shadow(0 0 20px #22C55E)" : lastResult?.result === "lose" ? "drop-shadow(0 0 20px #DC2626)" : "none" }}>
                {animDie !== null ? DICE_FACES[animDie] : "⬜"}
              </div>
              {lastResult && (
                <div className="font-oswald text-3xl font-bold" style={{ color: "#E8DDD0" }}>{lastResult.player_roll}</div>
              )}
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-2">
              <div className="font-oswald font-bold text-2xl uppercase" style={{ color: "#333" }}>VS</div>
              {lastResult && (
                <div className="font-oswald font-bold text-sm uppercase px-3 py-1 rounded-sm"
                  style={{
                    color: RESULT_CONFIG[lastResult.result].color,
                    backgroundColor: RESULT_CONFIG[lastResult.result].bg,
                    border: `1px solid ${RESULT_CONFIG[lastResult.result].border}`,
                  }}>
                  {RESULT_CONFIG[lastResult.result].label}
                </div>
              )}
            </div>

            {/* Server */}
            <div className="flex flex-col items-center gap-3">
              <div className="font-oswald text-xs uppercase tracking-widest" style={{ color: "#666" }}>Сервер</div>
              <div className="text-8xl select-none transition-all duration-75"
                style={{ filter: lastResult?.result === "lose" ? "drop-shadow(0 0 20px #DC2626)" : lastResult?.result === "win" ? "drop-shadow(0 0 20px #22C55E)" : "none" }}>
                {serverAnimDie !== null ? DICE_FACES[serverAnimDie] : "⬜"}
              </div>
              {lastResult && (
                <div className="font-oswald text-3xl font-bold" style={{ color: "#E8DDD0" }}>{lastResult.server_roll}</div>
              )}
            </div>
          </div>

          {/* Payout display */}
          {lastResult && (
            <div className="mt-6 pt-5 text-center" style={{ borderTop: "1px solid #1A1A1A" }}>
              {lastResult.result === "win" && (
                <div className="font-oswald font-bold text-2xl" style={{ color: "#22C55E" }}>
                  +{(lastResult.bet * 2).toFixed(0)} ₽ получено!
                </div>
              )}
              {lastResult.result === "lose" && (
                <div className="font-oswald font-bold text-2xl" style={{ color: "#DC2626" }}>
                  -{lastResult.bet.toFixed(0)} ₽ списано
                </div>
              )}
              {lastResult.result === "tie" && (
                <div className="font-oswald font-bold text-2xl" style={{ color: "#F59E0B" }}>
                  Ставка возвращена
                </div>
              )}
              <div className="font-mono text-sm mt-1" style={{ color: "#555" }}>
                Баланс: {lastResult.new_balance.toFixed(0)} ₽
              </div>
            </div>
          )}
        </div>

        {/* Bet selector */}
        <div className="p-5 rounded-sm mb-6" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
          <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#555" }}>Ставка</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {BET_PRESETS.map(n => (
              <button key={n} onClick={() => { setBet(n); setCustomBet(""); }}
                disabled={rolling}
                className="px-4 py-2 rounded-sm font-oswald font-bold text-sm uppercase transition-all"
                style={{
                  backgroundColor: bet === n && customBet === "" ? "#F97316" : "#0D0D0D",
                  color: bet === n && customBet === "" ? "#0D0D0D" : "#666",
                  border: `1px solid ${bet === n && customBet === "" ? "#F97316" : "#222"}`,
                  cursor: rolling ? "not-allowed" : "pointer",
                }}>
                {n} ₽
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              placeholder="Своя сумма..."
              value={customBet}
              onChange={e => setCustomBet(e.target.value)}
              disabled={rolling}
              className="flex-1 px-4 py-2.5 rounded-sm font-mono text-sm"
              style={{ backgroundColor: "#0D0D0D", border: `1px solid ${customBet ? "#F97316" : "#222"}`, color: "#E8DDD0", outline: "none" }}
              min={10}
            />
            <span className="font-oswald text-sm" style={{ color: "#555" }}>₽</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="font-mono text-xs" style={{ color: "#555" }}>Ставка: <span style={{ color: "#F97316" }}>{effectiveBet.toFixed(0)} ₽</span></span>
            {user && <span className="font-mono text-xs" style={{ color: "#555" }}>Баланс: <span style={{ color: "#E8DDD0" }}>{user.balance.toFixed(0)} ₽</span></span>}
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-sm font-mono text-sm mb-5 flex items-center gap-3"
            style={{ backgroundColor: "#1A0808", border: "1px solid #DC2626", color: "#FCA5A5" }}>
            <Icon name="AlertCircle" size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Roll button */}
        <button onClick={roll} disabled={rolling}
          className="w-full py-5 rounded-sm font-oswald font-bold uppercase tracking-widest text-xl transition-all flex items-center justify-center gap-3"
          style={{
            backgroundColor: rolling ? "#1A1A1A" : "#F97316",
            color: rolling ? "#555" : "#0D0D0D",
            cursor: rolling ? "not-allowed" : "pointer",
            boxShadow: rolling ? "none" : "0 0 30px rgba(249,115,22,0.3)",
          }}>
          {rolling ? (
            <><Icon name="Loader2" size={24} className="animate-spin" /><span>Бросаем...</span></>
          ) : (
            <><span>🎲</span><span>Бросить — {effectiveBet.toFixed(0)} ₽</span></>
          )}
        </button>

        {!user && (
          <p className="text-center font-mono text-xs mt-3" style={{ color: "#555" }}>
            Нужно <button onClick={onAuthRequired} className="underline" style={{ color: "#F97316" }}>войти в аккаунт</button>, чтобы играть
          </p>
        )}

        {/* History */}
        {user && (
          <div className="mt-10">
            <button onClick={() => { setShowHistory(!showHistory); }}
              className="w-full flex items-center justify-between p-4 rounded-sm transition-all"
              style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
              <span className="font-oswald text-sm uppercase tracking-widest">История бросков</span>
              <Icon name={showHistory ? "ChevronUp" : "ChevronDown"} size={18} style={{ color: "#555" }} />
            </button>

            {showHistory && (
              <div className="mt-3 flex flex-col gap-2">
                {history.length === 0 ? (
                  <div className="text-center py-6 font-mono text-sm" style={{ color: "#444" }}>Историй нет</div>
                ) : history.map(g => (
                  <div key={g.id} className="flex items-center justify-between px-4 py-3 rounded-sm"
                    style={{ backgroundColor: "#0D0D0D", border: `1px solid ${RESULT_CONFIG[g.result].border}22` }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{DICE_FACES[g.player_roll - 1]}</span>
                      <span className="font-oswald text-xs" style={{ color: "#444" }}>vs</span>
                      <span className="text-2xl">{DICE_FACES[g.server_roll - 1]}</span>
                    </div>
                    <div className="font-oswald text-xs uppercase tracking-wide"
                      style={{ color: RESULT_CONFIG[g.result].color }}>
                      {RESULT_CONFIG[g.result].label}
                    </div>
                    <div className="font-oswald text-sm font-bold"
                      style={{ color: g.result === "win" ? "#22C55E" : g.result === "lose" ? "#DC2626" : "#F59E0B" }}>
                      {g.result === "win" ? `+${(g.bet * 2).toFixed(0)}` : g.result === "lose" ? `-${g.bet.toFixed(0)}` : "0"} ₽
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}