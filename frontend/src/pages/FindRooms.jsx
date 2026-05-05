import { useState, useEffect } from 'react'

function FindRooms() {
  const [loading, setLoading] = useState(false)
  const [rooms, setRooms] = useState([])
  const [scanned, setScanned] = useState(false)

  function startScan() {
    setLoading(true)
    setScanned(false)

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords
      
      try {
        const res = await fetch(`http://localhost:8080/api/spaces/nearby?lat=${latitude}&lng=${longitude}&radius=5`)
        const data = await res.json()
        setRooms(data)
        setScanned(true)
      } catch (e) {
        console.error('Error fetching rooms:', e)
      }
      setLoading(false)
    })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF9F3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto 2rem', background: 'radial-gradient(circle, #FFFBEB 0%, #FAF5EB 100%)', borderRadius: '50%', border: '2px solid #D97706', boxShadow: '0 0 30px rgba(217, 119, 6, 0.2)' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '240px', height: '240px', border: '1px solid #E5E3DC', borderRadius: '50%', opacity: 0.6 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '160px', height: '160px', border: '1px solid #E5E3DC', borderRadius: '50%', opacity: 0.6 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', border: '1px solid #E5E3DC', borderRadius: '50%', opacity: 0.6 }}></div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '12px', height: '12px', background: '#D97706', borderRadius: '50%', boxShadow: '0 0 20px rgba(217, 119, 6, 0.6)' }}></div>
            <div style={{ position: 'absolute', top: 0, left: '50%', width: '2px', height: '150px', background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.8) 0%, rgba(217, 119, 6, 0) 100%)', transformOrigin: 'bottom center', marginLeft: '-1px', animation: 'spin 3s linear infinite', boxShadow: '0 0 15px rgba(217, 119, 6, 0.6)' }}></div>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1C1917' }}>Searching for nearest pods...</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#78716C' }}>Scanning your area 📍</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (scanned) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF9F3 100%)', fontFamily: 'sans-serif', padding: '2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ color: '#D97706', marginBottom: '1rem' }}>Found {rooms.length} Study Rooms</h1>
          {rooms.map(room => (
            <div key={room.id} style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #E5E3DC' }}>
              <h2 style={{ margin: '0 0 8px', color: '#1C1917', fontSize: '18px' }}>{room.name}</h2>
              <p style={{ margin: '0 0 8px', color: '#78716C', fontSize: '14px' }}>📍 {room.distance?.toFixed(1)} km away</p>
              <p style={{ margin: '0 0 8px', color: '#D97706', fontWeight: '600' }}>₹{room.monthlyRate}/month</p>
              <p style={{ margin: '0', color: '#78716C', fontSize: '13px' }}>{room.amenities}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF9F3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#1C1917', fontSize: '28px', marginBottom: '1rem' }}>Find Your Study Room</h1>
        <p style={{ color: '#78716C', marginBottom: '2rem', fontSize: '14px' }}>Discover rooms near you</p>
        <button onClick={startScan} style={{ background: 'linear-gradient(135deg, #D97706 0%, #BA7517 100%)', color: 'white', border: 'none', borderRadius: '12px', padding: '1rem 2rem', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)' }}>
          📍 Start Scanning
        </button>
      </div>
    </div>
  )
}

export default FindRooms