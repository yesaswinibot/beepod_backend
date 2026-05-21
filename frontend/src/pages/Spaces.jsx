import { useState, useEffect } from 'react'

const API = 'https://beepodbackend-production.up.railway.app'

const C = {
  ink: '#0F0E0C', paper: '#FBF7EE', paper2: '#F4EBD6',
  honey200: '#FFD361', honey300: '#F4B928', honey400: '#D99211', honey500: '#A86A07',
  buzz: '#FF2E7E', lime: '#C8FF3C',
  mute: 'rgba(15,14,12,.55)', mute2: 'rgba(15,14,12,.40)',
  line: 'rgba(15,14,12,.10)', line2: 'rgba(15,14,12,.06)',
}

function hexPath(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return 'M' + pts.join(' L') + ' Z'
}

function Spaces() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    fetch(`${API}/api/spaces/verified`)
      .then(r => r.json())
      .then(data => { setSpaces(data); setLoading(false) })
      .catch(() => {
        fetch(`${API}/api/spaces`).then(r => r.json())
          .then(data => { setSpaces(data); setLoading(false) })
          .catch(() => setLoading(false))
      })
  }, [])

  const filtered = search
    ? spaces.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.city?.toLowerCase().includes(search.toLowerCase()) ||
        s.amenities?.toLowerCase().includes(search.toLowerCase())
      )
    : spaces

  function getPhotos(space) {
    if (!space.photos) return []
    return space.photos.split(',').filter(u => u.trim())
  }

  function waLink(space) {
    return `https://wa.me/?text=${encodeURIComponent(`Hi! I found "${space.name}" on BeePod. Interested in a seat!`)}`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${C.paper} 0%, ${C.paper2} 100%)`,
      fontFamily: '"Plus Jakarta Sans", "Geist", -apple-system, sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Header */}
      <div style={{
        padding: '28px 20px 0',
        maxWidth: 800, margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 34 34">
            <path d={hexPath(17, 17, 16)} fill={C.ink} />
            <path d={hexPath(17, 17, 9)} fill={C.honey200} />
            <circle cx="17" cy="17" r="3" fill={C.ink} />
          </svg>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: '-.03em' }}>
            beepod<span style={{ color: C.buzz }}>.</span>
          </span>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.03em', color: C.ink, margin: '0 0 6px' }}>
          study rooms
        </h1>
        <p style={{ fontSize: 15, color: C.mute, margin: '0 0 20px' }}>
          verified pods across india
        </p>

        {/* Search */}
        <div style={{
          position: 'relative', marginBottom: 24
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: C.mute2 }}>
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            placeholder="search by name, city, or amenities..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '13px 16px 13px 44px',
              borderRadius: 14, border: `1.5px solid ${C.line}`,
              background: '#fff', fontSize: 14, fontFamily: 'inherit',
              color: C.ink, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{filtered.length} pods</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '.18em', color: C.mute2 }}>VERIFIED</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        maxWidth: 800, margin: '0 auto', padding: '0 20px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))',
        gap: 16
      }}>
        {loading && (
          <p style={{ color: C.mute, fontSize: 14, padding: 20, gridColumn: '1/-1' }}>Loading spaces...</p>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, margin: '0 0 4px' }}>
              {search ? 'no pods match ur search' : 'no verified pods yet'}
            </p>
            <p style={{ fontSize: 13, color: C.mute, margin: 0 }}>try a different search or check back soon</p>
          </div>
        )}

        {filtered.map(space => {
          const photos = getPhotos(space)
          return (
            <div key={space.id} style={{
              background: '#fff',
              borderRadius: 20,
              overflow: 'hidden',
              border: `1px solid ${C.line2}`,
              boxShadow: '0 2px 8px rgba(15,14,12,.04)',
              transition: 'transform .15s, box-shadow .15s',
              cursor: 'pointer',
            }}
              onClick={() => { setSelected(space); setPhotoIndex(0) }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(15,14,12,.10)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,14,12,.04)' }}
            >
              {/* Photo */}
              <div style={{ height: 180, background: C.paper2, position: 'relative', overflow: 'hidden' }}>
                {photos.length > 0 ? (
                  <img src={photos[0]} alt={space.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 40, opacity: 0.3 }}>📚</span>
                  </div>
                )}
                {photos.length > 1 && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 8,
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    padding: '3px 8px', borderRadius: 6,
                    fontSize: 11, fontWeight: 600
                  }}>+{photos.length - 1}</div>
                )}
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: C.ink, color: C.lime,
                  padding: '3px 8px', borderRadius: 6,
                  fontSize: 10, fontWeight: 700, letterSpacing: '.1em',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.lime }} />
                  VERIFIED
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '14px 16px 16px' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.ink, margin: '0 0 4px', letterSpacing: '-.01em' }}>{space.name}</h3>
                <p style={{ fontSize: 13, color: C.mute, margin: '0 0 10px' }}>
                  {space.address ? `${space.address}, ` : ''}{space.city}
                </p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: C.ink }}>₹{space.monthlyRate}</span>
                  <span style={{ fontSize: 13, color: C.mute }}>/mo</span>
                  <span style={{ width: 1, height: 14, background: C.line, margin: '0 4px' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{space.totalSeats} seats</span>
                </div>

                {space.amenities && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {space.amenities.split(',').slice(0, 4).map((a, i) => (
                      <span key={i} style={{
                        padding: '3px 8px', borderRadius: 6,
                        background: C.paper, fontSize: 11, color: C.ink, fontWeight: 500
                      }}>{a.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(15,14,12,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }} onClick={() => setSelected(null)}>
          <div style={{
            background: '#fff', borderRadius: 24,
            width: '100%', maxWidth: 460, maxHeight: '90vh',
            overflow: 'auto',
          }} onClick={e => e.stopPropagation()}>

            {/* Photos carousel */}
            {(() => {
              const photos = getPhotos(selected)
              return photos.length > 0 ? (
                <div style={{ position: 'relative', height: 240 }}>
                  <img src={photos[photoIndex]} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px 24px 0 0' }} />
                  {photos.length > 1 && (
                    <>
                      <button onClick={() => setPhotoIndex(i => (i - 1 + photos.length) % photos.length)}
                        style={navBtn('left')}>‹</button>
                      <button onClick={() => setPhotoIndex(i => (i + 1) % photos.length)}
                        style={navBtn('right')}>›</button>
                      <div style={{
                        position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: 6
                      }}>
                        {photos.map((_, i) => (
                          <div key={i} onClick={() => setPhotoIndex(i)} style={{
                            width: i === photoIndex ? 20 : 8, height: 8, borderRadius: 99,
                            background: i === photoIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', transition: 'all .2s'
                          }} />
                        ))}
                      </div>
                    </>
                  )}
                  <button onClick={() => setSelected(null)} style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>×</button>
                </div>
              ) : (
                <div style={{ height: 120, background: C.paper2, borderRadius: '24px 24px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontSize: 40, opacity: 0.3 }}>📚</span>
                  <button onClick={() => setSelected(null)} style={{
                    position: 'absolute', top: 12, right: 12,
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.3)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>×</button>
                </div>
              )
            })()}

            <div style={{ padding: '20px 22px 24px' }}>
              <div style={{
                fontFamily: 'monospace', fontSize: 10, letterSpacing: '.2em',
                color: C.honey500, marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.lime }} />
                VERIFIED STUDY ROOM
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', color: C.ink, margin: '0 0 6px' }}>
                {selected.name}
              </h2>
              <p style={{ fontSize: 14, color: C.mute, margin: '0 0 18px' }}>
                {selected.address ? `${selected.address}, ` : ''}{selected.city}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                <div style={statBox}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>₹{selected.monthlyRate}</div>
                  <div style={{ fontSize: 11, color: C.mute }}>/month</div>
                </div>
                <div style={statBox}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>{selected.totalSeats}</div>
                  <div style={{ fontSize: 11, color: C.mute }}>seats</div>
                </div>
                {selected.dailyRate && (
                  <div style={statBox}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: C.ink }}>₹{selected.dailyRate}</div>
                    <div style={{ fontSize: 11, color: C.mute }}>/day</div>
                  </div>
                )}
              </div>

              {selected.amenities && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Amenities</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.amenities.split(',').map((a, i) => (
                      <span key={i} style={{
                        padding: '5px 12px', borderRadius: 99,
                        background: C.paper, border: `1px solid ${C.line}`,
                        fontSize: 12, fontWeight: 500, color: C.ink,
                      }}>{a.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.description && (
                <p style={{ fontSize: 14, color: C.mute, lineHeight: 1.6, margin: '0 0 20px' }}>
                  {selected.description}
                </p>
              )}

              <a href={waLink(selected)} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '14px 0', borderRadius: 14,
                background: '#1F8A5B', color: '#fff',
                fontWeight: 700, fontSize: 15, textDecoration: 'none',
                fontFamily: 'inherit',
                boxShadow: '0 6px 16px rgba(31,138,91,.25)',
              }}>
                message on whatsapp →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const navBtn = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  [side]: 10,
  width: 34, height: 34, borderRadius: '50%',
  background: 'rgba(0,0,0,0.4)', color: '#fff',
  border: 'none', cursor: 'pointer', fontSize: 22,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
})

const statBox = {
  background: C.paper, borderRadius: 12, padding: '12px 8px',
  textAlign: 'center',
}

function waLink(space) {
  return `https://wa.me/?text=${encodeURIComponent(`Hi! I found "${space.name}" on BeePod. Interested in a seat!`)}`
}

export default Spaces