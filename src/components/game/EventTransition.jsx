import { useEffect } from 'react';
import { motion } from 'framer-motion';
import SFX from '../../utils/soundManager';

/**
 * Animated transition between events with a cinematic swipe/fade.
 * Shows for ~1.5s, then calls onComplete.
 */
export default function EventTransition({ nextEventName, nextEventIndex, totalEvents, onComplete }) {
  useEffect(() => {
    SFX.whoosh();
    const timer = setTimeout(onComplete, 1600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Sweeping bar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute', top: 0, bottom: 0,
          width: '60%',
          background: 'linear-gradient(90deg, transparent, var(--accent-25, rgba(52,152,219,0.15)), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.95] }}
        transition={{ duration: 1.5, times: [0, 0.2, 0.7, 1] }}
        style={{ textAlign: 'center', zIndex: 2 }}
      >
        <p style={{
          fontSize: 14, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8,
        }}>
          Up Next
        </p>
        <h2 className="font-display" style={{
          fontSize: 36, fontWeight: 700,
          color: 'var(--accent)',
          textTransform: 'uppercase', letterSpacing: 2,
        }}>
          {nextEventName}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
          Event {nextEventIndex + 1} of {totalEvents}
        </p>
      </motion.div>
    </div>
  );
}
