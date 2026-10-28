import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const RED = "#E31924";
const PAPER = "#FAF9F6";
const LINE = "#E8E4DD";
const TEXT = "#171717";
const MUTED = "#8F8A84";

const MENUS = {
  admin: [
    { label: "Обзор", to: "/cabinet", end: true },
    { label: "Проекты", to: "/cabinet/projects" },
    { label: "Планер", to: "/cabinet/planner" },
    { label: "Финансы", to: "/cabinet/commissions" },
  ],

  employee: [
    { label: "Обзор", to: "/cabinet", end: true },
  ],

  client: [
    { label: "Мой проект", to: "/cabinet", end: true },
  ],

  partner: [
    { label: "Обзор", to: "/cabinet", end: true },
    { label: "Начисления", to: "/cabinet/commissions" },
    { label: "Выплаты", to: "/cabinet/payouts" },
  ],
};

function roleLabel(role) {
  if (role === "admin") return "Администратор";
  if (role === "employee") return "Сотрудник";
  if (role === "client") return "Заказчик";
  if (role === "partner") return "Партнёр";

  return "";
}

function canOpen(role, pathname) {
  if (role === "admin") return true;

  if (role === "partner") {
    return (
      pathname === "/cabinet" ||
      pathname === "/cabinet/" ||
      pathname.startsWith("/cabinet/commissions") ||
      pathname.startsWith("/cabinet/payouts")
    );
  }

  if (role === "employee" || role === "client") {
    return pathname === "/cabinet" || pathname === "/cabinet/";
  }

  return false;
}

function HomeIntro({ role }) {
  const content = {
    admin: {
      eyebrow: "PAN TERRA / STUDIO MANAGEMENT",
      title: "Обзор студии",
      text: "Здесь будет собрана основная информация по проектам, срокам, клиентам, команде и финансам.",
    },

    employee: {
      eyebrow: "PAN TERRA / TEAM",
      title: "Рабочий кабинет",
      text: "Здесь будут ваши проекты, задачи, дедлайны и информация о заработке.",
    },

    client: {
      eyebrow: "PAN TERRA / CLIENT",
      title: "Ваш проект",
      text: "Здесь будет отображаться текущий этап проекта, следующий шаг, сроки, файлы и документы.",
    },
  };

  const current = content[role];

  if (!current) return null;

  return (
    <section style={{ paddingTop: 40 }}>
      <div
        style={{
          marginBottom: 18,
          fontSize: 10,
          letterSpacing: "0.17em",
          fontWeight: 700,
          color: RED,
        }}
      >
        {current.eyebrow}
      </div>

      <h1
        style={{
          margin: 0,
          fontSize: "clamp(40px, 5vw, 68px)",
          lineHeight: 0.96,
          letterSpacing: "-0.045em",
          fontWeight: 500,
          color: TEXT,
        }}
      >
        {current.title}
      </h1>

      <p
        style={{
          marginTop: 24,
          maxWidth: 620,
          fontSize: 15,
          lineHeight: 1.75,
          color: "#69645E",
        }}
      >
        {current.text}
      </p>
    </section>
  );
}

export default function CabinetLayout() {
  const location = useLocation();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);

  const expanded = hovered || pinned;

  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!mounted) return;

      if (error) {
        console.error("Не удалось загрузить роль пользователя:", error);
        setRole(null);
      } else {
        setRole(data?.role || null);
      }

      setLoading(false);
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, []);

  const menuItems = role ? MENUS[role] || [] : [];

  const isHome =
    location.pathname === "/cabinet" ||
    location.pathname === "/cabinet/";

  const allowed = role ? canOpen(role, location.pathname) : false;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: TEXT,
      }}
    >
      <style>{`
        .pt-sidebar-link {
          transition:
            transform 220ms cubic-bezier(.22,1,.36,1),
            color 180ms ease;
        }

        .pt-sidebar-link:hover {
          transform: translateX(4px);
        }

        .pt-sidebar-arrow {
          opacity: 0;
          transform: translateX(-5px);
          transition:
            opacity 180ms ease,
            transform 220ms cubic-bezier(.22,1,.36,1);
        }

        .pt-sidebar-link:hover .pt-sidebar-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .pt-sidebar-logout {
          transition:
            transform 220ms cubic-bezier(.22,1,.36,1),
            color 180ms ease;
        }

        .pt-sidebar-logout:hover {
          transform: translateX(4px);
          color: ${RED} !important;
        }

        @media (max-width: 700px) {
          .pt-cabinet-main {
            padding-left: 92px !important;
            padding-right: 18px !important;
          }
        }
      `}</style>

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "fixed",
          zIndex: 100,

          left: 0,
          top: 0,
          bottom: 0,

          width: expanded ? 252 : 68,

          display: "flex",
          flexDirection: "column",

          background: PAPER,
          borderRight: `1px solid ${LINE}`,

          overflow: "hidden",

          transition:
            "width 320ms cubic-bezier(.22,1,.36,1)",
        }}
      >
        <button
          type="button"
          onClick={() => setPinned((value) => !value)}
          aria-label={expanded ? "Закрыть меню" : "Открыть меню"}
          style={{
            width: "100%",
            height: 108,

            display: "flex",
            alignItems: "center",

            padding: "0 22px",

            border: 0,
            borderBottom: `1px solid ${LINE}`,

            background: "transparent",
            color: TEXT,

            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 24,
              minWidth: 24,

              fontSize: 12,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            PT
          </span>

          <span
            style={{
              marginLeft: 19,
              minWidth: 160,

              opacity: expanded ? 1 : 0,

              transform: expanded
                ? "translateX(0)"
                : "translateX(-8px)",

              transition:
                "opacity 170ms ease 60ms, transform 260ms cubic-bezier(.22,1,.36,1)",
            }}
          >
            <span
              style={{
                display: "block",

                fontSize: 13,
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: "0.08em",

                whiteSpace: "nowrap",
              }}
            >
              PAN TERRA
            </span>

            <span
              style={{
                display: "block",
                marginTop: 7,

                fontSize: 8,
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: "0.24em",

                color: RED,

                whiteSpace: "nowrap",
              }}
            >
              DESIGN STUDIO
            </span>
          </span>
        </button>

        <nav
          style={{
            paddingTop: 34,

            display: "flex",
            flexDirection: "column",
          }}
        >
          {menuItems.map((item, index) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className="pt-sidebar-link"
              onClick={() => {
                if (window.innerWidth <= 700) {
                  setPinned(false);
                }
              }}
              style={{
                textDecoration: "none",
                color: TEXT,
              }}
            >
              {({ isActive }) => (
                <div
                  style={{
                    height: 54,

                    display: "flex",
                    alignItems: "center",

                    padding: "0 22px",
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      minWidth: 24,

                      fontSize: 10,
                      lineHeight: 1,

                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: "0.08em",

                      color: isActive ? RED : MUTED,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    style={{
                      marginLeft: 19,
                      width: 128,

                      opacity: expanded ? 1 : 0,

                      fontSize: 14,
                      lineHeight: 1,

                      fontWeight: isActive ? 650 : 500,

                      whiteSpace: "nowrap",

                      transition: "opacity 160ms ease 60ms",
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    className="pt-sidebar-arrow"
                    style={{
                      marginLeft: "auto",

                      display: expanded
                        ? "inline-block"
                        : "none",

                      paddingLeft: 8,

                      fontSize: 15,
                      lineHeight: 1,

                      color: isActive ? RED : MUTED,
                    }}
                  >
                    →
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {role && (
          <div
            style={{
              borderTop: `1px solid ${LINE}`,
            }}
          >
            <div
              style={{
                minHeight: 78,

                display: "flex",
                alignItems: "center",

                padding: "14px 22px",
              }}
            >
              <span
                style={{
                  width: 24,
                  minWidth: 24,

                  fontSize: 12,
                  lineHeight: 1,

                  fontWeight: 700,
                }}
              >
                М
              </span>

              <span
                style={{
                  marginLeft: 19,
                  minWidth: 150,

                  opacity: expanded ? 1 : 0,

                  transition: "opacity 160ms ease 60ms",
                }}
              >
                <span
                  style={{
                    display: "block",

                    fontSize: 13,
                    lineHeight: 1.2,
                    fontWeight: 650,

                    whiteSpace: "nowrap",
                  }}
                >
                  Марьям
                </span>

                <span
                  style={{
                    display: "block",
                    marginTop: 6,

                    fontSize: 9,
                    lineHeight: 1,

                    color: MUTED,

                    textTransform: "uppercase",
                    letterSpacing: "0.13em",

                    whiteSpace: "nowrap",
                  }}
                >
                  {roleLabel(role)}
                </span>
              </span>
            </div>

            <button
              type="button"
              className="pt-sidebar-logout"
              onClick={() => supabase.auth.signOut()}
              style={{
                width: "100%",
                height: 58,

                display: "flex",
                alignItems: "center",

                padding: "0 22px",

                border: 0,
                borderTop: `1px solid ${LINE}`,

                background: "transparent",

                color: "#6D6964",

                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 24,
                  minWidth: 24,

                  fontSize: 16,
                  lineHeight: 1,
                }}
              >
                ↗
              </span>

              <span
                style={{
                  marginLeft: 19,

                  opacity: expanded ? 1 : 0,

                  fontSize: 12,
                  fontWeight: 500,

                  whiteSpace: "nowrap",

                  transition: "opacity 160ms ease 60ms",
                }}
              >
                Выйти
              </span>
            </button>
          </div>
        )}
      </aside>

      <main
        className="pt-cabinet-main"
        style={{
          maxWidth: 1180,
          margin: "0 auto",

          paddingTop: 32,
          paddingRight: 32,
          paddingBottom: 48,
          paddingLeft: 104,
        }}
      >
        {loading ? (
          <div
            style={{
              paddingTop: 40,
              fontSize: 13,
              color: MUTED,
            }}
          >
            Загружаем кабинет…
          </div>
        ) : !role ? (
          <div
            style={{
              paddingTop: 40,
            }}
          >
            Не удалось определить роль пользователя.
          </div>
        ) : isHome && role !== "partner" ? (
          <HomeIntro role={role} />
        ) : !allowed ? (
          <section
            style={{
              paddingTop: 40,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.16em",
                color: RED,
                fontWeight: 700,
              }}
            >
              PAN TERRA
            </div>

            <h1
              style={{
                marginTop: 14,
                marginBottom: 12,

                fontSize: 38,
                lineHeight: 1,

                letterSpacing: "-0.035em",
                fontWeight: 500,
              }}
            >
              Этот раздел недоступен
            </h1>

            <p
              style={{
                maxWidth: 500,

                color: "#77716B",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              У вашего аккаунта нет доступа к этому разделу кабинета.
            </p>
          </section>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}