import { motion } from 'framer-motion';
import { EVENT_META } from '../../utils/eventTypes';
import SFX from '../../utils/soundManager';

export default function EventIntro({ event, eventIndex, totalEvents, onStart }) {
  const meta = EVENT_META[event.type] || {};
  const Icon = meta.icon;
  const name = event.config?.name || meta.label || 'Event';
  const questionCount = event.questions?.length || 0;

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle, ${meta.color}30 0%, transparent 70%)`,
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ textAlign: 'center', zIndex: 2 }}
      >
        {/* Event Number */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 14, fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 3, marginBottom: 20,
          }}
        >
          Event {eventIndex + 1} of {totalEvents}
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 150 }}
          style={{
            width: 80, height: 80, borderRadius: 20,
            background: `${meta.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          {Icon && <Icon size={40} style={{ color: meta.color }} />}
        </motion.div>

        {/* Event Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display"
          style={{
            fontSize: 60, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', marginBottom: 12,
            color: meta.color || 'var(--accent)',
          }}
        >
          {name}
        </motion.h1>

        {/* Question Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            fontSize: 18, color: 'var(--text-secondary)',
            marginBottom: 40,
          }}
        >
          {questionCount} Question{questionCount !== 1 ? 's' : ''}
        </motion.p>

        {/* Start Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { SFX.eventStart(); onStart(); }}
          className="btn btn-primary btn-large"
          style={{
            fontSize: 18, padding: '16px 48px',
            background: meta.color || 'var(--accent)',
          }}
        >
          Begin Event
        </motion.button>
      </motion.div>
    </div>
  );
}
