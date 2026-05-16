import { useState, useEffect } from 'react'

const API = 'https://beepodbackend-production.up.railway.app'

function AdminPanel() {
  const [pending, setPending] = useState([])
  const [tab, setTab] = useState('pending') // pending | all
  const [allSpaces, setAllSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [p, a] = await Promise.all([
      fetch(`${API}/api/admin/spaces/pending`).then(r => r.json()),
      fetch(`${API}/api/admin/spaces/all`).then(r => r.json())
    ])
    setPending(p)
    setAllSpaces(a)
    setLoading(false)
  }

  async function approve(id) {
    setActionMsg('')
    const res = await fetch(`${API}/api/admin/spaces/${id}/approve`, { method: 'PUT' })
    if (res.ok) {
      setActionMsg('✅ Space approved successfully')
      loadData()
    }
  }

  async function reject(id) {
    setActionMsg('')
    if (!confirm('Reject this space? This will hide it from students.')) return
    const res = await fetch(`${API}/api/admin/spaces/${id}/reject`, { method: 'PUT' })
    if (res.ok) {
      setActionMsg('❌ Space rejected')
      loadData()
    }
  }

  const list = tab === 'pending' ? pending : allSpaces

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading admin panel...</p>

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>

      <div style={{ backgroundColor: '#1C1917', padding: '1.5rem 2rem' }}>
        <h1 style={{ color: '#D97706', margin: 0, fontSize: '22px' }}>🐝 BeePod Admin</h1>
        <p style={{ color: '#78716C', margin: '4px 0 0', fontSize: '13px' }}>Verify study room listings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '1.5rem 2rem' }}>
        <div style={{ background: '#D97706', borderRadius: '12px', padding: '1rem', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{pending.length}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Pending Review</div>
        </div>
        <div style={{ background: '#16A34A', borderRadius: '12px', padding: '1rem', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{allSpaces.filter(s => s.status === 'verified').length}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Verified</div>
        </div>
        <div style={{ background: '#DC2626', borderRadius: '12px', padding: '1rem', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{allSpaces.filter(s => s.status === 'rejected').length}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Rejected</div>
        </div>
      </div>

      <div style={{ display: 'flex', padding: '0 2rem', borderBottom: '1px solid #E5E3DC' }}>
        {['pending', 'all'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', border: 'none', background: 'none',
            fontWeight: tab === t ? '700' : '400',
            color: tab === t ? '#D97706' : '#78716C',
            borderBottom: tab === t ? '2px solid #D97706' : '2px solid transparent',
            cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize'
          }}>{t === 'pending' ? 'Pending Review' : 'All Spaces'}</button>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        {actionMsg && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', color: '#92400E', fontSize: '14px' }}>{actionMsg}</div>
        )}

        {list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#78716C' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
            <p style={{ fontSize: '14px' }}>{tab === 'pending' ? 'No spaces pending review' : 'No spaces yet'}</p>
          </div>
        )}

        {list.map(space => (
          <div key={space.id} style={{
            background: 'white', border: '1px solid #E5E3DC', borderRadius: '12px',
            padding: '1.25rem', marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1C1917' }}>{space.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#78716C' }}>
                  Owner ID: {space.ownerId || 'N/A'} · {space.city}
                </p>
              </div>
              <span style={{
                background: space.status === 'verified' ? '#DCFCE7' : space.status === 'rejected' ? '#FEF2F2' : '#FEF3C7',
                color: space.status === 'verified' ? '#16A34A' : space.status === 'rejected' ? '#DC2626' : '#D97706',
                padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
              }}>{space.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px', color: '#525252', marginBottom: '12px' }}>
              <div>🏠 {space.address || '—'}</div>
              <div>🪑 {space.totalSeats || 0} seats</div>
              <div>💰 ₹{space.monthlyRate}/mo · ₹{space.dailyRate}/day</div>
              <div>📍 {space.latitude?.toFixed(4)}, {space.longitude?.toFixed(4)}</div>
            </div>

            {space.amenities && (
              <p style={{ fontSize: '13px', color: '#525252', background: '#FAFAF9', padding: '8px 12px', borderRadius: '8px', margin: '0 0 12px' }}>
                ✨ {space.amenities}
              </p>
            )}
            {space.description && (
              <p style={{ fontSize: '13px', color: '#525252', margin: '0 0 12px' }}>{space.description}</p>
            )}

            {space.status === 'pending' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => approve(space.id)} style={{
                  flex: 1, padding: '10px', background: '#16A34A', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px'
                }}>✅ Approve</button>
                <button onClick={() => reject(space.id)} style={{
                  flex: 1, padding: '10px', background: '#DC2626', color: 'white',
                  border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px'
                }}>❌ Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminPanel