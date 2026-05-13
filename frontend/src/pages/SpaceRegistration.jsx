import { useState, useEffect } from 'react'

const API = 'https://beepodbackend-production.up.railway.app'

function SpaceRegistration({ onDone, ownerId }) {
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Try to auto-fetch location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLatitude(pos.coords.latitude.toFixed(6))
          setLongitude(pos.coords.longitude.toFixed(6))
        },
        () => {}
      )
    }
  }, [])

  async function submit() {
    setError('')
    if (!name || !city || !address || !totalSeats || !monthlyRate || !latitude || !longitude) {
      setError('Please fill all required fields.')
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
          status: 'pending',
          isVerified: false,
          isActive: true
        })
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => onDone && onDone(), 2000)
      } else {
        setError('Failed to register space. Try again.')
      }
    } catch {
      setError('Network error. Try again.')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', marginBottom: '10px',
    borderRadius: '10px', border: '1px solid #E5E3DC',
    boxSizing: 'border-box', fontSize: '14px', outline: 'none',
    background: '#FAFAF9', color: '#1C1917'
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '1rem' }}>
        <div style={{ background: 'white', border: '2px solid #FCD34D', borderRadius: '20px', padding: '2.5rem', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ color: '#D97706', fontSize: '20px', margin: '0 0 8px' }}>Space Submitted!</h2>
          <p style={{ color: '#B45309', fontSize: '14px', margin: 0 }}>Your space is now under admin review. You'll see it on your dashboard once verified.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFBEB', fontFamily: 'sans-serif', padding: '2rem 1rem' }}>
      <div style={{ background: 'white', border: '1px solid #FDE68A', borderRadius: '20px', padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '36px' }}>🐝</div>
          <h1 style={{ color: '#D97706', margin: '4px 0 2px', fontSize: '22px', fontWeight: '800' }}>Register Your Study Room</h1>
          <p style={{ color: '#B45309', margin: 0, fontSize: '13px' }}>Get listed on BeePod once verified</p>
        </div>

        <input placeholder="Study room name *" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        <input placeholder="City *" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
        <input placeholder="Full address *" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />

        <textarea placeholder="Short description" value={description} onChange={e => setDescription(e.target.value)}
          style={{ ...inputStyle, minHeight: '60px', resize: 'vertical', fontFamily: 'sans-serif' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input placeholder="Total seats *" type="number" value={totalSeats} onChange={e => setTotalSeats(e.target.value)} style={inputStyle} />
          <input placeholder="Monthly fee (₹) *" type="number" value={monthlyRate} onChange={e => setMonthlyRate(e.target.value)} style={inputStyle} />
        </div>

        <input placeholder="Daily fee (₹, optional)" type="number" value={dailyRate} onChange={e => setDailyRate(e.target.value)} style={inputStyle} />
        <input placeholder="Amenities (e.g. WiFi, AC, Locker)" value={amenities} onChange={e => setAmenities(e.target.value)} style={inputStyle} />

        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: '#92400E' }}>📍 Location Coordinates</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <input placeholder="Latitude *" value={latitude} onChange={e => setLatitude(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
            <input placeholder="Longitude *" value={longitude} onChange={e => setLongitude(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#B45309' }}>
            {latitude && longitude ? '✓ Location auto-detected' : 'Auto-detecting your location... allow access if prompted'}
          </p>
        </div>

        {error && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{error}</p>}

        <button onClick={submit} disabled={loading} style={{
          width: '100%', padding: '12px', background: '#D97706', color: 'white',
          border: 'none', borderRadius: '10px', fontWeight: '700',
          cursor: 'pointer', fontSize: '15px', opacity: loading ? 0.7 : 1, marginTop: '8px'
        }}>
          {loading ? 'Submitting...' : 'Submit for Verification 🐝'}
        </button>

        <p style={{ textAlign: 'center', color: '#B45309', fontSize: '12px', margin: '12px 0 0' }}>
          Your listing will be reviewed before going live to students.
        </p>
      </div>
    </div>
  )
}

export default SpaceRegistration