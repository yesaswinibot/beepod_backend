import { useState, useEffect, useRef } from 'react'
import { auth } from '../firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const API = 'https://beepodbackend-production.up.railway.app'

function Login({ onLogin }) {
  // mode: 'login' (email+pwd) | 'register' | 'phone' | 'email-otp'
  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmResult, setConfirmResult] = useState(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const recaptchaRef = useRef(null)

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear() } catch {}
        window.recaptchaVerifier = null
      }
    }
  }, [])

  function resetMsgs() { setError(''); setInfo('') }

  // ── Email + password ──────────────────────────────────
  async function handleEmailSubmit() {
    setLoading(true); resetMsgs()
    const url = mode === 'register' ? `${API}/api/auth/register` : `${API}/api/auth/login`
    const body = mode === 'register' ? { name, email, password, role, phone: '' } : { email, password }
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('name', data.name)
      onLogin(data.role)
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  // ── Email OTP: send ───────────────────────────────────
  async function sendEmailOtp() {
    resetMsgs()
    if (!email || !email.includes('@')) { setError('Enter a valid email.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/send-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setInfo(`OTP sent to ${email}. Check your inbox.`)
      setStep(2)
    } catch {
      setError('Failed to send OTP. Try again.')
    }
    setLoading(false)
  }

  // ── Email OTP: verify ─────────────────────────────────
  async function verifyEmailOtp() {
    resetMsgs()
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      if (data.exists) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('name', data.name)
        onLogin(data.role)
      } else {
        setStep(3) // ask for profile
      }
    } catch {
      setError('Verification failed. Try again.')
    }
    setLoading(false)
  }

  // ── Email OTP: complete registration ──────────────────
  async function completeEmailRegister() {
    resetMsgs()
    if (!name) { setError('Please enter your name.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, phone: '', password: `otp_${Date.now()}` })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('name', data.name)
      onLogin(data.role)
    } catch {
      setError('Registration failed. Try again.')
    }
    setLoading(false)
  }

  // ── Phone OTP: send ───────────────────────────────────
  async function sendPhoneOtp() {
    resetMsgs()
    if (!phone || phone.length < 10) { setError('Enter a valid 10-digit phone number.'); return }
    setLoading(true)
    try {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear() } catch {}
        window.recaptchaVerifier = null
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      })
      await window.recaptchaVerifier.render()
      const fullPhone = `+91${phone.replace(/\D/g, '')}`
      const result = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier)
      setConfirmResult(result)
      setStep(2)
    } catch (e) {
      console.error('OTP error:', e)
      setError(`Failed to send OTP: ${e.message || 'Try again.'}`)
    }
    setLoading(false)
  }

  // ── Phone OTP: verify ─────────────────────────────────
  async function verifyPhoneOtp() {
    resetMsgs()
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit OTP.'); return }
    setLoading(true)
    try {
      await confirmResult.confirm(otp)
      const res = await fetch(`${API}/api/auth/check-phone?phone=${phone}`)
      const data = await res.json()
      if (data.exists) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('name', data.name)
        onLogin(data.role)
      } else {
        setStep(3)
      }
    } catch {
      setError('Invalid OTP. Please try again.')
    }
    setLoading(false)
  }

  async function completePhoneRegister() {
    resetMsgs()
    if (!name) { setError('Please enter your name.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, role, email: `${phone}@beepod.in`, password: `phone_${phone}` })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.role)
      localStorage.setItem('name', data.name)
      onLogin(data.role)
    } catch {
      setError('Registration failed. Try again.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', marginBottom: '10px',
    borderRadius: '10px', border: '1px solid #E5E3DC',
    boxSizing: 'border-box', fontSize: '14px', outline: 'none',
    background: '#FAFAF9', color: '#1C1917'
  }

  const btnStyle = {
    width: '100%', padding: '12px', background: '#D97706', color: 'white',
    border: 'none', borderRadius: '10px', fontWeight: '700',
    cursor: 'pointer', fontSize: '15px', marginBottom: '12px',
    opacity: loading ? 0.7 : 1
  }

  const altBtnStyle = {
    ...btnStyle, background: '#FEF3C7', color: '#D97706',
    border: '1.5px solid #FCD34D'
  }

  function switchMode(m) { setMode(m); setStep(1); setOtp(''); resetMsgs() }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '1rem' }}>
      <div style={{ background: 'white', border: '1px solid #FDE68A', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(217,119,6,0.08)' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '36px' }}>🐝</div>
          <h1 style={{ color: '#D97706', margin: '4px 0 2px', fontSize: '22px', fontWeight: '800' }}>Beepod</h1>
          <p style={{ color: '#B45309', margin: 0, fontSize: '13px' }}>Find your focus. Own your time.</p>
        </div>

        {/* Tab switcher (only for email+pwd mode) */}
        {(mode === 'login' || mode === 'register') && step === 1 && (
          <div style={{ display: 'flex', background: '#FEF3C7', borderRadius: '10px', padding: '3px', marginBottom: '1.5rem', gap: '3px' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => switchMode(m)}
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: mode === m ? 'white' : 'transparent', color: mode === m ? '#D97706' : '#B45309', boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {/* ── EMAIL + PASSWORD ── */}
        {(mode === 'login' || mode === 'register') && (
          <>
            {mode === 'register' && (
              <>
                <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                  <option value="student">I am a Student</option>
                  <option value="owner">I am a Study Room Owner</option>
                </select>
              </>
            )}
            <input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}
            <button onClick={handleEmailSubmit} disabled={loading} style={btnStyle}>
              {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>

            <div style={{ position: 'relative', textAlign: 'center', margin: '8px 0 12px' }}>
              <div style={{ borderTop: '1px solid #FDE68A', position: 'absolute', top: '50%', left: 0, right: 0 }} />
              <span style={{ background: 'white', padding: '0 10px', color: '#B45309', fontSize: '12px', position: 'relative' }}>or continue with OTP</span>
            </div>

            <button onClick={() => switchMode('email-otp')} style={altBtnStyle}>
              ✉️ Email OTP
            </button>
            <button onClick={() => switchMode('phone')} style={{ ...altBtnStyle, marginBottom: 0 }}>
              📱 Phone OTP
            </button>
          </>
        )}

        {/* ── EMAIL OTP FLOW ── */}
        {mode === 'email-otp' && (
          <>
            {step === 1 && (
              <>
                <h2 style={{ fontSize: '16px', color: '#1C1917', margin: '0 0 1rem', fontWeight: '700' }}>Sign in with Email OTP</h2>
                <input placeholder="your@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}
                <button onClick={sendEmailOtp} disabled={loading} style={btnStyle}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
                <button onClick={() => switchMode('login')} style={{ ...btnStyle, background: 'none', color: '#B45309', border: 'none', marginBottom: 0 }}>
                  ← Back
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <h2 style={{ fontSize: '16px', color: '#1C1917', margin: '0 0 4px', fontWeight: '700' }}>Enter OTP</h2>
                <p style={{ color: '#B45309', fontSize: '13px', margin: '0 0 1rem' }}>Sent to {email}</p>
                <input placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '0.3em', fontWeight: '700' }} />
                {info && <p style={{ color: '#16A34A', fontSize: '13px', margin: '0 0 10px' }}>{info}</p>}
                {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}
                <button onClick={verifyEmailOtp} disabled={loading} style={btnStyle}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button onClick={() => { setStep(1); setOtp(''); resetMsgs() }} style={{ ...btnStyle, background: 'none', color: '#B45309', border: 'none', marginBottom: 0 }}>
                  ← Change email
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <h2 style={{ fontSize: '16px', color: '#1C1917', margin: '0 0 4px', fontWeight: '700' }}>Complete your profile</h2>
                <p style={{ color: '#B45309', fontSize: '13px', margin: '0 0 1rem' }}>Almost there 🐝</p>
                <input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                  <option value="student">I am a Student</option>
                  <option value="owner">I am a Study Room Owner</option>
                </select>
                {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}
                <button onClick={completeEmailRegister} disabled={loading} style={btnStyle}>
                  {loading ? 'Setting up...' : 'Get Started 🐝'}
                </button>
              </>
            )}
          </>
        )}

        {/* ── PHONE OTP FLOW ── */}
        {mode === 'phone' && (
          <>
            {step === 1 && (
              <>
                <h2 style={{ fontSize: '16px', color: '#1C1917', margin: '0 0 1rem', fontWeight: '700' }}>Sign in with Phone OTP</h2>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ padding: '11px 14px', background: '#FEF3C7', borderRadius: '10px', border: '1px solid #FDE68A', color: '#D97706', fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap' }}>+91</div>
                  <input placeholder="10-digit number" value={phone} onChange={e => setPhone(e.target.value)} maxLength={10}
                    style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
                </div>
                {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}
                <div id="recaptcha-container" ref={recaptchaRef} style={{ marginBottom: '10px' }} />
                <button onClick={sendPhoneOtp} disabled={loading} style={btnStyle}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
                <button onClick={() => switchMode('login')} style={{ ...btnStyle, background: 'none', color: '#B45309', border: 'none', marginBottom: 0 }}>
                  ← Back
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <h2 style={{ fontSize: '16px', color: '#1C1917', margin: '0 0 4px', fontWeight: '700' }}>Enter OTP</h2>
                <p style={{ color: '#B45309', fontSize: '13px', margin: '0 0 1rem' }}>Sent to +91 {phone}</p>
                <input placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '0.3em', fontWeight: '700' }} />
                {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}
                <button onClick={verifyPhoneOtp} disabled={loading} style={btnStyle}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button onClick={() => { setStep(1); setOtp(''); resetMsgs() }} style={{ ...btnStyle, background: 'none', color: '#B45309', border: 'none', marginBottom: 0 }}>
                  ← Change number
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <h2 style={{ fontSize: '16px', color: '#1C1917', margin: '0 0 4px', fontWeight: '700' }}>Complete your profile</h2>
                <p style={{ color: '#B45309', fontSize: '13px', margin: '0 0 1rem' }}>Almost there 🐝</p>
                <input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                  <option value="student">I am a Student</option>
                  <option value="owner">I am a Study Room Owner</option>
                </select>
                {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}
                <button onClick={completePhoneRegister} disabled={loading} style={btnStyle}>
                  {loading ? 'Setting up...' : 'Get Started 🐝'}
                </button>
              </>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default Login