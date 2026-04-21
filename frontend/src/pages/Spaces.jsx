import { useState, useEffect } from 'react'

function Spaces() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8080/api/spaces')
      .then(res => res.json())
      .then(data => {
        setSpaces(data)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>
      <h1 style={{ color: '#D97706' }}>Study Rooms</h1>
      <p style={{ color: '#78716C', marginBottom: '2rem' }}>{spaces.length} rooms available</p>

      {loading ? <p>Loading...</p> : spaces.map(space => (
        <div key={space.id} style={{
          background: 'white',
          border: '1px solid #E5E3DC',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ margin: 0, color: '#1C1917', fontSize: '18px' }}>{space.name}</h2>
              <p style={{ color: '#78716C', margin: '4px 0', fontSize: '14px' }}>📍 {space.address}, {space.city}</p>
              <p style={{ color: '#78716C', margin: '4px 0', fontSize: '14px' }}>💺 {space.totalSeats} seats</p>
              <p style={{ color: '#78716C', margin: '4px 0', fontSize: '14px' }}>📋 {space.amenities}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#D97706', fontWeight: '800', fontSize: '20px' }}>₹{space.monthlyRate}</div>
              <div style={{ color: '#78716C', fontSize: '12px' }}>per month</div>
              <div style={{ color: '#D97706', fontWeight: '600', fontSize: '14px', marginTop: '4px' }}>₹{space.dailyRate}/day</div>
            </div>
          </div>

          {space.description && (
            <p style={{ color: '#78716C', fontSize: '13px', marginTop: '12px', borderTop: '1px solid #E5E3DC', paddingTop: '12px' }}>
              {space.description}
            </p>
          )}

          {space.isVerified && (
            <span style={{
              background: '#DCFCE7',
              color: '#16A34A',
              padding: '2px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              marginTop: '8px',
              display: 'inline-block'
            }}>
              ✓ Verified
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default Spaces