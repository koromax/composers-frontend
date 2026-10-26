import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BottomNavigation } from './components/BottomNavigation'
import { Header } from './components/Header'
import { FeedPage } from './pages/FeedPage'
import { GridPage } from './pages/GridPage'

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <Routes>
          <Route element={<FeedPage />} path="/" />
          <Route element={<FeedPage />} path="/composers-feed" />
          <Route element={<FeedPage />} path="/composers-feed/:id" />
          <Route element={<GridPage />} path="/composers-grid" />
          <Route element={<Navigate replace to="/composers-feed" />} path="*" />
        </Routes>
        <BottomNavigation />
      </div>
    </BrowserRouter>
  )
}

export default App
