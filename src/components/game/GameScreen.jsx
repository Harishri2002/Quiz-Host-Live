import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import QARound from '../events/QARound';
import IdentifyRound from '../events/IdentifyRound';
import BuzzerRound from '../events/BuzzerRound';
import LightningRound from '../events/LightningRound';
import WipeoutRound from '../events/WipeoutRound';
import RapidFireDuel from '../events/RapidFireDuel';
import EventIntro from './EventIntro';
import EventSummary from './EventSummary';
import EventTransition from './EventTransition';
import MiniScoreboard from './MiniScoreboard';
import PauseOverlay from './PauseOverlay';
import { EVENT_META } from '../../utils/eventTypes';

export default function GameScreen() {
  const gameData = useGameStore((s) => s.gameData);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const isPaused = useUIStore((s) => s.isPaused);

  const currentEventIndex = gameData?.state?.currentEventIndex ?? 0;
  const sequence = gameData?.sequence || [];
  const currentEvent = sequence[currentEventIndex];
  const teams = gameData?.meta?.teams || [];
  const scores = gameData?.state?.scores || {};

  const [eventPhase, setEventPhase] = useState('intro');

  useEffect(() => {
    setEventPhase('intro');
  }, [currentEventIndex]);

  const handleIntroComplete = useCallback(() => {
    setEventPhase('active');
  }, []);

  const handleEventComplete = useCallback(() => {
    setEventPhase('summary');
    useGameStore.getState().saveGame();
  }, []);

  const handleNextEvent = useCallback(() => {
    const nextIndex = currentEventIndex + 1;
    if (nextIndex >= sequence.length) {
      navigateTo('finale');
    } else {
      // Show transition before advancing
      setEventPhase('transition');
    }
  }, [currentEventIndex, sequence.length, navigateTo]);

  const handleTransitionComplete = useCallback(() => {
    useGameStore.getState().nextEvent();
    setEventPhase('intro');
  }, []);

  if (!currentEvent) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', color: 'var(--text-secondary)',
      }}>
        <p>No events configured</p>
      </div>
    );
  }

  const eventProps = {
    event: currentEvent,
    teams,
    scores,
    onComplete: handleEventComplete,
  };

  const renderEventComponent = () => {
    switch (currentEvent.type) {
      case 'QA_ROUND':
        return <QARound {...eventProps} />;
      case 'IDENTIFY':
        return <IdentifyRound {...eventProps} />;
      case 'BUZZER':
        return <BuzzerRound {...eventProps} />;
      case 'LIGHTNING':
        return <LightningRound {...eventProps} />;
      case 'WIPEOUT':
        return <WipeoutRound {...eventProps} />;
      case 'RAPID_FIRE':
        return <RapidFireDuel {...eventProps} />;
      default:
        return (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>
            Unknown event type: {currentEvent.type}
          </div>
        );
    }
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <MiniScoreboard teams={teams} scores={scores} />

      <AnimatePresence mode="wait">
        {eventPhase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', height: '100%' }}
          >
            <EventIntro
              event={currentEvent}
              eventIndex={currentEventIndex}
              totalEvents={sequence.length}
              onStart={handleIntroComplete}
            />
          </motion.div>
        )}

        {eventPhase === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%' }}
          >
            {renderEventComponent()}
          </motion.div>
        )}

        {eventPhase === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', height: '100%' }}
          >
            <EventSummary
              event={currentEvent}
              teams={teams}
              scores={scores}
              isLastEvent={currentEventIndex >= sequence.length - 1}
              onNext={handleNextEvent}
            />
          </motion.div>
        )}

        {eventPhase === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', height: '100%' }}
          >
            <EventTransition
              nextEventName={
                sequence[currentEventIndex + 1]
                  ? (sequence[currentEventIndex + 1].config?.name ||
                     EVENT_META[sequence[currentEventIndex + 1].type]?.label ||
                     'Next Event')
                  : 'Finale'
              }
              nextEventIndex={currentEventIndex + 1}
              totalEvents={sequence.length}
              onComplete={handleTransitionComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaused && <PauseOverlay />}
      </AnimatePresence>
    </div>
  );
}
