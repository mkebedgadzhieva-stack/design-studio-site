import React from "react";

type Props = {
  whatsapp: string;   // например 79991234567 (без + и пробелов)
  telegram: string;   // юзернейм без @, например "mlk_design"
  title?: string;
};

export default function ContactUs({
  whatsapp,
  telegram,
  title = "Связаться с нами",
}: Props) {
  const waHref = `https://wa.me/${whatsapp}`;
  const tgHref = `https://t.me/${telegram}`;

  return (
    <section className="w-full bg-black text-white py-12">
      <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        <div className="flex items-center gap-6">
          <a
            href={tgHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="rounded-full border border-white/40 p-3 hover:bg-white/10 transition"
          >
            {/* иконка Telegram */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" className="h-6 w-6 fill-white">
              <path d="M120 0c66 0 120 54 120 120s-54 120-120 120S0 186 0 120 54 0 120 0Z"/>
              <path d="M52 117.2 177.8 67.6c5.9-2.3 11.1 1.4 9.2 10.1l-21.4 100.7c-1.5 6.8-5.6 8.5-11.3 5.3l-31.2-23-15 14.4c-1.7 1.7-3.1 3.1-6.3 3.1l2.2-31.7 57.7-52.1c2.5-2.2-0.6-3.5-3.8-1.3l-71.3 45-30.7-9.6c-6.7-2.1-6.8-6.8 1.4-10.3Z" fill="#fff"/>
            </svg>
          </a>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="rounded-full border border-white/40 p-3 hover:bg-white/10 transition"
          >
            {/* иконка WhatsApp */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-6 w-6 fill-white">
              <path d="M380.9 97.1C339-3.9 221.7-33.1 132.5 22.2 62.5 64.8 28.6 145.3 47 222.1L32 288l68.7-14.3c73.6 48.4 170.6 38.2 231.2-24.3 62.3-63.8 78.5-161.2 48.9-252.3z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
