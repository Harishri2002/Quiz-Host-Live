import { motion } from 'framer-motion';
import useUIStore from '../../store/uiStore';
import { Pause, Monitor } from 'lucide-react';

export default function PauseOverlay() {
  const togglePause = useUIStore((s) => s.togglePause);
  const isProjector = useUIStore((s) => s.isProjector);

  const handleOpenProjector = () => {
    window.open(window.location.origin + '?projector=true', 'projector', 'width=1280,height=720');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 24,
        zIndex: 50,
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <Pause size={60} style={{ color: 'var(--text-muted)' }} />
      </motion.div>
      <h2 className="font-display" style={{
        fontSize: 48, fontWeight: 700, color: 'var(--text-primary)',
        letterSpacing: 4, textTransform: 'uppercase',
      }}>
        Quiz Break
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
        Press Ctrl+Shift+P to resume
      </p>
      <button
        className="btn btn-secondary"
        onClick={togglePause}
        style={{ marginTop: 12, padding: '12px 32px' }}
      >
        Resume Game
      </button>

      {!isProjector && (
        <button
          className="btn btn-secondary"
          onClick={handleOpenProjector}
          style={{ marginTop: 4, padding: '8px 24px', fontSize: 13, background: 'transparent' }}
        >
          <Monitor size={16} />
          Launch Projector Screen
        </button>
      )}
    </motion.div>
  );
}
