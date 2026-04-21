import { useState, useEffect } from 'react'

function OwnerDashboard() {
  const [spaces, setSpaces] = useState([])
  const [students, setStudents] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/spaces').then(r => r.json()),
      fetch('http://localhost:8080/api/students').then(r => r.json()),
      fetch('http://localhost:8080/api/subscriptions/space/1').then(r => r.json())
    ]).then(([spacesData, studentsData, subsData]) => {
      setSpaces(spacesData)
      setStudents(studentsData)
      setSubscriptions(subsData)
      setLoading(false)
    })
  }, [])

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const unpaidSubscriptions = subscriptions.filter(s => s.paymentStatus === 'unpaid')

  function getWhatsAppLink(student, sub) {
    const msg = `Hi ${student.name}, your Beepod membership fee of Rs.${sub.monthlyFee} is pending. Please pay to keep your seat.`
    return `https://wa.me/91${student.phone}?text=${encodeURIComponent(msg)}`
  }

  if(loading) return <p style={{ padding: '2rem' }}>Loading dashboard...</p>

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>

      <div style={{ backgroundColor: '#1C1917', padding: '1.5rem 2rem' }}>
        <h1 style={{ color: '#D97706', margin: 0, fontSize: '20px' }}>
          {spaces[0]?.name || 'My Study Room'}
        </h1>
        <p style={{ color: '#78716C', margin: '4px 0 0', fontSize: '13px' }}>Owner Dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '1.5rem 2rem' }}>
        <div style={{ background: '#D97706', borderRadius: '12px', padding: '1rem', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{spaces[0]?.totalSeats || 0}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Seats</div>
        </div>
        <div style={{ background: '#D97706', borderRadius: '12px', padding: '1rem', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{activeSubscriptions.length}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Active Students</div>
        </div>
        <div style={{ background: unpaidSubscriptions.length > 0 ? '#DC2626' : '#D97706', borderRadius: '12px', padding: '1rem', color: 'white' }}>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>{unpaidSubscriptions.length}</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Unpaid</div>
        </div>
      </div>

      <div style={{ display: 'flex', padding: '0 2rem', borderBottom: '1px solid #E5E3DC' }}>
        {['dashboard', 'students', 'unpaid'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '10px 20px', border: 'none', background: 'none',
            fontWeight: activeTab === tab ? '700' : '400',
            color: activeTab === tab ? '#D97706' : '#78716C',
            borderBottom: activeTab === tab ? '2px solid #D97706' : '2px solid transparent',
            cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize'
          }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>

        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '16px', color: '#1C1917', marginTop: 0 }}>Recent Students</h2>
            {subscriptions.slice(0, 3).map(sub => {
              const student = students.find(s => s.id === sub.studentId)
              return (
                <div key={sub.id} style={{ background: 'white', border: '1px solid #E5E3DC', borderRadius: '10px', padding: '1rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1C1917' }}>{student?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#78716C' }}>Seat {sub.seatNumber} · Valid till {sub.validTill}</div>
                  </div>
                  <span style={{
                    background: sub.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF2F2',
                    color: sub.paymentStatus === 'paid' ? '#16A34A' : '#DC2626',
                    padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                  }}>
                    {sub.paymentStatus}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'students' && (
          <div>
            <h2 style={{ fontSize: '16px', color: '#1C1917', marginTop: 0 }}>All Students ({subscriptions.length})</h2>
            {subscriptions.map(sub => {
              const student = students.find(s => s.id === sub.studentId)
              return (
                <div key={sub.id} style={{ background: 'white', border: '1px solid #E5E3DC', borderRadius: '10px', padding: '1rem', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1C1917' }}>{student?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '12px', color: '#78716C' }}>📞 {student?.phone}</div>
                      <div style={{ fontSize: '12px', color: '#78716C' }}>🪑 Seat {sub.seatNumber}</div>
                      <div style={{ fontSize: '12px', color: '#78716C' }}>Valid: {sub.validFrom} to {sub.validTill}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        background: sub.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF2F2',
                        color: sub.paymentStatus === 'paid' ? '#16A34A' : '#DC2626',
                        padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px'
                      }}>
                        {sub.paymentStatus}
                      </span>
                      <div style={{ fontSize: '12px', color: '#D97706', fontWeight: '600' }}>Rs.{sub.monthlyFee}/mo</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'unpaid' && (
          <div>
            <h2 style={{ fontSize: '16px', color: '#1C1917', marginTop: 0 }}>Unpaid Students ({unpaidSubscriptions.length})</h2>
            {unpaidSubscriptions.length === 0 ? (
              <p style={{ color: '#16A34A', fontWeight: '600' }}>All students have paid!</p>
            ) : unpaidSubscriptions.map(sub => {
              const student = students.find(s => s.id === sub.studentId)
              return (
                <div key={sub.id} style={{ background: 'white', border: '1px solid #FECACA', borderRadius: '10px', padding: '1rem', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '600', color: '#1C1917' }}>{student?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '12px', color: '#78716C' }}>📞 {student?.phone}</div>
                  <div style={{ fontSize: '12px', color: '#78716C' }}>🪑 Seat {sub.seatNumber} · Rs.{sub.monthlyFee}/mo</div>
                  {student && (
                    <a
                    
                      href={getWhatsAppLink(student, sub)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-block', marginTop: '8px', background: '#25D366', color: 'white', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}
                    >
                      WhatsApp Reminder
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}

export default OwnerDashboard