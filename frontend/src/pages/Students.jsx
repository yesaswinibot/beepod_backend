import { useState, useEffect } from 'react'

function Students() {
  const [subscriptions, setSubscriptions] = useState([])
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const name = localStorage.getItem('name')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [spacesData, subsData] = await Promise.all([
      fetch('http://52.66.199.64:8080/api/spaces').then(r => r.json()),
      fetch('http://52.66.199.64:8080/api/subscriptions').then(r => r.json())
    ])
    setSpaces(spacesData)
    setSubscriptions(subsData)
    setLoading(false)
  }

  if(loading) return <p style={{ padding: '2rem' }}>Loading profile...</p>

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh', padding: '2rem' }}>

      {/* PROFILE HEADER */}
      <div style={{ background: '#1C1917', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
          {name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>{name}</div>
          <div style={{ color: '#78716C', fontSize: '13px' }}>Student · Beepod Member</div>
        </div>
      </div>

      {/* ACTIVE MEMBERSHIPS */}
      <h2 style={{ fontSize: '16px', color: '#1C1917', marginBottom: '1rem' }}>My Memberships</h2>

      {subscriptions.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #E5E3DC', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>📚</div>
          <div style={{ fontWeight: '600', color: '#1C1917', marginBottom: '4px' }}>No active memberships</div>
          <div style={{ fontSize: '13px', color: '#78716C' }}>Visit a study room and ask the owner to add you on Beepod</div>
        </div>
      ) : subscriptions.map(sub => {
        const space = spaces.find(s => s.id === sub.spaceId)
        const isExpired = new Date(sub.validTill) < new Date()
        const isExpiring = !isExpired && (() => {
          const validTill = new Date(sub.validTill)
          const sevenDays = new Date()
          sevenDays.setDate(sevenDays.getDate() + 7)
          return validTill <= sevenDays
        })()

        return (
          <div key={sub.id} style={{ background: 'white', border: `1px solid ${isExpired ? '#FECACA' : isExpiring ? '#FAC775' : '#E5E3DC'}`, borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: '700', color: '#1C1917', fontSize: '16px' }}>{space?.name || 'Study Room'}</div>
                <div style={{ fontSize: '12px', color: '#78716C' }}>📍 {space?.address}</div>
              </div>
              <span style={{ background: isExpired ? '#FEF2F2' : isExpiring ? '#FFF7ED' : '#F0FDF4', color: isExpired ? '#DC2626' : isExpiring ? '#92400E' : '#16A34A', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                {isExpired ? 'Expired' : isExpiring ? 'Expiring Soon' : 'Active'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#FFFBEB', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', color: '#A8A29E', marginBottom: '2px' }}>SEAT</div>
                <div style={{ fontWeight: '700', color: '#1C1917', fontSize: '14px' }}>
                  {sub.seatNumber || 'Not assigned'}
                </div>
              </div>
              <div style={{ background: '#FFFBEB', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', color: '#A8A29E', marginBottom: '2px' }}>VALID TILL</div>
                <div style={{ fontWeight: '700', color: isExpired ? '#DC2626' : '#1C1917', fontSize: '14px' }}>
                  {sub.validTill}
                </div>
              </div>
              <div style={{ background: '#FFFBEB', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', color: '#A8A29E', marginBottom: '2px' }}>MONTHLY FEE</div>
                <div style={{ fontWeight: '700', color: '#D97706', fontSize: '14px' }}>
                  ₹{sub.monthlyFee}
                </div>
              </div>
              <div style={{ background: '#FFFBEB', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '10px', color: '#A8A29E', marginBottom: '2px' }}>PAYMENT</div>
                <div style={{ fontWeight: '700', color: sub.paymentStatus === 'paid' ? '#16A34A' : '#DC2626', fontSize: '14px' }}>
                  {sub.paymentStatus === 'paid' ? 'Paid ✓' : 'Unpaid'}
                </div>
              </div>
            </div>

            {space?.amenities && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#78716C' }}>
                🏠 {space.amenities}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Students