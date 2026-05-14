import { useNavigate } from 'react-router-dom'

const C = {
  ink: '#0F0E0C', paper: '#FBF7EE', paper2: '#F4EBD6',
  honey200: '#FFD361', honey300: '#F4B928', honey400: '#D99211', honey500: '#A86A07',
  buzz: '#FF2E7E', lime: '#C8FF3C',
  line: 'rgba(15,14,12,.10)', line2: 'rgba(15,14,12,.06)',
}

const Arrow = ({ color }) => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
    <path d="M1 7h15M11 2l5 5-5 5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function Home() {
  const navigate = useNavigate()

  function chooseRole(role) {
    localStorage.setItem('intendedRole', role)
    navigate('/login')
  }

  const styles = {
    page: {
      minHeight: '100vh',
      background: C.paper,
      fontFamily: '"Plus Jakarta Sans", "Geist", -apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      color: C.ink,
      position: 'relative',
      overflow: 'hidden',
    },
    combPattern: {
      position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='52' height='90' viewBox='0 0 52 90'><g fill='none' stroke='%230F0E0C' stroke-opacity='0.05' stroke-width='1'><path d='M26 2 L48 14 L48 38 L26 50 L4 38 L4 14 Z'/><path d='M0 50 L22 62 L22 86 L0 98'/><path d='M52 50 L30 62 L30 86 L52 98'/></g></svg>")`,
      backgroundSize: '52px 90px',
    },
    container: {
      position: 'relative', zIndex: 2,
      maxWidth: 460, margin: '0 auto',
      padding: '32px 24px 40px',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
    },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 },
    brand: { display: 'flex', alignItems: 'center', gap: 10 },
    brandName: { fontWeight: 900, fontSize: 24, letterSpacing: '-.03em', color: C.ink },
    live: {
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 12px 6px 10px',
      background: '#fff', border: `1px solid ${C.line}`, borderRadius: 99,
      fontSize: 12, fontWeight: 600, color: C.ink,
      boxShadow: '0 1px 0 rgba(15,14,12,.04)',
    },
    liveDot: { width: 7, height: 7, borderRadius: '50%', background: C.lime, boxShadow: `0 0 8px ${C.lime}` },
    h1: { fontWeight: 900, fontSize: 46, lineHeight: 0.95, letterSpacing: '-.035em', color: C.ink, marginBottom: 6, marginTop: 0 },
    h1alt: { color: C.honey400, fontStyle: 'italic', fontWeight: 900, display: 'block' },
    sub: { marginTop: 14, fontWeight: 400, fontSize: 14.5, lineHeight: 1.5, color: 'rgba(15,14,12,.6)', maxWidth: '38ch' },
    eyebrow: {
      fontFamily: '"Geist Mono", monospace', fontSize: 11, fontWeight: 500,
      letterSpacing: '.32em', textTransform: 'uppercase',
      color: C.honey500, margin: '40px 0 16px',
    },
    stack: { display: 'flex', flexDirection: 'column', gap: 14 },
    card: (dark) => ({
      borderRadius: 28, padding: '22px 22px 24px',
      position: 'relative', overflow: 'hidden',
      background: dark ? C.ink : '#fff',
      color: dark ? C.paper2 : C.ink,
      border: dark ? 'none' : `1px solid ${C.line2}`,
      cursor: 'pointer',
      textAlign: 'left', width: '100%',
      fontFamily: 'inherit',
      transition: 'transform .15s ease, box-shadow .15s ease',
    }),
    tag: (dark) => ({
      display: 'inline-block', padding: '6px 12px', borderRadius: 99,
      fontFamily: '"Geist Mono", monospace',
      fontSize: 10, fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase',
      marginBottom: 18,
      background: dark ? 'rgba(244,185,40,.12)' : C.paper2,
      color: dark ? C.honey200 : C.honey500,
      border: dark ? '1px solid rgba(244,185,40,.2)' : 'none',
    }),
    h2: () => ({ fontWeight: 900, fontSize: 30, lineHeight: 1, letterSpacing: '-.028em', marginBottom: 12, maxWidth: '13ch', marginTop: 0 }),
    h2em: (dark) => ({ color: dark ? C.honey300 : C.honey400, fontStyle: 'italic', fontWeight: 900 }),
    cardP: (dark) => ({
      fontSize: 14, lineHeight: 1.5, fontWeight: 400, maxWidth: '32ch',
      color: dark ? 'rgba(251,247,238,.7)' : 'rgba(15,14,12,.6)',
      margin: 0
    }),
    cta: (variant) => ({
      marginTop: 22,
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '14px 20px 14px 22px',
      borderRadius: 99, border: 'none', cursor: 'pointer',
      fontFamily: 'inherit',
      fontWeight: 700, fontSize: 15, letterSpacing: '-.01em',
      background: variant === 'honey' ? C.honey200 : C.ink,
      color: variant === 'honey' ? C.ink : C.honey200,
    }),
    deco: { position: 'absolute', top: -30, right: -30, width: 170, height: 170, opacity: 0.9 },
    footer: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginTop: 'auto', paddingTop: 32,
      borderTop: '1px dashed rgba(15,14,12,.12)',
      fontFamily: '"Geist Mono", monospace',
      fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase',
      color: 'rgba(15,14,12,.45)',
    },
    footerDot: { color: C.ink, display: 'inline-flex', alignItems: 'center', gap: 6 },
  }

  return (
    <div style={styles.page}>
      <div style={styles.combPattern} />

      <div style={styles.container}>
        {/* header */}
        <div style={styles.header}>
          <div style={styles.brand}>
            <svg width="34" height="34" viewBox="0 0 34 34">
              <path d="M17 1 L31 9 L31 25 L17 33 L3 25 L3 9 Z" fill={C.ink} />
              <path d="M17 9 L24 13 L24 21 L17 25 L10 21 L10 13 Z" fill={C.honey200} />
              <circle cx="17" cy="17" r="3" fill={C.ink} />
            </svg>
            <span style={styles.brandName}>beepod<span style={{ color: C.buzz }}>.</span></span>
          </div>
          <span style={styles.live}>
            <span style={styles.liveDot} /> live
          </span>
        </div>

        {/* hero */}
        <div>
          <h1 style={styles.h1}>
            find ur focus.
            <span style={styles.h1alt}>own ur time.</span>
          </h1>
          <p style={styles.sub}>india's hive of study rooms — discover pods near u or run ur own.</p>
        </div>

        <div style={styles.eyebrow}>who r u?</div>

        {/* cards */}
        <div style={styles.stack}>
          {/* STUDENT */}
          <button onClick={() => chooseRole('student')} style={styles.card(true)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 18px 36px rgba(15,14,12,.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
            <svg style={styles.deco} viewBox="0 0 200 200">
              <path d="M100 8 L182 50 L182 134 L100 176 L18 134 L18 50 Z" fill="#1f1c17" />
            </svg>
            <span style={styles.tag(true)}>for students</span>
            <h2 style={styles.h2()}>
              find a pod <em style={styles.h2em(true)}>near u</em>
            </h2>
            <p style={styles.cardP(true)}>
              radar-style discovery · contact owners on whatsapp · free forever
            </p>
            <span style={styles.cta('honey')}>
              i'm a student <Arrow color={C.ink} />
            </span>
          </button>

          {/* OWNER */}
          <button onClick={() => chooseRole('owner')} style={styles.card(false)}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 28px rgba(15,14,12,.10)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
            <svg style={styles.deco} viewBox="0 0 200 200">
              <path d="M100 8 L182 50 L182 134 L100 176 L18 134 L18 50 Z" fill="none" stroke="rgba(15,14,12,.12)" strokeWidth="1.4" />
              <path d="M100 48 L148 76 L148 130 L100 158 L52 130 L52 76 Z" fill="none" stroke="rgba(15,14,12,.08)" strokeWidth="1.2" />
            </svg>
            <span style={styles.tag(false)}>for owners</span>
            <h2 style={styles.h2()}>
              run your library, <em style={styles.h2em(false)}>better</em>
            </h2>
            <p style={styles.cardP(false)}>
              student management · payment tracking · automated reminders · ₹699/mo
            </p>
            <span style={styles.cta('ink')}>
              i'm an owner <Arrow color={C.honey200} />
            </span>
          </button>
        </div>

        {/* footer */}
        <div style={styles.footer}>
          <span style={styles.footerDot}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.buzz }} />
            14 pods buzzing
          </span>
          <span>v0.3 · hive-204</span>
        </div>
      </div>
    </div>
  )
}

export default Home