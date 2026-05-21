import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://beepodbackend-production.up.railway.app'
const CLOUD_NAME = 'dodjtjnls'
const UPLOAD_PRESET = 'ml_default'

const C = {
  ink: '#0F0E0C', paper: '#FBF7EE', paper2: '#F4EBD6',
  honey200: '#FFD361', honey300: '#F4B928', honey400: '#D99211', honey500: '#A86A07',
  buzz: '#FF2E7E', lime: '#C8FF3C',
  mute: 'rgba(15,14,12,.55)', line: 'rgba(15,14,12,.10)',
}

function hexPath(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return 'M' + pts.join(' L') + ' Z'
}

function SpaceRegistration() {
  const navigate = useNavigate()
  const ownerId = parseInt(localStorage.getItem('userId') || '0')

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [totalSeats, setTotalSeats] = useState('')
  const [monthlyRate, setMonthlyRate] = useState('')
  const [dailyRate, setDailyRate] = useState('')
  const [amenities, setAmenities] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [photos, setPhotos] = useState([]) // array of cloudinary URLs
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState(1) // 1=details, 2=photos, 3=review

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setLatitude(pos.coords.latitude.toFixed(6)); setLongitude(pos.coords.longitude.toFixed(6)) },
        () => {}
      )
    }
  }, [])

  async function uploadPhoto(file) {
    if (photos.length >= 5) { setError('Maximum 5 photos allowed.'); return }
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', 'beepod')

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.secure_url) {
        setPhotos(prev => [...prev, data.secure_url])
      } else {
        setError('Upload failed. Try again.')
      }
    } catch {
      setError('Upload failed. Check your connection.')
    }
    setUploading(false)
  }

  function removePhoto(index) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  async function submit() {
    setError('')
    if (!name || !city || !address || !totalSeats || !monthlyRate) {
      setError('Please fill all required fields.')
      return
    }
    if (!latitude || !longitude) {
      setError('Location coordinates are required.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, city, address, description, amenities,
          totalSeats: parseInt(totalSeats),
          monthlyRate: parseInt(monthlyRate),
          dailyRate: dailyRate ? parseInt(dailyRate) : null,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          ownerId,
          photos: photos.join(','),
          status: 'pending',
          isVerified: false,
          isActive: true
        })
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => navigate('/owner'), 2500)
      } else {
        setError('Failed to register space. Try again.')
      }
    } catch {
      setError('Network error. Try again.')
    }
    setLoading(false)
  }

  function validateStep1() {
    if (!name || !city || !address || !totalSeats || !monthlyRate) {
      setError('Please fill all required fields.')
      return false
    }
    setError('')
    return true
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h2 style={{ color: C.ink, fontSize: 22, fontWeight: 800, margin: '0 0 8px' }}>space submitted!</h2>
          <p style={{ color: C.mute, fontSize: 14, margin: 0 }}>
            ur space is now under review. u'll see it on ur dashboard once verified by our team.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <svg width="34" height="34" viewBox="0 0 34 34" style={{ marginBottom: 12 }}>
            <path d={hexPath(17, 17, 16)} fill={C.ink} />
            <path d={hexPath(17, 17, 9)} fill={C.honey200} />
            <circle cx="17" cy="17" r="3" fill={C.ink} />
          </svg>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: C.ink, margin: '0 0 4px' }}>
            list ur study room
          </h1>
          <p style={{ color: C.mute, fontSize: 14, margin: 0 }}>
            get discovered by students near u
          </p>
        </div>

        {/* Progress steps */}
        <div style={styles.progress}>
          {['details', 'photos', 'review'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: step > i + 1 ? C.lime : step === i + 1 ? C.ink : C.paper2,
                color: step > i + 1 ? C.ink : step === i + 1 ? C.honey200 : C.mute,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                transition: 'all .2s'
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: step === i + 1 ? 700 : 500,
                color: step === i + 1 ? C.ink : C.mute
              }}>{s}</span>
              {i < 2 && <div style={{ width: 24, height: 1, background: C.line, margin: '0 4px' }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={styles.card}>

          {/* STEP 1 — Details */}
          {step === 1 && (
            <>
              <label style={styles.label}>Study room name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Focus Hub Kakinada" style={styles.input} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={styles.label}>City *</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Visakhapatnam" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Total seats *</label>
                  <input type="number" value={totalSeats} onChange={e => setTotalSeats(e.target.value)} placeholder="50" style={styles.input} />
                </div>
              </div>

              <label style={styles.label}>Full address *</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, area, landmark" style={styles.input} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={styles.label}>Monthly fee (₹) *</label>
                  <input type="number" value={monthlyRate} onChange={e => setMonthlyRate(e.target.value)} placeholder="499" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Daily fee (₹)</label>
                  <input type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)} placeholder="60" style={styles.input} />
                </div>
              </div>

              <label style={styles.label}>Amenities</label>
              <input value={amenities} onChange={e => setAmenities(e.target.value)} placeholder="WiFi, AC, Locker, RO Water" style={styles.input} />

              <label style={styles.label}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell students what makes ur space special..." style={{ ...styles.input, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }} />

              <div style={{ background: C.paper, borderRadius: 14, padding: 14, marginTop: 4 }}>
                <label style={{ ...styles.label, marginBottom: 8 }}>📍 Location</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="Latitude" style={{ ...styles.input, marginBottom: 0 }} />
                  <input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="Longitude" style={{ ...styles.input, marginBottom: 0 }} />
                </div>
                <p style={{ fontSize: 11, color: C.mute, margin: '6px 0 0' }}>
                  {latitude && longitude ? '✓ auto-detected' : 'allow location access or enter manually'}
                </p>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <button onClick={() => validateStep1() && setStep(2)} style={styles.primaryBtn}>
                next: add photos →
              </button>
            </>
          )}

          {/* STEP 2 — Photos */}
          {step === 2 && (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: '0 0 4px' }}>add photos</h3>
              <p style={{ fontSize: 13, color: C.mute, margin: '0 0 18px' }}>
                up to 5 photos. show off ur space — good lighting helps!
              </p>

              {/* Photo grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {photos.map((url, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '1', background: C.paper2 }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => removePhoto(i)} style={{
                      position: 'absolute', top: 6, right: 6,
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>×</button>
                    {i === 0 && (
                      <div style={{
                        position: 'absolute', bottom: 6, left: 6,
                        background: C.ink, color: C.honey200,
                        padding: '2px 8px', borderRadius: 6,
                        fontSize: 10, fontWeight: 700, letterSpacing: '.05em'
                      }}>COVER</div>
                    )}
                  </div>
                ))}

                {photos.length < 5 && (
                  <label style={{
                    aspectRatio: '1', borderRadius: 14,
                    border: `2px dashed ${uploading ? C.honey300 : C.line}`,
                    background: uploading ? C.paper : '#fff',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: uploading ? 'wait' : 'pointer',
                    transition: 'all .15s', gap: 4
                  }}>
                    <span style={{ fontSize: 24, color: C.mute }}>{uploading ? '⏳' : '+'}</span>
                    <span style={{ fontSize: 11, color: C.mute, fontWeight: 500 }}>
                      {uploading ? 'uploading...' : 'add photo'}
                    </span>
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { if (e.target.files[0]) uploadPhoto(e.target.files[0]) }}
                      disabled={uploading} />
                  </label>
                )}
              </div>

              <p style={{ fontSize: 12, color: C.mute, margin: '0 0 16px' }}>
                {photos.length}/5 photos · first photo is the cover image
              </p>

              {error && <div style={styles.error}>{error}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(1)} style={styles.ghostBtn}>← back</button>
                <button onClick={() => setStep(3)} style={{ ...styles.primaryBtn, flex: 1 }}>
                  {photos.length === 0 ? 'skip photos →' : 'next: review →'}
                </button>
              </div>
            </>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: '0 0 16px' }}>review ur listing</h3>

              {/* Photo preview */}
              {photos.length > 0 && (
                <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, height: 180 }}>
                  <img src={photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ background: C.paper, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                <h4 style={{ fontSize: 20, fontWeight: 800, color: C.ink, margin: '0 0 6px', letterSpacing: '-.02em' }}>{name}</h4>
                <p style={{ fontSize: 13, color: C.mute, margin: '0 0 12px' }}>{address}, {city}</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 12 }}>
                  <div style={styles.reviewStat}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>₹{monthlyRate}</div>
                    <div style={{ fontSize: 11, color: C.mute }}>/month</div>
                  </div>
                  <div style={styles.reviewStat}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{totalSeats}</div>
                    <div style={{ fontSize: 11, color: C.mute }}>seats</div>
                  </div>
                  <div style={styles.reviewStat}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{photos.length}</div>
                    <div style={{ fontSize: 11, color: C.mute }}>photos</div>
                  </div>
                </div>

                {amenities && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {amenities.split(',').map((a, i) => (
                      <span key={i} style={{
                        padding: '4px 10px', borderRadius: 99,
                        background: '#fff', border: `1px solid ${C.line}`,
                        fontSize: 12, color: C.ink, fontWeight: 500
                      }}>{a.trim()}</span>
                    ))}
                  </div>
                )}

                {description && (
                  <p style={{ fontSize: 13, color: C.mute, margin: '12px 0 0', lineHeight: 1.5 }}>{description}</p>
                )}
              </div>

              <div style={{
                background: '#FFF4CC', borderRadius: 12, padding: '12px 14px',
                fontSize: 13, color: '#7A5A00', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span>⏳</span>
                ur listing will be reviewed by our team before going live
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} style={styles.ghostBtn}>← back</button>
                <button onClick={submit} disabled={loading} style={{ ...styles.primaryBtn, flex: 1 }}>
                  {loading ? 'submitting...' : 'submit for verification 🐝'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${C.paper} 0%, ${C.paper2} 100%)`,
    fontFamily: '"Plus Jakarta Sans", "Geist", -apple-system, sans-serif',
    WebkitFontSmoothing: 'antialiased',
    display: 'flex', justifyContent: 'center',
    padding: '32px 16px 48px',
  },
  container: { width: '100%', maxWidth: 520 },
  progress: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 4, marginBottom: 24,
  },
  card: {
    background: '#fff', borderRadius: 24, padding: '28px 24px',
    border: `1px solid ${C.line}`,
    boxShadow: '0 20px 60px rgba(15,14,12,.08)',
  },
  label: {
    display: 'block', fontSize: 12, fontWeight: 600,
    color: C.ink, marginBottom: 6, letterSpacing: '.02em',
  },
  input: {
    width: '100%', padding: '11px 14px', marginBottom: 12,
    borderRadius: 12, border: `1.5px solid ${C.line}`,
    background: '#fff', color: C.ink, fontSize: 14,
    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color .15s',
  },
  primaryBtn: {
    width: '100%', padding: '14px 0', marginTop: 16,
    borderRadius: 14, border: 'none', cursor: 'pointer',
    background: C.ink, color: C.honey200,
    fontWeight: 700, fontSize: 15, fontFamily: 'inherit',
    boxShadow: '0 8px 20px rgba(15,14,12,.18)',
    transition: 'transform .1s',
  },
  ghostBtn: {
    padding: '14px 20px', marginTop: 16,
    borderRadius: 14, border: `1.5px solid ${C.line}`,
    background: '#fff', color: C.ink, cursor: 'pointer',
    fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
  },
  error: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    color: '#B91C1C', padding: '10px 14px', borderRadius: 12,
    fontSize: 13, marginTop: 12,
  },
  successCard: {
    background: '#fff', borderRadius: 28, padding: '48px 32px',
    textAlign: 'center', maxWidth: 400,
    boxShadow: '0 20px 60px rgba(15,14,12,.12)',
  },
  reviewStat: {
    background: '#fff', borderRadius: 10, padding: '10px 8px',
    textAlign: 'center', border: `1px solid ${C.line}`,
  },
}

export default SpaceRegistration