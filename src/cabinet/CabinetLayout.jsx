// src/cabinet/CabinetLayout.jsx
import { Link, NavLink, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase"; // <-- ВАЖНО: относительный путь

const link = (isActive) =>
  "px-3 py-2 rounded-xl border " +
  (isActive ? "bg-gray-100 font-medium" : "hover:bg-gray-50");

export default function CabinetLayout() {
  return (
    <div>
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          borderBottom: "1px solid #eee",
          padding: "10px 16px",
          display: "flex",
          gap: 12,
          zIndex: 5,
        }}
      >
        <Link to="/cabinet" style={{ fontWeight: 600 }}>
          MLK Design — Кабинет
        </Link>

        <nav style={{ display: "flex", gap: 8, marginLeft: 12 }}>
          <NavLink to="/cabinet" end className={({ isActive }) => link(isActive)}>
            Главная
          </NavLink>
          <NavLink to="/cabinet/commissions" className={({ isActive }) => link(isActive)}>
            Начисления
          </NavLink>
          <NavLink to="/cabinet/payouts" className={({ isActive }) => link(isActive)}>
            Выплаты
          </NavLink>
        </nav>

        <div style={{ marginLeft: "auto" }} />
        <button onClick={() => supabase.auth.signOut()}>Выйти</button>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
