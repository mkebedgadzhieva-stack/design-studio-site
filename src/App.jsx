import SmallFormats from "./pages/services/SmallFormats.jsx";
import BrandingPackages from "./pages/services/BrandingPackages.jsx";
import ServicesLayout from "./pages/services/ServicesLayout.jsx";
import LogoService from "./pages/services/LogoService.jsx";
import Services from "./pages/services/Services.jsx";
import ServicesDropdown from "./components/ServicesDropdown.jsx";
import PrintAds from "./pages/services/PrintAds.jsx";
import Publishing from "./pages/services/Publishing.jsx";
import Packaging from "./pages/services/Packaging.jsx";
import Extras from "./pages/services/Extras.jsx";
import ServiceDetail from "./pages/services/ServiceDetail.jsx";
import ProjectsAdmin from "./pages/cabinet/ProjectsAdmin.jsx";
import PlannerBoard from "./pages/cabinet/PlannerBoard.jsx";

import {
  BrowserRouter,
  MemoryRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

import AuthGate from "./features/auth/AuthGate.jsx";
import AuthCallback from "./features/auth/AuthCallback.jsx";

import CabinetLayout from "./cabinet/CabinetLayout.jsx";
import PartnerDashboard from "./pages/cabinet/PartnerDashboard.jsx";
import ClientDashboard from "./pages/cabinet/ClientDashboard.jsx";
import Commissions from "./pages/cabinet/Commissions.jsx";
import Payouts from "./pages/cabinet/Payouts.jsx";

import Project from "./pages/Project.jsx";
import ContactUs from "./components/ContactUs";
import Offer from "./pages/Offer.jsx";
import Store from "./pages/Store.jsx";
import FooterPanther from "./motion/FooterPanther.jsx";

// Превью анимаций — только в режиме разработки, в production-сборку не попадает.
const MotionPreview = import.meta.env.DEV
  ? lazy(() => import("./dev/MotionPreview.jsx"))
  : null;

// Приватный предпросмотр (vite.preview.config.js) открывается не из корня сайта,
// поэтому там маршруты живут в памяти; на обычном сайте — BrowserRouter.
const Router =
  import.meta.env.VITE_PREVIEW_ROUTER === "memory" ? MemoryRouter : BrowserRouter;

/* ---------------- THEME ---------------- */
const THEME = {
  brandName: "PAN TERRA",
brandDescriptor: "DESIGN STUDIO",
  accent: "#0f172a",
  accentSoft: "#e5e7eb",
  fontHeading: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
  fontBody: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
};

/* --------------- ДЕМО-ДАННЫЕ (главная) --------------- */
const SERVICES_DEMO = [
  { id: "identity", title: "Basic", price: 60000, desc: "Гайдлайн (мини-брендбук) — базовый стартовый пакет", bullets: ["2–3 концепции логотипа", "Гайд на 8–12 стр.", "2 раунда правок"] },
  { id: "brandkit", title: "Фирменный стиль", price: 90000, desc: "Средний пакет для компаний, которым нужно больше, чем логотип", bullets: ["3 концепции логотипа", "Гайд 20–30 стр.", "Шаблоны постов/сторис", "3 раунда правок"] },
  { id: "premium", title: "Брендбук (полный)", price: 150000, desc: "Максимальный пакет с поддержкой внедрения", bullets: ["4 концепции логотипа", "Брендбук 60+ стр.", "Печатные макеты", "Поддержка внедрения (7 дней консультаций)"] },
];

const WORKS = [
  { id: 1, name: "La Maison — айдентика", img: "", tag: "Айдентика" },
  { id: 2, name: "Samohvost — упаковка", img: "", tag: "Упаковка" },
  { id: 3, name: "Dropgets — бренд электроники", img: "", tag: "Брендинг" },
];

/* ---------------- утилиты ---------------- */
function classNames(...a) { return a.filter(Boolean).join(" "); }

function useThemeVars() {
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", THEME.accent);
    document.documentElement.style.setProperty("--accent-soft", THEME.accentSoft);
    document.documentElement.style.setProperty("--font-heading", THEME.fontHeading);
    document.documentElement.style.setProperty("--font-body", THEME.fontBody);
  }, []);
}

function useReferralCapture() {
  const loc = useLocation();
  useEffect(() => {
    const p = new URLSearchParams(loc.search);
    const ref = p.get("ref");
    if (ref) localStorage.setItem("ref_code", ref);
  }, [loc.search]);
}

/* ---------------- общие блоки ---------------- */
function Section({ id, title, subtitle, children, className }) {
  return (
    <section id={id} className={classNames("max-w-6xl mx-auto px-4 py-16", className)}>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
        {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Card({ children, className }) {
  return <div className={classNames("border rounded-2xl p-4", className)}>{children}</div>;
}

function Button({ children, to }) {
  if (to) {
    return (
      <Link to={to} className="inline-flex items-center justify-center rounded-xl border px-4 py-2 hover:bg-gray-50">
        {children}
      </Link>
    );
  }
  return (
    <button className="inline-flex items-center justify-center rounded-xl border px-4 py-2 hover:bg-gray-50">
      {children}
    </button>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 py-24 md:py-32">
        <h1
  data-header-trigger="true"
  className="text-4xl md:text-6xl font-semibold tracking-tight"
  style={{ fontFamily: "var(--font-heading)", lineHeight: 1.05 }}
>
  Тут пока нет текста,{" "}
  <span className="md:whitespace-nowrap">но он будет классный</span>
</h1>
        <p className="mt-6 text-gray-600 max-w-2xl">
          Кураторская дизайн-студия: айдентика, упаковка, презентации и сайт-визитка.
        </p>
        <div className="mt-8 flex gap-3">
          <Button to="/services">Пакеты услуг</Button>
          <Button to="/portfolio">Портфолио</Button>
        </div>
      </div>
    </section>
  );
}

function ServicesGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {SERVICES_DEMO.map((s) => (
        <Card key={s.id} className="space-y-3">
          <div className="text-lg font-semibold">{s.title}</div>
          <div className="text-sm text-gray-600">{s.desc}</div>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{s.price.toLocaleString("ru-RU")} ₽</div>
            <Button to="/contact">Заказать</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function WorksGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {WORKS.map((w) => (
        <Card key={w.id} className="space-y-3">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="text-sm opacity-60">{w.tag}</div>
          <div className="font-medium">{w.name}</div>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- оболочка ---------------- */
function Shell({ children }) {
  useThemeVars();
  useReferralCapture();
const [headerHidden, setHeaderHidden] = useState(false);
const headerRef = useRef(null);
const location = useLocation();
const isCabinet = location.pathname.startsWith("/cabinet");

useEffect(() => {
  const checkHeader = () => {
    const trigger = document.querySelector("[data-header-trigger]");

    if (!trigger) {
      setHeaderHidden(false);
      return;
    }

    const headerHeight = headerRef.current?.offsetHeight || 0;

    setHeaderHidden(
      trigger.getBoundingClientRect().top <= headerHeight
    );
  };

  checkHeader();

  window.addEventListener("scroll", checkHeader, { passive: true });
  window.addEventListener("resize", checkHeader);

  return () => {
    window.removeEventListener("scroll", checkHeader);
    window.removeEventListener("resize", checkHeader);
  };
}, [location.pathname]);

  return (
    <div className="min-h-screen text-gray-900" style={{ fontFamily: "var(--font-body)" }}>
      <header
  ref={headerRef}
  className={`sticky top-0 z-50 bg-white border-b transition-transform duration-300 ${
    headerHidden ? "-translate-y-full" : "translate-y-0"
  }`}
>
  <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-8">
    <Link
      to="/"
      style={{
        display: "block",
        width: "150px",
        flexShrink: 0,
      }}
    >
      <img
        src="/logo.svg"
        alt="PAN TERRA DESIGN STUDIO"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      />
    </Link>

    <div className="ml-auto flex items-center gap-8">
      <nav className="hidden md:flex items-center gap-8 text-sm">
        <Link to="/portfolio" className="hover:opacity-70">
          Портфолио
        </Link>

        <ServicesDropdown />

        <Link to="/studio" className="hover:opacity-70">
          О студии
        </Link>

        <Link to="/cabinet" className="hover:opacity-70">
          Личный кабинет
        </Link>
      </nav>

      <Link
        to="/contact"
        className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm whitespace-nowrap"
      >
        Оставить заявку
      </Link>
    </div>
  </div>
</header>

            {children}

      {!isCabinet && (
        <>
          <ContactUs
            whatsapp="79222817779"
            telegram="themarrrr"
          />

          <FooterPanther />

          <footer className="border-t">
            <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                © {new Date().getFullYear()} PAN TERRA. Все права защищены.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                <Link
                  to="/partners"
                  className="hover:opacity-70"
                >
                  Партнёрам
                </Link>

                <Link
                  to="/offer"
                  className="hover:opacity-70"
                >
                  Публичная оферта
                </Link>

                <a
                  href="https://t.me/themarrrr"
                  className="hover:opacity-70"
                >
                  Telegram
                </a>

                <a
                  href="mailto:hello@example.com"
                  className="hover:opacity-70"
                >
                  E-mail
                </a>
              </div>
            </div>
          </footer>
                </>
      )}
    </div>
  );
}

/* ---------------- простые страницы ---------------- */
function Home() {
  return (
    <>
      <Hero />
      <Section id="services" title="Пакеты услуг" subtitle="Выбирай подходящий — и вперёд.">
        <ServicesGrid />
      </Section>
      <Section id="portfolio" title="Пока тут пусто" subtitle="Собираем достойное на твой стол.">
        <WorksGrid />
      </Section>
    </>
  );
}

function Portfolio() { return <Section id="portfolio" title="Портфолио"><WorksGrid /></Section>; }
function Studio() { return <Section id="studio" title="О студии"><Card>Мы делаем айдентику, упаковку, презентации.</Card></Section>; }
function Contact() { return <Section id="contact" title="Контакты"><Card>Форма и контакты.</Card></Section>; }
function NotFound() {
  return (
    <Section id="not-found" title="Страница не найдена" subtitle="Возможно, ссылка устарела или страница ещё в работе.">
      <Button to="/">На главную</Button>
    </Section>
  );
}
function Partners() {
  const steps = [
    {
      number: "01",
      title: "Рекомендуете PAN TERRA",
      text: "Передаёте клиенту свою персональную ссылку или промокод.",
    },
    {
      number: "02",
      title: "Клиент заказывает дизайн",
      text: "Мы самостоятельно обсуждаем задачу, заключаем договор и ведём проект.",
    },
    {
      number: "03",
      title: "Вы получаете 10%",
      text: "После полной оплаты проекта комиссия становится доступна к выплате.",
    },
  ];

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-14 md:pt-28 md:pb-20">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-red-600">
            Партнёрская программа
          </p>

          <h1
            className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight"
            style={{
              fontFamily: "var(--font-heading)",
              lineHeight: 1.05,
            }}
          >
            Приводите клиентов.
            <br />
            Получайте 10%.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-gray-600">
            Рекомендуйте PAN TERRA тем, кому нужен дизайн. Мы берём
            проект на себя, а вы получаете вознаграждение за рекомендацию.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/cabinet">Стать партнёром</Button>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 hover:bg-gray-50"
            >
              Как это работает ↓
            </a>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-4 py-16 border-t"
      >
        <h2 data-header-trigger
  className="text-2xl md:text-3xl font-semibold">
          Всё очень просто
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.number} className="p-6">
              <div className="text-sm font-medium text-red-600">
                {step.number}
              </div>

              <h3 className="mt-8 text-xl font-semibold">
                {step.title}
              </h3>

              <p className="mt-3 text-gray-600">
                {step.text}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="rounded-2xl border p-6 md:p-10">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">
                Условия программы
              </h2>

              <p className="mt-4 text-gray-600">
                Без сложных уровней, скрытых условий и необходимости
                участвовать в самом проекте.
              </p>
            </div>

            <ul className="space-y-4">
              <li>— Вознаграждение — 10% от первого проекта клиента.</li>
              <li>— Комиссия рассчитывается от фактически оплаченной суммы.</li>
              <li>— Клиент закрепляется по ссылке, промокоду или рекомендации.</li>
              <li>— Выплата производится после полной оплаты проекта.</li>
              <li>— Отменённые и возвращённые заказы не учитываются.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pt-10 pb-24 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold">
          Знаете, кому нужен хороший дизайн?
        </h2>

        <p className="mt-4 text-gray-600">
          Зарегистрируйтесь и получите персональную партнёрскую ссылку.
        </p>

        <div className="mt-8">
          <Button to="/cabinet">Присоединиться</Button>
        </div>
      </section>
    </>
  );
}

/* --------------- Маршруты --------------- */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* ОБОЛОЧКА САЙТА (общая шапка + футер) */}
        <Route
          element={
            <Shell>
  <Outlet />
</Shell>
          }
        >
          {/* публичные страницы */}
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/services" element={<ServicesLayout />}>
            <Route index element={<Services />} />
            <Route path="logo" element={<LogoService />} />
            <Route path="branding-packages" element={<BrandingPackages />} />
            <Route path="small-formats" element={<SmallFormats />} />
            <Route path="print-ads" element={<PrintAds />} />
            <Route path="publishing" element={<Publishing />} />
            <Route path="packaging" element={<Packaging />} />
            <Route path="extras" element={<Extras />} />
            <Route path=":slug" element={<ServiceDetail />} />
          </Route>
          <Route path="/studio" element={<Studio />} />
          <Route path="/store" element={<Store />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/partners" element={<Partners />} />

          {/* КАБИНЕТ внутри оболочки сайта */}
          <Route
            path="/cabinet"
            element={
              <AuthGate>
                <CabinetLayout />
              </AuthGate>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="commissions" element={<Commissions />} />
            <Route path="payouts" element={<Payouts />} />
<Route path="projects" element={<ProjectsAdmin />} />
            <Route path="projects/:id" element={<Project />} />
<Route path="planner" element={<PlannerBoard />} />
          </Route>

          {MotionPreview && (
            <Route
              path="/dev/motion"
              element={
                <Suspense fallback={null}>
                  <MotionPreview />
                </Suspense>
              }
            />
          )}

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* OAuth callback (может быть снаружи оболочки) */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  );
}
