import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!session) {
    return (
      <div className="min-h-screen" style={{display:'grid',placeItems:'center',padding:'24px'}}>
        <div style={{maxWidth:420,width:'100%',border:'1px solid #e5e7eb',borderRadius:16,padding:16}}>
          <h1 style={{fontSize:20,fontWeight:600,marginBottom:12}}>Вход в кабинет</h1>

          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <button onClick={() => {setMode('signin'); setError('')}} style={{flex:1,padding:8,border:'1px solid #e5e7eb',borderRadius:10,background: mode==='signin'?'#f3f4f6':'#fff'}}>Войти</button>
            <button onClick={() => {setMode('signup'); setError('')}} style={{flex:1,padding:8,border:'1px solid #e5e7eb',borderRadius:10,background: mode==='signup'?'#f3f4f6':'#fff'}}>Регистрация</button>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setLoading(true); setError('')
              try {
                if (mode === 'signin') {
                  const { error } = await supabase.auth.signInWithPassword({ email, password })
                  if (error) throw error
                } else {
                  const { error } = await supabase.auth.signUp({ email, password })
                  if (error) throw error
                }
              } catch (err) {
                setError(err.message || 'Ошибка')
              } finally {
                setLoading(false)
              }
            }}
          >
            <input type="email" required placeholder="you@example.com"
              style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:12,padding:'10px',marginBottom:8}}
              value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input type="password" required placeholder="Пароль"
              style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:12,padding:'10px',marginBottom:12}}
              value={password} onChange={(e)=>setPassword(e.target.value)} />
            {error && <div style={{color:'#b91c1c',marginBottom:8,fontSize:13}}>{error}</div>}
            <button disabled={loading}
              style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:12,padding:'10px'}}>
              {loading ? 'Загрузка…' : (mode==='signin' ? 'Войти' : 'Создать аккаунт')}
            </button>
          </form>

          <div style={{height:1,background:'#eee',margin:'14px 0'}} />

          {/* Соц-вход подключим следующим шагом */}
          <button
            onClick={() => supabase.auth.signInWithOAuth({
              provider: 'google',
              options: { redirectTo: window.location.origin + '/cabinet' }
            })}
            style={{width:'100%',border:'1px solid #e5e7eb',borderRadius:12,padding:'10px'}}
          >
            Продолжить с Google
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
