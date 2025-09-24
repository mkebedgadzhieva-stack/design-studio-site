// src/features/auth/AuthCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { loginWithGoogle } from "./googleLogin";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/cabinet";
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const href = window.location.href;
        const url = new URL(href);
        const hasCode = !!url.searchParams.get("code");
        const hasHash = typeof window !== "undefined" && window.location.hash && window.location.hash.length > 1;

        // 1) PKCE: есть ?code=...
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(href);
          if (error) throw error;
          if (!active) return;
          return navigate(next, { replace: true });
        }

        // 2) Имплиситный/хеш-флоу: токены в #...
        if (hasHash) {
          const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) throw error;
          if (!active) return;
          return navigate(next, { replace: true });
        }

        // 3) Фолбэк: если мы сюда попали без кода/хеша — вдруг сессия уже есть
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (!active) return;
          return navigate(next, { replace: true });
        }

        // Иначе покажем понятную ошибку
        setError("Не найден код авторизации. Нажми «Войти через Google» ещё раз.");
      } catch (e) {
        console.error(e);
        setError(e.message || "Неизвестная ошибка входа");
      }
    })();

    return () => { active = false; };
  }, [navigate, next]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <p className="text-lg">Входим…</p>
        {error && (
          <>
            <p className="text-red-600 mt-2">Ошибка: {error}</p>
            <button
              onClick={loginWithGoogle}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              type="button"
            >
              Попробовать снова (Google)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
