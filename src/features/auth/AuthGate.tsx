import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-md rounded-2xl shadow p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Вход в кабинет</h1>
          {sent ? (
            <p>Письмо со ссылкой отправлено. Проверь почту и вернись сюда.</p>
          ) : (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault()
                const { error } = await supabase.auth.signInWithOtp({ email })
                if (!error) setSent(true)
                else alert(error.message)
              }}
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full border rounded-xl px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="w-full rounded-xl px-3 py-2 border">Получить ссылку</button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
