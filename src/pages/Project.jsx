import { useParams } from 'react-router-dom'

export default function Project() {
  const { id } = useParams()
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:600,marginBottom:12}}>Проект {id}</h2>
      <div>Тут позже будут вкладки: Бриф / Файлы / Чат / Счета.</div>
    </div>
  )
}
