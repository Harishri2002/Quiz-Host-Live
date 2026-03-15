import { useEffect, useCallback, useState } from 'react';
import useUIStore from '../../store/uiStore';

export default function Notification() {
  const notification = useUIStore((s) => s.notification);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [notification]);

  if (!visible || !notification) return null;

  const bgColors = {
    success: 'var(--success)',
    error: 'var(--error)',
    info: 'var(--accent)',
    warning: 'var(--warning)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        padding: '12px 20px',
        borderRadius: 8,
        background: bgColors[notification.type] || bgColors.info,
        color: 'white',
        fontSize: 14,
        fontWeight: 500,
        zIndex: 200,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        animation: 'fadeInUp 0.3s ease-out',
        maxWidth: 360,
      }}
    >
      {notification.message}
    </div>
  );
}
