import { useState, useEffect } from 'react'

function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [seatNumber, setSeatNumber] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')

  useEffect(() => {
    fetchStudents()
  }, [])

  function fetchStudents() {
    fetch('http://localhost:8080/api/students')
      .then(res => res.json())
      .then(data => {
        setStudents(data)
        setLoading(false)
      })
  }

  function addStudent() {
    if(!name || !phone) {
      alert('Please enter name and phone')
      return
    }
    fetch('http://localhost:8080/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, seatNumber, paymentStatus })
    })
    .then(res => res.json())
    .then(() => {
      setName('')
      setPhone('')
      setSeatNumber('')
      setPaymentStatus('unpaid')
      fetchStudents()
    })
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', backgroundColor: '#FFFBEB', minHeight: '100vh' }}>
      <h1 style={{ color: '#D97706' }}>Beepod — Students</h1>

      <div style={{ background: 'white', border: '1px solid #E5E3DC', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '16px', color: '#1C1917' }}>Add New Student</h2>
        <input
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px', color: '#1C1917', backgroundColor: 'white' }}
        />
        <input
          placeholder="Phone number"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px', color: '#1C1917', backgroundColor: 'white' }}
        />
        <input
          placeholder="Seat number"
          value={seatNumber}
          onChange={e => setSeatNumber(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px', color: '#1C1917', backgroundColor: 'white' }}
        />
        <select
          value={paymentStatus}
          onChange={e => setPaymentStatus(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #E5E3DC', boxSizing: 'border-box', fontSize: '14px', color: '#1C1917', backgroundColor: 'white' }}
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
        <button
          onClick={addStudent}
          style={{ width: '100%', padding: '12px', background: '#D97706', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}
        >
          Add Student
        </button>
      </div>

      <p style={{ color: '#78716C' }}>{students.length} students</p>
      {loading ? <p>Loading...</p> : students.map(student => (
        <div key={student.id} style={{ background: 'white', border: '1px solid #E5E3DC', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, color: '#1C1917' }}>{student.name}</h3>
          <p style={{ color: '#78716C', margin: '4px 0' }}>📞 {student.phone}</p>
          <p style={{ color: '#78716C', margin: '4px 0' }}>🪑 Seat: {student.seatNumber}</p>
          <span style={{
            background: student.paymentStatus === 'paid' ? '#DCFCE7' : '#FEF2F2',
            color: student.paymentStatus === 'paid' ? '#16A34A' : '#DC2626',
            padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
          }}>
            {student.paymentStatus}
          </span>
        </div>
      ))}
    </div>
  )
}

export default Students