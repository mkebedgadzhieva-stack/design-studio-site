import { Link, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function CabinetLayout() {
  return (
    <div>
      <header style={{position:'sticky',top:0,background:'#fff',borderBottom:'1px solid #eee',padding:'10px 16px',display:'flex',gap:12}}>
        <Link to="/cabinet" style={{fontWeight:600}}>MLK Design — Кабинет</Link>
        <div style={{marginLeft:'auto'}} />
        <button onClick={() => supabase.auth.signOut()}>Выйти</button>
      </header>
      <main style={{maxWidth:960,margin:'0 auto',padding:16}}>
        <Outlet />
      </main>
    </div>
  )
}
