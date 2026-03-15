import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronRight, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { useSyncState } from '../../utils/syncManager';
import { OPTION_LABELS } from '../../utils/eventTypes';
import CorrectBurst from '../animations/CorrectBurst';
import SFX from '../../utils/soundManager';

export default function WipeoutRound({ event, teams, scores, onComplete }) {
  const gameData = useGameStore((s) => s.gameData);

  const [questionIndex, setQuestionIndex] = useSyncState('wipe_qIdx', 0);
  const [phase, setPhase] = useSyncState('wipe_phs', 'wager'); // 'wager' → 'question' → 'reveal'
  const [wagers, setWagers] = useSyncState('wipe_wgrs', {});
  const [selectedOption, setSelectedOption] = useSyncState('wipe_selOpt', null);
  const [answerRevealed, setAnswerRevealed] = useSyncState('wipe_ansRev', false);
  const [showingCorrectBurst, setShowingCorrectBurst] = useSyncState('wipe_burst', false);
  const [results, setResults] = useSyncState('wipe_res', null); // { team: +/- amount }

  const addScore = useGameStore((s) => s.addScore);
  const deductScore = useGameStore((s) => s.deductScore);
  const config = event.config || {};
  const questions = event.questions || [];
  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = questionIndex >= totalQuestions - 1;
  const basePoints = config.basePoints || 20;

  if (!currentQuestion) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No questions in this event
      </div>
    );
  }

  const handleSetWager = (team, wager) => {
    setWagers((prev) => ({ ...prev, [team]: Math.max(config.allowZeroWager ? 0 : 1, parseInt(wager) || 0) }));
  };

  const handleLockWagers = () => {
    // Default any missing wager to basePoints
    const finalWagers = {};
    teams.forEach((t) => { finalWagers[t] = wagers[t] ?? basePoints; });
    setWagers(finalWagers);
    setPhase('question');
  };

  const handleSelectOption = (index) => {
    if (answerRevealed || selectedOption !== null) return;
    SFX.select();
    setSelectedOption(index);
  };

  const handleRevealAnswer = () => {
    if (selectedOption === null || answerRevealed) return;
    SFX.reveal();
    setAnswerRevealed(true);
    const correct = selectedOption === currentQuestion.correctOptionIndex;
    if (correct) {
      setTimeout(() => SFX.correct(), 200);
      setShowingCorrectBurst(true);
      setTimeout(() => setShowingCorrectBurst(false), 2500);
    } else {
      setTimeout(() => SFX.wrong(), 200);
    }
    setPhase('reveal');
  };

  const handleApplyResults = (correctTeams) => {
    const res = {};
    teams.forEach((team) => {
      const wager = wagers[team] || basePoints;
      if (correctTeams.includes(team)) {
        addScore(team, wager);
        res[team] = `+${wager}`;
      } else {
        deductScore(team, wager);
        res[team] = `-${wager}`;
      }
    });
    setResults(res);
  };

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) { onComplete(); return; }
    setQuestionIndex((prev) => prev + 1);
    setPhase('wager');
    setWagers({});
    setSelectedOption(null);
    setAnswerRevealed(false);
    setShowingCorrectBurst(false);
    setResults(null);
  }, [isLastQuestion, onComplete]);

  const options = currentQuestion.options || [];

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: '60px 40px 24px',
      position: 'relative',
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={18} style={{ color: '#E67E22' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#E67E22', textTransform: 'uppercase', letterSpacing: 1 }}>
            {config.name || 'Wipeout Round'}
          </span>
        </div>
        <span className="font-timer" style={{
          fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)',
          background: 'var(--bg-card)', padding: '6px 14px', borderRadius: 8,
          border: '1px solid var(--border)',
        }}>
          Q {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        maxWidth: 900, width: '100%', margin: '0 auto', gap: 24,
      }}>
        <AnimatePresence mode="wait">
          {phase === 'wager' && (
            <motion.div
              key="wager"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ width: '100%', maxWidth: 600, textAlign: 'center' }}
            >
              <h3 style={{ fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                Place Your Wagers
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                How many points will each team risk? (Max: {basePoints})
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {teams.map((team, i) => (
                  <div key={team} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                  }}>
                    <span style={{
                      fontSize: 14, fontWeight: 600, flex: 1,
                      color: `hsl(${(i * 360) / teams.length}, 65%, 55%)`,
                    }}>
                      {team}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 4 }}>Score: {scores[team] || 0}</span>
                    <input
                      type="range"
                      min={config.allowZeroWager ? 0 : 1}
                      max={basePoints}
                      value={wagers[team] ?? basePoints}
                      onChange={(e) => handleSetWager(team, e.target.value)}
                      style={{ width: 100 }}
                    />
                    <span className="font-timer" style={{
                      fontSize: 18, fontWeight: 700, width: 40, textAlign: 'right',
                      color: 'var(--warning)',
                    }}>
                      {wagers[team] ?? basePoints}
                    </span>
                  </div>
                ))}
              </div>

                <button className="btn btn-primary btn-large" onClick={handleLockWagers}
                  style={{ marginTop: 24, fontSize: 16, padding: '14px 40px', background: '#E67E22' }}>
                  Lock Wagers & Show Question
                </button>
            </motion.div>
          )}

          {(phase === 'question' || phase === 'reveal') && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ width: '100%', textAlign: 'center' }}
            >
              {/* Wager Summary */}
              {config.showTeamWagers && (
                <div style={{
                  display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap',
                }}>
                  {teams.map((team, i) => (
                    <span key={team} style={{
                      padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      color: `hsl(${(i * 360) / teams.length}, 65%, 55%)`,
                    }}>
                      {team}: {wagers[team] || basePoints} pts
                    </span>
                  ))}
                </div>
              )}

              {/* Question */}
              <h2 style={{
                fontSize: 30, fontWeight: 600, lineHeight: 1.3,
                color: 'var(--text-primary)', marginBottom: 28,
                maxWidth: 700, margin: '0 auto 28px',
              }}>
                {currentQuestion.questionText}
              </h2>

              {/* Options */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: options.length <= 2 ? '1fr' : 'repeat(2, 1fr)',
                gap: 10, maxWidth: 700, margin: '0 auto',
                position: 'relative',
              }}>
                {options.map((option, i) => {
                  const isSelected = selectedOption === i;
                  const isCorrectOption = i === currentQuestion.correctOptionIndex;
                  const isRevealedCorrect = answerRevealed && isCorrectOption;
                  const isWrongSelected = answerRevealed && isSelected && !isCorrectOption;
                  const isUnselected = answerRevealed && !isCorrectOption && !isSelected;

                  let bg = 'var(--bg-card)';
                  let borderColor = 'var(--border)';
                  if (isSelected && !answerRevealed) { borderColor = 'var(--warning)'; bg = 'rgba(243, 156, 18, 0.1)'; }
                  if (isRevealedCorrect) { bg = 'rgba(39, 174, 96, 0.2)'; borderColor = 'var(--success)'; }
                  if (isWrongSelected) { bg = 'rgba(231, 76, 60, 0.2)'; borderColor = 'var(--error)'; }

                  return (
                    <motion.button
                      key={i}
                      animate={{ opacity: isUnselected ? 0.3 : 1 }}
                      onClick={() => handleSelectOption(i)}
                      disabled={answerRevealed}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', borderRadius: 10,
                        background: bg, border: `2px solid ${borderColor}`,
                        cursor: answerRevealed ? 'default' : 'pointer',
                        textAlign: 'left', color: 'var(--text-primary)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: isRevealedCorrect ? 'var(--success)' : isWrongSelected ? 'var(--error)' : 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700,
                        color: (isRevealedCorrect || isWrongSelected) ? '#fff' : 'var(--text-secondary)',
                        flexShrink: 0,
                      }}>
                        {isRevealedCorrect ? <Check size={16} /> : isWrongSelected ? <X size={16} /> : OPTION_LABELS[i]}
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 500 }}>{option}</span>
                    </motion.button>
                  );
                })}
                {showingCorrectBurst && <CorrectBurst />}
              </div>

              {/* Results after reveal */}
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap',
                  }}
                >
                  {teams.map((team, i) => {
                    const r = results[team] || '0';
                    const isGain = r.startsWith('+');
                    return (
                      <div key={team} style={{
                        padding: '8px 16px', borderRadius: 8,
                        background: isGain ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                        border: `1px solid ${isGain ? 'var(--success)' : 'var(--error)'}`,
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}>
                        {isGain ? <TrendingUp size={16} style={{ color: 'var(--success)' }} /> : <TrendingDown size={16} style={{ color: 'var(--error)' }} />}
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{team}</span>
                        <span className="font-timer" style={{
                          fontSize: 18, fontWeight: 900,
                          color: isGain ? 'var(--success)' : 'var(--error)',
                        }}>
                          {r}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', padding: '16px 0 0',
          borderTop: '1px solid var(--border)', marginTop: 12,
        }}>
        {phase === 'question' && !answerRevealed && (
          <>
            <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
              {options.map((_, i) => (
                <button key={i}
                  className={`btn ${selectedOption === i ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleSelectOption(i)}
                  style={{ minHeight: 42, minWidth: 52, fontSize: 15, fontWeight: 700 }}>
                  {OPTION_LABELS[i]}
                </button>
              ))}
            </div>
            <button className={`btn btn-primary ${selectedOption === null ? 'btn-disabled' : ''}`}
              onClick={handleRevealAnswer} disabled={selectedOption === null}
              style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8 }}>
              <Eye size={18} /> Show Answer
            </button>
          </>
        )}

        {phase === 'reveal' && !results && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Who got it right?</span>
            {/* Quick buttons for common scenarios */}
            <button className="btn btn-success" onClick={() => handleApplyResults(teams)}
              style={{ fontSize: 13, padding: '6px 14px' }}>All Correct</button>
            <button className="btn btn-secondary" onClick={() => handleApplyResults([])}
              style={{ fontSize: 13, padding: '6px 14px', color: 'var(--error)' }}>None Correct</button>
            {teams.map((team) => (
              <button key={team} className="btn btn-secondary"
                onClick={() => handleApplyResults([team])}
                style={{ fontSize: 13, padding: '6px 14px' }}>
                Only {team}
              </button>
            ))}
          </div>
        )}

        {results && (
          <button className="btn btn-primary" onClick={handleNextQuestion}
            style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8 }}>
            <ChevronRight size={18} /> {isLastQuestion ? 'End Round' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}
