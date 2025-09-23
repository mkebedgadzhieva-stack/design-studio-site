import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
// import { supabase } from '../lib/supabase' // подключим позже, когда добавим БД

export default function Dashboard() {
  const [projects] = useState([]) // позже подменим реальными данными

  useEffect(() => {
    // тут позже будет загрузка проектов из Supabase
  }, [])

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Мои проекты</h2>
      {projects.length === 0 ? (
        <div style={{opacity:0.7}}>Пока пусто. Скоро подключим список из БД.</div>
      ) : (
        <ul>
          {projects.map(p => (
            <li key={p.id}><Link to={`/cabinet/projects/${p.id}`}>{p.title}</Link></li>
          ))}
        </ul>
      )}
    </div>
  )
}
