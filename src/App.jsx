import { useEffect, useCallback } from 'react';
import useUIStore from './store/uiStore';
import useGameStore from './store/gameStore';
import { applyTheme } from './themes/themes';
import LaunchScreen from './components/setup/LaunchScreen';
import SetupHub from './components/setup/SetupHub';
import GameScreen from './components/game/GameScreen';
import FinaleScreen from './components/game/FinaleScreen';
import Notification from './components/common/Notification';
import SaveIndicator from './components/common/SaveIndicator';

function App() {
  const currentScreen = useUIStore((s) => s.currentScreen);
  const gameData = useGameStore((s) => s.gameData);

  // Apply theme on load and when it changes
  useEffect(() => {
    const theme = gameData?.settings?.theme || 'dark_galaxy';
    applyTheme(theme);
  }, [gameData?.settings?.theme]);

  // Auto-save interval
  useEffect(() => {
    if (!gameData) return;
    const interval = (gameData.settings?.autoSaveInterval || 30) * 1000;
    const timer = setInterval(() => {
      const state = useGameStore.getState();
      if (state.isDirty && state.filePath) {
        state.saveGame();
      }
    }, interval);
    return () => clearInterval(timer);
  }, [gameData?.settings?.autoSaveInterval]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      useGameStore.getState().saveGame();
    }
    // Ctrl+Shift+P to pause (during game)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      if (currentScreen === 'game') {
        useUIStore.getState().togglePause();
      }
    }
    // Ctrl+Shift+Q to exit game (during game)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Q') {
      e.preventDefault();
      if (currentScreen === 'game') {
        useGameStore.getState().saveGame();
        useGameStore.getState().endGame();
        useUIStore.getState().navigateTo('setup');
        useUIStore.getState().setPaused(false);
      }
    }
  }, [currentScreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'launch':
        return <LaunchScreen />;
      case 'setup':
        return <SetupHub />;
      case 'game':
        return <GameScreen />;
      case 'finale':
        return <FinaleScreen />;
      default:
        return <LaunchScreen />;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', background: 'var(--bg-primary)' }}>
      {renderScreen()}
      <Notification />
      <SaveIndicator />
    </div>
  );
}

export default App;
