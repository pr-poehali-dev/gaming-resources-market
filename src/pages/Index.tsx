import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const IMG_HERO = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/4150d1d8-fc18-49aa-93e7-ac77a50d6a0e.jpg";
const IMG_TROPICAL = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/23e25a8d-1909-4e78-8bd3-0d09c665232b.jpg";
const IMG_MAGNOLIA = "https://cdn.poehali.dev/projects/f4df7e9e-38ca-4c43-9a9a-658478926a3f/files/59c91b66-e441-489c-86e2-8d60577397bb.jpg";

type Page = "home" | "catalog" | "about" | "cart" | "contacts" | "faq";

const CATALOG_ITEMS = [
  { id: 1, name: "Утренний бриз", price: 3200, tag: "Хит продаж", img: IMG_HERO, desc: "Розы, пионы, эвкалипт" },
  { id: 2, name: "Тропический рай", price: 4800, tag: "Новинка", img: IMG_TROPICAL, desc: "Антуриум, стрелиция, монстера" },
  { id: 3, name: "Белая магнолия", price: 5500, tag: "Премиум", img: IMG_MAGNOLIA, desc: "Магнолия, орхидеи, зелень" },
  { id: 4, name: "Летний закат", price: 2900, tag: "", img: IMG_HERO, desc: "Подсолнухи, ромашки, лаванда" },
  { id: 5, name: "Нежность", price: 3800, tag: "Хит продаж", img: IMG_MAGNOLIA, desc: "Пионы, фрезия, гортензия" },
  { id: 6, name: "Экзотика", price: 6200, tag: "Лимитед", img: IMG_TROPICAL, desc: "Гелиония, паучья лилия, листья" },
];

const FAQ_ITEMS = [
  { q: "Как быстро доставляют цветы?", a: "Доставляем в течение 2–4 часов по городу. Возможна срочная доставка за 1 час при наличии." },
  { q: "Как происходит оплата?", a: "Принимаем карты Visa, MasterCard, МИР, SBP, а также наличные при получении." },
  { q: "Можно ли заказать индивидуальный букет?", a: "Да! Напишите нам в мессенджер или позвоните — составим букет по вашему пожеланию и бюджету." },
  { q: "Как долго стоят цветы?", a: "При правильном уходе — 7–14 дней. К каждому заказу прикладываем инструкцию по уходу." },
  { q: "Есть ли доставка по всей России?", a: "Да, работаем с курьерскими службами по всей России. Сроки и стоимость рассчитываются индивидуально." },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  img: string;
  qty: number;
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (item: typeof CATALOG_ITEMS[0]) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, img: item.img, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  };

  const nav = (p: Page) => { setPage(p); setMenuOpen(false); window.scrollTo(0, 0); };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0A0A", color: "#F5F5F0" }}>
      {/* NAVBAR */}
      <header
        style={{ borderBottom: "1px solid #1A1A1A", backgroundColor: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)" }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => nav("home")} className="font-cormorant text-3xl font-bold tracking-wider" style={{ color: "#F5F5F0" }}>
            BLOOM
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {([["home","Главная"],["catalog","Каталог"],["about","О нас"],["contacts","Контакты"],["faq","FAQ"]] as [Page,string][]).map(([p, label]) => (
              <button
                key={p}
                onClick={() => nav(p)}
                className="font-golos text-sm font-medium uppercase transition-colors"
                style={{ color: page === p ? "#B5F43C" : "#888888", letterSpacing: "0.1em" }}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => nav("cart")} className="relative flex items-center gap-2 btn-outline-lime px-4 py-2 text-sm rounded">
              <Icon name="ShoppingBag" size={16} />
              <span className="font-golos font-semibold">Корзина</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: "#B5F43C", color: "#0A0A0A" }}>
                  {cartCount}
                </span>
              )}
            </button>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden" style={{ color: "#F5F5F0" }}>
              <Icon name={menuOpen ? "X" : "Menu"} size={24} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 pb-6 flex flex-col gap-4" style={{ borderTop: "1px solid #1A1A1A", paddingTop: "1rem" }}>
            {([["home","Главная"],["catalog","Каталог"],["about","О нас"],["contacts","Контакты"],["faq","FAQ"]] as [Page,string][]).map(([p, label]) => (
              <button key={p} onClick={() => nav(p)} className="font-golos text-left text-sm font-medium uppercase tracking-widest" style={{ color: page === p ? "#B5F43C" : "#888888" }}>
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main style={{ paddingTop: "73px" }}>
        {page === "home" && <HomePage onNav={nav} onAddToCart={addToCart} />}
        {page === "catalog" && <CatalogPage onAddToCart={addToCart} />}
        {page === "about" && <AboutPage />}
        {page === "cart" && <CartPage cart={cart} total={cartTotal} onRemove={removeFromCart} onUpdateQty={updateQty} onNav={nav} />}
        {page === "contacts" && <ContactsPage form={contactForm} setForm={setContactForm} submitted={submitted} setSubmitted={setSubmitted} />}
        {page === "faq" && <FaqPage openFaq={openFaq} setOpenFaq={setOpenFaq} />}
      </main>

      <footer style={{ borderTop: "1px solid #1A1A1A", backgroundColor: "#050505" }} className="mt-24 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="font-cormorant text-4xl font-bold mb-3">BLOOM</div>
            <p className="font-golos text-sm leading-relaxed" style={{ color: "#666" }}>
              Свежие цветы с душой.<br/>Каждый букет — маленький шедевр.
            </p>
          </div>
          <div>
            <div className="tag mb-4">Навигация</div>
            <div className="flex flex-col gap-2">
              {([["home","Главная"],["catalog","Каталог"],["about","О магазине"],["faq","FAQ"]] as [Page,string][]).map(([p,label]) => (
                <button key={p} onClick={() => nav(p)} className="text-left font-golos text-sm hover:text-white transition-colors" style={{ color: "#666" }}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="tag mb-4">Контакты</div>
            <div className="flex flex-col gap-2 font-golos text-sm" style={{ color: "#666" }}>
              <span>+7 (999) 000-00-00</span>
              <span>hello@bloom-shop.ru</span>
              <span>Москва, ул. Цветочная, 1</span>
              <div className="flex gap-3 mt-3">
                <button className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ border: "1px solid #333", color: "#888" }}>
                  <Icon name="Send" size={14} />
                </button>
                <button className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ border: "1px solid #333", color: "#888" }}>
                  <Icon name="Instagram" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid #1A1A1A" }}>
          <p className="font-golos text-xs" style={{ color: "#444" }}>© 2025 BLOOM. Все права защищены.</p>
          <p className="font-golos text-xs" style={{ color: "#444" }}>Сделано с любовью к цветам</p>
        </div>
      </footer>
    </div>
  );
}

function HomePage({ onNav, onAddToCart }: { onNav: (p: Page) => void; onAddToCart: (item: typeof CATALOG_ITEMS[0]) => void }) {
  const featuredRef = useInView();
  const marqueeText = "СВЕЖИЕ ЦВЕТЫ • АВТОРСКИЕ БУКЕТЫ • ДОСТАВКА ДЕНЬ В ДЕНЬ • ПОДАРОЧНАЯ УПАКОВКА • ";

  return (
    <div>
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: "#0A0A0A" }}>
        <div className="absolute inset-0">
          <img src={IMG_HERO} alt="Flowers" className="w-full h-full object-cover opacity-40" style={{ objectPosition: "center top" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0A0A0A 40%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0A0A0A 10%, transparent 60%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <div className="tag mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
              ✦ Новая коллекция 2025
            </div>
            <h1 className="font-cormorant opacity-0 animate-fade-up mb-6 leading-none" style={{ fontSize: "clamp(4rem, 10vw, 9rem)", fontWeight: 300, color: "#F5F5F0", animationDelay: "0.2s", animationFillMode: "forwards" }}>
              Цветы,<br />
              <em style={{ fontStyle: "italic", color: "#B5F43C" }}>которые</em><br />
              говорят
            </h1>
            <p className="font-golos text-lg mb-10 opacity-0 animate-fade-up" style={{ color: "#888", animationDelay: "0.3s", animationFillMode: "forwards", maxWidth: "480px" }}>
              Авторские букеты из свежих цветов. Доставляем радость в течение 2 часов по всему городу.
            </p>
            <div className="flex flex-wrap gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
              <button onClick={() => onNav("catalog")} className="btn-lime px-8 py-4 rounded-sm text-sm font-golos font-bold uppercase tracking-widest">
                Смотреть каталог
              </button>
              <button onClick={() => onNav("contacts")} className="btn-outline-lime px-8 py-4 rounded-sm text-sm font-golos font-bold uppercase tracking-widest">
                Заказать букет
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 right-6 md:right-12 z-10 flex gap-8 opacity-0 animate-fade-up" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
          {[["500+", "сортов цветов"], ["2ч", "доставка"], ["10k+", "клиентов"]].map(([num, label]) => (
            <div key={num} className="text-right">
              <div className="font-cormorant text-3xl font-bold" style={{ color: "#B5F43C" }}>{num}</div>
              <div className="font-golos text-xs uppercase tracking-widest" style={{ color: "#666" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="py-5 overflow-hidden" style={{ backgroundColor: "#B5F43C" }}>
        <div className="flex animate-marquee whitespace-nowrap" style={{ width: "max-content" }}>
          {[...Array(4)].map((_, i) => (
            <span key={i} className="font-golos font-black uppercase text-sm tracking-widest px-4" style={{ color: "#0A0A0A" }}>
              {marqueeText}
            </span>
          ))}
        </div>
      </div>

      <section className="py-24 px-6 max-w-7xl mx-auto" ref={featuredRef.ref}>
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6">
          <div>
            <div className="tag mb-3">Избранное</div>
            <h2 className="font-cormorant" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300, lineHeight: 1 }}>
              Топ букеты
            </h2>
          </div>
          <button onClick={() => onNav("catalog")} className="btn-outline-lime px-6 py-3 rounded-sm text-sm uppercase tracking-widest font-golos font-bold whitespace-nowrap">
            Весь каталог →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CATALOG_ITEMS.slice(0, 3).map((item, i) => (
            <div
              key={item.id}
              className={`card-hover rounded-sm overflow-hidden opacity-0 ${featuredRef.inView ? "animate-fade-up" : ""}`}
              style={{ backgroundColor: "#111111", animationDelay: `${i * 0.15}s`, animationFillMode: "forwards" }}
            >
              <div className="relative overflow-hidden" style={{ height: "320px" }}>
                <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                {item.tag && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-sm text-xs font-golos font-bold uppercase tracking-widest" style={{ backgroundColor: "#B5F43C", color: "#0A0A0A" }}>
                    {item.tag}
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="font-golos text-xs mb-1" style={{ color: "#666" }}>{item.desc}</div>
                <h3 className="font-cormorant text-2xl font-semibold mb-4">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-cormorant text-3xl font-bold" style={{ color: "#B5F43C" }}>{item.price.toLocaleString()} ₽</span>
                  <button onClick={() => onAddToCart(item)} className="btn-lime px-5 py-2 rounded-sm text-sm">
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-6 rounded-sm overflow-hidden relative mb-24">
        <div className="relative h-80 md:h-96">
          <img src={IMG_TROPICAL} alt="About" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center px-12" style={{ background: "rgba(10,10,10,0.6)" }}>
            <div className="max-w-lg">
              <div className="tag mb-4">О магазине</div>
              <h2 className="font-cormorant text-5xl md:text-6xl font-light mb-6" style={{ lineHeight: 1.1 }}>
                Цветы — наша<br /><em style={{ color: "#B5F43C", fontStyle: "italic" }}>страсть</em>
              </h2>
              <button onClick={() => onNav("about")} className="btn-lime px-7 py-3 rounded-sm text-sm uppercase tracking-widest font-golos font-bold">
                Узнать больше
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="tag text-center mb-10">Принимаем к оплате</div>
        <div className="flex flex-wrap items-center justify-center gap-6">
          {["Visa", "MasterCard", "МИР", "SBP", "Apple Pay", "Google Pay"].map(method => (
            <div key={method} className="px-6 py-3 rounded-sm font-golos font-semibold text-sm" style={{ border: "1px solid #222", color: "#888" }}>
              {method}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CatalogPage({ onAddToCart }: { onAddToCart: (item: typeof CATALOG_ITEMS[0]) => void }) {
  const [filter, setFilter] = useState("Все");
  const filters = ["Все", "Розы", "Тропические", "Премиум", "Хиты"];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="tag mb-3">Каталог</div>
        <h1 className="font-cormorant mb-8" style={{ fontSize: "clamp(3rem, 7vw, 7rem)", fontWeight: 300, lineHeight: 1 }}>
          Все букеты
        </h1>
        <div className="flex flex-wrap gap-3">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-5 py-2 rounded-sm text-sm font-golos font-semibold uppercase tracking-widest transition-all"
              style={filter === f
                ? { backgroundColor: "#B5F43C", color: "#0A0A0A" }
                : { border: "1px solid #333", color: "#888" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATALOG_ITEMS.map((item, i) => (
          <div
            key={item.id}
            className="card-hover rounded-sm overflow-hidden animate-fade-up opacity-0"
            style={{ backgroundColor: "#111111", animationDelay: `${i * 0.1}s`, animationFillMode: "forwards" }}
          >
            <div className="relative overflow-hidden" style={{ height: "300px" }}>
              <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
              {item.tag && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-sm text-xs font-golos font-bold uppercase tracking-widest" style={{ backgroundColor: "#B5F43C", color: "#0A0A0A" }}>
                  {item.tag}
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="font-golos text-xs mb-1" style={{ color: "#666" }}>{item.desc}</div>
              <h3 className="font-cormorant text-2xl font-semibold mb-4">{item.name}</h3>
              <div className="flex items-center justify-between">
                <span className="font-cormorant text-3xl font-bold" style={{ color: "#B5F43C" }}>{item.price.toLocaleString()} ₽</span>
                <button onClick={() => onAddToCart(item)} className="btn-lime px-5 py-2 rounded-sm text-sm font-golos font-bold">
                  В корзину
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutPage() {
  const s1 = useInView();
  const s2 = useInView();

  return (
    <div>
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img src={IMG_TROPICAL} alt="About hero" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 flex items-end px-8 pb-12" style={{ background: "linear-gradient(to top, #0A0A0A 30%, transparent)" }}>
          <div>
            <div className="tag mb-2">О магазине</div>
            <h1 className="font-cormorant" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 300, lineHeight: 1 }}>
              Наша история
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
          <div ref={s1.ref} className={`opacity-0 ${s1.inView ? "animate-fade-up" : ""}`} style={{ animationFillMode: "forwards" }}>
            <h2 className="font-cormorant text-5xl font-light mb-6" style={{ lineHeight: 1.1 }}>
              Мы создаём<br /><em style={{ color: "#B5F43C", fontStyle: "italic" }}>эмоции</em>
            </h2>
            <p className="font-golos text-base leading-relaxed mb-4" style={{ color: "#888" }}>
              BLOOM — это больше, чем цветочный магазин. Мы верим, что каждый букет несёт в себе историю, чувство и момент. С 2019 года мы создаём авторские флористические композиции, которые говорят вместо слов.
            </p>
            <p className="font-golos text-base leading-relaxed" style={{ color: "#888" }}>
              Наши флористы работают только со свежими цветами от проверенных поставщиков — от местных оранжерей до экзотических плантаций Эквадора и Нидерландов.
            </p>
          </div>
          <div ref={s2.ref} className={`opacity-0 ${s2.inView ? "animate-fade-up" : ""}`} style={{ animationFillMode: "forwards", animationDelay: "0.2s" }}>
            <img src={IMG_MAGNOLIA} alt="About" className="w-full h-72 object-cover rounded-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[["2019", "Год основания"], ["10 000+", "Счастливых клиентов"], ["500+", "Сортов цветов"], ["15", "Флористов в команде"]].map(([num, label]) => (
            <div key={num} className="p-8 rounded-sm text-center" style={{ backgroundColor: "#111" }}>
              <div className="font-cormorant text-4xl md:text-5xl font-bold mb-2" style={{ color: "#B5F43C" }}>{num}</div>
              <div className="font-golos text-sm uppercase tracking-widest" style={{ color: "#666" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CartPage({ cart, total, onRemove, onUpdateQty, onNav }: {
  cart: CartItem[];
  total: number;
  onRemove: (id: number) => void;
  onUpdateQty: (id: number, delta: number) => void;
  onNav: (p: Page) => void;
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="tag mb-3">Корзина</div>
      <h1 className="font-cormorant mb-10" style={{ fontSize: "clamp(3rem, 6vw, 6rem)", fontWeight: 300, lineHeight: 1 }}>
        Ваш заказ
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-24">
          <div className="mb-6 opacity-20 flex justify-center">
            <Icon name="ShoppingBag" size={64} />
          </div>
          <p className="font-cormorant text-3xl mb-6" style={{ color: "#666" }}>Корзина пуста</p>
          <button onClick={() => onNav("catalog")} className="btn-lime px-8 py-4 rounded-sm text-sm font-golos font-bold uppercase tracking-widest">
            Перейти в каталог
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-10">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-6 p-4 rounded-sm" style={{ backgroundColor: "#111" }}>
              <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-sm flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-cormorant text-2xl font-semibold mb-1">{item.name}</h3>
                <div className="font-cormorant text-xl" style={{ color: "#B5F43C" }}>{item.price.toLocaleString()} ₽</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => onUpdateQty(item.id, -1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: "1px solid #333", color: "#888" }}>
                  <Icon name="Minus" size={14} />
                </button>
                <span className="font-golos font-bold w-6 text-center">{item.qty}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: "1px solid #333", color: "#888" }}>
                  <Icon name="Plus" size={14} />
                </button>
              </div>
              <div className="font-cormorant text-xl font-bold" style={{ color: "#F5F5F0", minWidth: "100px", textAlign: "right" }}>
                {(item.price * item.qty).toLocaleString()} ₽
              </div>
              <button onClick={() => onRemove(item.id)} className="transition-colors" style={{ color: "#555" }}>
                <Icon name="X" size={18} />
              </button>
            </div>
          ))}

          <div className="mt-6 p-6 rounded-sm" style={{ backgroundColor: "#111", borderTop: "2px solid #B5F43C" }}>
            <div className="flex items-center justify-between mb-6">
              <span className="font-golos text-lg" style={{ color: "#888" }}>Итого</span>
              <span className="font-cormorant text-4xl font-bold" style={{ color: "#B5F43C" }}>{total.toLocaleString()} ₽</span>
            </div>
            <button className="w-full btn-lime py-4 rounded-sm text-sm font-golos font-bold uppercase tracking-widest">
              Оформить заказ
            </button>
            <p className="font-golos text-xs text-center mt-3" style={{ color: "#555" }}>
              Нажимая «Оформить заказ», вы переходите к оплате
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactsPage({ form, setForm, submitted, setSubmitted }: {
  form: { name: string; phone: string; message: string };
  setForm: (f: { name: string; phone: string; message: string }) => void;
  submitted: boolean;
  setSubmitted: (v: boolean) => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="tag mb-3">Связаться</div>
      <h1 className="font-cormorant mb-16" style={{ fontSize: "clamp(3rem, 7vw, 7rem)", fontWeight: 300, lineHeight: 1 }}>
        Контакты
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <div className="flex flex-col gap-8 mb-12">
            {[
              { icon: "Phone", label: "Телефон", value: "+7 (999) 000-00-00" },
              { icon: "Mail", label: "Email", value: "hello@bloom-shop.ru" },
              { icon: "MapPin", label: "Адрес", value: "Москва, ул. Цветочная, 1" },
              { icon: "Clock", label: "Режим работы", value: "Пн–Вс: 8:00 – 22:00" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#B5F43C" }}>
                  <Icon name={icon as "Phone"} size={18} style={{ color: "#0A0A0A" }} />
                </div>
                <div>
                  <div className="tag mb-1">{label}</div>
                  <div className="font-golos text-lg">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-sm" style={{ backgroundColor: "#111" }}>
            <div className="tag mb-3">Мессенджеры</div>
            <p className="font-golos text-sm mb-4" style={{ color: "#888" }}>Пишите в Telegram или WhatsApp — ответим быстро!</p>
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-sm font-golos font-semibold text-sm uppercase tracking-widest btn-lime">
                Telegram
              </button>
              <button className="flex-1 py-3 rounded-sm font-golos font-semibold text-sm uppercase tracking-widest btn-outline-lime">
                WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div>
          {submitted ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#B5F43C" }}>
                <Icon name="Check" size={28} style={{ color: "#0A0A0A" }} />
              </div>
              <h2 className="font-cormorant text-4xl mb-3">Заявка отправлена!</h2>
              <p className="font-golos" style={{ color: "#888" }}>Мы свяжемся с вами в течение 30 минут</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="tag mb-2">Напишите нам</div>
              {[
                { name: "name", placeholder: "Ваше имя", type: "text" },
                { name: "phone", placeholder: "Телефон", type: "tel" },
              ].map(({ name, placeholder, type }) => (
                <input
                  key={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name as "name" | "phone"]}
                  onChange={e => setForm({ ...form, [name]: e.target.value })}
                  required
                  className="w-full px-5 py-4 rounded-sm font-golos text-sm outline-none transition-all"
                  style={{ backgroundColor: "#111", border: "1px solid #222", color: "#F5F5F0" }}
                  onFocus={e => (e.target.style.borderColor = "#B5F43C")}
                  onBlur={e => (e.target.style.borderColor = "#222")}
                />
              ))}
              <textarea
                placeholder="Ваше сообщение или пожелания к букету"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={5}
                className="w-full px-5 py-4 rounded-sm font-golos text-sm outline-none transition-all resize-none"
                style={{ backgroundColor: "#111", border: "1px solid #222", color: "#F5F5F0" }}
                onFocus={e => (e.target.style.borderColor = "#B5F43C")}
                onBlur={e => (e.target.style.borderColor = "#222")}
              />
              <button type="submit" className="btn-lime py-4 rounded-sm text-sm font-golos font-bold uppercase tracking-widest">
                Отправить заявку
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FaqPage({ openFaq, setOpenFaq }: { openFaq: number | null; setOpenFaq: (i: number | null) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="tag mb-3">Вопросы и ответы</div>
      <h1 className="font-cormorant mb-16" style={{ fontSize: "clamp(3rem, 7vw, 7rem)", fontWeight: 300, lineHeight: 1 }}>
        FAQ
      </h1>

      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className="rounded-sm overflow-hidden"
            style={{ backgroundColor: "#111", border: openFaq === i ? "1px solid #B5F43C" : "1px solid #1A1A1A" }}
          >
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left"
            >
              <span className="font-golos font-semibold text-base pr-4">{item.q}</span>
              <Icon
                name={openFaq === i ? "ChevronUp" : "ChevronDown"}
                size={20}
                style={{ color: openFaq === i ? "#B5F43C" : "#666", flexShrink: 0 }}
              />
            </button>
            {openFaq === i && (
              <div className="px-6 pb-5 animate-fade-in">
                <p className="font-golos text-sm leading-relaxed" style={{ color: "#888" }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-sm text-center" style={{ backgroundColor: "#111", border: "1px solid #1A1A1A" }}>
        <div className="font-cormorant text-3xl mb-3">Не нашли ответ?</div>
        <p className="font-golos text-sm mb-6" style={{ color: "#888" }}>Напишите нам — поможем с любым вопросом!</p>
        <div className="flex gap-4 justify-center">
          <button className="btn-lime px-6 py-3 rounded-sm text-sm font-golos font-bold uppercase tracking-widest">
            Telegram
          </button>
          <button className="btn-outline-lime px-6 py-3 rounded-sm text-sm font-golos font-bold uppercase tracking-widest">
            Написать на email
          </button>
        </div>
      </div>
    </div>
  );
}
