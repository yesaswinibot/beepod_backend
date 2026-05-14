import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { auth } from '../firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const API = 'https://beepodbackend-production.up.railway.app'

// ── color tokens ─────────────────────────────────
const HONEY = '#F5B324'
const HONEY_DEEP = '#E89B11'
const HONEY_SOFT = '#FFE9A8'
const CREAM_BG = '#FFF6E0'
const CREAM = '#FFFCF2'
const INK = '#2A1F12'
const INK_SOFT = '#6B5A40'
const INK_MUTED = '#9A8869'
const BORDER = 'rgba(42, 31, 18, 0.10)'

// ── icons ─────────────────────────────────
const Icon = {
  mail: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="M3.5 7l8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  lock: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><rect x="4" y="11" width="16" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.6" /><path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  eye: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>,
  eyeOff: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M10.6 6.1A10 10 0 0112 6c6.5 0 10 6 10 6a17 17 0 01-3.1 3.8M6.6 6.6A17 17 0 002 12s3.5 6 10 6a10 10 0 004.4-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M9.9 9.9a3 3 0 004.2 4.2" stroke="currentColor" strokeWidth="1.6" /></svg>,
  phone: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A14 14 0 013 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  arrow: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  check: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  user: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" /><path d="M4 21a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  back: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

// ── bee mascot ────────────────────────────────────────────────
function Bee({ size = 44, happy = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id="bodyG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#FFD66A" />
          <stop offset="1" stopColor="#E89B11" />
        </linearGradient>
      </defs>
      <g style={{ transformOrigin: '20px 20px', animation: 'wingL 0.10s ease-in-out infinite' }}>
        <ellipse cx="18" cy="20" rx="12" ry="8" fill="rgba(255,255,255,0.75)" stroke="rgba(42,31,18,0.15)" strokeWidth="1" />
      </g>
      <g style={{ transformOrigin: '40px 20px', animation: 'wingR 0.10s ease-in-out infinite' }}>
        <ellipse cx="42" cy="20" rx="12" ry="8" fill="rgba(255,255,255,0.75)" stroke="rgba(42,31,18,0.15)" strokeWidth="1" />
      </g>
      <ellipse cx="30" cy="36" rx="15" ry="11" fill="url(#bodyG)" />
      <path d="M22 30 q-1 6 0 12" stroke="#1a1208" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M30 28 q-1 8 0 16" stroke="#1a1208" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M38 30 q1 6 0 12" stroke="#1a1208" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <circle cx="45" cy="32" r="7" fill="#1a1208" />
      {happy ? (
        <>
          <path d="M44 31 q1.5 -2 3 0" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M47 31 q1.5 -2 3 0" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="46" cy="31" r="1.3" fill="#fff" />
          <circle cx="49" cy="31" r="1" fill="#fff" opacity="0.6" />
        </>
      )}
      <circle cx="41" cy="36" r="1.8" fill="#ff8da3" opacity="0.7" />
      <path d="M44 26 q0 -4 3 -6" stroke="#1a1208" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M48 26 q1 -4 5 -5" stroke="#1a1208" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="47" cy="20" r="1.4" fill="#1a1208" />
      <circle cx="53" cy="21" r="1.4" fill="#1a1208" />
      <ellipse cx="24" cy="32" rx="4" ry="2.5" fill="rgba(255,255,255,0.45)" />
    </svg>
  )
}

// ── logo ───────────────────────────────────
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: 36, height: 40 }}>
        <svg width="36" height="40" viewBox="0 0 38 42">
          <defs>
            <linearGradient id="hexgL" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor={INK} />
              <stop offset="1" stopColor="#0E0A06" />
            </linearGradient>
          </defs>
          <path d="M19 1 L36 11 L36 31 L19 41 L2 31 L2 11 Z" fill="url(#hexgL)" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: '#FFD66A', fontWeight: 700, letterSpacing: -0.5
        }}>b</div>
      </div>
      <span style={{ fontSize: 20, fontWeight: 600, color: INK, letterSpacing: -0.8 }}>beepod</span>
    </div>
  )
}

// ── decorative honeycomb ───────────────────────────
function HexCell({ x, y, size = 24, active, delay = 0 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size * 1.15,
      transition: `all 0.45s cubic-bezier(.4,1.6,.5,1) ${delay}ms`,
      transform: active ? 'scale(1.1)' : 'scale(1)'
    }}>
      <svg viewBox="0 0 40 46" width="100%" height="100%">
        <path d="M20 1 L37 11 L37 35 L20 45 L3 35 L3 11 Z"
          fill={active ? HONEY : 'transparent'}
          stroke={active ? HONEY_DEEP : 'rgba(245,179,36,0.35)'}
          strokeWidth="1.5"
          style={{ transition: 'fill 0.4s, stroke 0.4s' }} />
        {active && <path d="M20 6 L32 13 L32 29 L20 36 L8 29 L8 13 Z" fill="rgba(255,255,255,0.35)" />}
      </svg>
    </div>
  )
}

function HoneyBackdrop({ progress }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(140% 90% at 80% 0%, ${HONEY_SOFT} 0%, ${CREAM_BG} 45%, ${CREAM_BG} 100%)`
      }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
        <defs>
          <pattern id="hexL" width="56" height="64" patternUnits="userSpaceOnUse">
            <path d="M28 3 L52 17 L52 47 L28 61 L4 47 L4 17 Z" fill="none" stroke="rgba(232,155,17,0.18)" strokeWidth="1.1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexL)" />
      </svg>
      <div style={{
        position: 'absolute', top: -120, right: -80, width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,214,106,0.55) 0%, rgba(255,214,106,0) 70%)',
        filter: 'blur(10px)'
      }} />
      <div style={{
        position: 'absolute', bottom: -160, left: -80, width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,179,36,0.25) 0%, rgba(245,179,36,0) 70%)',
        filter: 'blur(20px)'
      }} />

      <HexCell x={28} y={108} size={18} active={progress >= 1} />
      <HexCell x={56} y={92} size={18} active={progress >= 2} delay={80} />
      <HexCell x={84} y={108} size={18} active={progress >= 3} delay={160} />

      {[
        { l: '15%', t: '60%', d: '0s', s: 4 },
        { l: '85%', t: '45%', d: '1.5s', s: 3 },
        { l: '40%', t: '78%', d: '0.8s', s: 5 },
        { l: '70%', t: '82%', d: '2.2s', s: 3 },
        { l: '10%', t: '40%', d: '3s', s: 4 }
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: p.l, top: p.t,
          width: p.s, height: p.s, borderRadius: '50%',
          background: HONEY_DEEP, opacity: 0.4,
          animation: `pollenFloat 7s ease-in-out infinite ${p.d}`
        }} />
      ))}
    </div>
  )
}

// ── flying bee ───────────────────────────
function FlyingBee({ targetRef, containerRef }) {
  const [pos, setPos] = useState({ x: 60, y: 120 })
  const [happy, setHappy] = useState(false)
  const idleAngle = useRef(0)

  useEffect(() => {
    if (!targetRef?.current || !containerRef?.current) return
    const t = targetRef.current.getBoundingClientRect()
    const c = containerRef.current.getBoundingClientRect()
    setPos({ x: t.right - c.left - 24, y: t.top - c.top - 28 })
    setHappy(true)
    const id = setTimeout(() => setHappy(false), 800)
    return () => clearTimeout(id)
  }, [targetRef])

  useEffect(() => {
    if (targetRef?.current) return
    if (!containerRef?.current) return
    const c = containerRef.current.getBoundingClientRect()
    let raf
    const tick = () => {
      idleAngle.current += 0.012
      const cx = c.width * 0.78
      const cy = 110
      setPos({
        x: cx + Math.cos(idleAngle.current) * 30,
        y: cy + Math.sin(idleAngle.current * 1.3) * 18
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [targetRef])

  return (
    <div style={{
      position: 'absolute', left: 0, top: 0,
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      transition: 'transform 0.7s cubic-bezier(.5,1.4,.4,1)',
      pointerEvents: 'none', zIndex: 3
    }}>
      <div style={{ animation: 'beeBob 0.9s ease-in-out infinite' }}>
        <Bee size={44} happy={happy} />
      </div>
    </div>
  )
}

// ── input field ───────────────────────────
const Field = forwardRef(({ icon, type = 'text', placeholder, value, onChange, trailing, onFocusField, autoFocus = false }, ref) => {
  const [focus, setFocus] = useState(false)
  const inputRef = useRef(null)
  useImperativeHandle(ref, () => inputRef.current)
  return (
    <div style={{
      position: 'relative',
      borderRadius: 14,
      background: focus ? '#fff' : 'rgba(255,255,255,0.7)',
      border: `1.5px solid ${focus ? HONEY : BORDER}`,
      boxShadow: focus ? `0 0 0 4px rgba(245,179,36,0.18), 0 4px 14px rgba(232,155,17,0.10)` : '0 1px 0 rgba(255,255,255,0.6) inset',
      transition: 'all 0.2s ease',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 14px', height: 52
    }}>
      <span style={{ color: focus ? HONEY_DEEP : INK_MUTED, display: 'flex', transition: 'color 0.18s' }}>
        {icon}
      </span>
      <input
        ref={inputRef}
        type={type}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => { setFocus(true); onFocusField && onFocusField(inputRef) }}
        onBlur={() => setFocus(false)}
        autoComplete="off"
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: INK, fontSize: 15, fontFamily: 'inherit',
          letterSpacing: type === 'password' && value ? '0.2em' : 'normal'
        }}
      />
      {trailing}
    </div>
  )
})

function LiveBadge() {
  const [n, setN] = useState(2418)
  useEffect(() => {
    const id = setInterval(() => setN(v => v + (Math.random() > 0.5 ? 1 : -1)), 1800)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '5px 11px 5px 9px', borderRadius: 100,
      background: '#fff', border: '1px solid rgba(42,31,18,0.08)',
      fontSize: 11.5, color: INK, fontWeight: 500,
      boxShadow: '0 1px 2px rgba(120,80,20,0.06)'
    }}>
      <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
        <span style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: '50%', animation: 'ping 1.6s ease-out infinite' }} />
        <span style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: '50%' }} />
      </span>
      {n.toLocaleString()} locked in
    </div>
  )
}

// ────────────────────────────────────────────────────
// MAIN LOGIN
// ────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // login | register | email-otp | phone
  const [step, setStep] = useState(1)
  const [activeRef, setActiveRef] = useState(null)
  const [progress, setProgress] = useState(0)
  const containerRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmResult, setConfirmResult] = useState(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const recaptchaRef = useRef(null)

  useEffect(() => {
    const validEmail = /^\S+@\S+\.\S+$/.test(email)
    let p = 0
    if (validEmail || phone.length >= 10) p = 1
    if ((validEmail && password.length >= 4) || otp.length >= 3) p = 2
    if (success) p = 3
    setProgress(p)
  }, [email, password, phone, otp, success])

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear() } catch {}
        window.recaptchaVerifier = null
      }
    }
  }, [])

  useEffect(() => {
    const onFocusOut = () => {
      setTimeout(() => {
        if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
          setActiveRef(null)
        }
      }, 50)
    }
    document.addEventListener('focusout', onFocusOut)
    return () => document.removeEventListener('focusout', onFocusOut)
  }, [])

  function resetMsgs() { setError(''); setInfo('') }
  function switchMode(m) { setMode(m); setStep(1); setOtp(''); setPassword(''); resetMsgs() }

  function storeAndGo(data) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('name', data.name)
    localStorage.setItem('userId', data.userId)
    setSuccess(true)
    setTimeout(() => onLogin(data.role), 600)
  }

  async function handleEmailSubmit() {
    resetMsgs()
    if (!email || !password) { setError('Please fill all fields.'); return }
    setLoading(true)
    const url = mode === 'register' ? `${API}/api/auth/register` : `${API}/api/auth/login`
    const body = mode === 'register' ? { name, email, password, role, phone: '' } : { email, password }
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      storeAndGo(data)
    } catch { setError('Something went wrong. Try again.'); setLoading(false) }
  }

  async function sendEmailOtp() {
    resetMsgs()
    if (!email || !email.includes('@')) { setError('Enter a valid email.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/send-email-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setInfo(`code sent to ${email}`)
      setStep(2)
    } catch { setError('Failed to send code. Try again.') }
    setLoading(false)
  }

  async function verifyEmailOtp() {
    resetMsgs()
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit code.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/verify-email-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      if (data.exists) storeAndGo(data)
      else setStep(3)
    } catch { setError('Verification failed. Try again.') }
    setLoading(false)
  }

  async function completeEmailRegister() {
    resetMsgs()
    if (!name) { setError('Please enter your name.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, phone: '', password: `otp_${Date.now()}` })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      storeAndGo(data)
    } catch { setError('Registration failed. Try again.'); setLoading(false) }
  }

  async function sendPhoneOtp() {
    resetMsgs()
    if (!phone || phone.length < 10) { setError('Enter a valid 10-digit phone number.'); return }
    setLoading(true)
    try {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear() } catch {}
        window.recaptchaVerifier = null
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible', callback: () => {} })
      await window.recaptchaVerifier.render()
      const fullPhone = `+91${phone.replace(/\D/g, '')}`
      const result = await signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier)
      setConfirmResult(result)
      setStep(2)
    } catch (e) { setError(`Failed to send code. ${e.message || 'Try again.'}`) }
    setLoading(false)
  }

  async function verifyPhoneOtp() {
    resetMsgs()
    if (!otp || otp.length !== 6) { setError('Enter the 6-digit code.'); return }
    setLoading(true)
    try {
      await confirmResult.confirm(otp)
      const res = await fetch(`${API}/api/auth/check-phone?phone=${phone}`)
      const data = await res.json()
      if (data.exists) storeAndGo(data)
      else setStep(3)
    } catch { setError('Invalid code. Please try again.') }
    setLoading(false)
  }

  async function completePhoneRegister() {
    resetMsgs()
    if (!name) { setError('Please enter your name.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, role, email: `${phone}@beepod.in`, password: `phone_${phone}` })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      storeAndGo(data)
    } catch { setError('Registration failed. Try again.'); setLoading(false) }
  }

  const headline = mode === 'login' || mode === 'register' ? (
    <>welcome to the <span style={{ fontStyle: 'italic', color: HONEY_DEEP }}>hive</span></>
  ) : mode === 'email-otp' ? (
    <>sign in with <span style={{ fontStyle: 'italic', color: HONEY_DEEP }}>email</span></>
  ) : (
    <>sign in with <span style={{ fontStyle: 'italic', color: HONEY_DEEP }}>phone</span></>
  )

  const subtitle = step === 1 ? 'find your focus. own your time.' :
    step === 2 ? `enter the 6-digit code we sent to ${mode === 'phone' ? '+91 ' + phone : email}` :
    'just a couple more details'

  return (
    <div ref={containerRef} style={{
      position: 'relative',
      minHeight: '100vh',
      fontFamily: '"Plus Jakarta Sans", "Geist", -apple-system, system-ui, sans-serif',
      color: INK,
      background: CREAM_BG,
      overflow: 'hidden'
    }}>
      <HoneyBackdrop progress={progress} />
      <FlyingBee targetRef={activeRef} containerRef={containerRef} />

      <div style={{
        position: 'relative', zIndex: 2,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '40px 20px 26px',
        maxWidth: 440,
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <Logo />
          <LiveBadge />
        </div>

        <div style={{ marginBottom: 22, paddingRight: 60 }}>
          <h1 style={{
            margin: 0,
            fontSize: 34,
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: -1.2,
            color: INK
          }}>
            {headline}
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 14.5, color: INK_SOFT, lineHeight: 1.45 }}>
            {subtitle}
          </p>
        </div>

        <div style={{
          position: 'relative',
          borderRadius: 24,
          padding: '22px 20px 20px',
          background: '#fff',
          border: '1px solid rgba(42,31,18,0.06)',
          boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 20px 40px -10px rgba(120, 80, 20, 0.18), 0 6px 14px rgba(120, 80, 20, 0.08)'
        }}>

          {/* tabs only on login/register step 1 */}
          {(mode === 'login' || mode === 'register') && step === 1 && (
            <div style={{
              position: 'relative',
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              background: '#FBF3DE',
              borderRadius: 12, padding: 4, marginBottom: 18
            }}>
              <div style={{
                position: 'absolute', top: 4, bottom: 4,
                left: mode === 'login' ? 4 : 'calc(50%)',
                width: 'calc(50% - 4px)',
                background: '#fff',
                borderRadius: 9,
                transition: 'left 0.32s cubic-bezier(.4,1.4,.5,1)',
                boxShadow: '0 2px 6px rgba(120,80,20,0.12), 0 0 0 1px rgba(245,179,36,0.25)'
              }} />
              {[['login', 'log in'], ['register', 'sign up']].map(([k, label]) => (
                <button key={k} type="button" onClick={() => switchMode(k)} style={{
                  position: 'relative', zIndex: 1, background: 'transparent', border: 'none',
                  padding: '10px 0', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 14, fontWeight: 600,
                  color: mode === k ? INK : INK_MUTED,
                  transition: 'color 0.2s'
                }}>{label}</button>
              ))}
            </div>
          )}

          {/* back button for non-default modes */}
          {(mode === 'email-otp' || mode === 'phone') && (
            <button onClick={() => switchMode('login')} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: INK_SOFT, fontSize: 13, fontWeight: 500,
              marginBottom: 14, padding: 0, fontFamily: 'inherit'
            }}>
              <Icon.back /> back
            </button>
          )}

          {/* ───── LOGIN / REGISTER ───── */}
          {(mode === 'login' || mode === 'register') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mode === 'register' && (
                <>
                  <Field
                    icon={<Icon.user />}
                    placeholder="what should we call u?"
                    value={name}
                    onChange={setName}
                    onFocusField={setActiveRef}
                  />
                  <select value={role} onChange={e => setRole(e.target.value)} style={{
                    height: 52, borderRadius: 14, padding: '0 14px',
                    border: `1.5px solid ${BORDER}`, background: 'rgba(255,255,255,0.7)',
                    color: INK, fontSize: 15, fontFamily: 'inherit', outline: 'none', cursor: 'pointer'
                  }}>
                    <option value="student">i'm a student</option>
                    <option value="owner">i'm a study room owner</option>
                  </select>
                </>
              )}
              <Field
                icon={<Icon.mail />}
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={setEmail}
                onFocusField={setActiveRef}
              />
              <Field
                icon={<Icon.lock />}
                type={showPwd ? 'text' : 'password'}
                placeholder="password"
                value={password}
                onChange={setPassword}
                onFocusField={setActiveRef}
                trailing={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: INK_MUTED, display: 'flex', padding: 4
                  }}>
                    {showPwd ? <Icon.eyeOff /> : <Icon.eye />}
                  </button>
                }
              />

              {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>{error}</div>}

              <button onClick={handleEmailSubmit} disabled={loading} className="primary-btn" style={{
                marginTop: 6, height: 52, borderRadius: 14, border: 'none', cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: success ? '#0f5132' : CREAM,
                background: success ? '#bbf7d0' : INK,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s', opacity: (email && password) || loading || success ? 1 : 0.55
              }}>
                {loading ? <><span className="spinner" /> letting u in…</> :
                 success ? <><Icon.check /> ur in 🐝</> :
                 <>{mode === 'login' ? 'lock in' : 'join the hive'} <Icon.arrow /></>}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 2px' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(42,31,18,0.10)' }} />
                <span style={{ fontSize: 12, color: INK_MUTED }}>or, if ur lazy</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(42,31,18,0.10)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => switchMode('email-otp')} className="alt-btn" style={altBtnStyle}>
                  <Icon.mail /> email code
                </button>
                <button onClick={() => switchMode('phone')} className="alt-btn" style={altBtnStyle}>
                  <Icon.phone /> text code
                </button>
              </div>
            </div>
          )}

          {/* ───── EMAIL OTP ───── */}
          {mode === 'email-otp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {step === 1 && (
                <>
                  <Field icon={<Icon.mail />} placeholder="name@example.com" type="email" value={email} onChange={setEmail} onFocusField={setActiveRef} />
                  {error && <div style={errorStyle}>{error}</div>}
                  <button onClick={sendEmailOtp} disabled={loading} className="primary-btn" style={primaryBtnStyle(email, loading, success)}>
                    {loading ? <><span className="spinner" /> sending…</> : <>send code <Icon.arrow /></>}
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <Field icon={<Icon.lock />} placeholder="000000" value={otp} onChange={v => setOtp(v.replace(/\D/g, ''))} onFocusField={setActiveRef} autoFocus />
                  {info && <div style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', color: '#15803D', padding: '10px 14px', borderRadius: 10, fontSize: 13 }}>{info}</div>}
                  {error && <div style={errorStyle}>{error}</div>}
                  <button onClick={verifyEmailOtp} disabled={loading} className="primary-btn" style={primaryBtnStyle(otp.length === 6, loading, success)}>
                    {loading ? <><span className="spinner" /> verifying…</> : success ? <><Icon.check /> ur in 🐝</> : <>verify <Icon.arrow /></>}
                  </button>
                  <button onClick={() => { setStep(1); setOtp(''); resetMsgs() }} style={textBtnStyle}>use different email</button>
                </>
              )}
              {step === 3 && (
                <>
                  <Field icon={<Icon.user />} placeholder="ur name" value={name} onChange={setName} onFocusField={setActiveRef} />
                  <select value={role} onChange={e => setRole(e.target.value)} style={selectStyle}>
                    <option value="student">i'm a student</option>
                    <option value="owner">i'm a study room owner</option>
                  </select>
                  {error && <div style={errorStyle}>{error}</div>}
                  <button onClick={completeEmailRegister} disabled={loading} className="primary-btn" style={primaryBtnStyle(name, loading, success)}>
                    {loading ? <><span className="spinner" /> setting up…</> : <>continue <Icon.arrow /></>}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ───── PHONE OTP ───── */}
          {mode === 'phone' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {step === 1 && (
                <>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{
                      height: 52, display: 'flex', alignItems: 'center', padding: '0 14px',
                      borderRadius: 14, background: 'rgba(255,255,255,0.7)',
                      border: `1.5px solid ${BORDER}`, color: INK, fontWeight: 600, fontSize: 15
                    }}>+91</div>
                    <div style={{ flex: 1 }}>
                      <Field icon={<Icon.phone />} placeholder="98765 43210" value={phone} onChange={v => setPhone(v.replace(/\D/g, ''))} onFocusField={setActiveRef} />
                    </div>
                  </div>
                  {error && <div style={errorStyle}>{error}</div>}
                  <div id="recaptcha-container" ref={recaptchaRef}></div>
                  <button onClick={sendPhoneOtp} disabled={loading} className="primary-btn" style={primaryBtnStyle(phone.length >= 10, loading, success)}>
                    {loading ? <><span className="spinner" /> sending…</> : <>send code <Icon.arrow /></>}
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <Field icon={<Icon.lock />} placeholder="000000" value={otp} onChange={v => setOtp(v.replace(/\D/g, ''))} onFocusField={setActiveRef} autoFocus />
                  {error && <div style={errorStyle}>{error}</div>}
                  <button onClick={verifyPhoneOtp} disabled={loading} className="primary-btn" style={primaryBtnStyle(otp.length === 6, loading, success)}>
                    {loading ? <><span className="spinner" /> verifying…</> : success ? <><Icon.check /> ur in 🐝</> : <>verify <Icon.arrow /></>}
                  </button>
                  <button onClick={() => { setStep(1); setOtp(''); resetMsgs() }} style={textBtnStyle}>use different number</button>
                </>
              )}
              {step === 3 && (
                <>
                  <Field icon={<Icon.user />} placeholder="ur name" value={name} onChange={setName} onFocusField={setActiveRef} />
                  <select value={role} onChange={e => setRole(e.target.value)} style={selectStyle}>
                    <option value="student">i'm a student</option>
                    <option value="owner">i'm a study room owner</option>
                  </select>
                  {error && <div style={errorStyle}>{error}</div>}
                  <button onClick={completePhoneRegister} disabled={loading} className="primary-btn" style={primaryBtnStyle(name, loading, success)}>
                    {loading ? <><span className="spinner" /> setting up…</> : <>continue <Icon.arrow /></>}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 20, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 11, color: INK_MUTED, lineHeight: 1.5 }}>
            by continuing, u agree to our{' '}
            <a href="#" style={{ color: INK_SOFT, textDecoration: 'underline', textDecorationColor: 'rgba(245,179,36,0.5)' }}>terms</a>
            {' '}&middot;{' '}
            <a href="#" style={{ color: INK_SOFT, textDecoration: 'underline', textDecorationColor: 'rgba(245,179,36,0.5)' }}>privacy</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes wingL { 0%,100% { transform: rotate(-8deg) scaleY(1); } 50% { transform: rotate(-26deg) scaleY(0.65); } }
        @keyframes wingR { 0%,100% { transform: rotate(8deg) scaleY(1); } 50% { transform: rotate(26deg) scaleY(0.65); } }
        @keyframes beeBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes ping { 0% { transform: scale(1); opacity: 0.65; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes pollenFloat { 0%,100% { transform: translateY(0); opacity: 0.4; } 50% { transform: translateY(-30px); opacity: 0.7; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,252,242,0.25); border-top-color: ${CREAM}; animation: spin 0.7s linear infinite; }
        input::placeholder { color: ${INK_MUTED}; opacity: 1; }
        input::selection { background: rgba(245,179,36,0.35); }
        .primary-btn:not(:disabled):hover { background: #3a2a17 !important; }
        .primary-btn:active { transform: scale(0.985); }
        .alt-btn:hover { background: #fff !important; border-color: rgba(245,179,36,0.5) !important; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(120,80,20,0.08); }
        .alt-btn:active { transform: translateY(0); }
      `}</style>
    </div>
  )
}

const altBtnStyle = {
  height: 46, borderRadius: 12,
  background: '#FBF3DE',
  border: '1px solid rgba(42,31,18,0.06)',
  color: INK, cursor: 'pointer', fontFamily: 'inherit',
  fontSize: 13.5, fontWeight: 500,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'all 0.15s'
}

const errorStyle = { background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', padding: '10px 14px', borderRadius: 10, fontSize: 13 }

const textBtnStyle = {
  background: 'transparent', border: 'none', cursor: 'pointer', padding: 8,
  color: INK_SOFT, fontSize: 13, fontWeight: 500, fontFamily: 'inherit'
}

const selectStyle = {
  height: 52, borderRadius: 14, padding: '0 14px',
  border: `1.5px solid ${BORDER}`, background: 'rgba(255,255,255,0.7)',
  color: INK, fontSize: 15, fontFamily: 'inherit', outline: 'none', cursor: 'pointer'
}

const primaryBtnStyle = (ready, loading, success) => ({
  marginTop: 6, height: 52, borderRadius: 14, border: 'none', cursor: loading ? 'wait' : 'pointer',
  fontFamily: 'inherit', fontSize: 15, fontWeight: 600, color: success ? '#0f5132' : CREAM,
  background: success ? '#bbf7d0' : INK,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'all 0.2s', opacity: ready || loading || success ? 1 : 0.55
})

export default Login