import { useEffect, useRef } from 'react';

/**
 * CanvasParticles
 * Lightweight HTML5 Canvas particle system.
 * @param {Object} props
 * @param {string} props.variant - 'space', 'dust', 'nodes', 'sparkles'
 * @param {string} props.color - CSS color to use for particles (e.g., 'var(--accent)')
 * @param {number} props.count - Number of particles
 */
export default function CanvasParticles({ variant = 'dust', color = 'rgba(255, 255, 255, 0.5)', count = 50 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      // Need parent container to have position relative or absolute
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    
    // Initial resize
    resize();
    window.addEventListener('resize', resize);
    
    // Resolve CSS variable color if needed
    let resolvedColor = color;
    if (color.startsWith('var(')) {
      // Extract the variable name, e.g., --accent
      const varName = color.slice(4, -1).trim();
      resolvedColor = getComputedStyle(document.body).getPropertyValue(varName).trim() || '#ffffff';
    }

    // Initialize particles
    for (let i = 0; i < count; i++) {
      particles.push(createParticle(variant, canvas));
    }

    function createParticle(variant, canvas) {
      if (variant === 'space') {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.5 + 0.1,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseOffset: Math.random() * Math.PI * 2,
        };
      } else if (variant === 'nodes') {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          opacity: 0.6,
        };
      } else if (variant === 'sparkles') {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          vy: Math.random() * -1 - 0.2, // always UP
          vx: (Math.random() - 0.5) * 0.5,
          opacity: 0,
          decay: Math.random() * 0.02 + 0.01,
          state: 'fade-in'
        };
      } else {
        // 'dust' (default)
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.1,
        };
      }
    }

    const drawLine = (p1, p2, distance) => {
      if (distance > 100) return;
      const opacity = 1 - (distance / 100);
      ctx.beginPath();
      // Replace last parenthesis with opacity if color is rgba(), otherwise just apply globalAlpha
      ctx.globalAlpha = opacity * 0.3;
      ctx.strokeStyle = resolvedColor;
      ctx.lineWidth = 1;
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Node connections
      if (variant === 'nodes') {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            drawLine(particles[i], particles[j], dist);
          }
        }
      }

      particles.forEach((p) => {
        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Boundary checks
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        let currentOpacity = p.opacity;

        if (variant === 'space') {
          currentOpacity = p.opacity + Math.sin(Date.now() * p.pulseSpeed + p.pulseOffset) * 0.3;
          currentOpacity = Math.max(0.1, Math.min(1, currentOpacity));
        } else if (variant === 'sparkles') {
          if (p.state === 'fade-in') {
            p.opacity += p.decay;
            if (p.opacity >= 1) p.state = 'fade-out';
          } else {
            p.opacity -= p.decay;
            if (p.opacity <= 0) {
              // reset particle
              p.x = Math.random() * canvas.width;
              p.y = canvas.height; 
              p.opacity = 0;
              p.state = 'fade-in';
            }
          }
          currentOpacity = Math.max(0, Math.min(1, p.opacity));
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = resolvedColor;
        ctx.globalAlpha = currentOpacity;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, color, count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0, // Ensure it's behind content but visible
      }}
    />
  );
}
