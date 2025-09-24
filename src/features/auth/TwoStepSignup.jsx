import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function TwoStepSignup() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const goNext = (e) => {
    e.preventDefault()
    setError("")
    if (!email.trim()) return setError("Введите e-mail")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Некорректный e-mail")
    if (password.length < 6) return setError("Минимум 6 символов в пароле")
    setStep(2)
  }

  const submit = async (e) => {
  e.preventDefault()
  setError("")
  if (!firstName.trim()) return setError("Введите имя")
  if (!lastName.trim()) return setError("Введите фамилию")

  setLoading(true)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`.trim(),
      },
    },
  })
  if (error) {
    setLoading(false)
    return setError(error.message)
  }

  // Если сессия уже есть — сразу в кабинет
  if (data?.session) {
    window.location.href = "/cabinet"
    return
  }

  // Иначе пробуем залогиниться вручную
  const { error: e2 } = await supabase.auth.signInWithPassword({ email, password })
  setLoading(false)
  if (e2) {
    return setError("Почти готово! Проверьте e-mail и подтвердите адрес, затем войдите.")
  }

  window.location.href = "/cabinet"
}

  return (
    <form className="space-y-3" onSubmit={step === 1 ? goNext : submit}>
      {step === 1 && (
        <>
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
            autoComplete="new-password"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-xl border px-3 py-2 hover:bg-gray-50"
          >
            Далее
          </button>
          <p className="text-xs text-gray-500">
            Мы заботимся о приватности: ваш e-mail виден только вам. Публичное имя вы настроите далее.
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Имя"
              className="w-full rounded-xl border px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
            <input
              type="text"
              placeholder="Фамилия"
              className="w-full rounded-xl border px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border px-3 py-2 hover:bg-gray-50 disabled:opacity-60"
          >
            {loading ? "Создаём…" : "Создать аккаунт"}
          </button>
          <p className="text-xs text-gray-500">
            Ваши личные данные (e-mail, UID) не отображаются публично. Вы сами решаете, что показывать.
          </p>
        </>
      )}
    </form>
  )
}
