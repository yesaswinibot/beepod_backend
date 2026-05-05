import { useState, useEffect, useRef } from 'react'

const API = 'https://beepodbackend-production.up.railway.app'
const MAX_RADIUS_KM = 5
const RADAR_SIZE = 320

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getBearing(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return Math.atan2(y, x)
}

function StudentRadar() {
  const [userLocation, setUserLocation] = useState(null)
  const [spaces, setSpaces] = useState([])
  const [nearbySpaces, setNearbySpaces] = useState([])
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [locationError, setLocationError] = useState('')
  const [pulses, setPulses] = useState([])
  const [tick, setTick] = useState(0)
  const nearbyRef = useRef([])
  const animRef = useRef(null)
  const lastPulseRef = useRef(0)

  const center = RADAR_SIZE / 2
  const radarRadius = RADAR_SIZE / 2 - 16

  useEffect(() => {
    fetch(`${API}/api/spaces`)
      .then(r => r.json())
      .then(data => setSpaces(data))
      .catch(() => {})

    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Enable location to find nearby pods.')
    )
  }, [])

  useEffect(() => {
    if (!userLocation || spaces.length === 0) return
    const nearby = spaces
      .map(space => {
        const dist = haversineDistance(userLocation.lat, userLocation.lng, space.latitude, space.longitude)
        const bearing = getBearing(userLocation.lat, userLocation.lng, space.latitude, space.longitude)
        const r = Math.min(dist / (MAX_RADIUS_KM * 1000), 1) * radarRadius
        const x = center + r * Math.sin(bearing)
        const y = center - r * Math.cos(bearing)
        return { ...space, dist, bearing, x, y }
      })
      .filter(s => s.dist <= MAX_RADIUS_KM * 1000)
      .sort((a, b) => a.dist - b.dist)
    setNearbySpaces(nearby)
    nearbyRef.current = nearby
  }, [userLocation, spaces])

  // Animation loop
  useEffect(() => {
    let frame = 0
    const animate = () => {
      frame++
      setTick(frame)
      // Emit a new pulse every 90 frames (~1.5s at 60fps)
      if (frame - lastPulseRef.current > 90) {
        lastPulseRef.current = frame
        setPulses(prev => [...prev.filter(p => frame - p.born < 90), { id: frame, born: frame }])
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  function formatDist(m) {
    return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`
  }

  function waLink(space) {
    const msg = `Hi! I found your study room "${space.name}" on BeePod. I'd love to know more about available seats!`
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      backgroundColor: '#FFFBEB',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem 1rem'
    }}>
      <style>{`
        @keyframes blipPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pod-card:hover { background: #FEF3C7 !important; border-color: #F59E0B !important; }
        .wa-btn:hover { background: #1DA851 !important; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '32px', marginBottom: '4px' }}>🐝</div>
        <h1 style={{ color: '#92400E', margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>
          BeePod Radar
        </h1>
        <p style={{ color: '#B45309', margin: '4px 0 0', fontSize: '13px' }}>
          Finding study pods within {MAX_RADIUS_KM}km
        </p>
      </div>

      {locationError && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px',
          padding: '12px 16px', color: '#B91C1C', fontSize: '13px',
          maxWidth: '280px', textAlign: 'center', marginBottom: '1.5rem'
        }}>
          📍 {locationError}
        </div>
      )}

      {/* Radar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <svg width={RADAR_SIZE} height={RADAR_SIZE}>
          <defs>
            <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#FEF3C7" />
            </radialGradient>
            <filter id="blipShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background circle */}
          <circle cx={center} cy={center} r={radarRadius} fill="url(#radarBg)" stroke="#FDE68A" strokeWidth="2" />

          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((f, i) => (
            <circle key={f} cx={center} cy={center} r={radarRadius * f}
              fill="none" stroke="#FDE68A" strokeWidth={i === 3 ? 2 : 1} strokeDasharray={i === 3 ? '0' : '4 4'} />
          ))}

          {/* Crosshairs */}
          <line x1={center} y1={center - radarRadius} x2={center} y2={center + radarRadius} stroke="#FDE68A" strokeWidth="1" />
          <line x1={center - radarRadius} y1={center} x2={center + radarRadius} y2={center} stroke="#FDE68A" strokeWidth="1" />

          {/* Distance labels */}
          {[1, 2, 3, 4, 5].map((km, i) => (
            <text key={km} x={center + 4} y={center - radarRadius * ((i + 1) / 5) - 3}
              fontSize="9" fill="#D97706" fontFamily="monospace" opacity="0.7">
              {km}km
            </text>
          ))}

          {/* Radiating pulses */}
          {pulses.map(pulse => {
            const age = tick - pulse.born
            const progress = age / 90
            const r = radarRadius * progress
            const opacity = (1 - progress) * 0.6
            return (
              <circle key={pulse.id} cx={center} cy={center} r={r}
                fill="none" stroke="#F59E0B" strokeWidth={2 - progress * 1.5}
                opacity={opacity} />
            )
          })}

          {/* Blips */}
          {nearbySpaces.map(space => {
            const isSelected = selectedSpace?.id === space.id
            return (
              <g key={space.id} onClick={() => setSelectedSpace(isSelected ? null : space)}
                style={{ cursor: 'pointer' }}>
                {/* Outer glow */}
                <circle cx={space.x} cy={space.y} r={isSelected ? 14 : 10}
                  fill={isSelected ? '#FEF3C7' : '#FEF9C3'} opacity="0.8" />
                {/* Main blip */}
                <circle cx={space.x} cy={space.y} r={isSelected ? 8 : 6}
                  fill={isSelected ? '#D97706' : '#F59E0B'}
                  stroke={isSelected ? '#92400E' : '#D97706'}
                  strokeWidth="1.5"
                  filter="url(#blipShadow)" />
                {/* Inner dot */}
                <circle cx={space.x} cy={space.y} r={2} fill="white" opacity="0.9" />
                {/* Name label */}
                <text x={space.x + 10} y={space.y - 8}
                  fontSize="10" fill="#92400E" fontFamily="sans-serif" fontWeight="600">
                  {space.name?.slice(0, 12)}
                </text>
              </g>
            )
          })}

          {/* You (center) */}
          <circle cx={center} cy={center} r={10} fill="#FEF3C7" stroke="#D97706" strokeWidth="2" opacity="0.9" />
          <circle cx={center} cy={center} r={5} fill="#D97706" />
          <circle cx={center} cy={center} r={2} fill="white" />

          {/* "You" label */}
          <text x={center + 13} y={center + 4} fontSize="10" fill="#92400E" fontFamily="sans-serif" fontWeight="600">You</text>
        </svg>
      </div>

      {/* Status */}
      {!userLocation && !locationError && (
        <p style={{ color: '#B45309', fontSize: '13px', marginBottom: '1rem' }}>
          Locating you...
        </p>
      )}
      {userLocation && (
        <p style={{ color: '#D97706', fontSize: '13px', fontWeight: '600', marginBottom: '1rem' }}>
          🐝 {nearbySpaces.length} pod{nearbySpaces.length !== 1 ? 's' : ''} found near you
        </p>
      )}

      {/* Selected popup */}
      {selectedSpace && (
        <div style={{
          background: 'white', border: '2px solid #FCD34D', borderRadius: '16px',
          padding: '1.25rem', maxWidth: '300px', width: '100%',
          boxShadow: '0 4px 20px rgba(217,119,6,0.15)',
          animation: 'slideUp 0.2s ease',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <h3 style={{ color: '#92400E', margin: 0, fontSize: '16px', fontWeight: '700' }}>{selectedSpace.name}</h3>
              <p style={{ color: '#B45309', margin: '2px 0 0', fontSize: '12px' }}>
                📍 {selectedSpace.city} · {formatDist(selectedSpace.dist)} away
              </p>
            </div>
            <button onClick={() => setSelectedSpace(null)}
              style={{ background: '#FEF3C7', border: 'none', color: '#D97706', cursor: 'pointer', borderRadius: '50%', width: '28px', height: '28px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid #FDE68A' }}>
              <div style={{ color: '#D97706', fontWeight: '700', fontSize: '20px' }}>{selectedSpace.totalSeats || '—'}</div>
              <div style={{ color: '#B45309', fontSize: '11px', marginTop: '2px' }}>Total Seats</div>
            </div>
            <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid #FDE68A' }}>
              <div style={{ color: '#D97706', fontWeight: '700', fontSize: '20px' }}>₹{selectedSpace.monthlyRate || selectedSpace.monthly_rate || '—'}</div>
              <div style={{ color: '#B45309', fontSize: '11px', marginTop: '2px' }}>Per Month</div>
            </div>
          </div>

          {selectedSpace.address && (
            <p style={{ color: '#78716C', fontSize: '12px', margin: '0 0 10px', background: '#FAFAF9', borderRadius: '8px', padding: '8px' }}>
              🏠 {selectedSpace.address}
            </p>
          )}
          {selectedSpace.amenities && (
            <p style={{ color: '#78716C', fontSize: '12px', margin: '0 0 12px', background: '#FAFAF9', borderRadius: '8px', padding: '8px' }}>
              ✨ {selectedSpace.amenities}
            </p>
          )}

          <a href={waLink(selectedSpace)} target="_blank" rel="noreferrer" className="wa-btn"
            style={{
              display: 'block', background: '#25D366', color: 'white',
              padding: '12px', borderRadius: '12px', textDecoration: 'none',
              textAlign: 'center', fontWeight: '700', fontSize: '14px',
              transition: 'background 0.2s'
            }}>
            💬 Chat on WhatsApp
          </a>
        </div>
      )}

      {/* Nearby list */}
      {nearbySpaces.length > 0 && (
        <div style={{ maxWidth: '300px', width: '100%' }}>
          <p style={{ color: '#B45309', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
            Pods detected
          </p>
          {nearbySpaces.map(space => (
            <div key={space.id} onClick={() => setSelectedSpace(selectedSpace?.id === space.id ? null : space)}
              className="pod-card"
              style={{
                background: selectedSpace?.id === space.id ? '#FEF3C7' : 'white',
                border: `1px solid ${selectedSpace?.id === space.id ? '#F59E0B' : '#FDE68A'}`,
                borderRadius: '12px', padding: '12px 14px', marginBottom: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
              <div>
                <div style={{ color: '#92400E', fontWeight: '600', fontSize: '14px' }}>{space.name}</div>
                <div style={{ color: '#B45309', fontSize: '12px', marginTop: '2px' }}>
                  {space.city} · ₹{space.monthlyRate || space.monthly_rate}/mo
                </div>
              </div>
              <div style={{ background: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                {formatDist(space.dist)}
              </div>
            </div>
          ))}
        </div>
      )}

      {userLocation && nearbySpaces.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#B45309' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔍</div>
          <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>No pods found nearby yet</p>
          <p style={{ fontSize: '12px', color: '#D97706', margin: '4px 0 0' }}>Check back as more owners join!</p>
        </div>
      )}
    </div>
  )
}

export default StudentRadar