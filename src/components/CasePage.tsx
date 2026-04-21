import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { getCases, spin as apiSpin } from "@/api";
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
  seed_hash: string;
  client_seed: string;
  server_seed: string;
};

const RARITY_COLOR: Record<string, string> = {
  common: "#6B7280",
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
const RARITY_GLOW: Record<string, string> = {
  common: "rgba(107,114,128,0.3)",
  rare: "rgba(59,130,246,0.4)",
  epic: "rgba(168,85,247,0.5)",
  legendary: "rgba(245,158,11,0.6)",
};

const TG_ADMIN = "https://t.me/Torgreal7";
const ITEM_W = 130; // ширина одного слота в px
const STRIP_COUNT = 60; // кол-во элементов в ленте

type Props = {
  user: User | null;
  onAuthRequired: () => void;
  onBalanceUpdate: (b: number) => void;
};

function buildStrip(winPrize: Prize, allPrizes: Prize[]): Prize[] {
  // Создаём ленту из STRIP_COUNT случайных элементов
  // Победный приз ставим на позицию 48 (чтобы было много прокрутки)
  const strip: Prize[] = [];
  for (let i = 0; i < STRIP_COUNT; i++) {
    if (i === STRIP_COUNT - 12) {
      strip.push(winPrize);
    } else {
      // случайный приз на основе весов
      const total = allPrizes.reduce((s, p) => s + p.weight, 0);
      let r = Math.random() * total;
      let picked = allPrizes[0];
      for (const p of allPrizes) {
        r -= p.weight;
        if (r <= 0) { picked = p; break; }
      }
      strip.push(picked);
    }
  }
  return strip;
}

export default function CasePage({ user, onAuthRequired, onBalanceUpdate }: Props) {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loadError, setLoadError] = useState("");
  const [spinCount, setSpinCount] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [results, setResults] = useState<SpinResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [strip, setStrip] = useState<Prize[]>([]);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const rouletteRef = useRef<HTMLDivElement>(null);
  const animRef = useRef(false);

  useEffect(() => {
    getCases()
      .then(d => {
        const list: Case[] = d.cases || [];
        setCases(list);
        if (list.length > 0) setSelectedCase(list[0]);
        else setLoadError("Кейсы не найдены");
      })
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : "Не удалось загрузить кейсы");
      });
  }, []);

  // Инициализируем ленту случайными призами при выборе кейса
  useEffect(() => {
    if (!selectedCase) return;
    const s: Prize[] = [];
    for (let i = 0; i < STRIP_COUNT; i++) {
      s.push(selectedCase.prizes[Math.floor(Math.random() * selectedCase.prizes.length)]);
    }
    setStrip(s);
    setTranslateX(0);
    setIsAnimating(false);
  }, [selectedCase]);

  const doSpin = async () => {
    if (!user) { onAuthRequired(); return; }
    if (!selectedCase || spinning || animRef.current) return;

    const cost = selectedCase.price * spinCount;
    if (user.balance < cost) {
      setError(`Недостаточно средств. Нужно ${cost.toLocaleString()} ₽, у вас ${user.balance.toFixed(0)} ₽`);
      return;
    }

    setError("");
    setSpinning(true);
    setShowResults(false);
    animRef.current = true;

    try {
      const data = await apiSpin(selectedCase.id, spinCount);
      const firstResult: SpinResult = data.results[0];

      // Строим ленту с выигрышным призом на позиции STRIP_COUNT-12
      const newStrip = buildStrip(firstResult.prize, selectedCase.prizes);
      setStrip(newStrip);
      setTranslateX(0);
      setIsAnimating(false);

      // Ждём рендера, потом запускаем анимацию
      setTimeout(() => {
        if (!rouletteRef.current) return;
        const containerW = rouletteRef.current.clientWidth;
        const winIndex = STRIP_COUNT - 12;
        // Центруем победный слот
        const targetX = winIndex * ITEM_W - containerW / 2 + ITEM_W / 2;
        // Добавляем небольшой случайный сдвиг внутри слота (-30..+30px)
        const jitter = Math.floor(Math.random() * 60) - 30;

        setIsAnimating(true);
        setTranslateX(targetX + jitter);

        // Через 5 секунд — показываем результат
        setTimeout(() => {
          animRef.current = false;
          setIsAnimating(false);
          setResults(data.results);
          setShowResults(true);
          onBalanceUpdate(data.new_balance);
          setSpinning(false);
        }, 5200);
      }, 50);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка сервера");
      setSpinning(false);
      animRef.current = false;
    }
  };

  const claimPrize = (r: SpinResult) => {
    const msg = encodeURIComponent(
      `Привет! Хочу получить приз 🎰\n\nСпин #${r.spin_id}\nПриз: ${r.prize.emoji} ${r.prize.name}\n\nSeed hash: ${r.seed_hash}`
    );
    window.open(`${TG_ADMIN}?text=${msg}`, "_blank");
  };

  if (!selectedCase) return (
    <div className="flex items-center justify-center py-40">
      <div className="flex flex-col items-center gap-4">
        {loadError ? (
          <>
            <Icon name="AlertCircle" size={36} style={{ color: "#DC2626" }} />
            <div className="font-oswald text-base uppercase tracking-widest" style={{ color: "#DC2626" }}>{loadError}</div>
            <button onClick={() => window.location.reload()} className="btn-orange px-6 py-2 rounded-sm text-sm mt-2">
              Обновить страницу
            </button>
          </>
        ) : (
          <>
            <Icon name="Loader2" size={36} className="animate-spin" style={{ color: "#F97316" }} />
            <div className="font-oswald text-sm uppercase tracking-widest" style={{ color: "#555" }}>Загружаем кейсы...</div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0D0D0D" }}>
      <div className="max-w-5xl mx-auto px-5 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="tag mb-3 text-center">Испытай удачу</div>
          <h1 className="font-oswald font-bold mb-3" style={{ fontSize: "clamp(3rem,8vw,6rem)" }}>
            🎰 КЕЙСЫ
          </h1>
          <p className="font-mono text-sm" style={{ color: "#555" }}>
            Провабельно честная система · Все результаты проверяемы
          </p>
        </div>

        {/* Case selector tabs */}
        <div className="flex gap-3 flex-wrap justify-center mb-10">
          {cases.map(c => (
            <button key={c.id}
              onClick={() => { if (!spinning) { setSelectedCase(c); setShowResults(false); setError(""); } }}
              className="px-6 py-3 rounded-sm font-oswald font-bold uppercase tracking-wide text-sm transition-all"
              style={{
                backgroundColor: selectedCase.id === c.id ? "#F97316" : "#111",
                color: selectedCase.id === c.id ? "#0D0D0D" : "#888",
                border: `1px solid ${selectedCase.id === c.id ? "#F97316" : "#222"}`,
                cursor: spinning ? "not-allowed" : "pointer",
              }}>
              {c.name}
              <span className="ml-2 font-mono font-normal text-xs">
                {c.price.toFixed(0)} ₽
              </span>
            </button>
          ))}
        </div>

        {/* ===== ROULETTE ===== */}
        <div className="mb-8 rounded-sm overflow-hidden" style={{ backgroundColor: "#080808", border: "1px solid #1F1F1F" }}>

          {/* Top decoration */}
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #1A1A1A" }}>
            <div className="font-oswald text-sm uppercase tracking-widest" style={{ color: "#444" }}>
              {selectedCase.name}
            </div>
            <div className="font-oswald font-bold text-lg" style={{ color: "#F97316" }}>
              {(selectedCase.price * spinCount).toFixed(0)} ₽
            </div>
          </div>

          {/* Roulette window */}
          <div className="relative overflow-hidden" style={{ height: "170px" }} ref={rouletteRef}>

            {/* Left/right fade */}
            <div className="absolute left-0 top-0 bottom-0 w-32 z-20 pointer-events-none"
              style={{ background: "linear-gradient(to right, #080808, transparent)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-32 z-20 pointer-events-none"
              style={{ background: "linear-gradient(to left, #080808, transparent)" }} />

            {/* Center marker — top triangle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30" style={{ width: 0, height: 0,
              borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "16px solid #F97316" }} />
            {/* Center marker — bottom triangle */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30" style={{ width: 0, height: 0,
              borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderBottom: "16px solid #F97316" }} />
            {/* Center line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 w-0.5"
              style={{ backgroundColor: "#F97316", opacity: 0.6 }} />

            {/* The strip */}
            <div className="absolute top-0 left-0 h-full flex items-center"
              style={{
                transform: `translateX(-${translateX}px)`,
                transition: isAnimating
                  ? "transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)"
                  : "none",
                willChange: "transform",
              }}>
              {strip.map((prize, i) => (
                <div key={i}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-1 mx-1 rounded-sm select-none"
                  style={{
                    width: `${ITEM_W - 8}px`,
                    height: "140px",
                    backgroundColor: "#111",
                    border: `1px solid ${RARITY_COLOR[prize.rarity]}44`,
                    boxShadow: i === STRIP_COUNT - 12 && showResults
                      ? `0 0 20px ${RARITY_GLOW[prize.rarity]}`
                      : "none",
                  }}>
                  <div style={{ fontSize: "2.5rem", lineHeight: 1 }}>{prize.emoji}</div>
                  <div className="font-oswald font-bold text-center px-2 leading-tight"
                    style={{ fontSize: "0.7rem", color: RARITY_COLOR[prize.rarity], textTransform: "uppercase" }}>
                    {prize.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid #1A1A1A" }}>
            <div className="flex items-center gap-2">
              {spinning ? (
                <>
                  <Icon name="Loader2" size={14} className="animate-spin" style={{ color: "#F97316" }} />
                  <span className="font-mono text-xs" style={{ color: "#F97316" }}>Крутим...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
                  <span className="font-mono text-xs" style={{ color: "#555" }}>Готов к крутке</span>
                </>
              )}
            </div>
            {user && (
              <div className="font-oswald text-sm font-bold" style={{ color: "#F97316" }}>
                {user.balance.toFixed(0)} ₽
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Spin count */}
          <div className="p-5 rounded-sm" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
            <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#555" }}>
              Количество прокруток
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 10].map(n => (
                <button key={n} onClick={() => !spinning && setSpinCount(n)}
                  className="flex-1 py-2.5 rounded-sm font-oswald font-bold text-sm uppercase transition-all"
                  style={{
                    backgroundColor: spinCount === n ? "#F97316" : "#0D0D0D",
                    color: spinCount === n ? "#0D0D0D" : "#555",
                    border: `1px solid ${spinCount === n ? "#F97316" : "#222"}`,
                    cursor: spinning ? "not-allowed" : "pointer",
                  }}>
                  ×{n}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-5 rounded-sm" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
            <div className="flex justify-between items-center mb-3">
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: "#555" }}>Итого к оплате</div>
              <div className="font-oswald text-3xl font-bold" style={{ color: "#F97316" }}>
                {(selectedCase.price * spinCount).toFixed(0)} ₽
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: "#555" }}>Ваш баланс</div>
              <div className="font-oswald text-lg font-bold" style={{ color: user ? "#E8DDD0" : "#444" }}>
                {user ? `${user.balance.toFixed(0)} ₽` : "Не вошли"}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-sm font-mono text-sm mb-5 flex items-center gap-3"
            style={{ backgroundColor: "#1A0808", border: "1px solid #DC2626", color: "#FCA5A5" }}>
            <Icon name="AlertCircle" size={16} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* SPIN BUTTON */}
        <button onClick={doSpin} disabled={spinning}
          className="w-full py-5 rounded-sm font-oswald font-bold uppercase tracking-widest text-xl transition-all flex items-center justify-center gap-3"
          style={{
            backgroundColor: spinning ? "#1A1A1A" : "#F97316",
            color: spinning ? "#555" : "#0D0D0D",
            cursor: spinning ? "not-allowed" : "pointer",
            boxShadow: spinning ? "none" : "0 0 30px rgba(249,115,22,0.3)",
          }}>
          {spinning ? (
            <><Icon name="Loader2" size={24} className="animate-spin" /><span>Крутим...</span></>
          ) : (
            <><Icon name="Zap" size={24} /><span>Крутить {spinCount > 1 ? `×${spinCount}` : ""} — {(selectedCase.price * spinCount).toFixed(0)} ₽</span></>
          )}
        </button>

        {!user && (
          <p className="text-center font-mono text-xs mt-3" style={{ color: "#555" }}>
            Нужно <button onClick={onAuthRequired} className="underline" style={{ color: "#F97316" }}>войти в аккаунт</button>, чтобы крутить кейсы
          </p>
        )}

        {/* Prize list */}
        <div className="mt-12">
          <div className="font-oswald font-bold text-xl uppercase mb-5 tracking-wide">
            Содержимое кейса
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[...selectedCase.prizes].sort((a, b) => b.weight - a.weight).map(p => (
                <div key={p.id} className="flex flex-col items-center p-4 rounded-sm text-center"
                  style={{
                    backgroundColor: "#111",
                    border: `1px solid ${RARITY_COLOR[p.rarity]}33`,
                    boxShadow: p.rarity === "legendary" ? `0 0 12px ${RARITY_GLOW[p.rarity]}` : "none",
                  }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "6px" }}>{p.emoji}</div>
                  <div className="font-oswald font-bold uppercase leading-tight mb-1" style={{ fontSize: "0.75rem", color: RARITY_COLOR[p.rarity] }}>
                    {p.name}
                  </div>
                  <div className="font-mono text-xs" style={{ color: "#555" }}>
                    {RARITY_LABEL[p.rarity]}
                  </div>
                </div>
            ))}
          </div>
        </div>

      </div>

      {/* RESULT MODAL */}
      {showResults && results.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
            onClick={() => setShowResults(false)} />
          <div className="relative w-full max-w-md animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="rounded-sm overflow-hidden" style={{ backgroundColor: "#111", border: "1px solid #2A2A2A" }}>

              {/* Header */}
              <div className="px-6 py-5 text-center"
                style={{ background: "linear-gradient(135deg, #1A0D00, #0D0D0D)", borderBottom: "1px solid #1A1A1A" }}>
                <div className="text-4xl mb-2">🎉</div>
                <div className="font-oswald font-bold text-2xl uppercase tracking-widest" style={{ color: "#F97316" }}>
                  Поздравляем!
                </div>
              </div>

              {/* Prizes */}
              <div className="p-6 flex flex-col gap-4">
                {results.map(r => (
                  <div key={r.spin_id} className="p-5 rounded-sm text-center"
                    style={{
                      backgroundColor: "#0D0D0D",
                      border: `2px solid ${RARITY_COLOR[r.prize.rarity]}`,
                      boxShadow: `0 0 20px ${RARITY_GLOW[r.prize.rarity]}`,
                    }}>
                    <div style={{ fontSize: "4rem", marginBottom: "8px" }}>{r.prize.emoji}</div>
                    <div className="font-oswald font-bold text-2xl uppercase mb-1">{r.prize.name}</div>
                    <div className="font-mono text-sm mb-5" style={{ color: RARITY_COLOR[r.prize.rarity] }}>
                      {RARITY_LABEL[r.prize.rarity]}
                    </div>
                    <button onClick={() => claimPrize(r)}
                      className="tg-btn w-full py-3 rounded-sm text-sm flex items-center justify-center gap-2">
                      <Icon name="Send" size={16} />
                      <span>Получить приз в Telegram</span>
                    </button>
                  </div>
                ))}

                {/* Fairness info */}
                <div className="p-4 rounded-sm" style={{ backgroundColor: "#080808", border: "1px solid #1A1A1A" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="ShieldCheck" size={14} style={{ color: "#22C55E" }} />
                    <span className="font-oswald text-xs uppercase tracking-widest" style={{ color: "#22C55E" }}>
                      Провабельно честно
                    </span>
                  </div>
                  <div className="font-mono text-xs break-all" style={{ color: "#333" }}>
                    Hash: {results[0]?.seed_hash?.slice(0, 40)}...
                  </div>
                </div>

                <button onClick={() => setShowResults(false)}
                  className="btn-outline w-full py-2.5 rounded-sm text-sm">
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