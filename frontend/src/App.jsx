import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Students from './pages/Students'
import Spaces from './pages/Spaces'
import OwnerDashboard from './pages/OwnerDashboard'
import Login from './pages/Login'
import StudentRadar from './pages/StudentRadar'

function App() {
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

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <BrowserRouter>
      <nav style={{ backgroundColor: '#1C1917', padding: '1rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <span style={{ color: '#D97706', fontWeight: '800', fontSize: '18px' }}>Beepod</span>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
        <Link to="/spaces" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Study Rooms</Link>
        {role === 'owner' && (
          <Link to="/owner" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link>
        )}
        {role === 'student' && (
          <>
            <Link to="/students" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>My Profile</Link>
            <Link to="/radar" style={{ color: '#D97706', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>🐝 Find Pods</Link>
          </>
        )}
        <span style={{ marginLeft: 'auto', color: '#78716C', fontSize: '13px' }}>Hi, {name}</span>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #3C3835', color: '#78716C', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
          Logout
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/students" element={<Students />} />
        <Route path="/owner" element={role === 'owner' ? <OwnerDashboard /> : <Navigate to="/" />} />
        <Route path="/radar" element={role === 'student' ? <StudentRadar /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App