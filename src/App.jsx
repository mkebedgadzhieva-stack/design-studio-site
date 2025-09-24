/* App.jsx — сайт + кабинет. Страница /offer уже содержит полный текст оферты. */

import ServicesLayout from "./pages/services/ServicesLayout.jsx";
import LogoService from "./pages/services/LogoService.jsx";
import Services from "./pages/services/Services.jsx"; // список всех услуг (страница)
import ServicesDropdown from "./components/ServicesDropdown.jsx";

import { BrowserRouter, Routes, Route, Link, useLocation, Outlet } from "react-router-dom";
import { useEffect } from "react";

import AuthGate from "./features/auth/AuthGate.jsx";
import AuthCallback from "./features/auth/AuthCallback.jsx";

import Project from "./pages/Project.jsx";
import ContactUs from "./components/ContactUs";
import Cabinet from "./pages/Cabinet.tsx";

/* ---------------- THEME ---------------- */
const THEME = {
  brandName: "Mari Studio",
  accent: "#0f172a",
  accentSoft: "#e5e7eb",
  fontHeading: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
  fontBody: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial",
};

/* --------------- ДЕМО-ДАННЫЕ --------------- */
const SERVICES_DEMO = [
  {
    id: "identity",
    title: "Basic",
    price: 30000,
    desc: "Базовый пакет для старта бренда",
    bullets: ["Логотип (3 концепции)", "Гайд на 8–12 стр.", "2 раунда правок"],
  },
  {
    id: "brandkit",
    title: "Pro",
    price: 45000,
    desc: "Расширенный набор для развития",
    bullets: ["Логотип (3–4 концепции)", "Гайд 20–30 стр.", "Посты/сторис шаблоны", "3 раунда правок"],
  },
  {
    id: "premium",
    title: "Premium",
    price: 65000,
    desc: "Максимум материалов + анимация",
    bullets: ["Логотип (3–5 концепций)", "Гайд 60+ стр.", "Печатные макеты", "Сопровождение запуска"],
  },
];

const WORKS = [
  { id: 1, name: "La Maison — айдентика", img: "", tag: "Айдентика" },
  { id: 2, name: "Samohvost — упаковка", img: "", tag: "Упаковка" },
  { id: 3, name: "Dropgets — бренд электроники", img: "", tag: "Брендинг" },
];

/* ---------------- Утилиты ---------------- */
function classNames(...a) {
  return a.filter(Boolean).join(" ");
}

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

/* ---------------- Общие блоки ---------------- */
function Section({ id, title, subtitle, children, className }) {
  return (
    <section id={id} className={classNames("max-w-6xl mx-auto px-4 py-16", className)}>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h2>
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
  if (to)
    return (
      <Link to={to} className="inline-flex items-center justify-center rounded-xl border px-4 py-2 hover:bg-gray-50">
        {children}
      </Link>
    );
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
          className="text-4xl md:text-6xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", lineHeight: 1.05 }}
        >
          Мы отбираем то, что заслуживает места <span className="whitespace-nowrap">на твоём столе</span>
        </h1>
        <p className="mt-6 text-gray-600 max-w-2xl">
          Кураторская дизайн-студия: айдентика, упаковка, презентации и сайт-визитка. Умный, ироничный тон — не для
          всех, а для своих.
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
            {s.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
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

/* ---------------- Оболочка ---------------- */
function Shell({ children }) {
  useThemeVars();
  useReferralCapture();
  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "var(--font-body)" }}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl" style={{ background: "var(--accent)" }} />
            <span className="font-semibold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              {THEME.brandName}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/portfolio" className="hover:opacity-70">
              Портфолио
            </Link>
            <ServicesDropdown />
            <Link to="/studio" className="hover:opacity-70">
              О студии
            </Link>
            <Link to="/designers" className="hover:opacity-70">
              Для дизайнеров
            </Link>
            <Link to="/partners" className="hover:opacity-70">
              Партнёрская программа
            </Link>
            <Link to="/offer" className="hover:opacity-70">
              Публичная оферта
            </Link>
            <Link to="/cabinet" className="hover:opacity-70">
              Личный кабинет
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/contact" className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm">
              Оставить заявку
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} {THEME.brandName}. Все права защищены.</div>
          <div className="flex items-center gap-4">
            <a href="https://t.me/themarrrr" className="hover:opacity-70">Telegram</a>
            <a href="mailto:hello@example.com" className="hover:opacity-70">E-mail</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Страницы ---------------- */
function Home() {
  return (
    <>
      <Hero />
      <Section id="services" title="Пакеты услуг" subtitle="Выбирай подходящий — и вперёд.">
        <ServicesGrid />
      </Section>
      <Section id="portfolio" title="Избранные работы" subtitle="Собираем достойное на твой стол.">
        <WorksGrid />
      </Section>
    </>
  );
}

function Portfolio() {
  return (
    <Section id="portfolio" title="Портфолио">
      <WorksGrid />
    </Section>
  );
}

function Studio() {
  return (
    <Section id="studio" title="О студии">
      <p>Мы делаем айдентику, упаковку, презентации. Работаем по всему миру.</p>
    </Section>
  );
}

function Designers() {
  return (
    <Section id="designers" title="Для дизайнеров">
      <Card>Тут условия для дизайнеров.</Card>
    </Section>
  );
}

function Contact() {
  return (
    <Section id="contact" title="Контакты">
      <Card>Форма и контакты.</Card>
    </Section>
  );
}

function Offer() {
  return (
    <Section id="offer" title="Публичная оферта">
      <Card>
        <div className="prose max-w-none">
          <h1>Публичная оферта на оказание дизайн-услуг</h1>
          <p>
            <strong>Редакция от 24.09.2025</strong>
          </p>
          <p>
            Настоящая оферта является официальным предложением [ИП «Название моей студии»] (далее —{" "}
            <strong>Исполнитель</strong>) заключить договор на оказание дизайн-услуг с любым дееспособным лицом (далее —
            <strong>Заказчик</strong>) на условиях, изложенных ниже.
          </p>

          <h2 className="mt-8 pt-4 border-t border-gray-200 first:mt-0 first:pt-0 first:border-0">1. Термины</h2>
          <div className="space-y-1">
            <p>
              <strong>1.1. Сайт</strong> — [домен сайта].
            </p>
            <p>
              <strong>1.2. Услуги</strong> — графический дизайн и брендинг: логотип, айдентика, бренд-гайд/брендбук,
              презентации, упаковка, шаблоны для соцсетей и иные носители по согласованию.
            </p>
            <p>
              <strong>1.3. Бриф</strong> — задание/анкета, включая переписку в e-mail/Telegram.
            </p>
            <p>
              <strong>1.4. Материалы Заказчика</strong> — тексты, изображения, данные, товарные знаки, референсы и иная
              информация, переданная Исполнителю.
            </p>
            <p>
              <strong>1.5. Результат работ (РК)</strong> — макеты, исходники и иные файлы, созданные Исполнителем.
            </p>
            <p>
              <strong>1.6. Раунд правок</strong> — набор правок, переданных одним сообщением/документом по одной версии
              РК.
            </p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">2. Предмет</h2>
          <div className="space-y-1">
            <p>
              <strong>2.1.</strong> Исполнитель оказывает Услуги, Заказчик принимает и оплачивает их.
            </p>
            <p>
              <strong>2.2.</strong> Состав работ, сроки и формат сдачи определяются выбранным пакетом на Сайте и/или
              подтверждаются сторонами в переписке.
            </p>
            <p>
              <strong>2.3.</strong> Электронная переписка (e-mail/Telegram) признаётся простой электронной подписью
              сторон.
            </p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">3. Акцепт оферты</h2>
          <div className="space-y-1">
            <p>
              <strong>3.1.</strong> Договор считается заключённым с момента:
            </p>
            <ul className="!mt-2">
              <li>оплаты счёта/онлайн-оплаты; и/или</li>
              <li>отправки заполненного Брифа и подтверждения старта; и/или</li>
              <li>письменного согласия на условия оферты в e-mail/Telegram.</li>
            </ul>
            <p>
              <strong>3.2.</strong> Акцепт означает согласие с настоящей офертой и Политикой конфиденциальности на
              Сайте.
            </p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">4. Стоимость и оплата</h2>
          <div className="space-y-1">
            <p>
              <strong>4.1.</strong> Стоимость определяется по ценам на Сайте и/или согласованным в переписке.
            </p>
            <p>
              <strong>4.2. График:</strong> <strong>50% предоплата</strong> перед стартом, <strong>50% — перед
              передачей финальных файлов</strong>.
            </p>
            <p>
              <strong>4.3.</strong> В пакет входит указанное на Сайте число раундов правок. <strong>Каждый новый раунд
              правок сверх включённых — 2 000 ₽.</strong>
            </p>
            <p>
              <strong>4.4.</strong> Допработы вне объёма пакета (новые носители, допконцепции и пр.) — по отдельной
              смете/ставке, согласованной письменно.
            </p>
            <p>
              <strong>4.5.</strong> Оплата — безналично: банковская карта/счёт/иные способы.
            </p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">5. Процесс и сроки</h2>
          <div className="space-y-1">
            <p>
              <strong>5.1.</strong> Старт — после акцепта и получения предоплаты (и Брифа/Материалов).
            </p>
            <p>
              <strong>5.2.</strong> Сроки этапов являются ориентировочными; корректируются пропорционально срокам
              предоставления Материалов/фидбэка.
            </p>
            <p>
              <strong>5.3. Обратная связь: 2 рабочих дня.</strong> Заказчик обязуется давать обратную связь по
              отправленным версиям <strong>в течение двух рабочих дней</strong>. При отсутствии ответа <strong>Исполнитель
              вправе продолжать работы по плану/следующим этапам</strong>.
            </p>
            <p>
              <strong>5.4.</strong> Существенные изменения исходного ТЗ считаются допработами и подлежат отдельному
              согласованию и оплате.
            </p>
            <p>
              <strong>5.5.</strong> Промежуточные версии могут направляться с водяными знаками/пониженным качеством до
              финальной оплаты.
            </p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">6. Приёмка и передача РК</h2>
          <div className="space-y-1">
            <p>
              <strong>6.1.</strong> Передача РК — в цифровом виде (ссылки/файлы: PDF, PNG/SVG, Figma/AI/PSD — согласно
              пакету).
            </p>
            <p>
              <strong>6.2.</strong> После <strong>полной оплаты</strong> Исполнитель передаёт финальные файлы (без
              водяных знаков) и права по разд. 7.
            </p>
            <p>
              <strong>6.3. Электронный акт и приёмка.</strong> По запросу Заказчика акт оформляется электронно: (i)
              через ЭДО (Диадок/СБИС/Контур/1С-ЭДО/иное) с КЭП, (ii) через DocuSign/PandaDoc/аналог, либо (iii) простая
              электронная подпись — сообщением в e-mail/Telegram «Акт принят»/«Работы приняты без замечаний». <strong>Оплата
              финального платежа также считается принятием работ.</strong> Если в течение <strong>2 рабочих
              дней</strong> замечаний не поступило, Исполнитель вправе продолжать работы по плану; итоговое
              подтверждение приёмки оформляется любым из указанных способов.
            </p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">7. Права и сторонние лицензии</h2>
          <div className="space-y-1">
            <p>
              <strong>7.1.</strong> Исключительные права на РК переходят Заказчику <strong>после полной оплаты</strong>,
              на территории всего мира, на срок действия авторских прав.
            </p>
            <p>
              <strong>7.2.</strong> Права на объекты третьих лиц (шрифты, стоки, плагины и т.п.) не переходят и
              регулируются их лицензиями. Исполнитель помогает подобрать/оформить лицензии; стоимость согласуется
              заранее. Заказчик обязуется соблюдать условия соответствующих лицензий.
            </p>
            <p>
              <strong>7.3. Портфолио / NDA.</strong> Исполнитель вправе показывать проект в портфолио и соцсетях.{" "}
              <strong>Если публикация нежелательна, Заказчик направляет короткое уведомление или стороны подписывают NDA —
              публикации не будет.</strong>
            </p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">8. Обязанности сторон</h2>
          <div className="space-y-1">
            <p>
              <strong>8.1. Заказчик:</strong>
            </p>
            <ul className="!mt-2">
              <li>предоставляет достоверные данные, Бриф и Материалы;</li>
              <li>подтверждает законность использования Материалов и несёт ответственность за претензии третьих лиц к ним;</li>
              <li>даёт своевременную обратную связь и принимает решения по этапам.</li>
            </ul>
            <p>
              <strong>8.2. Исполнитель:</strong>
            </p>
            <ul className="!mt-2">
              <li>оказывает Услуги добросовестно в согласованных объёмах и сроках;</li>
              <li>уведомляет о обстоятельствах, влияющих на сроки/качество;</li>
              <li>вправе привлекать соисполнителей, оставаясь ответственным перед Заказчиком.</li>
            </ul>
            <p>
              <strong>8.3.</strong> Исполнитель не отвечает за задержки, вызванные несвоевременным предоставлением Заказчиком Материалов/фидбэка.
            </p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">9. Отмена и возвраты</h2>
          <div className="space-y-1">
            <ul>
              <li><strong>9.1.</strong> До старта работ — возврат <strong>100%</strong>.</li>
              <li><strong>9.2.</strong> После старта — возврат <strong>пропорционален невыполнённому объёму</strong>; завершённые этапы/выполненные раунды правок (в т.ч. по <strong>2 000 ₽</strong>) не возвращаются.</li>
              <li><strong>9.3.</strong> Возврат — тем же способом, которым была получена оплата, если иное не согласовано письменно.</li>
            </ul>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">10. Конфиденциальность и данные</h2>
          <div className="space-y-1">
            <p><strong>10.1.</strong> Стороны не раскрывают конфиденциальную информацию, за исключением случаев, предусмотренных законом.</p>
            <p><strong>10.2.</strong> По запросу Заказчика стороны подписывают отдельное NDA. Срок конфиденциальности — <strong>3 года</strong> (если иное не установлено NDA).</p>
            <p><strong>10.3.</strong> Персональные данные обрабатываются по Политике конфиденциальности на Сайте.</p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">11. Ответственность</h2>
          <div className="space-y-1">
            <p><strong>11.1.</strong> Возмещаются <strong>фактические прямые убытки</strong>; <strong>упущенная выгода не возмещается</strong>.</p>
            <p><strong>11.2.</strong> Совокупная ответственность Исполнителя <strong>ограничивается суммой, фактически уплаченной Заказчиком</strong>, если иное не предусмотрено императивными нормами закона.</p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">12. Форс-мажор</h2>
          <div className="space-y-1">
            <p><strong>12.1.</strong> Стороны освобождаются от ответственности на период действия форс-мажора при прямой причинной связи.</p>
            <p><strong>12.2.</strong> Сторона, на которую повлияли обстоятельства, <strong>уведомляет</strong> другую сторону в разумный срок (по возможности — в течение <strong>5 рабочих дней</strong>).</p>
            <p><strong>12.3.</strong> Для общеизвестных событий доказательства факта не требуются; направляется краткое уведомление о <strong>влиянии на обязательства</strong> и сроках возобновления. Просрочка уведомления не лишает права ссылаться на форс-мажор, но другая сторона не отвечает за убытки, вызванные исключительно поздним уведомлением.</p>
            <p><strong>12.4.</strong> Сроки исполнения <strong>продлеваются пропорционально</strong>. Если больше <strong>30 дней</strong> — стороны согласуют изменения; если больше <strong>60 дней</strong> — любая сторона может <strong>расторгнуть без штрафов</strong> с оплатой фактически выполненных работ.</p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">13. Урегулирование споров</h2>
          <div className="space-y-1">
            <p><strong>13.1.</strong> Претензия направляется в e-mail/Telegram; срок ответа — <strong>10 календарных дней</strong>.</p>
            <p><strong>13.2.</strong> Спор рассматривается в суде по месту регистрации Исполнителя по праву <strong>РФ</strong> (если иное не согласовано письменно).</p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">14. Срок действия оферты, изменения</h2>
          <div className="space-y-1">
            <p><strong>14.1.</strong> Оферта действует бессрочно до её отзыва или публикации новой редакции.</p>
            <p><strong>14.2.</strong> Изменения вступают в силу с момента публикации; к ранее возникшим отношениям применяется редакция на момент акцепта.</p>
          </div>

          <h2 className="mt-8 pt-4 border-t border-gray-200">15. Контакты и реквизиты</h2>
          <p>
            <strong>Исполнитель:</strong> [ИП «Кебедгаджиева Марьям Нуралиевна»]<br />
            <strong>ИНН/ОГРНИП/ОГРН:</strong> [значения]<br />
            <strong>Адрес:</strong> [адрес]<br />
            <strong>E-mail:</strong> [почта] • <strong>Telegram:</strong> [@ник]<br />
            <strong>Банковские реквизиты:</strong> [по необходимости]
          </p>
        </div>
      </Card>
    </Section>
  );
}

function Partners() {
  return (
    <Section id="partners" title="Партнёрская программа">
      <Card>Про реферальные проценты.</Card>
    </Section>
  );
}

/* --------------- Маршруты --------------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Общая оболочка сайта */}
        <Route element={<Shell><><Outlet /><ContactUs whatsapp="79222817779" telegram="themarrrr" /></></Shell>}>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />

          {/* УСЛУГИ: вложенная структура */}
          <Route path="/services" element={<ServicesLayout />}>
            <Route index element={<Services />} />
            <Route path="logo" element={<LogoService />} />
            {/* сюда позже добавим:
              <Route path="identity" element={<IdentityService />} />
              <Route path="brandbook" element={<BrandbookService />} />
              ... */}
          </Route>

          <Route path="/studio" element={<Studio />} />
          <Route path="/designers" element={<Designers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/offer" element={<Offer />} />
          <Route path="/partners" element={<Partners />} />

          {/* кабинет */}
          <Route
            path="/cabinet"
            element={
              <AuthGate>
                <Cabinet />
              </AuthGate>
            }
          />
          <Route
            path="/cabinet/projects/:id"
            element={
              <AuthGate>
                <Project />
              </AuthGate>
            }
          />
        </Route>

        {/* oauth callback */}
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

