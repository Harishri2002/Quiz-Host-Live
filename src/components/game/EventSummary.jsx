import { motion } from 'framer-motion';
import { Trophy, ChevronRight, Flag } from 'lucide-react';

export default function EventSummary({ event, teams, scores, isLastEvent, onNext }) {
  const name = event.config?.name || 'Event';
  const sorted = [...teams].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: 40,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: 600, width: '100%' }}
      >
        {/* Title */}
        <h2 style={{
          fontSize: 14, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8,
        }}>
          Round Complete
        </h2>
        <h1 className="font-display" style={{
          fontSize: 36, fontWeight: 700, marginBottom: 32,
          color: 'var(--accent)',
        }}>
          {name}
        </h1>

        {/* Leaderboard */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8,
          marginBottom: 40,
        }}>
          {sorted.map((team, i) => {
            const score = scores[team] || 0;
            const maxScore = Math.max(...Object.values(scores), 1);
            const barWidth = (score / maxScore) * 100;
            const medals = ['🥇', '🥈', '🥉'];

            return (
              <motion.div
                key={team}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10,
                  background: 'var(--bg-card)',
                  border: i === 0 ? '1px solid var(--accent)' : '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: 20, width: 30, textAlign: 'center' }}>
                  {i < 3 ? medals[i] : `${i + 1}.`}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15, fontWeight: 600, marginBottom: 4,
                  }}>
                    {team}
                  </div>
                  <div style={{
                    height: 6, borderRadius: 3,
                    background: 'var(--bg-tertiary)',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(barWidth, 5)}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                      style={{
                        height: '100%', borderRadius: 3,
                        background: `hsl(${(i * 360) / teams.length}, 65%, 55%)`,
                      }}
                    />
                  </div>
                </div>
                <span className="font-timer" style={{
                  fontSize: 20, fontWeight: 700,
                  color: i === 0 ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                  {score}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Next Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="btn btn-primary btn-large"
          style={{ fontSize: 18, padding: '16px 40px', gap: 10 }}
        >
          {isLastEvent ? (
            <><Flag size={20} /> Go to Finale</>
          ) : (
            <><ChevronRight size={20} /> Next Event</>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
