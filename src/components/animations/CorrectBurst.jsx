import { useMemo } from 'react';
import { motion } from 'framer-motion';

// Confetti-like particle burst for correct answers
export default function CorrectBurst() {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const angle = (Math.random() * 360) * (Math.PI / 180);
      const distance = Math.random() * 250 + 80;
      const size = Math.random() * 10 + 4;
      const colors = ['#27AE60', '#2ECC71', '#F1C40F', '#F39C12', '#E74C3C', '#00D4FF'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = Math.random() > 0.5 ? 'circle' : 'square';

      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size,
        color,
        shape,
        rotation: Math.random() * 720 - 360,
        delay: Math.random() * 0.2,
      };
    });
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 20,
    }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: 0, y: 0,
            scale: 1, opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: p.x, y: p.y,
            scale: 0,
            opacity: 0,
            rotate: p.rotation,
          }}
          transition={{
            duration: 1.5 + Math.random() * 0.5,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: p.size, height: p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : 2,
          }}
        />
      ))}
    </div>
  );
}
