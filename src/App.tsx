
import { Route, Routes } from 'react-router-dom'
import './App.css'
import IndexPage from '@/pages/Index'
import TimelinePage from '@/pages/Timeline'
import NotFoundPage from '@/pages/NotFound'
import { ChatProvider } from '@/contexts/chat-context'

function App() {
  return (
    <ChatProvider>
      <div className="sidebar-chat-layout">
        <div className="timeline-container">
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </ChatProvider>
  )
}

export default App
