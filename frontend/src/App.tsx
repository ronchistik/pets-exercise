import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import PetList from './pages/PetList'
import PetDetail from './pages/PetDetail'
import PetForm from './pages/PetForm'
import { ToastProvider, useToast } from './context/ToastContext'
import { ToastContainer } from './components'

function AppContent() {
  const location = useLocation()
  const { toasts, removeToast } = useToast()

  return (
    <div className="app">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <nav className="nav">
        <Link to="/" className="logo">🐾 Novellia Pets</Link>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</Link>
          <Link to="/pets" className={location.pathname.startsWith('/pets') ? 'active' : ''}>Pets</Link>
        </div>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pets" element={<PetList />} />
          <Route path="/pets/new" element={<PetForm />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/pets/:id/edit" element={<PetForm />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App

