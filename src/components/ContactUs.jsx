// src/components/ContactUs.jsx
export default function ContactUs({ whatsapp, telegram }) {
  // нормализуем входные данные
  const waDigits = (whatsapp || "").replace(/\D/g, "");
  const tgUser = (telegram || "").replace(/^@/, "");

  // ссылки
  const waHref = waDigits ? `https://wa.me/${waDigits}` : "#";
  const tgHref = tgUser ? `https://t.me/${tgUser}` : "#";
  const gmailCompose = "https://mail.google.com/mail/?view=cm&fs=1&to=mkebedgadzhieva@gmail.com";

  return (
    <section id="contact" className="py-16">
      <div className="mx-auto w-full max-w-5xl px-4">
        {/* Заголовок по центру — чуть меньше */}
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Связаться с нами
          </h2>
        </div>

        {/* Иконки по центру — кружки и пиктограммы в 2 раза меньше */}
        <div className="flex justify-center">
          <nav className="flex flex-wrap items-center justify-center gap-8 sm:gap-10">
            {/* WhatsApp */}
            <a
              href={waHref}
              target={waDigits ? "_blank" : undefined}
              rel={waDigits ? "noreferrer" : undefined}
              className="group inline-flex flex-col items-center gap-2"
              aria-label="Написать в WhatsApp"
              title="WhatsApp"
            >
              <span className="grid place-items-center size-8 sm:size-9 rounded-full border border-black/60 transition group-hover:scale-105">
                <img src="/icons/whatsapp.svg" alt="WhatsApp" className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <span className="text-xs">WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href={tgHref}
              target={tgUser ? "_blank" : undefined}
              rel={tgUser ? "noreferrer" : undefined}
              className="group inline-flex flex-col items-center gap-2"
              aria-label="Написать в Telegram"
              title="Telegram"
            >
              <span className="grid place-items-center size-8 sm:size-9 rounded-full border border-black/60 transition group-hover:scale-105">
                <img src="/icons/telegram.svg" alt="Telegram" className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <span className="text-xs">Telegram</span>
            </a>

            {/* Email */}
            <a
              href={gmailCompose}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex flex-col items-center gap-2"
              aria-label="Написать Email"
              title="Email"
            >
              <span className="grid place-items-center size-8 sm:size-9 rounded-full border border-black/60 transition group-hover:scale-105">
                <img src="/icons/email.svg" alt="Email" className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <span className="text-xs">Email</span>
            </a>
          </nav>
        </div>
      </div>
    </section>
  );
}
