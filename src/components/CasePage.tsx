import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { getCases, spin, getBalance } from "@/api";
import type { User } from "./AuthModal";

type Prize = {
  id: number;
  name: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  weight: number;
};

type Case = {
  id: number;
  name: string;
  price: number;
  prizes: Prize[];
};

type SpinResult = {
  spin_id: number;
  prize: Prize;
  roll: number;
  seed_hash: string;
  client_seed: string;
  server_seed: string;
};

const RARITY_COLOR: Record<string, string> = {
  common: "#9CA3AF",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F59E0B",
};
const RARITY_LABEL: Record<string, string> = {
  common: "Обычный",
  rare: "Редкий",
  epic: "Эпический",
  legendary: "Легендарный",
};

const TG_ADMIN = "https://t.me/Torgreal7";

type Props = {
  user: User | null;
  onAuthRequired: () => void;
  onBalanceUpdate: (newBalance: number) => void;
};

export default function CasePage({ user, onAuthRequired, onBalanceUpdate }: Props) {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [spinCount, setSpinCount] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<SpinResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [rouletteItems, setRouletteItems] = useState<Prize[]>([]);
  const [rouletteOffset, setRouletteOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const rouletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCases().then(d => {
      setCases(d.cases);
      if (d.cases.length > 0) setSelectedCase(d.cases[0]);
    });
  }, []);

  const buildRouletteStrip = (prize: Prize, allPrizes: Prize[]) => {
    const strip: Prize[] = [];
    for (let i = 0; i < 40; i++) {
      const rnd = allPrizes[Math.floor(Math.random() * allPrizes.length)];
      strip.push(rnd);
    }
    strip[35] = prize;
    return strip;
  };

  const doSpin = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!selectedCase) return;
    const cost = selectedCase.price * spinCount;
    if (user.balance < cost) {
      setError(`Недостаточно средств. Нужно ${cost} ₽, у вас ${user.balance.toFixed(0)} ₽`);
      return;
    }
    setError("");
    setSpinning(true);
    setShowResults(false);
    try {
      const data = await spin(selectedCase.id, spinCount);
      const firstResult = data.results[0];
      const strip = buildRouletteStrip(firstResult.prize, selectedCase.prizes);
      setRouletteItems(strip);
      setRouletteOffset(0);

      setTimeout(() => {
        const itemW = 120;
        const targetIdx = 35;
        const centerOffset = (rouletteRef.current?.clientWidth || 600) / 2 - itemW / 2;
        const offset = targetIdx * itemW - centerOffset;
        setRouletteOffset(offset);
        setIsAnimating(true);
      }, 50);

      setTimeout(() => {
        setIsAnimating(false);
        setResults(data.results);
        setShowResults(true);
        onBalanceUpdate(data.new_balance);
      }, 4500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setSpinning(false);
    }
  };

  const handleAnimationEnd = () => {
    if (isAnimating) return;
    setSpinning(false);
  };

  const claimPrize = (result: SpinResult) => {
    const msg = encodeURIComponent(
      `Хочу получить приз!\nСпин #${result.spin_id}: ${result.prize.emoji} ${result.prize.name}\nSeed hash: ${result.seed_hash}`
    );
    window.open(`${TG_ADMIN}?text=${msg}`, "_blank");
  };

  if (!selectedCase) return (
    <div className="flex items-center justify-center py-32" style={{ color: "#555" }}>
      <Icon name="Loader2" size={30} className="animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <div className="tag mb-2">Испытай удачу</div>
      <h1 className="font-oswald font-bold mb-2" style={{ fontSize: "clamp(2.5rem,7vw,5rem)" }}>КЕЙСЫ</h1>
      <p className="font-mono text-xs mb-10" style={{ color: "#666" }}>
        Провабельно честная система — каждый результат можно проверить
      </p>

      {/* Case selector */}
      <div className="flex gap-3 flex-wrap mb-10">
        {cases.map(c => (
          <button key={c.id} onClick={() => { setSelectedCase(c); setShowResults(false); setError(""); }}
            className="px-5 py-3 rounded-sm font-oswald font-bold uppercase tracking-wide text-sm transition-all"
            style={{
              backgroundColor: selectedCase.id === c.id ? "#F97316" : "#111",
              color: selectedCase.id === c.id ? "#0D0D0D" : "#888",
              border: `1px solid ${selectedCase.id === c.id ? "#F97316" : "#222"}`,
            }}>
            {c.name} — {c.price} ₽
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Roulette */}
        <div>
          {/* Roulette strip */}
          <div className="relative rounded-sm overflow-hidden mb-6"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #1F1F1F", height: "140px" }}>
            {/* Center line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 z-10"
              style={{ backgroundColor: "#F97316", boxShadow: "0 0 10px #F97316" }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 z-10"
              style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "12px solid #F97316" }} />

            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10"
              style={{ background: "linear-gradient(to right, #0D0D0D, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10"
              style={{ background: "linear-gradient(to left, #0D0D0D, transparent)" }} />

            {/* Items */}
            <div ref={rouletteRef} className="absolute top-0 left-0 h-full flex items-center"
              style={{
                transform: `translateX(-${rouletteOffset}px)`,
                transition: isAnimating ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
              onTransitionEnd={handleAnimationEnd}>
              {(rouletteItems.length > 0 ? rouletteItems : selectedCase.prizes).map((p, i) => (
                <div key={i} className="flex-shrink-0 w-28 h-24 flex flex-col items-center justify-center mx-1 rounded-sm"
                  style={{ backgroundColor: "#161616", border: `1px solid ${RARITY_COLOR[p.rarity]}33` }}>
                  <div className="text-3xl mb-1">{p.emoji}</div>
                  <div className="font-oswald text-xs uppercase text-center px-1 leading-tight"
                    style={{ color: RARITY_COLOR[p.rarity] }}>{p.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mb-4 flex-wrap">
            {[1, 2, 3, 5, 10].map(n => (
              <button key={n} onClick={() => setSpinCount(n)}
                className="flex-1 py-2 rounded-sm font-oswald font-bold text-sm uppercase transition-all"
                style={{
                  backgroundColor: spinCount === n ? "#1F1F1F" : "#111",
                  color: spinCount === n ? "#F97316" : "#555",
                  border: `1px solid ${spinCount === n ? "#F97316" : "#222"}`,
                }}>
                ×{n}
              </button>
            ))}
          </div>

          <div className="p-4 rounded-sm mb-4 flex items-center justify-between"
            style={{ backgroundColor: "#0D0D0D", border: "1px solid #1A1A1A" }}>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest mb-0.5" style={{ color: "#555" }}>Итого</div>
              <div className="font-oswald text-3xl font-bold" style={{ color: "#F97316" }}>
                {(selectedCase.price * spinCount).toFixed(0)} ₽
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs" style={{ color: "#555" }}>Ваш баланс</div>
              <div className="font-oswald text-lg font-bold" style={{ color: user ? "#E8DDD0" : "#555" }}>
                {user ? `${user.balance.toFixed(0)} ₽` : "—"}
              </div>
            </div>
          </div>

          {error && (
            <div className="px-4 py-2.5 rounded-sm font-mono text-xs mb-4"
              style={{ backgroundColor: "#1A0808", border: "1px solid #DC2626", color: "#FCA5A5" }}>
              {error}
            </div>
          )}

          <button onClick={doSpin} disabled={spinning}
            className="w-full btn-orange py-4 rounded-sm text-base flex items-center justify-center gap-3">
            {spinning
              ? <><Icon name="Loader2" size={20} className="animate-spin" /><span>Крутим...</span></>
              : <><Icon name="Zap" size={20} /><span>Крутить {spinCount > 1 ? `×${spinCount}` : ""}</span></>
            }
          </button>

          {!user && (
            <p className="font-mono text-xs text-center mt-3" style={{ color: "#555" }}>
              Войди в аккаунт чтобы крутить кейсы
            </p>
          )}
        </div>

        {/* Right: Prizes list */}
        <div>
          <div className="font-oswald font-bold text-lg uppercase mb-4 tracking-wide">
            Содержимое кейса
          </div>
          <div className="flex flex-col gap-2">
            {selectedCase.prizes.map(p => {
              const totalW = selectedCase.prizes.reduce((s, x) => s + x.weight, 0);
              const pct = ((p.weight / totalW) * 100).toFixed(1);
              return (
                <div key={p.id} className="flex items-center gap-4 px-4 py-3 rounded-sm"
                  style={{ backgroundColor: "#111", border: `1px solid ${RARITY_COLOR[p.rarity]}22` }}>
                  <div className="text-2xl w-8 text-center">{p.emoji}</div>
                  <div className="flex-1">
                    <div className="font-oswald font-bold text-sm uppercase">{p.name}</div>
                    <div className="font-mono text-xs" style={{ color: RARITY_COLOR[p.rarity] }}>
                      {RARITY_LABEL[p.rarity]}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-oswald font-bold text-sm" style={{ color: "#F97316" }}>{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results modal */}
      {showResults && results.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setShowResults(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.85)" }} />
          <div className="relative w-full max-w-lg animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #2A2A2A" }}>
              <div className="px-6 py-4" style={{ borderBottom: "1px solid #1A1A1A", background: "linear-gradient(135deg, #1A0A00, #0D0D0D)" }}>
                <div className="font-oswald font-bold text-2xl uppercase tracking-widest text-center" style={{ color: "#F97316" }}>
                  🎉 Выигрыш!
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {results.map(r => (
                  <div key={r.spin_id} className="p-4 rounded-sm text-center"
                    style={{ backgroundColor: "#0D0D0D", border: `1px solid ${RARITY_COLOR[r.prize.rarity]}44` }}>
                    <div className="text-5xl mb-3">{r.prize.emoji}</div>
                    <div className="font-oswald font-bold text-xl uppercase mb-1">{r.prize.name}</div>
                    <div className="font-mono text-xs mb-4" style={{ color: RARITY_COLOR[r.prize.rarity] }}>
                      {RARITY_LABEL[r.prize.rarity]}
                    </div>
                    <button onClick={() => claimPrize(r)} className="tg-btn px-6 py-2.5 rounded-sm text-sm flex items-center gap-2 mx-auto">
                      <Icon name="Send" size={15} />
                      <span>Получить в Telegram</span>
                    </button>
                  </div>
                ))}
                <div className="px-4 py-3 rounded-sm font-mono text-xs" style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="ShieldCheck" size={14} style={{ color: "#22C55E" }} />
                    <span style={{ color: "#22C55E" }}>Провабельно честно</span>
                  </div>
                  <div style={{ color: "#444", wordBreak: "break-all" }}>
                    Hash: {results[0]?.seed_hash?.slice(0, 32)}...
                  </div>
                </div>
                <button onClick={() => setShowResults(false)} className="btn-outline py-2 rounded-sm text-sm">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
