import { useState } from 'react'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const url = isRegister
      ? 'http://localhost:8080/api/auth/register'
      : 'http://localhost:8080/api/auth/login'

    const body = isRegister
      ? { name, email, password, role, phone }
      : { email, password }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()

      if(data.error) {
        setError(data.error)
      } else {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('name', data.name)
        onLogin(data.role)
      }
    } catch(e) {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'white', border: '1px solid #E5E3DC', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px' }}>
        
        <h1 style={{ color: '#D97706', margin: '0 0 0.25rem', fontSize: '24px' }}>Beepod 🐝</h1>
        <p style={{ color: '#78716C', margin: '0 0 1.5rem', fontSize: '14px' }}>Find your focus. Own your time.</p>

        <h2 style={{ fontSize: '18px', color: '#1C1917', margin: '0 0 1.5rem' }}>
          {isRegister ? 'Create account' : 'Sign in'}
        </h2>

        {isRegister && (
          <>
            <input
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }}
            />
            <input
              placeholder="Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }}
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }}
            >
              <option value="student">I am a Student</option>
              <option value="owner">I am a Study Room Owner</option>
            </select>
          </>
        )}

        <input
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }}
        />

        {error && (
          <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#D97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', marginBottom: '12px' }}
        >
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#78716C', margin: 0 }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={{ background: 'none', border: 'none', color: '#D97706', fontWeight: '600', cursor: 'pointer', fontSize: '13px', marginLeft: '4px' }}
          >
            {isRegister ? 'Sign in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login