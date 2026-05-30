import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API = 'http://52.66.199.64:8080'

const C = {
  ink: '#0F0E0C', paper: '#FBF7EE', paper2: '#F4EBD6',
  honey200: '#FFD361', honey300: '#F4B928', honey400: '#D99211',
  buzz: '#FF2E7E', lime: '#C8FF3C',
  mute: 'rgba(15,14,12,.55)',
  line: 'rgba(15,14,12,.10)',
}

function hexPath(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return 'M' + pts.join(' L') + ' Z'
}

function CheckIn() {
  const { spaceId } = useParams()
  const [space, setSpace] = useState(null)
  const [status, setStatus] = useState('idle') // idle | checking-in | checked-in | checking-out | checked-out | error
  const [error, setError] = useState('')
  const [attendance, setAttendance] = useState(null)
  const [time, setTime] = useState(new Date())

  const token = localStorage.getItem('token')
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('name')

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Fetch space info
  useEffect(() => {
    fetch(`${API}/api/spaces/${spaceId}`)
      .then(r => r.json())
      .then(setSpace)
      .catch(() => {})
  }, [spaceId])

  // Check if already checked in today
  useEffect(() => {
    if (!userId || !spaceId) return
    fetch(`${API}/api/attendance/today/${spaceId}`)
      .then(r => r.json())
      .then(data => {
        const mine = data.find(a => a.studentId === parseInt(userId) && !a.checkOutTime)
        if (mine) {
          setAttendance(mine)
          setStatus('checked-in')
        }
      })
      .catch(() => {})
  }, [userId, spaceId])

  async function handleCheckIn() {
    setError('')
    setStatus('checking-in')
    try {
      const res = await fetch(`${API}/api/attendance/checkin?studentId=${userId}&spaceId=${spaceId}`, { method: 'POST' })
      const data = await res.json()
      if (data.error) { setError(data.error); setStatus('error'); return }
      setAttendance(data.attendance)
      setStatus('checked-in')
    } catch { setError('Failed to check in. Try again.'); setStatus('error') }
  }

  async function handleCheckOut() {
    setError('')
    setStatus('checking-out')
    try {
      const res = await fetch(`${API}/api/attendance/checkout?studentId=${userId}&spaceId=${spaceId}`, { method: 'POST' })
      const data = await res.json()
      if (data.error) { setError(data.error); setStatus('error'); return }
      setAttendance(data.attendance)
      setStatus('checked-out')
    } catch { setError('Failed to check out. Try again.'); setStatus('error') }
  }

  const timeStr = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  const dateStr = time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // Not logged in
  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logoWrap}>
            <svg width="40" height="40" viewBox="0 0 34 34">
              <path d={hexPath(17, 17, 16)} fill={C.ink} />
              <path d={hexPath(17, 17, 9)} fill={C.honey200} />
              <circle cx="17" cy="17" r="3" fill={C.ink} />
            </svg>
          </div>
          <h1 style={styles.title}>sign in to check in</h1>
          <p style={styles.sub}>you need a BeePod account to mark attendance</p>
          <a href="/login" style={styles.primaryBtn}>sign in →</a>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <svg width="40" height="40" viewBox="0 0 34 34">
            <path d={hexPath(17, 17, 16)} fill={C.ink} />
            <path d={hexPath(17, 17, 9)} fill={C.honey200} />
            <circle cx="17" cy="17" r="3" fill={C.ink} />
          </svg>
        </div>

        {/* Space info */}
        <div style={styles.eyebrow}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.lime, boxShadow: `0 0 8px ${C.lime}`, display: 'inline-block' }} />
          LIVE · ATTENDANCE
        </div>

        <h1 style={styles.title}>{space?.name || 'Study Room'}</h1>
        <p style={styles.sub}>{space?.city || ''}{space?.address ? ` · ${space.address}` : ''}</p>

        {/* Clock */}
        <div style={styles.clock}>{timeStr}</div>
        <div style={styles.date}>{dateStr}</div>

        {/* Status */}
        <div style={{ marginTop: 24 }}>
          <div style={styles.userBadge}>
            <div style={styles.userAvatar}>{(userName || 'U')[0].toUpperCase()}</div>
            <span>{userName}</span>
          </div>
        </div>

        {/* Actions */}
        {status === 'idle' && (
          <button onClick={handleCheckIn} style={styles.checkInBtn}>
            check in →
          </button>
        )}

        {status === 'checking-in' && (
          <div style={styles.loadingBtn}>checking in...</div>
        )}

        {status === 'checked-in' && (
          <>
            <div style={styles.successBox}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>ur checked in!</div>
              <div style={{ fontSize: 13, color: C.mute, marginTop: 4 }}>
                since {attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
              </div>
            </div>
            <button onClick={handleCheckOut} style={styles.checkOutBtn}>
              check out →
            </button>
          </>
        )}

        {status === 'checking-out' && (
          <div style={styles.loadingBtn}>checking out...</div>
        )}

        {status === 'checked-out' && (
          <div style={styles.doneBox}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>👋</div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>see u tomorrow!</div>
            <div style={{ fontSize: 13, color: C.mute, marginTop: 4 }}>
              session: {attendance?.checkInTime ? new Date(attendance.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
              {' → '}
              {attendance?.checkOutTime ? new Date(attendance.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
            </div>
          </div>
        )}

        {(status === 'error' || error) && (
          <div style={styles.errorBox}>{error}</div>
        )}

        <div style={styles.footer}>
          powered by <span style={{ fontWeight: 700 }}>beepod<span style={{ color: C.buzz }}>.</span></span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${C.paper} 0%, ${C.paper2} 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
    fontFamily: '"Plus Jakarta Sans", "Geist", -apple-system, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 28,
    padding: '32px 28px 24px',
    width: '100%', maxWidth: 380,
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(15,14,12,.12), 0 0 0 1px rgba(15,14,12,.04)',
  },
  logoWrap: { marginBottom: 20 },
  eyebrow: {
    fontFamily: 'monospace', fontSize: 10,
    letterSpacing: '.24em', textTransform: 'uppercase',
    color: '#A86A07',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    marginBottom: 10,
  },
  title: {
    fontWeight: 800, fontSize: 24, letterSpacing: '-.03em',
    color: C.ink, margin: '0 0 6px',
  },
  sub: {
    fontSize: 14, color: C.mute, lineHeight: 1.4, margin: 0,
  },
  clock: {
    fontFamily: 'monospace', fontSize: 42, fontWeight: 700,
    letterSpacing: '-.02em', color: C.ink,
    marginTop: 24, lineHeight: 1,
  },
  date: {
    fontFamily: 'monospace', fontSize: 11,
    letterSpacing: '.14em', textTransform: 'uppercase',
    color: C.mute, marginTop: 6,
  },
  userBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    padding: '8px 16px 8px 8px',
    background: C.paper, borderRadius: 99,
    fontSize: 14, fontWeight: 600, color: C.ink,
  },
  userAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: C.ink, color: C.honey200,
    fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  checkInBtn: {
    width: '100%', marginTop: 20,
    padding: '16px 0', borderRadius: 16, border: 'none',
    background: C.ink, color: C.honey200,
    fontWeight: 700, fontSize: 16, fontFamily: 'inherit',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(15,14,12,.2)',
  },
  checkOutBtn: {
    width: '100%', marginTop: 12,
    padding: '14px 0', borderRadius: 16, border: `2px solid ${C.ink}`,
    background: 'transparent', color: C.ink,
    fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
    cursor: 'pointer',
  },
  loadingBtn: {
    width: '100%', marginTop: 20,
    padding: '16px 0', borderRadius: 16,
    background: C.paper2, color: C.mute,
    fontWeight: 600, fontSize: 15, textAlign: 'center',
  },
  successBox: {
    marginTop: 20, padding: '20px 16px',
    background: '#ECFDF5', borderRadius: 16,
    color: '#065F46',
  },
  doneBox: {
    marginTop: 20, padding: '20px 16px',
    background: C.paper, borderRadius: 16,
    color: C.ink,
  },
  errorBox: {
    marginTop: 16, padding: '12px 16px',
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: 12, color: '#B91C1C', fontSize: 13,
  },
  primaryBtn: {
    display: 'inline-block', marginTop: 20,
    padding: '14px 28px', borderRadius: 14,
    background: C.ink, color: C.honey200,
    fontWeight: 700, fontSize: 15, textDecoration: 'none',
    fontFamily: 'inherit',
  },
  footer: {
    marginTop: 24, paddingTop: 16,
    borderTop: `1px dashed ${C.line}`,
    fontSize: 11, color: C.mute,
  },
}

export default CheckIn