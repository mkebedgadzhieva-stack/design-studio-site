export default function Store() {
  const cats = [
    { title: "Website Templates", desc: "Готовые макеты сайтов/лендингов (Figma или свёрстанные шаблоны)." },
    { title: "Мокапы", desc: "Кураторские сцены для презентаций бренда: упаковка, печать, мерч." },
    { title: "Шаблоны", desc: "Презентации, посты/сторис, коммерческие — готовые и редактируемые." },
    { title: "Шрифты", desc: "Кастом/адаптации и лицензии. Поддержка под кириллицу." },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12">Store</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {cats.map((c) => (
            <div key={c.title} className="p-6 border rounded-2xl shadow-sm">
              <div className="text-xl font-semibold mb-2">{c.title}</div>
              <p className="text-gray-600">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
