import { motion } from 'framer-motion'

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.25, ease: 'easeIn' } }
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition