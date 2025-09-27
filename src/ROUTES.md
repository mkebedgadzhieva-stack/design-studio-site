# КАРТА РОУТЕРОВ (РЕДАКТИРУЕМАЯ)

```text
App (BrowserRouter + Shell: шапка/меню/футер)
├─ "/" → Home (Hero + блоки услуг/портфолио)
├─ "/portfolio" → Portfolio
├─ "/services" → ServicesLayout
│   ├─ index → Services (список категорий)
│   ├─ "logo" → LogoService
│   ├─ "branding-packages" → BrandingPackages
│   ├─ "small-formats" → SmallFormats
│   ├─ "print-ads" → PrintAds
│   ├─ "publishing" → Publishing
│   ├─ "packaging" → Packaging
│   └─ "extras" → Extras
├─ "/studio" → Studio
├─ "/store" → Store
├─ "/contact" → Contact (и виджет ContactUs)
├─ "/offer" → Offer
├─ "/partners" → Partners
└─ "/cabinet" (закрытая зона через AuthGate)
    └─ CabinetLayout (внутреннее меню кабинета)
        ├─ index → PartnerDashboard
        ├─ "commissions" → Commissions
        └─ "payouts" → Payouts

Отдельно:
"/auth/callback" → AuthCallback (обработка OAuth)
```

---

## ПОТОК АВТОРИЗАЦИИ (редактируемая схема)

```text
[Гость]
   ↓ открывает /cabinet
[AuthGate] проверяет supabase.auth.getSession()
   ├─ нет сессии → показывает вкладки Войти/Регистрация
   │     • Email+пароль → signInWithPassword
   │     • Google OAuth → loginWithGoogle → redirectTo /auth/callback?next=/cabinet
   │     • Регистрация (TwoStepSignup): шаг1 email+пароль → шаг2 имя/фамилия → signUp
   └─ есть сессия → пропуск в CabinetLayout

/auth/callback:
   • если есть ?code=… → exchangeCodeForSession → navigate(/cabinet)
   • если токены в #… → getSessionFromUrl → navigate(/cabinet)
   • если сессия уже есть → navigate(/cabinet)
```

---

## QA‑чеклист (поставь галочки)

**Навигация**

* [ ] В шапке открывается меню «Услуги» и подсказки не «отваливаются» при движении курсора.
* [ ] Все пункты меню ведут на существующие страницы (особенно Digital/Motion/Social из выпадашки).
* [ ] Кнопки «Заказать/Обсудить задачу» ведут на /contact на всех страницах услуг.

**Оболочка сайта**

* [ ] На всех публичных страницах видны шапка и футер (Shell).
* [ ] При переходе в кабинет шапка сайта остаётся («кабинет внутри сайта»).

**Авторизация**

* [ ] Вход email+пароль логинит и кидает в /cabinet.
* [ ] Регистрация TwoStepSignup: после шага 2 попадаем в /cabinet.
* [ ] Вход через Google: OAuth → /auth/callback → /cabinet.
* [ ] Выход из аккаунта в кабинете работает (кнопка «Выйти»).

**Кабинет/данные**

* [ ] На дэшборде виден баланс, реф‑ссылка копируется, «Запросить вывод» создаёт запись.
* [ ] Таблица «Начисления» грузит строки текущего пользователя.
* [ ] Таблица «Выплаты» показывает историю.

**Техническое**

* [ ] В .env заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.
* [ ] ContactUs подключён там, где нужно (или внизу Shell).