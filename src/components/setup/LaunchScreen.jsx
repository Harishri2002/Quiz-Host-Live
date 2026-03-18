import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Clock, ChevronRight, Sparkles, Download, X, FileJson } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import CanvasParticles from '../common/CanvasParticles';

// ── Load Game Modal ──────────────────────────────────────
function LoadGameModal({ recentGames, loading, onOpen, onOpenFromFile, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '28px 28px',
          width: '100%', maxWidth: 480,
          maxHeight: '80vh', overflow: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Load Game</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Open from file */}
        <button
          onClick={onOpenFromFile}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 10, marginBottom: 20,
            background: 'rgba(108,99,255,0.12)', border: '1px dashed rgba(108,99,255,0.4)',
            color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: 10, fontWeight: 600, fontSize: 14, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(108,99,255,0.22)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(108,99,255,0.12)'}
        >
          <FolderOpen size={18} />
          Browse for file… (.qmg or .json)
        </button>

        {/* Recent Games */}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>
          Recent Games
        </div>

        {recentGames.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 16px',
            color: 'var(--text-muted)', background: 'var(--bg-card)',
            borderRadius: 12, border: '1px dashed var(--border)',
            fontSize: 14,
          }}>
            No recent games found.<br />
            <span style={{ fontSize: 12 }}>Create a new game or browse for a file above.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentGames.map((game) => {
              const title = game.title || 'Untitled Quiz';
              const date = new Date(game.lastOpened).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              });
              return (
                <motion.button
                  key={game.filePath}
                  disabled={loading}
                  onClick={() => onOpen(game.filePath)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: 10, width: '100%',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {date}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </motion.button>
              );
            })}
          </div>
        )}
      </motion.div>
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

  // State for window dimensions to pass to CanvasParticles
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    loadRecent();

    // Handle window resize for CanvasParticles
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadRecent = async () => {
    if (window.electronAPI?.file?.getRecent) {
      try {
        const recents = await window.electronAPI.file.getRecent();
        setRecentGames(recents || []);
      } catch {
        // ignore
      }
    } else {
      const browserRecents = useGameStore.getState().getRecentGames();
      setRecentGames(browserRecents || []);
    }
  };

  const handleCreate = useCallback(async () => {
    setLoading(true);
    try {
      const success = await createNewGame();
      if (success) {
        navigateTo('setup');
      }
    } finally {
      setLoading(false);
    }
  }, [createNewGame, navigateTo]);

  const handleImportDesktop = useCallback(async () => {
    setLoading(true);
    try {
      const success = await openGame();
      if (success) {
        navigateTo('setup');
      }
    } finally {
      setLoading(false);
    }
  }, [openGame, navigateTo]);

  const handleOpenRecent = useCallback(async (filePath) => {
    setLoading(true);
    try {
      const success = await openGameByPath(filePath);
      if (success) {
        navigateTo('setup');
      }
    } finally {
      setLoading(false);
    }
  }, [openGameByPath, navigateTo]);

  const [showLoadModal, setShowLoadModal] = useState(false);
  const handleOpenLoadModal = () => {
    setShowLoadModal(true);
    loadRecent();
  };
  const handleCloseLoadModal = () => setShowLoadModal(false);

  const handleOpenFromFile = useCallback(async () => {
    handleCloseLoadModal();
    setLoading(true);
    try {
      const success = await openGame();
      if (success) {
        navigateTo('setup');
      }
    } finally {
      setLoading(false);
    }
  }, [openGame, navigateTo]);

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
      <CanvasParticles variant="space" color="var(--accent)" count={60} />

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
                  letterSpacing: 2,
                  background: `linear-gradient(135deg, var(--accent-light), var(--accent), var(--accent-dark))`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Quiz-Host
                <span style={{ 
                  fontSize: 20, 
                  letterSpacing: 1,
                  padding: '6px 14px', 
                  borderRadius: 24, 
                  background: 'rgba(39, 174, 96, 0.15)', 
                  border: '1px solid var(--success)', 
                  color: 'var(--success)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginLeft: 20,
                  WebkitTextFillColor: 'var(--success)', // Override the gradient clip for badge
                }}>
                  <motion.div 
                    animate={{ opacity: [1, 0.4, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }} 
                    style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} 
                  />
                  LIVE
                </span>
              </h1>
            </div>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 16,
              fontWeight: 400,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              Quiz Event Manager
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
              padding: '16px 12px',
              fontSize: 16,
              minHeight: 56,
              borderRadius: 12,
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={20} />
            Create New Game
          </motion.button>

          <motion.button
            className="btn btn-secondary"
            onClick={handleOpenLoadModal}
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1,
              padding: '16px 12px',
              fontSize: 16,
              minHeight: 56,
              borderRadius: 12,
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            <FolderOpen size={20} />
            Load Game
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          <motion.button
            className="btn btn-secondary"
            onClick={handleImportDesktop}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '12px 12px',
              fontSize: 15,
              borderRadius: 12,
              gap: 8,
              background: 'transparent',
              border: '1px dashed var(--border)',
            }}
          >
            <Download size={18} />
            Import Game from File (.qmg/.json)
          </motion.button>
        </motion.div>

        {/* Load Game Modal */}
        <AnimatePresence>
          {showLoadModal && (
            <LoadGameModal
              recentGames={recentGames}
              loading={loading}
              onOpen={handleOpenRecent}
              onOpenFromFile={handleOpenFromFile}
              onClose={handleCloseLoadModal}
            />
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
        Quiz-Host Live v1.0.0
      </div>
    </div>
  );
}
