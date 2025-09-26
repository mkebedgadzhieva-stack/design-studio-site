// src/pages/cabinet/PartnerDashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error && error.code === "PGRST116") {
    // если профиля нет — создадим пустой
    const { data: created } = await supabase.from("profiles").insert({ id: user.id }).select().single();
    return created;
  }
  return data;
}

async function getCommissionsTotals(partnerId) {
  const { data, error } = await supabase
    .from("orders_commissions")
    .select("commission_amount,status")
    .eq("partner_id", partnerId);

  if (error) throw error;

  let approved = 0, pending = 0, paid = 0, reversed = 0;
  for (const row of data || []) {
    const s = (row.status || "").toLowerCase();
    if (s === "approved") approved += Number(row.commission_amount);
    else if (s === "pending") pending += Number(row.commission_amount);
    else if (s === "paid") paid += Number(row.commission_amount);
    else if (s === "reversed") reversed += Number(row.commission_amount);
  }

  // вычтем уже заявленные/выплаченные суммы из доступных (по желанию)
  const { data: wd } = await supabase
    .from("withdrawals")
    .select("amount,status")
    .eq("partner_id", partnerId);

  let requested = 0;
  for (const w of wd || []) {
    const s = (w.status || "").toLowerCase();
    if (s === "requested" || s === "processing") requested += Number(w.amount);
  }

  const available = Math.max(0, approved - requested);

  return { approved, pending, paid, reversed, requested, available };
}

export default function PartnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [totals, setTotals] = useState(null);
  const [copyOk, setCopyOk] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const prof = await getProfile();
      setProfile(prof);
      if (prof?.id) {
        const t = await getCommissionsTotals(prof.id);
        setTotals(t);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Загрузка…</div>;
  if (!profile) return <div>Нужно войти</div>;

  const refUrl = `${window.location.origin}/?ref=${profile.ref_code}`;

  const available = totals?.available ?? 0;
  const pending = totals?.pending ?? 0;
  const paid = totals?.paid ?? 0;

  const minPayout = 3000; // можно вынести в константы/настройки

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Партнёрский баланс</h2>
          <div className="mt-2 text-3xl font-extrabold">{available.toLocaleString("ru-RU")} ₽</div>
          <div className="text-sm text-gray-600 mt-1">
            Ожидает подтверждения: {pending.toLocaleString("ru-RU")} ₽ · Выплачено: {paid.toLocaleString("ru-RU")} ₽
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/cabinet/commissions"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            Начисления
          </Link>
          <Link
            to="/cabinet/payouts"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            Выплаты
          </Link>
          <button
            disabled={available < minPayout}
            onClick={async () => {
              const { error } = await supabase.from("withdrawals").insert({
                partner_id: profile.id,
                amount: available, // можно сделать ввод суммы; для MVP — весь доступный
                status: "requested",
              });
              if (!error) {
                alert("Заявка на вывод создана. Выплаты обрабатываются раз в неделю.");
                const t = await getCommissionsTotals(profile.id);
                setTotals(t);
              } else {
                alert(error.message);
              }
            }}
            className={`rounded-xl px-4 py-2 border ${available < minPayout ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
          >
            Запросить вывод
          </button>
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <h3 className="font-semibold mb-2">Ваша реферальная ссылка</h3>
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <code className="text-sm bg-gray-50 rounded-xl px-3 py-2 break-all">{refUrl}</code>
          <button
            className="rounded-xl border px-3 py-2 hover:bg-gray-50"
            onClick={async () => {
              await navigator.clipboard.writeText(refUrl);
              setCopyOk(true);
              setTimeout(() => setCopyOk(false), 1500);
            }}
          >
            {copyOk ? "Скопировано ✓" : "Скопировать"}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Делитесь ссылкой — мы засечём переход (90 дней). Комиссия начисляется после финальной оплаты.
        </p>
      </div>
    </section>
  );
}
