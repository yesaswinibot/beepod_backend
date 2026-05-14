import { useState, useEffect, useRef } from 'react'

const API = 'https://beepodbackend-production.up.railway.app'
const MAX_RADIUS_KM = 5

// ── Tokens ────────────────────────────────────────────────
const C = {
  ink: '#0F0E0C', ink2: '#1B1813', ink3: '#2A2519',
  paper: '#FBF7EE', paper2: '#F4EBD6', paper3: '#EADFC2',
  h50: '#FFF6DC', h100: '#FFE8A8', h200: '#FFD361',
  h300: '#F4B928', h400: '#D99211', h500: '#A86A07',
  buzz: '#FF2E7E', lime: '#C8FF3C',
  line: 'rgba(15,14,12,.10)', line2: 'rgba(15,14,12,.06)',
  mute: 'rgba(15,14,12,.55)', mute2: 'rgba(15,14,12,.40)',
}

const VIBE_COLOR = {
  'verified': C.lime,
  'pending': C.h300,
}

// ── Distance helpers ─────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function bearingDeg(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (Math.atan2(y, x) * 180) / Math.PI
}

// ── SVG helpers ─────────────────────────
function hexPath(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return 'M' + pts.map(p => p.join(',')).join(' L ') + ' Z'
}

function HoneycombDefs() {
  return (
    <defs>
      <pattern id="combPattern" width="34" height="58.88" patternUnits="userSpaceOnUse">
        <path d={hexPath(17, 16, 16)} fill="none" stroke="rgba(15,14,12,.05)" strokeWidth=".8" />
        <path d={hexPath(0, 45.44, 16)} fill="none" stroke="rgba(15,14,12,.05)" strokeWidth=".8" />
        <path d={hexPath(34, 45.44, 16)} fill="none" stroke="rgba(15,14,12,.05)" strokeWidth=".8" />
      </pattern>
      <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={C.h300} stopOpacity="0" />
        <stop offset="70%" stopColor={C.h300} stopOpacity=".22" />
        <stop offset="100%" stopColor={C.h200} stopOpacity=".7" />
      </radialGradient>
      <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={C.h200} stopOpacity=".55" />
        <stop offset="100%" stopColor={C.h200} stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

// ── Radar ─────────────────────────
function Radar({ pods, selected, onSelect }) {
  const size = 340
  const cx = size / 2, cy = size / 2
  const [angle, setAngle] = useState(0)

  useEffect(() => {
    let raf
    const tick = () => { setAngle(a => (a + 0.6) % 360); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const rings = [60, 110, 160, 210, 260]
  const maxR = 260

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <HoneycombDefs />
        <circle cx={cx} cy={cy} r={size / 2 - 4} fill={C.paper} />
        <circle cx={cx} cy={cy} r={size / 2 - 4} fill="url(#combPattern)" />

        {rings.map((r, i) => (
          <path key={i} d={hexPath(cx, cy, r)} fill="none"
            stroke={i === rings.length - 1 ? C.ink : C.line}
            strokeWidth={i === rings.length - 1 ? 1.4 : 1}
            strokeDasharray={i === rings.length - 1 ? '0' : '3 4'} />
        ))}

        <g transform={`rotate(${angle} ${cx} ${cy})`}>
          <path d={`M${cx},${cy} L${cx + 270 * Math.cos(-Math.PI / 2)},${cy + 270 * Math.sin(-Math.PI / 2)} A270,270 0 0,1 ${cx + 270 * Math.cos(-Math.PI / 2 + Math.PI / 2.5)},${cy + 270 * Math.sin(-Math.PI / 2 + Math.PI / 2.5)} Z`}
            fill="url(#sweepGrad)" />
          <line x1={cx} y1={cy} x2={cx} y2={cy - 270} stroke={C.h400} strokeWidth="1.2" strokeOpacity=".5" />
        </g>

        {rings.map((r, i) => (
          <text key={i} x={cx + 4} y={cy - r + 11}
            fontFamily="monospace" fontSize="9"
            fill={C.mute2} letterSpacing=".1em">
            {(i + 1) + 'km'}
          </text>
        ))}

        {['N', 'E', 'S', 'W'].map((d, i) => {
          const a = (Math.PI / 2) * i - Math.PI / 2
          const x = cx + (size / 2 - 14) * Math.cos(a)
          const y = cy + (size / 2 - 14) * Math.sin(a) + 3
          return <text key={d} x={x} y={y} textAnchor="middle"
            fontFamily="monospace" fontSize="9"
            fill={d === 'N' ? C.ink : C.mute2} fontWeight="600" letterSpacing=".15em">{d}</text>
        })}

        <circle cx={cx} cy={cy} r="20" fill="url(#dotGlow)">
          <animate attributeName="r" values="14;26;14" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={cy} r="6" fill={C.ink} />
        <circle cx={cx} cy={cy} r="2.2" fill={C.h200} />

        {pods.map(p => {
          const a = p.angleDeg * Math.PI / 180 - Math.PI / 2
          const ringR = Math.min((p.distKm / MAX_RADIUS_KM) * maxR, maxR)
          const x = cx + ringR * Math.cos(a)
          const y = cy + ringR * Math.sin(a)
          const isSel = selected === p.id
          const fill = isSel ? C.ink : C.h200
          const stroke = isSel ? C.h200 : C.ink
          return (
            <g key={p.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(p.id)}>
              <path d={hexPath(x, y, 16)} fill={C.h300} opacity=".25">
                <animate attributeName="opacity" values=".35;0;.35" dur="2.4s" begin={(p.distKm * 0.2) + 's'} repeatCount="indefinite" />
              </path>
              <path d={hexPath(x, y, 11)} fill={fill} stroke={stroke} strokeWidth="1.4" />
              {isSel && <path d={hexPath(x, y, 20)} fill="none" stroke={C.buzz} strokeWidth="1.4" />}
            </g>
          )
        })}
      </svg>

      <div style={{ position: 'absolute', bottom: 8, left: 10, fontFamily: 'monospace', fontSize: 9, color: C.mute2, letterSpacing: '.14em' }}>
        SCAN 5KM
      </div>
      <div style={{ position: 'absolute', bottom: 8, right: 10, fontFamily: 'monospace', fontSize: 9, color: C.h400, letterSpacing: '.14em', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.lime, boxShadow: `0 0 6px ${C.lime}` }} />
        LIVE
      </div>
    </div>
  )
}

function Header({ city }) {
  return (
    <div style={{ padding: '32px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="34" height="34" viewBox="0 0 34 34">
          <path d={hexPath(17, 17, 16)} fill={C.ink} />
          <path d={hexPath(17, 17, 9)} fill={C.h200} />
          <circle cx="17" cy="17" r="3" fill={C.ink} />
        </svg>
        <div>
          <div style={{ fontSize: 22, lineHeight: 1, color: C.ink, fontWeight: 600 }}>
            beepod<span style={{ color: C.buzz, fontStyle: 'italic' }}>.</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.mute, letterSpacing: '.18em', marginTop: 3 }}>
            HIVE · {city || 'NEAR U'}
          </div>
        </div>
      </div>
      <button onClick={() => { localStorage.clear(); window.location.reload() }} style={{
        width: 36, height: 36, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.ink, border: `1px solid ${C.ink}`, cursor: 'pointer', padding: 0
      }} title="logout">
        <span style={{ fontSize: 16, fontStyle: 'italic', color: C.h200 }}>u</span>
      </button>
    </div>
  )
}

function StatStrip({ count }) {
  return (
    <div style={{
      margin: '8px 16px 14px', padding: '12px 14px',
      background: C.ink, color: C.h100, borderRadius: 18,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.lime, boxShadow: `0 0 10px ${C.lime}` }} />
        <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '.18em', color: '#c9b88b' }}>BUZZING NOW</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 600, color: C.h200, lineHeight: 1 }}>{count}</span>
        <span style={{ fontSize: 11, color: '#c9b88b' }}>pod{count !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

function PodRow({ p, selected, onSelect }) {
  const isSel = selected === p.id
  return (
    <div onClick={() => onSelect(p.id)} style={{
      padding: '13px 14px', borderRadius: 18, cursor: 'pointer',
      background: isSel ? C.ink : '#fff',
      color: isSel ? C.paper : C.ink,
      border: `1px solid ${isSel ? C.ink : C.line2}`,
      boxShadow: isSel ? '0 8px 24px rgba(15,14,12,.18)' : '0 1px 0 rgba(15,14,12,.03)',
      display: 'flex', alignItems: 'center', gap: 12,
      transition: 'all .18s ease'
    }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width="46" height="46" viewBox="0 0 46 46">
          <path d={hexPath(23, 23, 21)} fill={isSel ? C.h200 : C.paper2} />
          <path d={hexPath(23, 23, 14)} fill={isSel ? C.ink : '#fff'} stroke={isSel ? C.h300 : C.line} strokeWidth="1" />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📚</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
          <span style={{
            fontSize: 17, lineHeight: 1.15, fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0
          }}>{p.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
          <span style={{
            fontSize: 11, color: isSel ? C.h200 : C.mute, fontWeight: 500,
            overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            {p.city} · {p.amenities ? p.amenities.split(',')[0] : 'study room'}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 70 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: isSel ? C.h200 : C.ink, lineHeight: 1, fontStyle: 'italic' }}>₹{p.monthlyRate || '—'}</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 300, color: isSel ? 'rgba(255,246,220,.55)' : C.mute2, marginTop: 3 }}>
          per month
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: isSel ? 'rgba(255,246,220,.5)' : C.mute2, letterSpacing: '.14em', marginTop: 2 }}>
          {p.distKm < 1 ? `${Math.round(p.distKm * 1000)}M` : `${p.distKm.toFixed(1)}KM`}
        </div>
      </div>
    </div>
  )
}

function BottomSheet({ pods, selected, onSelect }) {
  const selectedPod = pods.find(p => p.id === selected)

  function waLink(p) {
    const msg = `hi! found ur study room "${p.name}" on beepod. interested 🐝`
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
  }

  return (
    <div style={{
      background: C.paper2,
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      padding: '14px 14px 28px',
      marginTop: 6,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ width: 42, height: 5, borderRadius: 99, background: 'rgba(15,14,12,.18)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '2px 6px 12px', gap: 12 }}>
        <span style={{ fontSize: 22, color: C.ink, whiteSpace: 'nowrap', fontWeight: 500 }}>
          pods near <em style={{ color: C.ink }}>u</em>
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: C.mute, letterSpacing: '.14em' }}>SORT · NEAR</span>
      </div>

      {pods.length === 0 ? (
        <div style={{ padding: '30px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 6 }}>🔍</div>
          <p style={{ fontSize: 14, color: C.ink, fontWeight: 600, margin: 0 }}>no pods spotted yet</p>
          <p style={{ fontSize: 12, color: C.mute, margin: '4px 0 0' }}>more r joining the hive everyday 🐝</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {pods.map(p => (
            <PodRow key={p.id} p={p} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}

      {selectedPod && (
        <div style={{ marginTop: 12, padding: '2px 4px', display: 'flex', gap: 8 }}>
          <a href={waLink(selectedPod)} target="_blank" rel="noreferrer" style={{
            flex: 1, height: 50, borderRadius: 16, border: 'none', cursor: 'pointer',
            background: C.buzz, color: '#fff', fontWeight: 600, fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 10px 22px rgba(255,46,126,.32), inset 0 1px 0 rgba(255,255,255,.25)',
            textDecoration: 'none'
          }}>
            chat on whatsapp
            <span style={{ fontSize: 18, fontStyle: 'italic' }}>→</span>
          </a>
          <button onClick={() => onSelect(null)} style={{
            width: 62, height: 50, borderRadius: 16, cursor: 'pointer',
            background: '#fff', border: `1px solid ${C.line}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2
          }} aria-label="close">
            <span style={{ fontSize: 20, color: C.ink, lineHeight: 1 }}>×</span>
            <span style={{ fontSize: 8, color: C.mute, letterSpacing: '.04em' }}>close</span>
          </button>
        </div>
      )}
    </div>
  )
}

function StudentRadar() {
  const [userLocation, setUserLocation] = useState(null)
  const [allSpaces, setAllSpaces] = useState([])
  const [pods, setPods] = useState([])
  const [selected, setSelected] = useState(null)
  const [locationError, setLocationError] = useState('')

  useEffect(() => {
    fetch(`${API}/api/spaces/verified`)
      .then(r => r.json())
      .then(data => setAllSpaces(data))
      .catch(() => {
        fetch(`${API}/api/spaces`).then(r => r.json()).then(setAllSpaces).catch(() => {})
      })

    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('enable location to find pods near u')
    )
  }, [])

  useEffect(() => {
    if (!userLocation || allSpaces.length === 0) return
    const computed = allSpaces
      .filter(s => s.latitude && s.longitude)
      .map(s => ({
        ...s,
        distKm: haversineKm(userLocation.lat, userLocation.lng, s.latitude, s.longitude),
        angleDeg: bearingDeg(userLocation.lat, userLocation.lng, s.latitude, s.longitude)
      }))
      .filter(s => s.distKm <= MAX_RADIUS_KM)
      .sort((a, b) => a.distKm - b.distKm)
    setPods(computed)
    if (computed.length > 0 && !selected) setSelected(computed[0].id)
  }, [userLocation, allSpaces])

  const city = pods[0]?.city || ''

  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: `linear-gradient(180deg, ${C.paper} 0%, ${C.paper} 50%, ${C.paper2} 100%)`,
      fontFamily: '"Plus Jakarta Sans", "Geist", sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }}>
      <Header city={city} />
      <StatStrip count={pods.length} />

      {locationError && (
        <div style={{
          margin: '0 16px 14px', padding: '12px 14px',
          background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C',
          borderRadius: 14, fontSize: 13, textAlign: 'center'
        }}>
          📍 {locationError}
        </div>
      )}

      <div style={{ margin: '10px 16px 0', position: 'relative' }}>
        <div style={{
          borderRadius: 28, padding: '14px 6px 8px',
          background: `linear-gradient(180deg, #fff 0%, ${C.h50} 100%)`,
          border: `1px solid ${C.line2}`,
          boxShadow: '0 18px 40px rgba(15,14,12,.08), inset 0 1px 0 rgba(255,255,255,.8)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 12, left: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d={hexPath(5, 5, 4.5)} fill={C.ink} /></svg>
            <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.18em', color: C.mute2 }}>RADAR · 5KM</span>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 14 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '.14em', color: C.h400 }}>HONEYCOMB · LIVE</span>
          </div>
          <div style={{ marginTop: 18 }}>
            <Radar pods={pods} selected={selected} onSelect={setSelected} />
          </div>
        </div>
      </div>

      <BottomSheet pods={pods} selected={selected} onSelect={setSelected} />
    </div>
  )
}

export default StudentRadar