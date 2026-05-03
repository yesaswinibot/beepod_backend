import { useState, useEffect } from 'react'

function OwnerDashboard() {
  const [spaces, setSpaces] = useState([])
  const [students, setStudents] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudentPhone, setNewStudentPhone] = useState('')
  const [newSeatNumber, setNewSeatNumber] = useState('')
  const [newMonthlyFee, setNewMonthlyFee] = useState('')
  const [newValidFrom, setNewValidFrom] = useState('')
  const [newValidTill, setNewValidTill] = useState('')
  const [newPaymentStatus, setNewPaymentStatus] = useState('unpaid')
  const [addError, setAddError] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [spacesData, studentsData, subsData] = await Promise.all([
      fetch('https://beepodbackend-production.up.railway.app/api/spaces').then(r => r.json()),
      fetch('https://beepodbackend-production.up.railway.app/api/students').then(r => r.json()),
      fetch('https://beepodbackend-production.up.railway.app/api/subscriptions/space/1').then(r => r.json())
    ])
    setSpaces(spacesData)
    setStudents(studentsData)
    setSubscriptions(subsData)
    setLoading(false)
  }

  async function addStudent() {
    setAddError('')
    const allStudents = await fetch('https://beepodbackend-production.up.railway.app/api/students').then(r => r.json())
    const student = allStudents.find(s => s.phone === newStudentPhone)
    if(!student) { setAddError('No student found with this phone. Ask them to register on Beepod first.'); return }
    const sub = { spaceId: spaces[0]?.id, studentId: student.id, seatNumber: newSeatNumber, monthlyFee: parseInt(newMonthlyFee), validFrom: newValidFrom, validTill: newValidTill, paymentStatus: newPaymentStatus }
    const res = await fetch('https://beepodbackend-production.up.railway.app/api/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
    if(res.ok) { setShowAddStudent(false); setNewStudentPhone(''); setNewSeatNumber(''); setNewMonthlyFee(''); setNewValidFrom(''); setNewValidTill(''); setNewPaymentStatus('unpaid'); loadData() }
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const unpaidSubscriptions = subscriptions.filter(s => s.paymentStatus === 'unpaid')

  function waLink(student, msg) {
    return `https://wa.me/91${student.phone}?text=${encodeURIComponent(msg)}`
  }

  if(loading) return <p style={{ padding: '2rem' }}>Loading dashboard...</p>

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>

      <div style={{ backgroundColor: '#1C1917', padding: '1.5rem 2rem' }}>
        <h1 style={{ color: '#D97706', margin: 0, fontSize: '20px' }}>{spaces[0]?.name || 'My Study Room'}</h1>
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
        {['dashboard', 'students', 'unpaid', 'expiry'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', border: 'none', background: 'none', fontWeight: activeTab === tab ? '700' : '400', color: activeTab === tab ? '#D97706' : '#78716C', borderBottom: activeTab === tab ? '2px solid #D97706' : '2px solid transparent', cursor: 'pointer', fontSize: '14px', textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>

        {activeTab === 'dashboard' && (
          <div>
            <button onClick={() => setShowAddStudent(!showAddStudent)} style={{ background: '#D97706', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer', marginBottom: '1rem', fontSize: '14px' }}>
              {showAddStudent ? 'Cancel' : '+ Add Student'}
            </button>
            {showAddStudent && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FAC775', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '15px', color: '#1C1917' }}>Add New Student</h3>
                <input placeholder="Student phone number" value={newStudentPhone} onChange={e => setNewStudentPhone(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }} />
                <input placeholder="Seat number (e.g. A12)" value={newSeatNumber} onChange={e => setNewSeatNumber(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }} />
                <input placeholder="Monthly fee (₹)" value={newMonthlyFee} onChange={e => setNewMonthlyFee(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }} />
                <input type="date" value={newValidFrom} onChange={e => setNewValidFrom(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }} />
                <input type="date" value={newValidTill} onChange={e => setNewValidTill(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }} />
                <select value={newPaymentStatus} onChange={e => setNewPaymentStatus(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px' }}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
                {addError && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 10px' }}>{addError}</p>}
                <button onClick={addStudent} style={{ width: '100%', padding: '12px', background: '#1C1917', color: '#FAEEDA', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                  Confirm & Add Student
                </button>
              </div>
            )}
            <h2 style={{ fontSize: '16px', color: '#1C1917', marginTop: 0 }}>Recent Students</h2>
            {subscriptions.slice(0, 3).map(sub => {
              const student = students.find(s => s.id === sub.studentId)
              return (
                <div key={sub.id} style={{ background: 'white', border: '1px solid #E5E3DC', borderRadius: '10px', padding: '1rem', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1C1917' }}>{student?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: '#78716C' }}>Seat {sub.seatNumber} · Valid till {sub.validTill}</div>
                  </div>
                  <span style={{ background: sub.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF2F2', color: sub.paymentStatus === 'paid' ? '#16A34A' : '#DC2626', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
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
                      <span style={{ background: sub.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF2F2', color: sub.paymentStatus === 'paid' ? '#16A34A' : '#DC2626', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
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
                    <a href={waLink(student, `Hi ${student.name}, your Beepod membership fee of Rs.${sub.monthlyFee} is pending. Please pay to keep your seat.`)} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '8px', background: '#25D366', color: 'white', padding: '6px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                      WhatsApp Reminder
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'expiry' && (
          <div>
            <h2 style={{ fontSize: '16px', color: '#1C1917', marginTop: 0 }}>Expiry Dashboard</h2>

            <div style={{ background: '#FFF7ED', border: '1px solid #FAC775', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '14px', color: '#92400E', margin: '0 0 10px' }}>⚠️ Expiring This Week</h3>
              {(() => {
                const expiring = subscriptions.filter(sub => {
                  const validTill = new Date(sub.validTill)
                  const today = new Date()
                  const sevenDays = new Date()
                  sevenDays.setDate(today.getDate() + 7)
                  return validTill >= today && validTill <= sevenDays
                })
                return expiring.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#78716C', margin: 0 }}>No memberships expiring this week</p>
                ) : expiring.map(sub => {
                  const student = students.find(s => s.id === sub.studentId)
                  return (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #FAC775' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1C1917', fontSize: '14px' }}>{student?.name}</div>
                        <div style={{ fontSize: '12px', color: '#78716C' }}>Expires: {sub.validTill}</div>
                      </div>
                      {student && (
                        <a href={waLink(student, `Hi ${student.name}, your Beepod membership expires on ${sub.validTill}. Please renew to keep your seat.`)} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: 'white', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>
                          WhatsApp
                        </a>
                      )}
                    </div>
                  )
                })
              })()}
            </div>

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '14px', color: '#DC2626', margin: '0 0 10px' }}>❌ Expired</h3>
              {(() => {
                const expired = subscriptions.filter(sub => new Date(sub.validTill) < new Date())
                return expired.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#78716C', margin: 0 }}>No expired memberships</p>
                ) : expired.map(sub => {
                  const student = students.find(s => s.id === sub.studentId)
                  return (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #FECACA' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1C1917', fontSize: '14px' }}>{student?.name}</div>
                        <div style={{ fontSize: '12px', color: '#78716C' }}>Expired: {sub.validTill}</div>
                      </div>
                      {student && (
                        <a href={waLink(student, `Hi ${student.name}, your Beepod membership has expired. Please renew to continue.`)} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: 'white', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>
                          WhatsApp
                        </a>
                      )}
                    </div>
                  )
                })
              })()}
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '1rem' }}>
              <h3 style={{ fontSize: '14px', color: '#16A34A', margin: '0 0 10px' }}>✅ Active</h3>
              {subscriptions.filter(sub => new Date(sub.validTill) >= new Date()).map(sub => {
                const student = students.find(s => s.id === sub.studentId)
                return (
                  <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #BBF7D0' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1C1917', fontSize: '14px' }}>{student?.name}</div>
                      <div style={{ fontSize: '12px', color: '#78716C' }}>Valid till: {sub.validTill}</div>
                    </div>
                    <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#16A34A', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>Active</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default OwnerDashboard