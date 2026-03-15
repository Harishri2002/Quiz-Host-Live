import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useGameStore from '../../store/gameStore';

export default function GameIntro({ onStart }) {
  const gameData = useGameStore((s) => s.gameData);

  const title = gameData?.meta?.title || 'Quiz-Host Live Game';
  const subtitle = gameData?.settings?.introSubtitle || 'Welcome to the Event';
  const fontStyle = gameData?.settings?.introFont || 'display';
  const logo = gameData?.meta?.logo || null;

  const getFontFamily = () => {
    switch (fontStyle) {
      case 'sans': return '"Inter", sans-serif';
      case 'serif': return '"Merriweather", "Georgia", serif';
      case 'display': default: return '"Orbitron", sans-serif';
    }
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      padding: 40,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          textAlign: 'center',
          maxWidth: 900,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        {logo && (
          <motion.img
            src={logo}
            alt="Quiz Logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              maxHeight: 100, maxWidth: 300, objectFit: 'contain',
              marginBottom: 20,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
            }}
          />
        )}

        <h1 style={{
          fontFamily: getFontFamily(),
          fontSize: 84,
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: fontStyle === 'display' ? 4 : 0,
          lineHeight: 1.1,
          marginBottom: 24,
          textShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {title}
        </h1>
        
        {subtitle && (
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: 'var(--accent)',
              fontFamily: '"Rajdhani", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: 6,
              marginBottom: 60,
            }}
          >
            {subtitle}
          </motion.h2>
        )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="btn btn-primary btn-large"
            style={{
              fontSize: 20,
              padding: '16px 48px',
              borderRadius: 30,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <Play size={24} style={{ marginRight: 12 }} />
            Begin Event
          </motion.button>
      </motion.div>
    </div>
  );
}
