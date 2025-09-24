// src/features/auth/AuthGate.jsx

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import TwoStepSignup from "./TwoStepSignup.jsx";
import { loginWithGoogle } from "./googleLogin";

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-1/2 px-4 py-2 rounded-xl border text-sm " +
        (active ? "bg-gray-100 font-medium" : "hover:bg-gray-50")
      }
      type="button"
    >
      {children}
    </button>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    // Сразу в кабинет (дополнительно сработает onAuthStateChange ниже)
    navigate("/cabinet", { replace: true });
  };

  return (
    <form className="space-y-3" onSubmit={onEmailPasswordSignIn}>
      <input
        type="email"
        placeholder="you@example.com"
        className="w-full rounded-xl border px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Пароль"
        className="w-full rounded-xl border px-3 py-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      {error && <div className="text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl border px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
      >
        {loading ? "Входим…" : "Войти"}
      </button>

      <div className="relative text-center text-xs text-gray-500 my-3">
        <span className="bg-white px-2 relative z-10">или</span>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-gray-200" />
      </div>

      {/* Google вход с корректным redirectTo на /auth/callback?next=/cabinet */}
      <button
        type="button"
        onClick={loginWithGoogle}
        className="w-full rounded-xl border px-3 py-2 hover:bg-gray-50"
      >
        Продолжить с Google
      </button>
    </form>
  );
}

export default function AuthGate({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("signin"); // signin | signup

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      // 1) моментальная проверка текущей сессии (на рефреше/после OAuth)
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setInitialized(true);

      // если сессия уже есть и мы не в кабинете — перенаправляем
      if (data.session && location.pathname !== "/cabinet") {
        navigate("/cabinet", { replace: true });
      }

      // 2) слушатель изменений авторизации
      const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
        setSession(sess);
        if (event === "SIGNED_IN" && sess) {
          if (location.pathname !== "/cabinet") {
            navigate("/cabinet", { replace: true });
          }
        }
      });

      unsub = listener.subscription.unsubscribe;
    })();

    return () => {
      unsub && unsub();
    };
  }, [navigate, location.pathname]);

  // Пока инициализируемся — ничего не рендерим (можно спиннер)
  if (!initialized) return null;

  // Если авторизованы — показываем приватную часть (кабинет)
  if (session) return children;

  // Если не авторизованы — показываем формы входа/регистрации
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="w-full max-w-md rounded-2xl border p-5">
        <h2 className="text-lg font-semibold mb-3">Вход в кабинет</h2>

        <div className="flex gap-2 mb-4">
          <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
            Войти
          </TabButton>
          <TabButton active={tab === "signup"} onClick={() => setTab("signup")}>
            Регистрация
          </TabButton>
        </div>

        {tab === "signin" ? <SignInForm /> : <TwoStepSignup />}

        <p className="mt-4 text-xs text-gray-500">
          Конфиденциальность: e-mail и UID никогда не отображаются публично и доступны только вам.
          Публичные данные (имя/фамилия/ник) вы выбираете сами.
        </p>
      </div>
    </div>
  );
}
