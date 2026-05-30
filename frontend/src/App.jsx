import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Home from './pages/Home'
import Students from './pages/Students'
import Spaces from './pages/Spaces'
import OwnerDashboard from './pages/OwnerDashboard'
import Login from './pages/Login'
import StudentRadar from './pages/StudentRadar'
import AdminPanel from './pages/AdminPanel'
import SpaceRegistration from './pages/SpaceRegistration'
import CheckIn from './pages/CheckIn'
import PageTransition from './pages/PageTransition'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const location = useLocation()
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [role, setRole] = useState(localStorage.getItem('role'))
  const [name, setName] = useState(localStorage.getItem('name'))

  function handleLogin(userRole) {
    setToken(localStorage.getItem('token'))
    setRole(userRole)
    setName(localStorage.getItem('name'))
  }

  function handleLogout() {
    localStorage.clear()
    setToken(null)
    setRole(null)
    setName(null)
  }

  const ownerId = parseInt(localStorage.getItem('userId') || '0')
  const homeForRole = role === 'student' ? '/radar' : role === 'owner' ? '/owner' : role === 'admin' ? '/admin' : '/'

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Splash — logged-out only */}
        <Route path="/" element={
          token ? <Navigate to={homeForRole} replace /> :
          <PageTransition><Home /></PageTransition>
        } />

        {/* Login */}
        <Route path="/login" element={
          token ? <Navigate to={homeForRole} replace /> :
          <PageTransition><Login onLogin={handleLogin} /></PageTransition>
        } />

        {/* Public pages */}
        <Route path="/spaces" element={
          <PageTransition>
            {token ? <AppShell role={role} name={name} onLogout={handleLogout}><Spaces /></AppShell> : <Spaces />}
          </PageTransition>
        } />

        <Route path="/checkin/:spaceId" element={
          <PageTransition><CheckIn /></PageTransition>
        } />

        {/* Student */}
        <Route path="/radar" element={
          token && role === 'student'
            ? <PageTransition><StudentRadar /></PageTransition>
            : <Navigate to="/" />
        } />

        <Route path="/students" element={
          token ? <PageTransition><AppShell role={role} name={name} onLogout={handleLogout}><Students /></AppShell></PageTransition>
            : <Navigate to="/" />
        } />

        {/* Owner */}
        <Route path="/owner" element={
          token && role === 'owner'
            ? <PageTransition><AppShell role={role} name={name} onLogout={handleLogout}><OwnerDashboard /></AppShell></PageTransition>
            : <Navigate to="/" />
        } />

        <Route path="/register-space" element={
          token && role === 'owner'
            ? <PageTransition><SpaceRegistration /></PageTransition>
            : <Navigate to="/" />
        } />

        {/* Admin */}
        <Route path="/admin" element={
          token && role === 'admin'
            ? <PageTransition><AppShell role={role} name={name} onLogout={handleLogout}><AdminPanel /></AppShell></PageTransition>
            : <Navigate to="/" />
        } />

      </Routes>
    </AnimatePresence>
  )
}

function AppShell({ role, name, onLogout, children }) {
  return (
    <div>
      <nav style={{
        backgroundColor: '#0F0E0C',
        padding: '0.9rem 1.5rem',
        display: 'flex', gap: '1.5rem',
        alignItems: 'center', flexWrap: 'wrap',
        fontFamily: '"Plus Jakarta Sans", sans-serif'
      }}>
        <a href={role === 'student' ? '/radar' : role === 'owner' ? '/owner' : '/admin'}
          style={{ color: '#FFD361', fontWeight: 600, fontSize: 18, textDecoration: 'none', letterSpacing: -0.3 }}>
          beepod<span style={{ color: '#FF2E7E', fontStyle: 'italic' }}>.</span>
        </a>

        {role === 'owner' && (
          <>
            <a href="/owner" style={navLink}>dashboard</a>
            <a href="/spaces" style={navLink}>listings</a>
            <a href="/register-space" style={{ ...navLink, color: '#FFD361' }}>+ add space</a>
          </>
        )}

        {role === 'student' && (
          <>
            <a href="/radar" style={navLink}>radar</a>
            <a href="/spaces" style={navLink}>all pods</a>
          </>
        )}

        {role === 'admin' && (
          <a href="/admin" style={{ ...navLink, color: '#FFD361' }}>admin</a>
        )}

        <span style={{ marginLeft: 'auto', color: 'rgba(251,247,238,0.6)', fontSize: 13 }}>hi, {name?.toLowerCase()}</span>
        <button onClick={onLogout} style={{
          background: 'transparent', border: '1px solid rgba(255,211,97,0.3)',
          color: '#FFD361', padding: '6px 14px', borderRadius: 8,
          cursor: 'pointer', fontSize: 13, fontFamily: 'inherit'
        }}>logout</button>
      </nav>
      {children}
    </div>
  )
}

const navLink = {
  color: 'rgba(251,247,238,0.85)',
  textDecoration: 'none',
  fontSize: 14,
  fontFamily: 'inherit'
}

export default App