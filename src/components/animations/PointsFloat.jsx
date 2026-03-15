import { motion } from 'framer-motion';

export default function PointsFloat({ points, color }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -50, scale: 1.2 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="font-timer"
      style={{
        fontSize: 32,
        fontWeight: 900,
        color: color || 'var(--success)',
        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
        pointerEvents: 'none',
      }}
    >
      {points}
    </motion.div>
  );
}
