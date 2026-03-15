import { motion } from 'framer-motion';
import {
  Info, Layers, Settings as SettingsIcon, Monitor, Play,
  ArrowLeft, Save
} from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useGameStore from '../../store/gameStore';
import GameInfoPanel from './GameInfoPanel';
import SequenceBuilder from './SequenceBuilder';
import EventEditor from './EventEditor';

const tabs = [
  { id: 'info', label: 'Game Info', icon: Info },
  { id: 'sequence', label: 'Sequence', icon: Layers },
  { id: 'editor', label: 'Event Editor', icon: SettingsIcon },
];

export default function SetupHub() {
  const setupTab = useUIStore((s) => s.setupTab);
  const setSetupTab = useUIStore((s) => s.setSetupTab);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const activeEventId = useUIStore((s) => s.activeEventId);
  const gameData = useGameStore((s) => s.gameData);
  const saveGame = useGameStore((s) => s.saveGame);
  const startGame = useGameStore((s) => s.startGame);
  const isDirty = useGameStore((s) => s.isDirty);

  const hasEvents = gameData?.sequence?.length > 0;
  const hasQuestions = gameData?.sequence?.some((e) => (e.questions?.length || 0) > 0);
  const canStart = hasEvents && hasQuestions;

  const handleStartGame = () => {
    if (!canStart) return;
    saveGame();
    startGame();
    navigateTo('game');
  };

  const handleBackToLaunch = () => {
    if (isDirty) {
      saveGame();
    }
    useGameStore.getState().closeGame();
    useUIStore.getState().resetUI();
  };

  const handleOpenProjector = () => {
    window.open(window.location.origin + '?projector=true', 'projector', 'width=1280,height=720');
  };

  const renderPanel = () => {
    switch (setupTab) {
      case 'info':
        return <GameInfoPanel />;
      case 'sequence':
        return <SequenceBuilder />;
      case 'editor':
        return <EventEditor />;
      default:
        return <GameInfoPanel />;
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      background: 'var(--bg-primary)',
    }}>
      {/* Sidebar */}
      <div style={{
        width: 240,
        minWidth: 240,
        height: '100%',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
      }}>
        {/* Back Button */}
        <button
          onClick={handleBackToLaunch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            marginBottom: 8,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        {/* Game Title */}
        <div style={{
          padding: '12px 20px 20px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 8,
        }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {gameData?.meta?.title || 'Untitled Quiz'}
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {gameData?.sequence?.length || 0} events configured
          </p>
        </div>

        {/* Nav Tabs */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {tabs.map((tab) => {
            const isActive = setupTab === tab.id;
            const Icon = tab.icon;
            const isDisabled = tab.id === 'editor' && !activeEventId;

            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setSetupTab(tab.id)}
                disabled={isDisabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 20px',
                  background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  border: 'none',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  color: isDisabled
                    ? 'var(--text-muted)'
                    : isActive
                      ? 'var(--accent)'
                      : 'var(--text-secondary)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{
          padding: '16px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <button
            className="btn btn-secondary"
            onClick={handleOpenProjector}
            style={{ width: '100%', fontSize: 13, minHeight: 40, padding: '8px 12px' }}
          >
            <Monitor size={16} />
            Launch Projector
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => saveGame()}
            style={{ width: '100%', fontSize: 13, minHeight: 40, padding: '8px 12px' }}
          >
            <Save size={16} />
            Save Game
          </button>

          <motion.button
            className={`btn btn-primary ${!canStart ? 'btn-disabled' : ''}`}
            onClick={handleStartGame}
            disabled={!canStart}
            whileHover={canStart ? { scale: 1.02 } : {}}
            whileTap={canStart ? { scale: 0.98 } : {}}
            style={{ width: '100%', fontSize: 14, minHeight: 44, padding: '10px 12px' }}
            title={!canStart ? 'Add at least one event with questions to start' : 'Start the game'}
          >
            <Play size={18} />
            Start Game
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
      }}>
        <motion.div
          key={setupTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          style={{ width: '100%', height: '100%' }}
        >
          {renderPanel()}
        </motion.div>
      </div>
    </div>
  );
}
