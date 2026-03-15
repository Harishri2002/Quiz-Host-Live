import useGameStore from '../../store/gameStore';

export default function SaveIndicator() {
  const saveStatus = useGameStore((s) => s.saveStatus);

  if (saveStatus === 'idle') return null;

  const labels = {
    saving: 'Saving...',
    saved: 'Saved ✓',
    error: 'Save failed!',
  };

  return (
    <div className={`save-indicator ${saveStatus}`}>
      {labels[saveStatus] || ''}
    </div>
  );
}
