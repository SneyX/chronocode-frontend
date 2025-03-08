
import { Route, Routes } from 'react-router-dom'
import './App.css'
import IndexPage from '@/pages/Index'
import TimelinePage from '@/pages/Timeline'
import NotFoundPage from '@/pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
