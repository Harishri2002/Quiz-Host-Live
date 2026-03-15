import { useCallback, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Clock, ChevronRight, Sparkles } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';

// Simple particle background using CSS
function ParticleField() {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
    }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'var(--accent)',
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function RecentGameCard({ game, onOpen }) {
  const title = game.title || 'Untitled Quiz';
  const date = new Date(game.lastOpened).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <motion.button
      onClick={() => onOpen(game.filePath)}
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        width: '100%',
        cursor: 'pointer',
        textAlign: 'left',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} />
          {date}
        </div>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
    </motion.button>
  );
}

export default function LaunchScreen() {
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const createNewGame = useGameStore((s) => s.createNewGame);
  const openGame = useGameStore((s) => s.openGame);
  const openGameByPath = useGameStore((s) => s.openGameByPath);
  const navigateTo = useUIStore((s) => s.navigateTo);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    if (window.electronAPI?.file?.getRecent) {
      try {
        const recents = await window.electronAPI.file.getRecent();
        setRecentGames(recents || []);
      } catch {
        // ignore
      }
    }
  };

  const handleCreate = useCallback(async () => {
    setLoading(true);
    const success = await createNewGame();
    setLoading(false);
    if (success) {
      navigateTo('setup');
    }
  }, [createNewGame, navigateTo]);

  const handleOpen = useCallback(async () => {
    setLoading(true);
    const success = await openGame();
    setLoading(false);
    if (success) {
      navigateTo('setup');
    }
  }, [openGame, navigateTo]);

  const handleOpenRecent = useCallback(async (filePath) => {
    setLoading(true);
    const success = await openGameByPath(filePath);
    setLoading(false);
    if (success) {
      navigateTo('setup');
    }
  }, [openGameByPath, navigateTo]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-primary)',
    }}>
      {/* Particle Background */}
      <ParticleField />

      {/* Gradient Orbs */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        opacity: 0.06,
        top: '-150px',
        right: '-100px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-light) 0%, transparent 70%)',
        opacity: 0.04,
        bottom: '-100px',
        left: '-100px',
        pointerEvents: 'none',
      }} />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 48,
          zIndex: 2,
          maxWidth: 600,
          width: '100%',
          padding: '0 24px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 120 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
              <Sparkles size={36} style={{ color: 'var(--accent)' }} />
              <h1
                className="font-display"
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  letterSpacing: 3,
                  background: `linear-gradient(135deg, var(--accent-light), var(--accent), var(--accent-dark))`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                }}
              >
                Quiz-Lab
              </h1>
            </div>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              College Quiz Event Manager
            </p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            display: 'flex',
            gap: 16,
            width: '100%',
            maxWidth: 440,
          }}
        >
          <motion.button
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontSize: 16,
              minHeight: 56,
              borderRadius: 12,
              gap: 10,
            }}
          >
            <Plus size={20} />
            Create New Game
          </motion.button>

          <motion.button
            className="btn btn-secondary"
            onClick={handleOpen}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontSize: 16,
              minHeight: 56,
              borderRadius: 12,
              gap: 10,
            }}
          >
            <FolderOpen size={20} />
            Open Game
          </motion.button>
        </motion.div>

        {/* Recent Games */}
        <AnimatePresence>
          {recentGames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{ width: '100%', maxWidth: 440 }}
            >
              <h3 style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 12,
              }}>
                Recent Games
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentGames.map((game, i) => (
                  <motion.div
                    key={game.filePath}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <RecentGameCard game={game} onOpen={handleOpenRecent} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Version */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        right: 20,
        fontSize: 11,
        color: 'var(--text-muted)',
        opacity: 0.6,
      }}>
        Quiz-Lab v1.0.0
      </div>
    </div>
  );
}
