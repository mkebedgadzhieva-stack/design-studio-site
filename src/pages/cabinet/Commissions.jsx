// src/pages/cabinet/Commissions.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Commissions() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setRows([]);
      const { data, error } = await supabase
        .from("orders_commissions")
        .select("*")
        .eq("partner_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setRows(data || []);
    })();
  }, []);

  if (!rows) return <div>Загрузка…</div>;

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Начисления</h2>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Дата</th>
              <th className="py-2 pr-4">Сумма чека</th>
              <th className="py-2 pr-4">Ставка</th>
              <th className="py-2 pr-4">Вознаграждение</th>
              <th className="py-2 pr-4">Статус</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-4">{new Date(r.created_at).toLocaleString("ru-RU")}</td>
                <td className="py-2 pr-4">{Number(r.amount_check).toLocaleString("ru-RU")} ₽</td>
                <td className="py-2 pr-4">{Number(r.commission_pct).toFixed(0)}%</td>
                <td className="py-2 pr-4 font-medium">{Number(r.commission_amount).toLocaleString("ru-RU")} ₽</td>
                <td className="py-2 pr-4">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600 mt-3">
        Начисления появляются после подтверждения финальной оплаты заказа.
      </p>
    </section>
  );
}
