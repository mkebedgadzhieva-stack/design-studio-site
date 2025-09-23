import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type UserBits = {
  email: string | null
  name: string | null
  avatar: string | null
}

export default function Cabinet() {
  const [user, setUser] = useState<UserBits | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('SESSION:', session, 'ERROR:', error)

      if (!session) {
        // нет сессии — отправляем на главную (вход)
        window.location.href = '/'
        return
      }

      const u = session.user
      setUser({
        email: u.email ?? null,
        name: (u.user_metadata?.full_name as string) ?? null,
        avatar: (u.user_metadata?.avatar_url as string) ?? null,
      })
      setLoading(false)
    }
    run()
  }, [])

  if (loading) return <div className="p-8">Проверяем вход…</div>

  return (
    <div className="max-w-3xl mx-auto p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">MLK Design — Кабинет</h1>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
          className="px-3 py-2 rounded bg-black text-white"
        >
          Выйти
        </button>
      </header>

      <div className="flex items-center gap-4 mb-8">
        {user?.avatar && (
          <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full" />
        )}
        <div>
          <div className="font-medium">{user?.name ?? 'Без имени'}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>
      </div>

      <h2 className="text-xl font-medium mb-2">Мои проекты</h2>
      <p>Пока пусто. Скоро подключим список из БД.</p>
    </div>
  )
}
