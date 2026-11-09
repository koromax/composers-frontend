import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BottomNavigation } from './components/BottomNavigation'
import { Header } from './components/Header'
import { FeedPage } from './pages/FeedPage'
import { GridPage } from './pages/GridPage'
import { LoginPage } from './pages/LoginPage'
import { AddComposerPage } from './pages/AddComposerPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="app-container">
        <Header />
        <Routes>
          <Route element={<FeedPage />} path="/" />
          <Route element={<FeedPage />} path="/composers-feed" />
          <Route element={<FeedPage />} path="/composers-feed/:id" />
          <Route element={<GridPage />} path="/composers-grid" />
          <Route element={<AddComposerPage />} path="/composers-add" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<Navigate replace to="/composers-feed" />} path="*" />
        </Routes>
        <BottomNavigation />
      </div>
    </BrowserRouter>
  )
}

export default App
