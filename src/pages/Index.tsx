import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const IMG_BG = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/482adf94-6629-443d-b3cd-671ac067ca0a.jpg";
const IMG_COWBOY = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/77e96c0d-9a4a-4f00-a7b7-808d2e684032.jpg";
const IMG_SAMURAI = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/749d2710-b283-4344-bae3-b2beeca9b467.jpg";
const IMG_AMMO = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/2e9d7b55-d51c-42cd-abf0-46b5efe32777.jpg";
const IMG_MEDS = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/8236384d-4eaa-484d-b527-9f01d35dd2d5.jpg";

const TG_LINK = "https://t.me/fuckktokyo";

type Page = "home" | "catalog" | "faq" | "contacts";

const PRODUCTS = [
  {
    id: 1,
    name: "Ковбой",
    price: 1200,
    img: IMG_COWBOY,
    badge: "ТОП",
    badgeColor: "#F97316",
    desc: "Уникальный образ выжившего. Полный набор снаряжения ковбоя для доминирования в пустоши.",
    emoji: "🤠",
    tag: "Скин персонажа",
  },
  {
    id: 2,
    name: "Самурай",
    price: 500,
    img: IMG_SAMURAI,
    badge: "ХИТ",
    badgeColor: "#DC2626",
    desc: "Броня и стиль воина. Наводи страх на врагов своим видом в постапокалиптическом мире.",
    emoji: "⚔️",
    tag: "Скин персонажа",
  },
  {
    id: 3,
    name: "Патроны",
    price: 700,
    img: IMG_AMMO,
    badge: "",
    badgeColor: "",
    desc: "Боеприпасы для выживания. Запасайся впрок — в пустоши патроны ценятся на вес золота.",
    emoji: "🔫",
    tag: "Ресурс",
  },
  {
    id: 4,
    name: "Медикаменты",
    price: 100,
    img: IMG_MEDS,
    badge: "ДЁШЕВО",
    badgeColor: "#16A34A",
    desc: "Аптечки и лекарства. Восстанови здоровье в самый нужный момент и продолжай бой.",
    emoji: "💊",
    tag: "Ресурс",
  },
];

const FAQ_ITEMS = [
  { q: "Как купить товар?", a: "Нажмите «Купить» на любом товаре — откроется Telegram с готовым сообщением. Укажите нужный товар и количество, и мы быстро ответим." },
  { q: "Как быстро получу товар?", a: "Передача ресурсов происходит в течение 5–30 минут после подтверждения оплаты. Работаем быстро!" },
  { q: "Как происходит оплата?", a: "Оплата через перевод на карту СберБанка. Реквизиты отправим в Telegram после подтверждения заказа." },
  { q: "Безопасно ли покупать?", a: "Да! Мы работаем давно, имеем множество положительных отзывов. Передача только после получения оплаты." },
  { q: "Можно ли купить сразу несколько товаров?", a: "Конечно! Напишите список нужных товаров и количество — сделаем скидку при большом заказе." },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const nav = (p: Page) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };

  const buyItem = (name: string, price: number) => {
    const msg = encodeURIComponent(`Привет! Хочу купить: ${name} (${price} ₽)`);
    window.open(`${TG_LINK}?text=${msg}`, "_blank");
  };

  return (
    <div style={{ backgroundColor: "#0D0D0D", color: "#E8DDD0", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: "rgba(13,13,13,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1F1F1F" }}>
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <button onClick={() => nav("home")} className="flex items-center gap-2">
            <span className="text-xl" style={{ filter: "drop-shadow(0 0 6px #F97316)" }}>☣️</span>
            <div>
              <div className="font-oswald font-bold text-base tracking-widest uppercase" style={{ color: "#F97316", lineHeight: 1 }}>
                WASTELAND
              </div>
              <div className="font-mono text-xs tracking-widest" style={{ color: "#555", lineHeight: 1 }}>
                PREY DAY SHOP
              </div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {([["home","Главная"],["catalog","Товары"],["faq","FAQ"],["contacts","Контакты"]] as [Page,string][]).map(([p, label]) => (
              <button key={p} onClick={() => nav(p)}
                className="font-oswald text-sm tracking-widest uppercase transition-colors"
                style={{ color: page === p ? "#F97316" : "#666" }}>
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href={TG_LINK} target="_blank" rel="noreferrer" className="tg-btn px-4 py-2 text-xs rounded-sm hidden md:flex items-center gap-2">
              <Icon name="Send" size={14} />
              <span>Написать</span>
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{ color: "#E8DDD0" }}>
              <Icon name={menuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-5 pb-5 flex flex-col gap-4" style={{ borderTop: "1px solid #1F1F1F", paddingTop: "1rem" }}>
            {([["home","Главная"],["catalog","Товары"],["faq","FAQ"],["contacts","Контакты"]] as [Page,string][]).map(([p, label]) => (
              <button key={p} onClick={() => nav(p)} className="font-oswald text-left text-sm tracking-widest uppercase" style={{ color: page === p ? "#F97316" : "#888" }}>
                {label}
              </button>
            ))}
            <a href={TG_LINK} target="_blank" rel="noreferrer" className="tg-btn px-4 py-2 text-xs rounded-sm flex items-center gap-2 w-fit">
              <Icon name="Send" size={14} />
              <span>Написать в Telegram</span>
            </a>
          </div>
        )}
      </header>

      <main style={{ paddingTop: "61px" }}>
        {page === "home" && <HomePage onNav={nav} onBuy={buyItem} />}
        {page === "catalog" && <CatalogPage onBuy={buyItem} />}
        {page === "faq" && <FaqPage openFaq={openFaq} setOpenFaq={setOpenFaq} />}
        {page === "contacts" && <ContactsPage />}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1A1A1A", backgroundColor: "#080808" }} className="mt-20 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">☣️</span>
            <div>
              <div className="font-oswald font-bold tracking-widest text-sm uppercase" style={{ color: "#F97316" }}>WASTELAND SHOP</div>
              <div className="font-mono text-xs" style={{ color: "#444" }}>Prey Day Survival</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {([["home","Главная"],["catalog","Товары"],["faq","FAQ"],["contacts","Контакты"]] as [Page,string][]).map(([p,label]) => (
              <button key={p} onClick={() => nav(p)} className="font-oswald text-xs tracking-widest uppercase transition-colors" style={{ color: "#555" }}>{label}</button>
            ))}
          </div>
          <a href={TG_LINK} target="_blank" rel="noreferrer" className="tg-btn px-5 py-2 text-xs rounded-sm flex items-center gap-2">
            <Icon name="Send" size={14} />
            <span>@fuckktokyo</span>
          </a>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-6 text-center font-mono text-xs" style={{ borderTop: "1px solid #1A1A1A", color: "#333" }}>
          © 2025 WASTELAND SHOP — Неофициальный магазин ресурсов Prey Day Survival
        </div>
      </footer>
    </div>
  );
}

/* ============ HOME PAGE ============ */
function HomePage({ onNav, onBuy }: { onNav: (p: Page) => void; onBuy: (name: string, price: number) => void }) {
  const sec1 = useInView();
  const sec2 = useInView();
  const marquee = "ВЫЖИВИ • КУПИ РЕСУРСЫ • СТАНЬ СИЛЬНЕЕ • PREY DAY SURVIVAL • WASTELAND SHOP • ";

  return (
    <div>
      {/* HERO */}
      <section className="relative scanlines overflow-hidden" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <div className="absolute inset-0">
          <img src={IMG_BG} alt="Wasteland" className="w-full h-full object-cover" style={{ opacity: 0.35 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0D0D0D 45%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0D0D0D 10%, transparent 60%)" }} />
          {/* red vignette */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(139,0,0,0.25) 100%)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 py-24">
          <div className="max-w-xl">
            <div className="tag mb-4 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}>
              ⚠ Prey Day Survival — Торговая точка
            </div>
            <h1 className="font-oswald opacity-0 animate-fade-up mb-5"
              style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)", fontWeight: 700, lineHeight: 1, animationDelay: "0.2s", animationFillMode: "forwards" }}>
              <span style={{ color: "#E8DDD0" }}>WASTELAND</span><br />
              <span style={{ color: "#F97316" }} className="animate-flicker">SHOP</span>
            </h1>
            <p className="font-oswald font-light text-lg mb-8 opacity-0 animate-fade-up"
              style={{ color: "#888", animationDelay: "0.3s", animationFillMode: "forwards", letterSpacing: "0.05em" }}>
              Ресурсы для выживания в постапокалипсисе.<br />
              Быстро. Надёжно. Без лишних вопросов.
            </p>
            <div className="flex flex-wrap gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
              <button onClick={() => onNav("catalog")} className="btn-orange px-8 py-3 rounded-sm text-sm">
                Купить ресурсы
              </button>
              <a href={TG_LINK} target="_blank" rel="noreferrer" className="tg-btn px-8 py-3 rounded-sm text-sm flex items-center gap-2">
                <Icon name="Send" size={16} />
                <span>Telegram</span>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-16 opacity-0 animate-fade-up" style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}>
            {[["4", "товара"], ["5–30 мин", "доставка"], ["100%", "гарантия"]].map(([val, label]) => (
              <div key={label}>
                <div className="font-oswald text-2xl font-bold" style={{ color: "#F97316" }}>{val}</div>
                <div className="font-mono text-xs uppercase tracking-widest" style={{ color: "#555" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-40">
          <div className="font-mono text-xs tracking-widest" style={{ color: "#666" }}>SCROLL</div>
          <Icon name="ChevronDown" size={16} style={{ color: "#666" }} />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="py-3 overflow-hidden" style={{ backgroundColor: "#F97316" }}>
        <div className="flex animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} className="font-oswald font-bold text-xs tracking-widest px-4 uppercase" style={{ color: "#0D0D0D" }}>
              {marquee}
            </span>
          ))}
        </div>
      </div>

      {/* PRODUCTS PREVIEW */}
      <section className="py-20 px-5 max-w-6xl mx-auto" ref={sec1.ref}>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="tag mb-2">Ассортимент</div>
            <h2 className="font-oswald text-5xl md:text-6xl font-bold">ТОВАРЫ</h2>
          </div>
          <button onClick={() => onNav("catalog")} className="btn-outline px-6 py-2 rounded-sm text-sm">
            Все товары →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRODUCTS.map((item, i) => (
            <div
              key={item.id}
              className={`card-hover rounded-sm overflow-hidden opacity-0 ${sec1.inView ? "animate-fade-up" : ""}`}
              style={{ backgroundColor: "#111", animationDelay: `${i * 0.1}s`, animationFillMode: "forwards", border: "1px solid #1A1A1A" }}
            >
              <div className="relative overflow-hidden" style={{ height: "200px" }}>
                <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #111 5%, transparent 50%)" }} />
                {item.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-sm text-xs font-oswald font-bold tracking-widest uppercase"
                    style={{ backgroundColor: item.badgeColor, color: "#fff" }}>
                    {item.badge}
                  </span>
                )}
                <div className="absolute bottom-3 left-3 text-2xl">{item.emoji}</div>
              </div>
              <div className="p-4">
                <div className="tag text-xs mb-1">{item.tag}</div>
                <h3 className="font-oswald text-xl font-bold uppercase mb-1">{item.name}</h3>
                <div className="font-oswald text-2xl font-bold mb-4" style={{ color: "#F97316" }}>{item.price.toLocaleString()} ₽</div>
                <button onClick={() => onBuy(item.name, item.price)} className="w-full tg-btn py-2 rounded-sm text-xs flex items-center justify-center gap-2">
                  <Icon name="Send" size={13} />
                  <span>Купить</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-5" style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A" }} ref={sec2.ref}>
        <div className="max-w-6xl mx-auto">
          <div className="tag text-center mb-3">Как это работает</div>
          <h2 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-12">КАК КУПИТЬ</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", icon: "ShoppingCart", title: "Выбери товар", desc: "Найди нужный ресурс в нашем каталоге и нажми «Купить»" },
              { num: "02", icon: "Send", title: "Напиши в Telegram", desc: "Откроется чат с @fuckktokyo — подтверди заказ и получи реквизиты" },
              { num: "03", icon: "Zap", title: "Получи ресурс", desc: "После оплаты — передача ресурса в игре в течение 5–30 минут" },
            ].map(({ num, icon, title, desc }, i) => (
              <div
                key={num}
                className={`opacity-0 ${sec2.inView ? "animate-fade-up" : ""} p-6 rounded-sm`}
                style={{ backgroundColor: "#111", border: "1px solid #1A1A1A", animationDelay: `${i * 0.15}s`, animationFillMode: "forwards" }}
              >
                <div className="font-mono text-4xl font-bold mb-4" style={{ color: "#1F1F1F" }}>{num}</div>
                <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4" style={{ backgroundColor: "#F97316" }}>
                  <Icon name={icon as "Send"} size={20} style={{ color: "#0D0D0D" }} />
                </div>
                <h3 className="font-oswald text-xl font-bold uppercase mb-2">{title}</h3>
                <p className="font-mono text-xs leading-relaxed" style={{ color: "#666" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5 max-w-6xl mx-auto text-center">
        <div className="tag mb-3">Готов выжить?</div>
        <h2 className="font-oswald text-5xl md:text-6xl font-bold mb-6">
          ПИШИ ПРЯМО <span style={{ color: "#F97316" }}>СЕЙЧАС</span>
        </h2>
        <p className="font-mono text-sm mb-8 mx-auto" style={{ color: "#666", maxWidth: "400px" }}>
          Отвечаем быстро. Передача ресурсов без задержек.
        </p>
        <a href={TG_LINK} target="_blank" rel="noreferrer"
          className="tg-btn inline-flex items-center gap-3 px-10 py-4 rounded-sm text-sm">
          <Icon name="Send" size={18} />
          <span>Открыть Telegram</span>
        </a>
      </section>
    </div>
  );
}

/* ============ CATALOG PAGE ============ */
function CatalogPage({ onBuy }: { onBuy: (name: string, price: number) => void }) {
  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <div className="tag mb-2">Ассортимент</div>
      <h1 className="font-oswald font-bold mb-3" style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}>
        ВСЕ ТОВАРЫ
      </h1>
      <p className="font-mono text-sm mb-12" style={{ color: "#666" }}>
        Оплата через СберБанк — реквизиты в Telegram после подтверждения заказа
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PRODUCTS.map((item, i) => (
          <div
            key={item.id}
            className="card-hover rounded-sm overflow-hidden animate-fade-up opacity-0 flex"
            style={{ backgroundColor: "#111", border: "1px solid #1A1A1A", animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}
          >
            <div className="relative flex-shrink-0" style={{ width: "160px", height: "160px" }}>
              <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, #111 100%)" }} />
              {item.badge && (
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-sm text-xs font-oswald font-bold tracking-widest uppercase"
                  style={{ backgroundColor: item.badgeColor, color: "#fff" }}>
                  {item.badge}
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <div className="tag text-xs mb-1">{item.tag}</div>
                <h3 className="font-oswald text-2xl font-bold uppercase mb-1">
                  {item.emoji} {item.name}
                </h3>
                <p className="font-mono text-xs leading-relaxed" style={{ color: "#666" }}>{item.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-oswald text-2xl font-bold" style={{ color: "#F97316" }}>{item.price.toLocaleString()} ₽</span>
                <button onClick={() => onBuy(item.name, item.price)} className="tg-btn px-5 py-2 rounded-sm text-xs flex items-center gap-2">
                  <Icon name="Send" size={13} />
                  <span>Купить</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment info */}
      <div className="mt-10 p-6 rounded-sm" style={{ backgroundColor: "#0F0F0F", border: "1px solid #1F1F1F" }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#1A3C1A" }}>
            <Icon name="ShieldCheck" size={20} style={{ color: "#22C55E" }} />
          </div>
          <div>
            <div className="font-oswald font-bold text-base uppercase tracking-wider mb-1" style={{ color: "#22C55E" }}>
              Оплата через СберБанк
            </div>
            <p className="font-mono text-xs leading-relaxed" style={{ color: "#666" }}>
              После оформления заказа в Telegram мы пришлём номер карты СберБанк для перевода.
              Передача ресурсов в течение 5–30 минут после подтверждения оплаты.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ FAQ PAGE ============ */
function FaqPage({ openFaq, setOpenFaq }: { openFaq: number | null; setOpenFaq: (i: number | null) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <div className="tag mb-2">Помощь</div>
      <h1 className="font-oswald font-bold mb-12" style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
        FAQ
      </h1>

      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="rounded-sm overflow-hidden"
            style={{ backgroundColor: "#111", border: openFaq === i ? "1px solid #F97316" : "1px solid #1A1A1A" }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-oswald font-semibold text-base pr-4 uppercase tracking-wide">{item.q}</span>
              <Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} size={18}
                style={{ color: openFaq === i ? "#F97316" : "#555", flexShrink: 0 }} />
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4 animate-fade-in">
                <p className="font-mono text-sm leading-relaxed" style={{ color: "#888" }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 rounded-sm text-center" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
        <div className="font-oswald text-2xl font-bold uppercase mb-2">Остались вопросы?</div>
        <p className="font-mono text-xs mb-5" style={{ color: "#666" }}>Напишите напрямую — ответим моментально</p>
        <a href={TG_LINK} target="_blank" rel="noreferrer"
          className="tg-btn inline-flex items-center gap-2 px-7 py-3 rounded-sm text-sm">
          <Icon name="Send" size={16} />
          <span>Написать @fuckktokyo</span>
        </a>
      </div>
    </div>
  );
}

/* ============ CONTACTS PAGE ============ */
function ContactsPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <div className="tag mb-2">Связь</div>
      <h1 className="font-oswald font-bold mb-12" style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
        КОНТАКТЫ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-5">
          <div className="p-6 rounded-sm" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2AABEE, #229ED9)" }}>
                <Icon name="Send" size={22} style={{ color: "#fff" }} />
              </div>
              <div>
                <div className="tag mb-0.5">Основной канал</div>
                <div className="font-oswald text-xl font-bold uppercase">Telegram</div>
              </div>
            </div>
            <p className="font-mono text-sm mb-4" style={{ color: "#666" }}>
              Пишите напрямую. Отвечаем быстро, работаем без выходных.
            </p>
            <a href={TG_LINK} target="_blank" rel="noreferrer"
              className="tg-btn flex items-center justify-center gap-2 py-3 rounded-sm text-sm w-full">
              <Icon name="Send" size={16} />
              <span>@fuckktokyo</span>
            </a>
          </div>

          <div className="p-6 rounded-sm" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#1A3C1A" }}>
                <Icon name="CreditCard" size={22} style={{ color: "#22C55E" }} />
              </div>
              <div>
                <div className="tag mb-0.5" style={{ color: "#22C55E" }}>Оплата</div>
                <div className="font-oswald text-xl font-bold uppercase">СберБанк</div>
              </div>
            </div>
            <p className="font-mono text-sm" style={{ color: "#666" }}>
              Принимаем оплату переводом на карту СберБанк.<br />
              Реквизиты отправляем в Telegram после подтверждения заказа.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="p-6 rounded-sm h-full" style={{ backgroundColor: "#0F0F0F", border: "1px solid #1A1A1A" }}>
            <div className="tag mb-3">Время работы</div>
            <div className="flex flex-col gap-3 mb-6">
              {[["Режим", "Ежедневно"], ["Часы", "10:00 – 23:00"], ["Ответ в TG", "5–15 минут"], ["Передача", "5–30 минут"]].map(([key, val]) => (
                <div key={key} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid #1A1A1A" }}>
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "#555" }}>{key}</span>
                  <span className="font-oswald font-semibold text-sm uppercase" style={{ color: "#E8DDD0" }}>{val}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-sm" style={{ backgroundColor: "#0D0D0D", border: "1px solid #1F1F1F" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
                <span className="font-oswald text-sm font-bold uppercase tracking-widest" style={{ color: "#22C55E" }}>Онлайн</span>
              </div>
              <p className="font-mono text-xs" style={{ color: "#555" }}>Готов принять заказ прямо сейчас</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
