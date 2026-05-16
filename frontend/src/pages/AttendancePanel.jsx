import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const API = 'https://beepodbackend-production.up.railway.app'

function AttendancePanel({ spaceId, spaceName, students }) {
  const [todayList, setTodayList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const printRef = useRef(null)

  const checkinUrl = `https://beepod.in/checkin/${spaceId}`

  useEffect(() => {
    loadToday()
    const interval = setInterval(loadToday, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [spaceId])

  async function loadToday() {
    try {
      const data = await fetch(`${API}/api/attendance/today/${spaceId}`).then(r => r.json())
      setTodayList(data)
    } catch {}
    setLoading(false)
  }

  function getStudentName(studentId) {
    const s = students.find(st => st.id === studentId)
    return s?.name || 'Unknown'
  }

  function formatTime(dt) {
    if (!dt) return '—'
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  function printQR() {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head><title>BeePod QR - ${spaceName}</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; font-family:sans-serif; text-align:center">
          <h1 style="font-size:28px; margin-bottom:4px">${spaceName}</h1>
          <p style="color:#666; margin-bottom:24px">Scan to mark attendance</p>
          <img src="data:image/svg+xml;base64,${btoa(document.getElementById('qr-svg-owner')?.outerHTML || '')}" width="280" height="280" />
          <p style="margin-top:16px; font-size:14px; color:#888">${checkinUrl}</p>
          <p style="margin-top:24px; font-size:12px; color:#aaa">Powered by BeePod</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const checkedIn = todayList.filter(a => !a.checkOutTime)
  const checkedOut = todayList.filter(a => a.checkOutTime)

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={statCard}>
          <div style={statLabel}>Present today</div>
          <div style={statValue}>{todayList.length}</div>
          <div style={statSub}>{checkedIn.length} currently in</div>
        </div>
        <div style={statCard}>
          <div style={statLabel}>Checked out</div>
          <div style={statValue}>{checkedOut.length}</div>
          <div style={statSub}>completed sessions</div>
        </div>
        <div style={statCard}>
          <div style={statLabel}>QR scans today</div>
          <div style={statValue}>{todayList.length}</div>
          <div style={statSub}>total check-ins</div>
        </div>
      </div>

      {/* QR Section */}
      <div style={{
        background: '#fff', border: '1px solid #ECECE8', borderRadius: 16,
        padding: 24, marginBottom: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: '#1B1B1A' }}>Attendance QR code</h3>
            <p style={{ fontSize: 13, color: '#6F6F69', margin: '4px 0 0' }}>Students scan this to check in</p>
          </div>
          <button onClick={() => setShowQR(!showQR)} style={{
            padding: '8px 16px', borderRadius: 10, border: '1px solid #ECECE8',
            background: showQR ? '#1B1B1A' : '#fff', color: showQR ? '#FFC529' : '#1B1B1A',
            fontWeight: 600, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
          }}>
            {showQR ? 'Hide QR' : 'Show QR'}
          </button>
        </div>

        {showQR && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: '#FBF7EE', borderRadius: 20, padding: 24,
              display: 'inline-block', marginBottom: 16,
              border: '1px solid rgba(15,14,12,.06)'
            }}>
              <div id="qr-svg-owner">
                <QRCodeSVG
                  value={checkinUrl}
                  size={220}
                  level="H"
                  bgColor="#FBF7EE"
                  fgColor="#0F0E0C"
                  imageSettings={{
                    src: '',
                    height: 0,
                    width: 0,
                  }}
                />
              </div>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#6F6F69', margin: '0 0 12px', fontFamily: 'monospace', letterSpacing: '.05em' }}>
                {checkinUrl}
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => { navigator.clipboard.writeText(checkinUrl) }} style={actionBtn}>
                  Copy link
                </button>
                <button onClick={printQR} style={{ ...actionBtn, background: '#1B1B1A', color: '#FFC529', borderColor: '#1B1B1A' }}>
                  Print QR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Today's attendance table */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#1B1B1A' }}>Today's attendance</h2>
        <button onClick={loadToday} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6F6F69', fontSize: 13, fontFamily: 'inherit' }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#8A8A82', fontSize: 14, padding: 20 }}>Loading...</p>
      ) : todayList.length === 0 ? (
        <div style={{
          border: '1px dashed #DCDCD6', borderRadius: 12, padding: '40px 24px',
          background: '#fff', textAlign: 'center'
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, color: '#1B1B1A' }}>No check-ins yet today</div>
          <div style={{ fontSize: 13, color: '#6F6F69' }}>Show the QR code to your students to get started</div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #ECECE8', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                <th style={th}>Student</th>
                <th style={th}>Check in</th>
                <th style={th}>Check out</th>
                <th style={th}>Duration</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayList.map(a => {
                const inTime = a.checkInTime ? new Date(a.checkInTime) : null
                const outTime = a.checkOutTime ? new Date(a.checkOutTime) : null
                let duration = '—'
                if (inTime && outTime) {
                  const mins = Math.round((outTime - inTime) / 60000)
                  duration = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
                } else if (inTime) {
                  const mins = Math.round((new Date() - inTime) / 60000)
                  duration = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
                }
                const isIn = !a.checkOutTime
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #F1F1ED' }}>
                    <td style={tdName}>{getStudentName(a.studentId)}</td>
                    <td style={td}>{formatTime(a.checkInTime)}</td>
                    <td style={td}>{formatTime(a.checkOutTime)}</td>
                    <td style={td}>{duration}</td>
                    <td style={td}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                        background: isIn ? '#DCFCE7' : '#FFF4CC',
                        color: isIn ? '#15803D' : '#7A5A00',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: isIn ? '#22C55E' : '#FFC529' }} />
                        {isIn ? 'studying' : 'left'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const statCard = { background: '#fff', border: '1px solid #ECECE8', borderRadius: 12, padding: '20px 22px' }
const statLabel = { fontSize: 13, color: '#6F6F69', fontWeight: 500 }
const statValue = { fontSize: 32, fontWeight: 700, margin: '10px 0 6px', letterSpacing: '-.02em', color: '#1B1B1A' }
const statSub = { fontSize: 12, color: '#8A8A82' }
const th = {
  textAlign: 'left', padding: '12px 18px', fontSize: 12, fontWeight: 600,
  color: '#6F6F69', textTransform: 'uppercase', letterSpacing: '0.04em',
  background: '#FAFAF7', borderBottom: '1px solid #ECECE8'
}
const td = { padding: '14px 18px', color: '#3A3A36' }
const tdName = { padding: '14px 18px', fontWeight: 600, color: '#1B1B1A' }
const actionBtn = {
  padding: '8px 16px', borderRadius: 10, border: '1px solid #ECECE8',
  background: '#fff', color: '#1B1B1A',
  fontWeight: 600, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
}

export default AttendancePanel