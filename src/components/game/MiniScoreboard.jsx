import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Trophy } from 'lucide-react';

export default function MiniScoreboard({ teams, scores }) {
  const [open, setOpen] = useState(false);

  const sorted = [...teams].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <>
      {/* Trigger button */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 20 }}>
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 13, fontWeight: 700,
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          🏆
          <span style={{ color: 'var(--warning)' }}>
            {sorted[0] ? `${sorted[0]}: ${scores[sorted[0]] || 0}` : 'Scores'}
          </span>
        </motion.button>
      </div>

      {/* Full-screen Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="scoreboard-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 560,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                padding: '32px 36px',
                position: 'relative',
              }}
            >
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 6, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <Trophy size={32} style={{ color: '#F1C40F', marginBottom: 8 }} />
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  Live Scores
                </h2>
              </div>

              {/* Scoreboard */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sorted.map((team, i) => (
                  <motion.div
                    key={team}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 20px', borderRadius: 12,
                      background: i === 0 ? 'rgba(241,196,15,0.12)' : 'var(--bg-card)',
                      border: i === 0 ? '1.5px solid rgba(241,196,15,0.4)' : '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: 22, minWidth: 30 }}>{i < 3 ? medals[i] : `${i + 1}.`}</span>
                    <span style={{
                      flex: 1, fontSize: 18, fontWeight: i === 0 ? 800 : 600,
                      color: i === 0 ? '#F1C40F' : 'var(--text-primary)',
                    }}>
                      {team}
                    </span>
                    <span className="font-timer" style={{
                      fontSize: 26, fontWeight: 900,
                      color: i === 0 ? '#F1C40F' : 'var(--text-secondary)',
                    }}>
                      {scores[team] || 0}
                    </span>
                  </motion.div>
                ))}
              </div>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
                Click anywhere outside to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
