import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const C = {
  ink: '#0F0E0C', paper: '#FBF7EE', paper2: '#F4EBD6',
  honey200: '#FFD361', honey300: '#F4B928', honey400: '#D99211', honey500: '#A86A07',
  buzz: '#FF2E7E', lime: '#C8FF3C',
  mute: 'rgba(15,14,12,.55)', line: 'rgba(15,14,12,.10)',
}

function hexPath(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return 'M' + pts.join(' L') + ' Z'
}

// Animated counter
function Counter({ target, duration = 2 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = parseInt(target)
    const step = end / (duration * 60)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return <span ref={ref}>{count.toLocaleString('en-IN')}</span>
}

// Floating honeycomb particles
function FloatingHex({ delay, x, y, size }) {
  return (
    <motion.div
      style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, -10, 0],
        opacity: [0.15, 0.3, 0.15],
      }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width={size} height={size * 1.15} viewBox="0 0 40 46">
        <path d="M20 1 L37 11 L37 35 L20 45 L3 35 L3 11 Z" fill="none" stroke={C.honey300} strokeWidth="1" opacity="0.4" />
      </svg>
    </motion.div>
  )
}

// Stagger container
const stagger = {
  animate: { transition: { staggerChildren: 0.08 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const fadeScale = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

function Home() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  function chooseRole(role) {
    localStorage.setItem('intendedRole', role)
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.paper,
      fontFamily: '"Plus Jakarta Sans", "Geist", -apple-system, sans-serif',
      position: 'relative', overflow: 'hidden',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Animated honeycomb background */}
      <motion.div style={{ position: 'absolute', inset: 0, y: bgY, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.5,
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='52' height='90' viewBox='0 0 52 90'><g fill='none' stroke='%230F0E0C' stroke-opacity='0.05' stroke-width='1'><path d='M26 2 L48 14 L48 38 L26 50 L4 38 L4 14 Z'/><path d='M0 50 L22 62 L22 86 L0 98'/><path d='M52 50 L30 62 L30 86 L52 98'/></g></svg>")`,
          backgroundSize: '52px 90px',
        }} />
      </motion.div>

      {/* Floating hex particles */}
      <FloatingHex delay={0} x="8%" y="15%" size={28} />
      <FloatingHex delay={1.5} x="85%" y="10%" size={22} />
      <FloatingHex delay={0.8} x="75%" y="55%" size={32} />
      <FloatingHex delay={2.2} x="12%" y="65%" size={20} />
      <FloatingHex delay={3} x="90%" y="75%" size={26} />
      <FloatingHex delay={1} x="45%" y="85%" size={18} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 480, margin: '0 auto',
        padding: '32px 24px 48px',
      }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <motion.svg
              width="34" height="34" viewBox="0 0 34 34"
              whileHover={{ rotate: 30 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <path d={hexPath(17, 17, 16)} fill={C.ink} />
              <path d={hexPath(17, 17, 9)} fill={C.honey200} />
              <circle cx="17" cy="17" r="3" fill={C.ink} />
            </motion.svg>
            <span style={{ fontWeight: 900, fontSize: 24, letterSpacing: '-.03em', color: C.ink }}>
              beepod<span style={{ color: C.buzz }}>.</span>
            </span>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 12px 6px 10px',
              background: '#fff', border: `1px solid ${C.line}`, borderRadius: 99,
              fontSize: 12, fontWeight: 600, color: C.ink,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: C.lime, boxShadow: `0 0 8px ${C.lime}` }}
            />
            live
          </motion.span>
        </motion.div>

        {/* Hero text — staggered word reveal */}
        <motion.div ref={heroRef} variants={stagger} initial="initial" animate="animate" style={{ marginBottom: 36 }}>
          <motion.h1 variants={fadeUp} style={{
            fontWeight: 900, fontSize: 46, lineHeight: 0.95,
            letterSpacing: '-.035em', color: C.ink, margin: 0,
          }}>
            find ur focus.
          </motion.h1>
          <motion.h1 variants={fadeUp} style={{
            fontWeight: 900, fontSize: 46, lineHeight: 0.95,
            letterSpacing: '-.035em', fontStyle: 'italic',
            color: C.honey400, margin: 0,
          }}>
            own ur time.
          </motion.h1>
          <motion.p variants={fadeUp} style={{
            marginTop: 14, fontWeight: 400, fontSize: 14.5,
            lineHeight: 1.5, color: C.mute, maxWidth: '38ch',
          }}>
            india's hive of study rooms — discover pods near u or run ur own.
          </motion.p>
        </motion.div>

        {/* WHO R U */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            fontFamily: 'monospace', fontSize: 11, fontWeight: 500,
            letterSpacing: '.32em', textTransform: 'uppercase',
            color: C.honey500, margin: '0 0 16px',
          }}
        >
          who r u?
        </motion.div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* STUDENT CARD */}
          <motion.button
            onClick={() => chooseRole('student')}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, boxShadow: '0 24px 48px rgba(15,14,12,.28)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', textAlign: 'left',
              background: C.ink, color: C.paper2,
              borderRadius: 28, padding: 22,
              border: 'none', cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 14px 32px rgba(15,14,12,.18)',
              fontFamily: 'inherit',
            }}
          >
            <motion.svg
              style={{ position: 'absolute', top: -30, right: -30, opacity: 0.15 }}
              width="170" height="170"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              <path d="M85 8 L155 46 L155 122 L85 160 L15 122 L15 46 Z" fill={C.honey200} />
            </motion.svg>

            <span style={{
              fontFamily: 'monospace', fontSize: 10, letterSpacing: '.22em',
              color: C.honey200, background: 'rgba(244,185,40,.12)',
              padding: '4px 10px', borderRadius: 100,
              display: 'inline-block', marginBottom: 14,
              border: '1px solid rgba(244,185,40,.2)',
            }}>FOR STUDENTS</span>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 6 }}>
              find a pod <span style={{ fontStyle: 'italic', color: C.honey200 }}>near u</span>
            </div>
            <div style={{ fontSize: 14, color: 'rgba(251,247,238,0.65)', marginBottom: 18 }}>
              radar-style discovery · contact owners on whatsapp · free forever
            </div>
            <motion.div
              whileHover={{ x: 6 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: C.honey200, color: C.ink,
                padding: '11px 18px', borderRadius: 14,
                fontWeight: 700, fontSize: 14,
              }}
            >
              i'm a student
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
            </motion.div>
          </motion.button>

          {/* OWNER CARD */}
          <motion.button
            onClick={() => chooseRole('owner')}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, boxShadow: '0 18px 36px rgba(15,14,12,.12)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', textAlign: 'left',
              background: '#fff', color: C.ink,
              borderRadius: 28, padding: 22,
              border: `1px solid ${C.line}`, cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              fontFamily: 'inherit',
            }}
          >
            <motion.svg
              style={{ position: 'absolute', top: -10, right: -10, opacity: 0.4 }}
              width="120" height="120"
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            >
              <path d="M60 6 L108 34 L108 90 L60 118 L12 90 L12 34 Z" fill="none" stroke={C.honey300} strokeWidth="1.2" />
              <path d="M60 30 L86 46 L86 78 L60 94 L34 78 L34 46 Z" fill="none" stroke={C.honey300} strokeWidth="1" />
            </motion.svg>

            <span style={{
              fontFamily: 'monospace', fontSize: 10, letterSpacing: '.22em',
              color: C.honey500, background: C.paper2,
              padding: '4px 10px', borderRadius: 100,
              display: 'inline-block', marginBottom: 14,
            }}>FOR OWNERS</span>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 6 }}>
              run your library, <span style={{ fontStyle: 'italic', color: C.honey400 }}>better</span>
            </div>
            <div style={{ fontSize: 14, color: C.mute, marginBottom: 18 }}>
              student management · payment tracking · automated reminders · ₹699/mo
            </div>
            <motion.div
              whileHover={{ x: 6 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: C.ink, color: C.honey200,
                padding: '11px 18px', borderRadius: 14,
                fontWeight: 700, fontSize: 14,
              }}
            >
              i'm an owner
              <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>→</motion.span>
            </motion.div>
          </motion.button>
        </div>

        {/* Stats — count-up animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          style={{
            display: 'flex', justifyContent: 'space-around',
            padding: '24px 0', marginTop: 32,
            borderTop: '1px dashed rgba(15,14,12,.12)',
          }}
        >
          {[
            { num: 500, suffix: '+', label: 'pods' },
            { num: 12000, suffix: '+', label: 'students' },
            { num: 24, suffix: '', label: 'cities' }
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>
                <Counter target={s.num} />{s.suffix}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: C.mute, letterSpacing: '.14em', marginTop: 2 }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 16, paddingTop: 16,
            fontFamily: 'monospace', fontSize: 10.5,
            letterSpacing: '.18em', textTransform: 'uppercase',
            color: 'rgba(15,14,12,.35)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.ink }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.buzz }} />
            14 pods buzzing
          </span>
          <span>v1.0 · hive</span>
        </motion.div>
      </div>
    </div>
  )
}

export default Home
