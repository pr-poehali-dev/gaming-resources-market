import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

/* ---- Images ---- */
const IMG_BG = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/482adf94-6629-443d-b3cd-671ac067ca0a.jpg";
const IMG_COWBOY = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/77e96c0d-9a4a-4f00-a7b7-808d2e684032.jpg";
const IMG_COWBOY_NY = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/041ac11a-fbf4-49e5-a6e5-644af32c7c8e.jpg";
const IMG_SAMURAI = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/749d2710-b283-4344-bae3-b2beeca9b467.jpg";
const IMG_AMMO = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/2e9d7b55-d51c-42cd-abf0-46b5efe32777.jpg";
const IMG_MEDS = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/8236384d-4eaa-484d-b527-9f01d35dd2d5.jpg";
const IMG_EASTER = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/c2faedf2-bd62-4038-9238-36fd605fb916.jpg";
const IMG_SANTA = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/5cdc1919-cac9-4ce9-8c34-ab7e605f9c04.jpg";
const IMG_PASS = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/39e3fb3e-bb6a-4be2-902b-60f2bbc7c762.jpg";
const IMG_BACKPACK = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/be5783d1-4694-484f-9fb0-f3d2c940a9c8.jpg";

/* ---- Contacts ---- */
const TG_ADMIN1 = "https://t.me/Torgreal7";
const TG_ADMIN2 = "https://t.me/fuckktokyo";
const TG_REVIEWS = "https://t.me/dysyeyye/2";

/* ---- Products ---- */
type Product = {
  id: number;
  name: string;
  price: number;
  priceLabel?: string;
  img: string;
  emoji: string;
  badge?: string;
  badgeColor?: string;
  limited?: boolean;
  category: string;
  desc: string;
};

const PRODUCTS: Product[] = [
  /* Скины */
  { id: 1,  name: "НГ Ковбой",       price: 1000, img: IMG_COWBOY_NY, emoji: "❄️", badge: "НГ",    badgeColor: "#3B82F6", limited: true,  category: "Скины",   desc: "Новогодний образ ковбоя. Лимитированный зимний скин для настоящих выживших." },
  { id: 2,  name: "Ковбой",          price: 800,  img: IMG_COWBOY,    emoji: "🤠", badge: "ХИТ",   badgeColor: "#F97316", limited: false, category: "Скины",   desc: "Классический образ ковбоя. Полный набор снаряжения для доминирования в пустоши." },
  { id: 3,  name: "Самурай",         price: 500,  img: IMG_SAMURAI,   emoji: "🌸", badge: "",       badgeColor: "",        limited: false, category: "Скины",   desc: "Броня и стиль воина. Наводи страх на врагов своим видом." },
  { id: 4,  name: "Пасхальный рюкзак", price: 2999, img: IMG_EASTER, emoji: "🐇", badge: "РЕДКИЙ", badgeColor: "#EC4899", limited: false, category: "Скины",   desc: "Уникальный пасхальный рюкзак. Редкий предмет с ограниченным тиражом." },
  { id: 5,  name: "Шапка Санты",     price: 400,  img: IMG_SANTA,     emoji: "🎅", badge: "ЛИМИТ", badgeColor: "#DC2626", limited: true,  category: "Скины",   desc: "Новогодняя шапка Санты. Ограниченное количество — успей купить!" },
  { id: 6,  name: "Зим. сет",        price: 100,  img: IMG_COWBOY_NY, emoji: "❄️", badge: "",       badgeColor: "",        limited: false, category: "Скины",   desc: "Зимний набор снаряжения. Отличный вариант для атмосферной игры." },
  { id: 7,  name: "Зим. охотник",    price: 25,   img: IMG_COWBOY_NY, emoji: "❄️", badge: "",       badgeColor: "",        limited: false, category: "Скины",   desc: "Зимний охотник. Бюджетный скин для новых выживших." },
  /* Рюкзаки */
  { id: 8,  name: "НГ рюкзак",       price: 250,  img: IMG_COWBOY_NY, emoji: "❄️", badge: "НГ",    badgeColor: "#3B82F6", limited: false, category: "Рюкзаки", desc: "Новогодний рюкзак. Стильный зимний аксессуар для вашего выжившего." },
  { id: 9,  name: "Военный рюкзак",  price: 200,  img: IMG_BACKPACK,  emoji: "☀️", badge: "",       badgeColor: "",        limited: false, category: "Рюкзаки", desc: "Военный тактический рюкзак. Надёжный и вместительный." },
  /* Расходники */
  { id: 10, name: "Спас",            price: 50,   img: IMG_MEDS,      emoji: "🏝️", badge: "",       badgeColor: "",        limited: false, category: "Расходники", desc: "Спасательный набор. Цена за стак.", priceLabel: "за стак" },
  { id: 11, name: "Антибиотики",     price: 15,   img: IMG_MEDS,      emoji: "🤕", badge: "",       badgeColor: "",        limited: false, category: "Расходники", desc: "Антибиотики для лечения. Цена за стак.", priceLabel: "за стак" },
  { id: 12, name: "Повязки",         price: 5,    img: IMG_MEDS,      emoji: "🤕", badge: "",       badgeColor: "",        limited: false, category: "Расходники", desc: "Медицинские повязки. Восстанавливай здоровье в бою.", priceLabel: "за стак" },
  { id: 13, name: "Биг аптечки",     price: 10,   img: IMG_MEDS,      emoji: "🏝️", badge: "",       badgeColor: "",        limited: false, category: "Расходники", desc: "Большие аптечки. Максимальное восстановление здоровья.", priceLabel: "за стак" },
  /* Патроны */
  { id: 14, name: "Жиги 5.56",       price: 15,   img: IMG_AMMO,      emoji: "⭐", badge: "",       badgeColor: "",        limited: false, category: "Патроны",  desc: "Патроны 5.56 FMJ. Универсальные боеприпасы.", priceLabel: "за стак" },
  { id: 15, name: "НГ 9мм",          price: 10,   img: IMG_AMMO,      emoji: "❄️", badge: "НГ",    badgeColor: "#3B82F6", limited: false, category: "Патроны",  desc: "Новогодние патроны 9мм. Особая серия боеприпасов.", priceLabel: "за стак" },
  { id: 16, name: "Улуч 5.56",       price: 10,   img: IMG_AMMO,      emoji: "⭐", badge: "",       badgeColor: "",        limited: false, category: "Патроны",  desc: "Улучшенные патроны 5.56. Повышенная пробиваемость.", priceLabel: "за стак" },
  { id: 17, name: "Жетоны",          price: 5,    img: IMG_AMMO,      emoji: "⭐", badge: "",       badgeColor: "",        limited: false, category: "Патроны",  desc: "Игровые жетоны. Внутриигровая валюта.", priceLabel: "за стак" },
  /* Пропуски */
  { id: 18, name: "Золотой пропуск (покупка)", price: 500, img: IMG_PASS, emoji: "💥", badge: "ВЫГОДА", badgeColor: "#EAB308", limited: false, category: "Пропуски", desc: "Покупаем золотой пропуск на ваш аккаунт. Без передачи доступа!" },
  { id: 19, name: "Пропуск + лут на новый акк", price: 0,  img: IMG_PASS, emoji: "✅", badge: "СЕРВИС", badgeColor: "#8B5CF6", limited: false, category: "Пропуски", desc: "Создаём новый аккаунт, покупаем пропуск + баксы, передаём весь лут на ваш аккаунт. Уточняйте цену в TG.", priceLabel: "цена по запросу" },
  /* Сезоны */
  { id: 20, name: "Сезон ковбоя",    price: 1200, img: IMG_COWBOY,    emoji: "🤠", badge: "ЛИМИТ", badgeColor: "#DC2626", limited: true,  category: "Сезоны",   desc: "Полный сезон ковбоя. Ограниченное количество — торопись!" },
  { id: 21, name: "Сезон НГ ковбоя", price: 1500, img: IMG_COWBOY_NY, emoji: "❄️", badge: "ЛИМИТ", badgeColor: "#DC2626", limited: true,  category: "Сезоны",   desc: "Новогодний сезон ковбоя. Самый редкий и ценный сезон." },
  { id: 22, name: "Сезон самурая",   price: 800,  img: IMG_SAMURAI,   emoji: "🌸", badge: "",       badgeColor: "",        limited: false, category: "Сезоны",   desc: "Полный сезон самурая. Все награды сезона самурая." },
];

const CATEGORIES = ["Все", "Скины", "Рюкзаки", "Расходники", "Патроны", "Пропуски", "Сезоны"];

const FAQ_ITEMS = [
  { q: "Нужно ли давать пароль от аккаунта?", a: "❌ Нет! Мы работаем БЕЗ входа на ваш аккаунт. Передача ресурсов происходит напрямую в игре через торговлю." },
  { q: "Как происходит передача?", a: "После оплаты мы встречаемся в игре и передаём ресурсы через внутриигровой обмен. Смотри видео-инструкцию на сайте." },
  { q: "Как оплатить?", a: "Оплата через перевод на карту СберБанка. Реквизиты отправим в Telegram после подтверждения заказа." },
  { q: "Сколько ждать после оплаты?", a: "Передача ресурсов в течение 5–30 минут. В пиковые часы может занять до 1 часа — предупредим заранее." },
  { q: "Можно ли купить несколько товаров?", a: "Да! Напишите список нужных товаров — сделаем скидку при заказе на сумму от 500 ₽." },
  { q: "Где посмотреть отзывы?", a: "Все отзывы собраны в нашем Telegram-канале. Ссылка есть в разделе Контакты." },
];

type Page = "home" | "catalog" | "order" | "how" | "faq" | "contacts";

function useInView(threshold = 0.12) {
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
  const [cartItems, setCartItems] = useState<{ product: Product; qty: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const nav = (p: Page) => { setPage(p); setMenuOpen(false); setCartOpen(false); window.scrollTo(0, 0); };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if (exists) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: number) => setCartItems(prev => prev.filter(i => i.product.id !== id));
  const changeQty = (id: number, delta: number) => setCartItems(prev =>
    prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  );

  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const sendOrder = () => {
    const lines = cartItems.map(i => `• ${i.product.emoji} ${i.product.name} × ${i.qty} = ${(i.product.price * i.qty).toLocaleString()} ₽`).join("\n");
    const msg = encodeURIComponent(`Привет! Хочу сделать заказ:\n\n${lines}\n\nИтого: ${cartTotal.toLocaleString()} ₽`);
    window.open(`${TG_ADMIN1}?text=${msg}`, "_blank");
  };

  const buyNow = (p: Product) => {
    const msg = encodeURIComponent(`Привет! Хочу купить: ${p.emoji} ${p.name}${p.price > 0 ? ` — ${p.price.toLocaleString()} ₽` : " (уточнить цену)"}`);
    window.open(`${TG_ADMIN1}?text=${msg}`, "_blank");
  };

  return (
    <div style={{ backgroundColor: "#0D0D0D", color: "#E8DDD0", minHeight: "100vh" }}>

      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: "rgba(13,13,13,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid #1F1F1F" }}>
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <button onClick={() => nav("home")} className="flex items-center gap-2">
            <span className="text-xl">☣️</span>
            <div>
              <div className="font-oswald font-bold text-base tracking-widest uppercase leading-none" style={{ color: "#F97316" }}>WASTELAND</div>
              <div className="font-mono text-xs tracking-widest leading-none" style={{ color: "#444" }}>PREY DAY SHOP</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {([["home","Главная"],["catalog","Товары"],["how","Как купить"],["faq","FAQ"],["contacts","Контакты"]] as [Page,string][]).map(([p, label]) => (
              <button key={p} onClick={() => nav(p)} className="font-oswald text-xs tracking-widest uppercase transition-colors"
                style={{ color: page === p ? "#F97316" : "#666" }}>{label}</button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button onClick={() => setCartOpen(!cartOpen)} className="relative flex items-center gap-2 px-3 py-2 rounded-sm"
              style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A" }}>
              <Icon name="ShoppingCart" size={16} style={{ color: "#E8DDD0" }} />
              {cartCount > 0 && (
                <span className="font-oswald text-xs font-bold" style={{ color: "#F97316" }}>{cartCount}</span>
              )}
            </button>
            <a href={TG_ADMIN1} target="_blank" rel="noreferrer" className="tg-btn px-4 py-2 text-xs rounded-sm hidden md:flex items-center gap-2">
              <Icon name="Send" size={13} />
              <span>Написать</span>
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{ color: "#E8DDD0" }}>
              <Icon name={menuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-5 pb-5 flex flex-col gap-4" style={{ borderTop: "1px solid #1F1F1F", paddingTop: "1rem" }}>
            {([["home","Главная"],["catalog","Товары"],["how","Как купить"],["faq","FAQ"],["contacts","Контакты"]] as [Page,string][]).map(([p, label]) => (
              <button key={p} onClick={() => nav(p)} className="font-oswald text-left text-sm tracking-widest uppercase"
                style={{ color: page === p ? "#F97316" : "#888" }}>{label}</button>
            ))}
            <a href={TG_ADMIN1} target="_blank" rel="noreferrer" className="tg-btn px-4 py-2 text-xs rounded-sm flex items-center gap-2 w-fit">
              <Icon name="Send" size={14} /><span>Написать в Telegram</span>
            </a>
          </div>
        )}
      </header>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setCartOpen(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
        </div>
      )}
      <div className="fixed top-0 right-0 h-full z-50 transition-transform duration-300 flex flex-col"
        style={{ width: "min(380px, 100vw)", backgroundColor: "#0F0F0F", borderLeft: "1px solid #1F1F1F", transform: cartOpen ? "translateX(0)" : "translateX(100%)" }}>
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid #1F1F1F" }}>
          <div className="font-oswald font-bold text-xl uppercase tracking-widest">Корзина</div>
          <button onClick={() => setCartOpen(false)}><Icon name="X" size={20} style={{ color: "#666" }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "#444" }}>
              <Icon name="ShoppingCart" size={40} />
              <div className="font-oswald text-sm uppercase tracking-wider">Корзина пуста</div>
            </div>
          ) : cartItems.map(({ product: p, qty }) => (
            <div key={p.id} className="flex gap-3 p-3 rounded-sm" style={{ backgroundColor: "#161616", border: "1px solid #222" }}>
              <img src={p.img} alt={p.name} className="w-14 h-14 object-cover rounded-sm flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-oswald text-sm font-bold uppercase truncate">{p.emoji} {p.name}</div>
                <div className="font-oswald text-base font-bold" style={{ color: "#F97316" }}>
                  {p.price > 0 ? `${(p.price * qty).toLocaleString()} ₽` : "по запросу"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => changeQty(p.id, -1)} className="w-6 h-6 rounded-sm flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: "#222", color: "#E8DDD0" }}>−</button>
                  <span className="font-mono text-sm w-5 text-center">{qty}</span>
                  <button onClick={() => changeQty(p.id, 1)} className="w-6 h-6 rounded-sm flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: "#222", color: "#E8DDD0" }}>+</button>
                </div>
              </div>
              <button onClick={() => removeFromCart(p.id)} className="flex-shrink-0 mt-1">
                <Icon name="Trash2" size={15} style={{ color: "#555" }} />
              </button>
            </div>
          ))}
        </div>
        {cartItems.length > 0 && (
          <div className="p-5" style={{ borderTop: "1px solid #1F1F1F" }}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "#666" }}>Итого</span>
              <span className="font-oswald text-2xl font-bold" style={{ color: "#F97316" }}>{cartTotal.toLocaleString()} ₽</span>
            </div>
            <button onClick={sendOrder} className="w-full tg-btn py-3 rounded-sm text-sm flex items-center justify-center gap-2">
              <Icon name="Send" size={16} />
              <span>Оформить в Telegram</span>
            </button>
            <p className="font-mono text-xs text-center mt-2" style={{ color: "#444" }}>
              Заказ уйдёт @Torgreal7 автоматически
            </p>
          </div>
        )}
      </div>

      <main style={{ paddingTop: "61px" }}>
        {page === "home"     && <HomePage onNav={nav} onAdd={addToCart} />}
        {page === "catalog"  && <CatalogPage onAdd={addToCart} onBuy={buyNow} />}
        {page === "how"      && <HowPage />}
        {page === "faq"      && <FaqPage />}
        {page === "contacts" && <ContactsPage />}
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1A1A1A", backgroundColor: "#080808" }} className="mt-20 py-10 px-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span>☣️</span>
            <div>
              <div className="font-oswald font-bold tracking-widest text-sm uppercase" style={{ color: "#F97316" }}>WASTELAND SHOP</div>
              <div className="font-mono text-xs" style={{ color: "#444" }}>Prey Day Survival</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5">
            {([["home","Главная"],["catalog","Товары"],["how","Как купить"],["faq","FAQ"],["contacts","Контакты"]] as [Page,string][]).map(([p,label]) => (
              <button key={p} onClick={() => nav(p)} className="font-oswald text-xs tracking-widest uppercase" style={{ color: "#555" }}>{label}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <a href={TG_ADMIN1} target="_blank" rel="noreferrer" className="tg-btn px-4 py-2 text-xs rounded-sm flex items-center gap-2">
              <Icon name="Send" size={13} /><span>@Torgreal7</span>
            </a>
            <a href={TG_ADMIN2} target="_blank" rel="noreferrer" className="tg-btn px-4 py-2 text-xs rounded-sm flex items-center gap-2">
              <Icon name="Send" size={13} /><span>@fuckktokyo</span>
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-6 text-center font-mono text-xs" style={{ borderTop: "1px solid #1A1A1A", color: "#333" }}>
          © 2025 WASTELAND SHOP — Неофициальный магазин ресурсов Prey Day Survival • ❌ Без входа на аккаунт
        </div>
      </footer>
    </div>
  );
}

/* ============================= HOME PAGE ============================= */
function HomePage({ onNav, onAdd }: { onNav: (p: Page) => void; onAdd: (p: Product) => void }) {
  const sec = useInView();
  const sec2 = useInView();
  const marqueeText = "ВЫЖИВИ • КУПИ РЕСУРСЫ • СТАНЬ СИЛЬНЕЕ • PREY DAY SURVIVAL • WASTELAND SHOP • БЕЗ ВХОДА НА АККАУНТ • ";
  const featured = PRODUCTS.filter(p => [2, 1, 3, 4, 20, 18].includes(p.id));

  return (
    <div>
      {/* HERO */}
      <section className="relative scanlines overflow-hidden" style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <div className="absolute inset-0">
          <img src={IMG_BG} alt="" className="w-full h-full object-cover" style={{ opacity: 0.3 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0D0D0D 50%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0D0D0D 8%, transparent 55%)" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(139,0,0,0.2) 100%)" }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 py-24 w-full">
          <div className="max-w-2xl">
            <div className="tag mb-4 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}>
              ⚠ Официальный магазин ресурсов • Prey Day Survival
            </div>
            <h1 className="font-oswald font-bold opacity-0 animate-fade-up mb-4"
              style={{ fontSize: "clamp(3.5rem,10vw,9rem)", lineHeight: 1, animationDelay: "0.2s", animationFillMode: "forwards" }}>
              <span style={{ color: "#E8DDD0" }}>WASTE</span><span style={{ color: "#F97316" }} className="animate-flicker">LAND</span><br/>
              <span className="font-mono font-normal" style={{ fontSize: "clamp(1rem,3vw,2rem)", color: "#555", letterSpacing: "0.3em" }}>SHOP</span>
            </h1>
            <p className="font-oswald font-light text-lg mb-3 opacity-0 animate-fade-up"
              style={{ color: "#888", animationDelay: "0.3s", animationFillMode: "forwards" }}>
              Скины · Патроны · Медикаменты · Пропуски
            </p>
            <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#DC2626", boxShadow: "0 0 6px #DC2626" }} />
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color: "#DC2626" }}>❌ Без входа на аккаунт</span>
            </div>
            <div className="flex flex-wrap gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
              <button onClick={() => onNav("catalog")} className="btn-orange px-8 py-3 rounded-sm text-sm">Открыть каталог</button>
              <button onClick={() => onNav("how")} className="btn-outline px-8 py-3 rounded-sm text-sm">Как купить</button>
            </div>
            <div className="flex flex-wrap gap-8 mt-12 opacity-0 animate-fade-up" style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}>
              {[["22", "товара"],["5–30 мин","доставка"],["100%","без входа"]].map(([v,l]) => (
                <div key={l}>
                  <div className="font-oswald text-2xl font-bold" style={{ color: "#F97316" }}>{v}</div>
                  <div className="font-mono text-xs uppercase tracking-widest" style={{ color: "#555" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="py-3 overflow-hidden" style={{ backgroundColor: "#F97316" }}>
        <div className="flex animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
          {[...Array(3)].map((_,i) => (
            <span key={i} className="font-oswald font-bold text-xs tracking-widest px-4 uppercase" style={{ color: "#0D0D0D" }}>{marqueeText}</span>
          ))}
        </div>
      </div>

      {/* FEATURED */}
      <section className="py-20 px-5 max-w-7xl mx-auto" ref={sec.ref}>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="tag mb-2">Популярное</div>
            <h2 className="font-oswald text-5xl md:text-6xl font-bold">ТОВАРЫ</h2>
          </div>
          <button onClick={() => onNav("catalog")} className="btn-outline px-6 py-2 rounded-sm text-sm">Все {PRODUCTS.length} товаров →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured.map((item, i) => (
            <ProductCard key={item.id} product={item} index={i} inView={sec.inView} onAdd={onAdd} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-5" style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid #1A1A1A", borderBottom: "1px solid #1A1A1A" }} ref={sec2.ref}>
        <div className="max-w-7xl mx-auto">
          <div className="tag text-center mb-2">Процесс</div>
          <h2 className="font-oswald text-4xl md:text-5xl font-bold text-center mb-12">КАК КУПИТЬ</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num:"01", icon:"ShoppingCart", title:"Выбери товар",    desc:"Найди нужный предмет в каталоге и добавь в корзину" },
              { num:"02", icon:"Send",         title:"Оформи в TG",     desc:"Нажми «Оформить» — готовый заказ уйдёт администратору" },
              { num:"03", icon:"CreditCard",   title:"Оплати",          desc:"Получи реквизиты СберБанк и переведи сумму заказа" },
              { num:"04", icon:"Zap",          title:"Получи ресурс",   desc:"Передача в игре через 5–30 минут после оплаты" },
            ].map(({ num, icon, title, desc }, i) => (
              <div key={num} className={`opacity-0 ${sec2.inView ? "animate-fade-up" : ""} p-6 rounded-sm`}
                style={{ backgroundColor: "#111", border: "1px solid #1A1A1A", animationDelay: `${i*0.12}s`, animationFillMode: "forwards" }}>
                <div className="font-mono text-4xl font-bold mb-4" style={{ color: "#1F1F1F" }}>{num}</div>
                <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-4" style={{ backgroundColor: "#F97316" }}>
                  <Icon name={icon as "Send"} size={20} style={{ color: "#0D0D0D" }} />
                </div>
                <h3 className="font-oswald text-lg font-bold uppercase mb-2">{title}</h3>
                <p className="font-mono text-xs leading-relaxed" style={{ color: "#666" }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button onClick={() => onNav("how")} className="btn-outline px-8 py-3 rounded-sm text-sm">
              Смотреть видео-инструкцию →
            </button>
          </div>
        </div>
      </section>

      {/* REVIEWS CTA */}
      <section className="py-16 px-5 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-sm" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
            <div className="text-3xl mb-4">⭐</div>
            <h3 className="font-oswald text-2xl font-bold uppercase mb-2">Сотни довольных покупателей</h3>
            <p className="font-mono text-xs mb-5" style={{ color: "#666" }}>Все отзывы реальные — проверяй в нашем Telegram-канале</p>
            <a href={TG_REVIEWS} target="_blank" rel="noreferrer" className="btn-outline px-6 py-2 rounded-sm text-sm inline-block">
              Смотреть отзывы →
            </a>
          </div>
          <div className="p-8 rounded-sm" style={{ backgroundColor: "#0F1A0F", border: "1px solid #1A2A1A" }}>
            <div className="text-3xl mb-4">💎</div>
            <h3 className="font-oswald text-2xl font-bold uppercase mb-2" style={{ color: "#22C55E" }}>Гарантия передачи</h3>
            <p className="font-mono text-xs mb-5" style={{ color: "#666" }}>
              ❌ Без входа на аккаунт · ✅ Передача через игру · 💰 Оплата Сбербанк
            </p>
            <a href={TG_ADMIN1} target="_blank" rel="noreferrer" className="tg-btn px-6 py-2 rounded-sm text-sm inline-flex items-center gap-2">
              <Icon name="Send" size={14} /><span>Написать администратору</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================= PRODUCT CARD ============================= */
function ProductCard({ product: p, index, inView, onAdd, large }: {
  product: Product; index: number; inView: boolean; onAdd: (p: Product) => void; large?: boolean;
}) {
  return (
    <div className={`card-hover rounded-sm overflow-hidden opacity-0 ${inView ? "animate-fade-up" : ""} flex flex-col`}
      style={{ backgroundColor: "#111", border: "1px solid #1A1A1A", animationDelay: `${index * 0.07}s`, animationFillMode: "forwards" }}>
      <div className="relative overflow-hidden" style={{ height: large ? "220px" : "140px" }}>
        <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #111 5%, transparent 50%)" }} />
        {p.badge && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-sm text-xs font-oswald font-bold tracking-widest uppercase"
            style={{ backgroundColor: p.badgeColor, color: "#fff", fontSize: "0.6rem" }}>{p.badge}</span>
        )}
        {p.limited && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm font-oswald font-bold tracking-widest uppercase"
            style={{ backgroundColor: "#7F1D1D", color: "#FCA5A5", fontSize: "0.55rem" }}>ЛИМИТ</span>
        )}
        <div className="absolute bottom-2 left-2 text-lg">{p.emoji}</div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="tag mb-0.5" style={{ fontSize: "0.6rem" }}>{p.category}</div>
        <h3 className="font-oswald font-bold uppercase leading-tight mb-1" style={{ fontSize: large ? "1.1rem" : "0.85rem" }}>{p.name}</h3>
        {large && <p className="font-mono text-xs leading-relaxed mb-2" style={{ color: "#666", flexGrow: 1 }}>{p.desc}</p>}
        <div className="font-oswald font-bold mb-2" style={{ color: "#F97316", fontSize: large ? "1.4rem" : "1rem" }}>
          {p.price > 0 ? `${p.price.toLocaleString()} ₽` : "по запросу"}
          {p.priceLabel && <span className="font-mono font-normal ml-1" style={{ fontSize: "0.65rem", color: "#888" }}>{p.priceLabel}</span>}
        </div>
        <button onClick={() => onAdd(p)} className="w-full btn-orange py-1.5 rounded-sm flex items-center justify-center gap-1.5"
          style={{ fontSize: "0.7rem" }}>
          <Icon name="ShoppingCart" size={12} />
          <span>В корзину</span>
        </button>
      </div>
    </div>
  );
}

/* ============================= CATALOG PAGE ============================= */
function CatalogPage({ onAdd, onBuy }: { onAdd: (p: Product) => void; onBuy: (p: Product) => void }) {
  const [category, setCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const sec = useInView();

  const filtered = PRODUCTS.filter(p =>
    (category === "Все" || p.category === category) &&
    (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-5 py-16">
      <div className="tag mb-2">Ассортимент</div>
      <h1 className="font-oswald font-bold mb-8" style={{ fontSize: "clamp(2.5rem,7vw,6rem)" }}>КАТАЛОГ</h1>

      {/* Search + filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#555" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск товара..."
            className="w-full pl-9 pr-4 py-2.5 rounded-sm font-mono text-sm outline-none"
            style={{ backgroundColor: "#111", border: "1px solid #222", color: "#E8DDD0" }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className="font-oswald text-xs px-3 py-2 rounded-sm uppercase tracking-widest transition-colors"
              style={{ backgroundColor: category === cat ? "#F97316" : "#111", color: category === cat ? "#0D0D0D" : "#666", border: "1px solid #222" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" ref={sec.ref}>
        {filtered.map((item, i) => (
          <ProductCard key={item.id} product={item} index={i} inView={sec.inView || true} onAdd={onAdd} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20" style={{ color: "#444" }}>
          <Icon name="SearchX" size={40} className="mx-auto mb-4" />
          <div className="font-oswald text-xl uppercase">Ничего не найдено</div>
        </div>
      )}

      {/* Payment info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-sm" style={{ backgroundColor: "#0F0F0F", border: "1px solid #1F1F1F" }}>
          <div className="flex items-center gap-3 mb-2">
            <Icon name="CreditCard" size={20} style={{ color: "#22C55E" }} />
            <div className="font-oswald font-bold uppercase tracking-wider" style={{ color: "#22C55E" }}>Оплата СберБанк</div>
          </div>
          <p className="font-mono text-xs" style={{ color: "#666" }}>
            Реквизиты отправим в Telegram. Передача ресурсов 5–30 мин после оплаты.
          </p>
        </div>
        <div className="p-5 rounded-sm" style={{ backgroundColor: "#1A0F0F", border: "1px solid #2A1A1A" }}>
          <div className="flex items-center gap-3 mb-2">
            <Icon name="ShieldCheck" size={20} style={{ color: "#DC2626" }} />
            <div className="font-oswald font-bold uppercase tracking-wider" style={{ color: "#DC2626" }}>❌ Без входа на аккаунт</div>
          </div>
          <p className="font-mono text-xs" style={{ color: "#666" }}>
            Пароль никогда не нужен. Передача только через внутриигровую торговлю.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================= HOW PAGE ============================= */
function HowPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <div className="tag mb-2">Инструкция</div>
      <h1 className="font-oswald font-bold mb-4" style={{ fontSize: "clamp(2.5rem,7vw,5rem)" }}>КАК КУПИТЬ</h1>
      <p className="font-mono text-sm mb-12" style={{ color: "#666" }}>Всё просто — без входа на аккаунт, передача прямо в игре</p>

      {/* VIDEO PLACEHOLDER */}
      <div className="relative rounded-sm overflow-hidden mb-12" style={{ backgroundColor: "#111", border: "1px solid #1F1F1F", aspectRatio: "16/9" }}>
        <img src={IMG_BG} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            style={{ backgroundColor: "#F97316", boxShadow: "0 0 40px rgba(249,115,22,0.5)" }}>
            <Icon name="Play" size={32} style={{ color: "#0D0D0D", marginLeft: "4px" }} />
          </div>
          <div className="font-oswald text-xl font-bold uppercase tracking-widest">Видео-инструкция</div>
          <div className="font-mono text-sm" style={{ color: "#666" }}>Как выглядит пропуск и как происходит передача ресурсов</div>
          <a href={TG_ADMIN1} target="_blank" rel="noreferrer"
            className="tg-btn mt-2 px-6 py-2 rounded-sm text-sm inline-flex items-center gap-2">
            <Icon name="Send" size={14} /><span>Попросить видео в Telegram</span>
          </a>
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-4 mb-12">
        {[
          { step:"1", title:"Выбери товар в каталоге", desc:"Найди нужный скин, патроны или предмет. Добавь в корзину или нажми «В корзину».", icon:"ShoppingCart" },
          { step:"2", title:"Нажми «Оформить в Telegram»", desc:"Твой заказ со всеми товарами автоматически отправится администратору @Torgreal7.", icon:"Send" },
          { step:"3", title:"Подтверди заказ", desc:"Администратор ответит и пришлёт реквизиты карты СберБанка для оплаты.", icon:"MessageSquare" },
          { step:"4", title:"Оплати переводом", desc:"Переведи нужную сумму на карту СберБанк. Пришли скриншот подтверждения.", icon:"CreditCard" },
          { step:"5", title:"Встреча в игре", desc:"Заходишь в Prey Day Survival. Администратор найдёт тебя и передаст ресурсы через внутриигровую торговлю.", icon:"Gamepad2" },
          { step:"6", title:"Готово!", desc:"Ресурсы у тебя! Пароль от аккаунта никогда не нужен — всё через игру.", icon:"PartyPopper" },
        ].map(({ step, title, desc, icon }, i) => (
          <div key={step} className="flex gap-5 p-5 rounded-sm animate-fade-up opacity-0"
            style={{ backgroundColor: "#111", border: "1px solid #1A1A1A", animationDelay: `${i*0.08}s`, animationFillMode: "forwards" }}>
            <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 font-oswald font-bold text-lg"
              style={{ backgroundColor: "#F97316", color: "#0D0D0D" }}>{step}</div>
            <div className="flex-1">
              <div className="font-oswald font-bold text-base uppercase mb-1">{title}</div>
              <div className="font-mono text-xs leading-relaxed" style={{ color: "#666" }}>{desc}</div>
            </div>
            <Icon name={icon as "Send"} size={20} style={{ color: "#2A2A2A", flexShrink: 0, marginTop: "4px" }} />
          </div>
        ))}
      </div>

      {/* Pass info */}
      <div className="p-6 rounded-sm mb-8" style={{ backgroundColor: "#0F1A0F", border: "1px solid #1A3A1A" }}>
        <div className="flex items-center gap-3 mb-4">
          <img src={IMG_PASS} alt="Пропуск" className="w-16 h-16 object-cover rounded-sm flex-shrink-0" />
          <div>
            <div className="font-oswald font-bold text-xl uppercase mb-1" style={{ color: "#EAB308" }}>💥 Золотой пропуск</div>
            <div className="font-mono text-xs" style={{ color: "#666" }}>Как это работает</div>
          </div>
        </div>
        <div className="font-mono text-xs leading-relaxed" style={{ color: "#888" }}>
          <p className="mb-2">Покупаем золотой пропуск на ТВОЙ аккаунт за <span style={{ color: "#EAB308" }}>500 ₽</span>. Вход на аккаунт НЕ нужен — покупка через другой аккаунт с передачей в игре.</p>
          <p>Также можем создать новый аккаунт, купить пропуск + баксы и передать весь лут с пропуска на любой твой аккаунт. Цена уточняется индивидуально.</p>
        </div>
      </div>

      <div className="text-center">
        <a href={TG_ADMIN1} target="_blank" rel="noreferrer"
          className="tg-btn inline-flex items-center gap-3 px-10 py-4 rounded-sm text-sm">
          <Icon name="Send" size={18} /><span>Написать @Torgreal7</span>
        </a>
      </div>
    </div>
  );
}

/* ============================= FAQ PAGE ============================= */
function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <div className="tag mb-2">Помощь</div>
      <h1 className="font-oswald font-bold mb-12" style={{ fontSize: "clamp(3rem,7vw,6rem)" }}>FAQ</h1>
      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="rounded-sm overflow-hidden"
            style={{ backgroundColor: "#111", border: open === i ? "1px solid #F97316" : "1px solid #1A1A1A" }}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
              <span className="font-oswald font-semibold text-base pr-4 uppercase tracking-wide">{item.q}</span>
              <Icon name={open === i ? "ChevronUp" : "ChevronDown"} size={18}
                style={{ color: open === i ? "#F97316" : "#555", flexShrink: 0 }} />
            </button>
            {open === i && (
              <div className="px-5 pb-4 animate-fade-in">
                <p className="font-mono text-sm leading-relaxed" style={{ color: "#888" }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-12 p-6 rounded-sm text-center" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
        <div className="font-oswald text-2xl font-bold uppercase mb-2">Остались вопросы?</div>
        <p className="font-mono text-xs mb-5" style={{ color: "#666" }}>Пишите напрямую — отвечаем быстро</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href={TG_ADMIN1} target="_blank" rel="noreferrer" className="tg-btn inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm">
            <Icon name="Send" size={15} /><span>@Torgreal7</span>
          </a>
          <a href={TG_ADMIN2} target="_blank" rel="noreferrer" className="tg-btn inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm">
            <Icon name="Send" size={15} /><span>@fuckktokyo</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ============================= CONTACTS PAGE ============================= */
function ContactsPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <div className="tag mb-2">Связь</div>
      <h1 className="font-oswald font-bold mb-12" style={{ fontSize: "clamp(3rem,7vw,6rem)" }}>КОНТАКТЫ</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-5">
          {[
            { href: TG_ADMIN1, handle: "@Torgreal7",  title: "Администратор 1", desc: "Основной канал для заказов" },
            { href: TG_ADMIN2, handle: "@fuckktokyo", title: "Администратор 2", desc: "Дополнительный контакт" },
          ].map(({ href, handle, title, desc }) => (
            <div key={handle} className="p-6 rounded-sm" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2AABEE,#229ED9)" }}>
                  <Icon name="Send" size={22} style={{ color: "#fff" }} />
                </div>
                <div>
                  <div className="tag mb-0.5">{title}</div>
                  <div className="font-oswald text-xl font-bold uppercase">{handle}</div>
                </div>
              </div>
              <p className="font-mono text-xs mb-4" style={{ color: "#666" }}>{desc}. Ответим в течение 5–15 минут.</p>
              <a href={href} target="_blank" rel="noreferrer"
                className="tg-btn flex items-center justify-center gap-2 py-3 rounded-sm text-sm w-full">
                <Icon name="Send" size={16} /><span>Открыть {handle}</span>
              </a>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <div className="p-6 rounded-sm" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-sm flex items-center justify-center" style={{ backgroundColor: "#1A3C1A" }}>
                <Icon name="Star" size={22} style={{ color: "#EAB308" }} />
              </div>
              <div>
                <div className="tag mb-0.5" style={{ color: "#EAB308" }}>Отзывы</div>
                <div className="font-oswald text-xl font-bold uppercase">Канал отзывов</div>
              </div>
            </div>
            <p className="font-mono text-xs mb-4" style={{ color: "#666" }}>Все реальные отзывы покупателей собраны в нашем Telegram-канале.</p>
            <a href={TG_REVIEWS} target="_blank" rel="noreferrer"
              className="btn-outline flex items-center justify-center gap-2 py-3 rounded-sm text-sm w-full">
              <Icon name="ExternalLink" size={16} /><span>Смотреть отзывы</span>
            </a>
          </div>
          <div className="p-6 rounded-sm" style={{ backgroundColor: "#0F0F0F", border: "1px solid #1A1A1A" }}>
            <div className="tag mb-3">График работы</div>
            {[["Режим","Ежедневно"],["Часы","10:00 – 23:00"],["Ответ","5–15 мин"],["Передача","5–30 мин"]].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2" style={{ borderBottom: "1px solid #1A1A1A" }}>
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "#555" }}>{k}</span>
                <span className="font-oswald font-semibold text-sm uppercase">{v}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
              <span className="font-oswald text-sm font-bold uppercase tracking-widest" style={{ color: "#22C55E" }}>Онлайн</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
