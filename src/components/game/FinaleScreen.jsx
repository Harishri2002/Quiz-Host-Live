import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Home, RotateCcw } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import SFX from '../../utils/soundManager';

function ConfettiRain() {
  const particles = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => {
      const colors = ['#F1C40F', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#E67E22', '#00D4FF', '#FF6B81'];
      return {
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: Math.random() * 3 + 3,
        size: Math.random() * 10 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 720,
        wobble: Math.random() * 40 - 20,
      };
    });
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: '110vh',
            x: `${p.x + p.wobble}vw`,
            rotate: p.rotation,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

export default function FinaleScreen() {
  const gameData = useGameStore((s) => s.gameData);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const endGame = useGameStore((s) => s.endGame);
  const [showConfetti, setShowConfetti] = useState(true);

  const teams = gameData?.meta?.teams || [];
  const scores = gameData?.state?.scores || {};
  const sorted = [...teams].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const winner = sorted[0];
  const winnerScore = scores[winner] || 0;

  useEffect(() => {
    setTimeout(() => SFX.finale(), 500);
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleReturnToMenu = () => {
    endGame();
    useUIStore.getState().resetUI();
    navigateTo('setup');
  };

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative', overflow: 'hidden',
    }}>
      {showConfetti && <ConfettiRain />}

      <div style={{
        position: 'absolute',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(241, 196, 15, 0.12) 0%, transparent 70%)',
        top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ textAlign: 'center', zIndex: 2, maxWidth: 600 }}
      >
        {/* Congrats heading */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 16, fontWeight: 700, letterSpacing: 6,
            textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 8,
          }}
        >
          🎉 Congratulations! 🎉
        </motion.p>

        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: [0, 1.15, 1], rotate: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 10 }}
          style={{ fontSize: 90, marginBottom: 16 }}
        >
          🏆
        </motion.div>

        {/* Winner */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="font-display"
          style={{
            fontSize: 56, fontWeight: 900, letterSpacing: 3,
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #F1C40F, #F39C12, #E67E22)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 8,
          }}
        >
          {winner}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="font-timer"
          style={{ fontSize: 28, color: 'var(--warning)', marginBottom: 32 }}
        >
          {winnerScore} Points
        </motion.p>

        {/* Final Standings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            marginBottom: 32, width: '100%',
          }}
        >
          {sorted.map((team, i) => (
            <motion.div
              key={team}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', borderRadius: 8,
                background: i === 0 ? 'rgba(241, 196, 15, 0.1)' : 'var(--bg-card)',
                border: i === 0 ? '1px solid rgba(241, 196, 15, 0.3)' : '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{i < 3 ? medals[i] : `${i + 1}.`}</span>
                <span style={{
                  fontSize: 15, fontWeight: i === 0 ? 700 : 500,
                  color: i === 0 ? '#F1C40F' : 'var(--text-primary)',
                }}>
                  {team}
                </span>
              </div>
              <span className="font-timer" style={{
                fontSize: 18, fontWeight: 700,
                color: i === 0 ? '#F1C40F' : 'var(--text-secondary)',
              }}>
                {scores[team] || 0}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center' }}
        >
          <button
            className="btn btn-secondary"
            onClick={handleReturnToMenu}
            style={{ gap: 8 }}
          >
            <Home size={18} />
            Return to Menu
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
