// src/pages/cabinet/Payouts.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Payouts() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setRows([]);
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("partner_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setRows(data || []);
    })();
  }, []);

  if (!rows) return <div>Загрузка…</div>;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Выплаты</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Дата заявки</th>
              <th className="py-2 pr-4">Сумма</th>
              <th className="py-2 pr-4">Статус</th>
              <th className="py-2 pr-4">Комментарий</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-4">{new Date(r.created_at).toLocaleString("ru-RU")}</td>
                <td className="py-2 pr-4">{Number(r.amount).toLocaleString("ru-RU")} ₽</td>
                <td className="py-2 pr-4">{r.status}</td>
                <td className="py-2 pr-4">{r.comment || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 mt-3">
        Выплаты обрабатываются по графику (например, раз в неделю). Статус обновится после перевода.
      </p>
    </section>
  );
}
