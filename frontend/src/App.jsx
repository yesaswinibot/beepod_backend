import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Students from './pages/Students'
import Spaces from './pages/Spaces'
import OwnerDashboard from './pages/OwnerDashboard'

function App() {
  return (
    <BrowserRouter>

      {/* NAVIGATION */}
      <nav style={{
        backgroundColor: '#1C1917',
        padding: '1rem 2rem',
        display: 'flex',
        gap: '2rem',
        alignItems: 'center'
      }}>
        <span style={{ color: '#D97706', fontWeight: '800', fontSize: '18px' }}>
          Beepod
        </span>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Home</Link>
        <Link to="/spaces" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Study Rooms</Link>
        <Link to="/students" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Students</Link>
        <Link to="/owner" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>Owner Dashboard</Link>
      </nav>

      {/* PAGES */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/students" element={<Students />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/owner" element={<OwnerDashboard />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App