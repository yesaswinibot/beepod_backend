import { useState, useEffect } from 'react'
import AttendancePanel from './AttendancePanel'

const API = 'https://beepodbackend-production.up.railway.app'

// ── Sidebar nav items ─────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'students', label: 'Students', icon: '○' },
  { id: 'unpaid', label: 'Unpaid', icon: '₹' },
  { id: 'expiry', label: 'Expiry', icon: '▤' },
  { id: 'earnings', label: 'Earnings', icon: '◈' },
  { id: 'attendance', label: 'Attendance', icon: '◎' },
]

// ── Reusable components ─────────────────

function Sidebar({ active, onNav, ownerName }) {
  const initials = (ownerName || 'O').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <aside style={sb.aside}>
      <div style={sb.brand}>
        <div style={sb.logoMark}>B</div>
        <span style={sb.brandText}>BeePod</span>
      </div>
      <nav style={sb.nav}>
        <button key="attendance" onClick={() => onNav('attendance')}
          style={{ ...sb.navItem, ...(active === 'attendance' ? sb.navItemActive : {}) }}>
          <span style={sb.navIcon}>◎</span>
          <span>Attendance</span>
        </button>
        {NAV.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
            style={{ ...sb.navItem, ...(active === item.id ? sb.navItemActive : {}) }}>
            <span style={sb.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={sb.owner}>
        <div style={sb.avatar}>{initials}</div>
        <div style={{ textAlign: 'left' }}>
          <div style={sb.ownerName}>{ownerName || 'Owner'}</div>
          <div style={sb.ownerSub}>Study Room Owner</div>
        </div>
      </div>
    </aside>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div style={card.card}>
      <div style={card.label}>{label}</div>
      <div style={card.value}>{value}</div>
      <div style={card.sub}>{sub}</div>
    </div>
  )
}

function StatusPill({ status }) {
  const isPaid = status === 'paid'
  return (
    <span style={{
      ...pill.base,
      background: isPaid ? '#DCFCE7' : '#FFF4CC',
      color: isPaid ? '#15803D' : '#7A5A00'
    }}>
      <span style={{ ...pill.dot, background: isPaid ? '#22C55E' : '#FFC529' }} />
      {status}
    </span>
  )
}

// ── Revenue chart (SVG) ─────────────────
function RevenueChart({ subscriptions }) {
  const W = 760, H = 260
  const pad = { top: 16, right: 16, bottom: 28, left: 56 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  // Generate daily revenue from subscriptions
  const today = new Date()
  const data = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const label = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`
    // Simulate daily revenue based on subscription data
    const activeOnDay = subscriptions.filter(s => {
      const from = new Date(s.validFrom)
      const till = new Date(s.validTill)
      return d >= from && d <= till
    })
    const revenue = activeOnDay.reduce((sum, s) => sum + Math.round((s.monthlyFee || 0) / 30), 0)
    data.push({ label, revenue, date: d })
  }

  if (data.length === 0) return <div style={{ padding: 40, textAlign: 'center', color: '#8A8A82' }}>No data yet</div>

  const maxVal = Math.max(...data.map(d => d.revenue), 100)
  const yMax = Math.ceil(maxVal / 500) * 500 || 500
  const yRange = yMax

  const x = (i) => pad.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const y = (v) => pad.top + innerH - (v / yRange) * innerH

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.revenue).toFixed(1)}`).join(' ')

  const ticks = 4
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => (yRange * i) / ticks)
  const labelStep = Math.max(1, Math.floor(data.length / 6))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} preserveAspectRatio="none">
      {tickVals.map((v, i) => (
        <g key={i}>
          <line x1={pad.left} x2={W - pad.right} y1={y(v)} y2={y(v)} stroke="#ECECE8" strokeDasharray="3 3" strokeWidth={1} />
          <text x={pad.left - 8} y={y(v) + 4} fontSize="11" fill="#8A8A82" textAnchor="end">₹{v.toLocaleString('en-IN')}</text>
        </g>
      ))}
      <path d={`${path} L ${x(data.length - 1).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`}
        fill="#FFC529" fillOpacity="0.22" />
      <path d={path} fill="none" stroke="#1B6B36" strokeWidth="2.5" />
      {data.map((d, i) =>
        i % labelStep === 0 || i === data.length - 1 ? (
          <text key={i} x={x(i)} y={H - 8} fontSize="11" fill="#8A8A82" textAnchor="middle">{d.label}</text>
        ) : null
      )}
    </svg>
  )
}

// ── Main Dashboard ─────────────────
function OwnerDashboard() {
  const [page, setPage] = useState('dashboard')
  const [spaces, setSpaces] = useState([])
  const [students, setStudents] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  // Add student form
  const [showAdd, setShowAdd] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [newName, setNewName] = useState('')
  const [newSeat, setNewSeat] = useState('')
  const [newFee, setNewFee] = useState('')
  const [newFrom, setNewFrom] = useState('')
  const [newTill, setNewTill] = useState('')
  const [newPayment, setNewPayment] = useState('unpaid')
  const [addError, setAddError] = useState('')

  const ownerName = localStorage.getItem('name') || 'Owner'

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const [sp, st, su] = await Promise.all([
        fetch(`${API}/api/spaces`).then(r => r.json()),
        fetch(`${API}/api/students`).then(r => r.json()),
        fetch(`${API}/api/subscriptions/space/1`).then(r => r.json())
      ])
      setSpaces(sp)
      setStudents(st)
      setSubscriptions(su)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function addStudent() {
    setAddError('')
    if (!newPhone) { setAddError('Phone number is required.'); return }
    const allStudents = await fetch(`${API}/api/students`).then(r => r.json())
    let student = allStudents.find(s => s.phone === newPhone)
    if (!student) {
      const createRes = await fetch(`${API}/api/students`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone, name: newName || newPhone })
      })
      if (!createRes.ok) { setAddError('Failed to create student.'); return }
      student = await createRes.json()
    }
    const sub = { spaceId: spaces[0]?.id, studentId: student.id, seatNumber: newSeat, monthlyFee: parseInt(newFee), validFrom: newFrom, validTill: newTill, paymentStatus: newPayment }
    const res = await fetch(`${API}/api/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) })
    if (res.ok) {
      setShowAdd(false); setNewPhone(''); setNewName(''); setNewSeat(''); setNewFee(''); setNewFrom(''); setNewTill(''); setNewPayment('unpaid')
      loadData()
    } else { setAddError('Failed to add student. Check all fields.') }
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
  const unpaidSubscriptions = subscriptions.filter(s => s.paymentStatus === 'unpaid')
  const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.monthlyFee || 0), 0)
  const paidRevenue = subscriptions.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + (s.monthlyFee || 0), 0)
  const occupancyRate = spaces[0]?.totalSeats ? Math.round((activeSubscriptions.length / spaces[0].totalSeats) * 100) : 0

  function waLink(student, msg) {
    return `https://wa.me/91${student.phone}?text=${encodeURIComponent(msg)}`
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>
      <p style={{ color: '#8A8A82', fontSize: 15 }}>Loading dashboard...</p>
    </div>
  )

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #ECECE8', borderRadius: 8,
    fontSize: 14, fontFamily: 'inherit', color: '#1B1B1A', background: '#fff', outline: 'none', boxSizing: 'border-box', marginBottom: 8
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", "Geist", -apple-system, sans-serif', background: '#FAFAF7', WebkitFontSmoothing: 'antialiased' }}>

      {/* Sidebar */}
      <Sidebar active={page} onNav={setPage} ownerName={ownerName} />

      {/* Main content */}
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', minWidth: 0 }}>
          {page === 'attendance' && (
  <div>
    <header style={{ marginBottom: 24 }}>
      <h1 style={pg.h1}>Attendance</h1>
      <p style={pg.sub}>QR check-in for {spaces[0]?.name || 'your study room'}</p>
    </header>
    <AttendancePanel spaceId={spaces[0]?.id} spaceName={spaces[0]?.name} students={students} />
  </div>
)}

        {/* ─── DASHBOARD ─── */}
        {page === 'dashboard' && (
          <div>
            <header style={{ marginBottom: 24 }}>
              <h1 style={pg.h1}>Dashboard</h1>
              <p style={pg.sub}>Overview of {spaces[0]?.name || 'your study room'}</p>
            </header>

            <div style={pg.statsGrid}>
              <StatCard label="Active students" value={activeSubscriptions.length} sub={`of ${spaces[0]?.totalSeats || 0} seats`} />
              <StatCard label="Total revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub={`₹${paidRevenue.toLocaleString('en-IN')} collected`} />
              <StatCard label="Occupancy rate" value={`${occupancyRate}%`} sub="Seats filled" />
            </div>

            {/* Add student */}
            <div style={{ marginBottom: 24 }}>
              <button onClick={() => setShowAdd(!showAdd)} style={{
                padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: '#FFC529', color: '#1B1B1A', fontWeight: 700, fontSize: 14, fontFamily: 'inherit'
              }}>{showAdd ? 'Cancel' : '+ Add student'}</button>
            </div>

            {showAdd && (
              <div style={{ background: '#fff', border: '1px solid #ECECE8', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px', color: '#1B1B1A' }}>Add new student</h3>
                <input placeholder="Phone number *" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={inputStyle} />
                <input placeholder="Student name (optional)" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input placeholder="Seat (e.g. A12)" value={newSeat} onChange={e => setNewSeat(e.target.value)} style={inputStyle} />
                  <input placeholder="Monthly fee (₹)" value={newFee} onChange={e => setNewFee(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input type="date" value={newFrom} onChange={e => setNewFrom(e.target.value)} style={inputStyle} />
                  <input type="date" value={newTill} onChange={e => setNewTill(e.target.value)} style={inputStyle} />
                </div>
                <select value={newPayment} onChange={e => setNewPayment(e.target.value)} style={inputStyle}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
                {addError && <p style={{ color: '#DC2626', fontSize: 13, margin: '0 0 8px' }}>{addError}</p>}
                <button onClick={addStudent} style={{
                  width: '100%', padding: 12, borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: '#1B1B1A', color: '#FFC529', fontWeight: 700, fontSize: 14, fontFamily: 'inherit'
                }}>Confirm & add student</button>
              </div>
            )}

            {/* Recent students table */}
            <section>
              <div style={pg.sectionHead}>
                <h2 style={pg.h2}>Recent students</h2>
                <span style={pg.muted}>{subscriptions.length} total</span>
              </div>
              <div style={tbl.wrap}>
                <table style={tbl.table}>
                  <thead>
                    <tr>
                      <th style={tbl.th}>Student</th>
                      <th style={tbl.th}>Seat</th>
                      <th style={tbl.th}>Fee</th>
                      <th style={tbl.th}>Valid till</th>
                      <th style={tbl.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.slice(0, 7).map(sub => {
                      const student = students.find(s => s.id === sub.studentId)
                      return (
                        <tr key={sub.id} style={tbl.tr}>
                          <td style={tbl.tdName}>{student?.name || 'Unknown'}</td>
                          <td style={tbl.td}>{sub.seatNumber}</td>
                          <td style={tbl.td}>₹{sub.monthlyFee}</td>
                          <td style={tbl.td}>{sub.validTill}</td>
                          <td style={tbl.td}><StatusPill status={sub.paymentStatus} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ─── STUDENTS ─── */}
        {page === 'students' && (
          <div>
            <header style={{ marginBottom: 24 }}>
              <h1 style={pg.h1}>Students</h1>
              <p style={pg.sub}>All students in your study room</p>
            </header>
            <div style={tbl.wrap}>
              <table style={tbl.table}>
                <thead>
                  <tr>
                    <th style={tbl.th}>Student</th>
                    <th style={tbl.th}>Phone</th>
                    <th style={tbl.th}>Seat</th>
                    <th style={tbl.th}>Fee</th>
                    <th style={tbl.th}>Valid</th>
                    <th style={tbl.th}>Status</th>
                    <th style={tbl.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(sub => {
                    const student = students.find(s => s.id === sub.studentId)
                    return (
                      <tr key={sub.id} style={tbl.tr}>
                        <td style={tbl.tdName}>{student?.name || 'Unknown'}</td>
                        <td style={tbl.td}>{student?.phone}</td>
                        <td style={tbl.td}>{sub.seatNumber}</td>
                        <td style={tbl.td}>₹{sub.monthlyFee}/mo</td>
                        <td style={tbl.td}>{sub.validFrom} → {sub.validTill}</td>
                        <td style={tbl.td}><StatusPill status={sub.paymentStatus} /></td>
                        <td style={{ ...tbl.td, textAlign: 'right' }}>
                          {student && (
                            <a href={waLink(student, `Hi ${student.name}, regarding your BeePod membership.`)}
                              target="_blank" rel="noreferrer"
                              style={tbl.msgBtn}>✉ Message</a>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── UNPAID ─── */}
        {page === 'unpaid' && (
          <div>
            <header style={{ marginBottom: 24 }}>
              <h1 style={pg.h1}>Unpaid</h1>
              <p style={pg.sub}>{unpaidSubscriptions.length} student{unpaidSubscriptions.length !== 1 ? 's' : ''} with pending payments</p>
            </header>
            {unpaidSubscriptions.length === 0 ? (
              <div style={pg.empty}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={pg.emptyTitle}>All payments collected</div>
                <div style={pg.emptyBody}>Every student has paid their dues. Nice work!</div>
              </div>
            ) : (
              <div style={tbl.wrap}>
                <table style={tbl.table}>
                  <thead>
                    <tr>
                      <th style={tbl.th}>Student</th>
                      <th style={tbl.th}>Phone</th>
                      <th style={tbl.th}>Seat</th>
                      <th style={tbl.th}>Fee due</th>
                      <th style={tbl.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidSubscriptions.map(sub => {
                      const student = students.find(s => s.id === sub.studentId)
                      return (
                        <tr key={sub.id} style={tbl.tr}>
                          <td style={tbl.tdName}>{student?.name || 'Unknown'}</td>
                          <td style={tbl.td}>{student?.phone}</td>
                          <td style={tbl.td}>{sub.seatNumber}</td>
                          <td style={{ ...tbl.td, color: '#DC2626', fontWeight: 600 }}>₹{sub.monthlyFee}</td>
                          <td style={{ ...tbl.td, textAlign: 'right' }}>
                            {student && (
                              <a href={waLink(student, `Hi ${student.name}, your BeePod membership fee of ₹${sub.monthlyFee} is pending. Please pay to keep your seat.`)}
                                target="_blank" rel="noreferrer"
                                style={{ ...tbl.msgBtn, background: '#25D366', color: '#fff', borderColor: '#25D366' }}>
                                WhatsApp reminder
                              </a>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── EXPIRY ─── */}
        {page === 'expiry' && (
          <div>
            <header style={{ marginBottom: 24 }}>
              <h1 style={pg.h1}>Expiry tracker</h1>
              <p style={pg.sub}>Monitor membership validity</p>
            </header>

            {/* Expiring this week */}
            {(() => {
              const now = new Date()
              const week = new Date(); week.setDate(now.getDate() + 7)
              const expiring = subscriptions.filter(s => {
                const t = new Date(s.validTill)
                return t >= now && t <= week
              })
              const expired = subscriptions.filter(s => new Date(s.validTill) < now)
              const active = subscriptions.filter(s => new Date(s.validTill) >= now)

              return (
                <>
                  <div style={pg.statsGrid}>
                    <StatCard label="Expiring this week" value={expiring.length} sub="Need attention" />
                    <StatCard label="Expired" value={expired.length} sub="Memberships ended" />
                    <StatCard label="Active" value={active.length} sub="Currently valid" />
                  </div>

                  {expiring.length > 0 && (
                    <section style={{ marginBottom: 24 }}>
                      <h2 style={pg.h2}>⚠ Expiring this week</h2>
                      <div style={{ ...tbl.wrap, marginTop: 12, borderColor: '#FDE68A' }}>
                        <table style={tbl.table}>
                          <thead><tr><th style={tbl.th}>Student</th><th style={tbl.th}>Expires</th><th style={tbl.th}></th></tr></thead>
                          <tbody>
                            {expiring.map(sub => {
                              const student = students.find(s => s.id === sub.studentId)
                              return (
                                <tr key={sub.id} style={tbl.tr}>
                                  <td style={tbl.tdName}>{student?.name}</td>
                                  <td style={tbl.td}>{sub.validTill}</td>
                                  <td style={{ ...tbl.td, textAlign: 'right' }}>
                                    {student && <a href={waLink(student, `Hi ${student.name}, your BeePod membership expires on ${sub.validTill}. Please renew to keep your seat.`)} target="_blank" rel="noreferrer" style={{ ...tbl.msgBtn, background: '#25D366', color: '#fff', borderColor: '#25D366' }}>WhatsApp</a>}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {expired.length > 0 && (
                    <section>
                      <h2 style={pg.h2}>❌ Expired</h2>
                      <div style={{ ...tbl.wrap, marginTop: 12 }}>
                        <table style={tbl.table}>
                          <thead><tr><th style={tbl.th}>Student</th><th style={tbl.th}>Expired on</th><th style={tbl.th}></th></tr></thead>
                          <tbody>
                            {expired.map(sub => {
                              const student = students.find(s => s.id === sub.studentId)
                              return (
                                <tr key={sub.id} style={tbl.tr}>
                                  <td style={tbl.tdName}>{student?.name}</td>
                                  <td style={{ ...tbl.td, color: '#DC2626' }}>{sub.validTill}</td>
                                  <td style={{ ...tbl.td, textAlign: 'right' }}>
                                    {student && <a href={waLink(student, `Hi ${student.name}, your BeePod membership has expired. Please renew to continue.`)} target="_blank" rel="noreferrer" style={tbl.msgBtn}>WhatsApp</a>}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </>
              )
            })()}
          </div>
        )}

        {/* ─── EARNINGS ─── */}
        {page === 'earnings' && (
          <div>
            <header style={{ marginBottom: 24 }}>
              <h1 style={pg.h1}>Earnings</h1>
              <p style={pg.sub}>Revenue overview for your study rooms</p>
            </header>

            <div style={pg.statsGrid}>
              <StatCard label="Total revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="All subscriptions" />
              <StatCard label="Collected" value={`₹${paidRevenue.toLocaleString('en-IN')}`} sub={`${Math.round((paidRevenue / (totalRevenue || 1)) * 100)}% collection rate`} />
              <StatCard label="Pending" value={`₹${(totalRevenue - paidRevenue).toLocaleString('en-IN')}`} sub={`${unpaidSubscriptions.length} unpaid students`} />
            </div>

            <section style={{ marginBottom: 28 }}>
              <div style={pg.sectionHead}>
                <h2 style={pg.h2}>Revenue — last 30 days</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: '#1B6B36' }} />
                  <span style={{ fontSize: 12, color: '#5A5A55' }}>Daily revenue</span>
                </div>
              </div>
              <div style={{
                background: '#fff', border: '1px solid #ECECE8', borderRadius: 12, padding: '20px 22px'
              }}>
                <RevenueChart subscriptions={subscriptions} />
              </div>
            </section>

            <section>
              <div style={pg.sectionHead}>
                <h2 style={pg.h2}>All subscriptions</h2>
                <span style={pg.muted}>{subscriptions.length} total</span>
              </div>
              <div style={tbl.wrap}>
                <table style={tbl.table}>
                  <thead>
                    <tr>
                      <th style={tbl.th}>Student</th>
                      <th style={tbl.th}>Monthly fee</th>
                      <th style={tbl.th}>Valid till</th>
                      <th style={tbl.th}>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(sub => {
                      const student = students.find(s => s.id === sub.studentId)
                      return (
                        <tr key={sub.id} style={tbl.tr}>
                          <td style={tbl.tdName}>{student?.name || 'Unknown'}</td>
                          <td style={tbl.td}>₹{sub.monthlyFee}</td>
                          <td style={tbl.td}>{sub.validTill}</td>
                          <td style={tbl.td}><StatusPill status={sub.paymentStatus} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  )
}

// ── Styles ─────────────────

const sb = {
  aside: {
    width: 240, background: '#fff', borderRight: '1px solid #ECECE8',
    display: 'flex', flexDirection: 'column', padding: '20px 0',
    position: 'sticky', top: 0, height: '100vh',
    fontFamily: 'inherit'
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 20px', marginBottom: 28
  },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: '#1B1B1A', color: '#FFC529',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 16
  },
  brandText: { fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#1B1B1A' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8, border: 'none',
    background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 14, fontWeight: 500, color: '#5A5A55',
    transition: 'background 0.12s'
  },
  navItemActive: { background: '#FFF4CC', color: '#1B1B1A', fontWeight: 600 },
  navIcon: { fontSize: 16, width: 20, textAlign: 'center' },
  owner: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 20px', borderTop: '1px solid #ECECE8', marginTop: 'auto'
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: '#1B1B1A', color: '#FFC529',
    fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  ownerName: { fontSize: 13, fontWeight: 600, color: '#1B1B1A' },
  ownerSub: { fontSize: 12, color: '#8A8A82' }
}

const card = {
  card: { background: '#fff', border: '1px solid #ECECE8', borderRadius: 12, padding: '20px 22px' },
  label: { fontSize: 13, color: '#6F6F69', fontWeight: 500 },
  value: { fontSize: 32, fontWeight: 700, margin: '10px 0 6px', letterSpacing: '-0.02em', color: '#1B1B1A' },
  sub: { fontSize: 12, color: '#8A8A82' }
}

const pill = {
  base: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500 },
  dot: { width: 6, height: 6, borderRadius: '50%' }
}

const pg = {
  h1: { fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#1B1B1A' },
  sub: { color: '#6F6F69', fontSize: 14, margin: '6px 0 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 },
  sectionHead: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  h2: { fontSize: 18, fontWeight: 600, margin: 0, color: '#1B1B1A' },
  muted: { color: '#8A8A82', fontSize: 13 },
  empty: {
    border: '1px dashed #DCDCD6', borderRadius: 12, padding: '48px 24px',
    background: '#fff', textAlign: 'center'
  },
  emptyTitle: { fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#1B1B1A' },
  emptyBody: { fontSize: 14, color: '#6F6F69', maxWidth: 420, margin: '0 auto' }
}

const tbl = {
  wrap: { background: '#fff', border: '1px solid #ECECE8', borderRadius: 12, overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left', padding: '12px 18px', fontSize: 12, fontWeight: 600,
    color: '#6F6F69', textTransform: 'uppercase', letterSpacing: '0.04em',
    background: '#FAFAF7', borderBottom: '1px solid #ECECE8'
  },
  tr: { borderBottom: '1px solid #F1F1ED' },
  td: { padding: '14px 18px', color: '#3A3A36' },
  tdName: { padding: '14px 18px', fontWeight: 600, color: '#1B1B1A' },
  msgBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', border: '1px solid #ECECE8', background: '#fff',
    borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#1B1B1A',
    cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none'
  }
}

export default OwnerDashboard