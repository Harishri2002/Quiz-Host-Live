import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function MiniScoreboard({ teams, scores }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      position: 'absolute',
      top: 12, right: 12,
      zIndex: 20,
    }}>
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.02 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 8,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: 13, fontWeight: 600,
        }}
      >
        🏆 Scores
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            style={{
              position: 'absolute', top: '100%', right: 0,
              marginTop: 6, minWidth: 200,
              padding: '12px 14px', borderRadius: 10,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
            }}
          >
            {teams.map((team, i) => (
              <div
                key={team}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: i < teams.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{team}</span>
                <span className="font-timer" style={{
                  fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                }}>
                  {scores[team] || 0}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
