import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import TwoStepSignup from "./TwoStepSignup.jsx";
import { loginWithGoogle } from "./googleLogin";

const RED = "#E31924";

function PortalButton({ active, onClick, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: "16px 18px",
        border: active
          ? `1px solid ${RED}`
          : "1px solid #E5E5E5",
        background: active
          ? "rgba(227, 25, 36, 0.035)"
          : "#fff",
        borderRadius: 14,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 180ms ease",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: active ? RED : "#171717",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 11,
          lineHeight: 1.4,
          color: "#8A8A8A",
        }}
      >
        {subtitle}
      </div>
    </button>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        flex: 1,
        padding: "10px 14px",
        border: "none",
        borderBottom: active
          ? `1px solid ${RED}`
          : "1px solid #E7E7E7",
        background: "transparent",
        color: active ? RED : "#777",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SignInForm({ portal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onEmailPasswordSignIn = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    const user = authData?.user;

    if (!user) {
      setLoading(false);
      setError("Не удалось определить пользователя.");
      return;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.role) {
      await supabase.auth.signOut();

      setLoading(false);
      setError("Не удалось определить тип вашего аккаунта.");
      return;
    }

    const studioRoles = ["admin", "employee"];
    const clientRoles = ["client", "partner"];

    const allowed =
      portal === "studio"
        ? studioRoles.includes(profile.role)
        : clientRoles.includes(profile.role);

    if (!allowed) {
      await supabase.auth.signOut();

      setLoading(false);

      if (portal === "studio") {
        setError(
          "Этот аккаунт не относится к команде PAN TERRA. Выберите вход «Заказчик / партнёр»."
        );
      } else {
        setError(
          "Этот аккаунт относится к команде PAN TERRA. Выберите вход «Студия»."
        );
      }

      return;
    }

    setLoading(false);

    navigate("/cabinet", {
      replace: true,
    });
  };

  return (
    <form
      onSubmit={onEmailPasswordSignIn}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        style={{
          width: "100%",
          padding: "13px 14px",
          border: "1px solid #E3E3E3",
          borderRadius: 12,
          outline: "none",
          fontSize: 14,
        }}
      />

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        style={{
          width: "100%",
          padding: "13px 14px",
          border: "1px solid #E3E3E3",
          borderRadius: 12,
          outline: "none",
          fontSize: 14,
        }}
      />

      {error && (
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: RED,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "13px 16px",
          marginTop: 2,
          border: `1px solid ${RED}`,
          borderRadius: 12,
          background: RED,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.65 : 1,
        }}
      >
        {loading
          ? "Входим…"
          : portal === "studio"
          ? "Войти в кабинет студии"
          : "Войти в кабинет"}
      </button>

      {portal === "client" && (
        <>
          <div
            style={{
              position: "relative",
              margin: "7px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                height: 1,
                background: "#ECECEC",
              }}
            />

            <span
              style={{
                position: "relative",
                padding: "0 10px",
                background: "#fff",
                color: "#999",
                fontSize: 10,
              }}
            >
              ИЛИ
            </span>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid #E3E3E3",
              borderRadius: 12,
              background: "#fff",
              color: "#222",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Продолжить с Google
          </button>
        </>
      )}
    </form>
  );
}

export default function AuthGate({ children }) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState(null);

  const [portal, setPortal] = useState("client");
  const [tab, setTab] = useState("signin");

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setInitialized(true);
      }
    );

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          console.error(
            "Ошибка получения сессии:",
            error
          );
        }

        setSession(data?.session ?? null);
        setInitialized(true);
      })
      .catch((error) => {
        if (!mounted) return;

        console.error(
          "Ошибка получения сессии:",
          error
        );

        setInitialized(true);
      });

    const safetyTimer = window.setTimeout(() => {
      if (!mounted) return;

      setInitialized(true);
    }, 2000);

    return () => {
      mounted = false;

      window.clearTimeout(safetyTimer);

      subscription.unsubscribe();
    };
  }, []);

  if (!initialized) {
    return (
      <div
        style={{
          minHeight: "55vh",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          color: "#777",
        }}
      >
        Загружаем кабинет…
      </div>
    );
  }

  if (session) {
    return children;
  }

  return (
    <div
      style={{
        minHeight: "72vh",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
        background: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
        }}
      >
        <div
          style={{
            marginBottom: 30,
          }}
        >
          <div
            style={{
              marginBottom: 10,
              color: RED,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.17em",
            }}
          >
            PAN TERRA / ACCOUNT
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 32,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
              fontWeight: 500,
            }}
          >
            Личный кабинет
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: "#777",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Выберите тип входа.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <PortalButton
            active={portal === "studio"}
            onClick={() => {
              setPortal("studio");
              setTab("signin");
            }}
            title="Студия"
            subtitle="Для команды PAN TERRA"
          />

          <PortalButton
            active={portal === "client"}
            onClick={() => {
              setPortal("client");
              setTab("signin");
            }}
            title="Заказчик / партнёр"
            subtitle="Проекты и партнёрская программа"
          />
        </div>

        <div
          style={{
            borderTop: "1px solid #ECECEC",
            paddingTop: 24,
          }}
        >
          {portal === "client" && (
            <div
              style={{
                display: "flex",
                marginBottom: 22,
              }}
            >
              <TabButton
                active={tab === "signin"}
                onClick={() => setTab("signin")}
              >
                Войти
              </TabButton>

              <TabButton
                active={tab === "signup"}
                onClick={() => setTab("signup")}
              >
                Регистрация
              </TabButton>
            </div>
          )}

          {portal === "studio" ? (
            <>
              <SignInForm portal="studio" />

              <p
                style={{
                  marginTop: 18,
                  color: "#999",
                  fontSize: 11,
                  lineHeight: 1.55,
                }}
              >
                Доступ сотрудников создаётся администратором
                PAN TERRA.
              </p>
            </>
          ) : tab === "signin" ? (
            <SignInForm portal="client" />
          ) : (
            <TwoStepSignup />
          )}
        </div>
      </div>
    </div>
  );
}