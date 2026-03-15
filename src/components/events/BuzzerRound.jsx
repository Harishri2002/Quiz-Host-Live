import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronRight, Check, X } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { useSyncState } from '../../utils/syncManager';
import { OPTION_LABELS } from '../../utils/eventTypes';
import CorrectBurst from '../animations/CorrectBurst';
import SFX from '../../utils/soundManager';

function CircularTimer({ seconds, total, warning }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const strokeDashoffset = circumference * (1 - progress);
  const isWarning = seconds <= warning;

  return (
    <div style={{ position: 'relative', width: 130, height: 130 }}>
      <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="65" cy="65" r={radius} fill="none"
          stroke="var(--bg-tertiary)" strokeWidth="8" />
        <motion.circle
          cx="65" cy="65" r={radius} fill="none"
          stroke={isWarning ? 'var(--error)' : 'var(--accent)'}
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="font-timer" style={{
          fontSize: 36, fontWeight: 900,
          color: isWarning ? 'var(--error)' : 'var(--text-primary)',
        }}>
          {seconds}
        </span>
      </div>
    </div>
  );
}

export default function BuzzerRound({ event, teams, scores, onComplete }) {
  const isProjector = useUIStore((s) => s.isProjector);

  const [questionIndex, setQuestionIndex] = useSyncState('buzz_qIdx', 0);
  const [selectedOption, setSelectedOption] = useSyncState('buzz_selOpt', null);
  const [answerRevealed, setAnswerRevealed] = useSyncState('buzz_ansRev', false);
  const [showingCorrectBurst, setShowingCorrectBurst] = useSyncState('buzz_burst', false);
  const [awardedTeam, setAwardedTeam] = useSyncState('buzz_awdTm', null);
  const [timer, setTimer] = useSyncState('buzz_timer', event.config?.timePerQuestion || 20);
  const [timerActive, setTimerActive] = useSyncState('buzz_tmrAct', true);
  const [pointsFloater, setPointsFloater] = useSyncState('buzz_ptsDrop', null);
  const timerRef = useRef(null);

  const addScore = useGameStore((s) => s.addScore);
  const config = event.config || {};
  const questions = event.questions || [];
  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = questionIndex >= totalQuestions - 1;
  const timePerQuestion = config.timePerQuestion || 20;
  const warningThreshold = config.warningThreshold || 5;

  // Timer effect
  useEffect(() => {
    setTimer(timePerQuestion);
    setTimerActive(true);
  }, [questionIndex, timePerQuestion]);

  // Timer tick effect
  useEffect(() => {
    if (isProjector) return; // Only Host runs the timer
    
    if (!timerActive || answerRevealed || timer === null) return;
    if (timer <= 0) {
      // Time's up
      SFX.timeUp();
      if (config.autoRevealOnTimeout) {
        setAnswerRevealed(true);
      }
      setTimerActive(false);
      return;
    }
    timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timer, timerActive, answerRevealed, config.autoRevealOnTimeout]);

  if (!currentQuestion) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)',
      }}>
        No questions in this event
      </div>
    );
  }

  const handleSelectOption = (index) => {
    if (answerRevealed || selectedOption !== null) return;
    SFX.select();
    setSelectedOption(index);
  };

  const handleRevealAnswer = () => {
    if (answerRevealed) return;
    SFX.reveal();
    setAnswerRevealed(true);
    setTimerActive(false);
    const correct = selectedOption === currentQuestion.correctOptionIndex;
    if (correct) {
      setTimeout(() => SFX.correct(), 200);
      setShowingCorrectBurst(true);
      setTimeout(() => setShowingCorrectBurst(false), 2500);
    } else {
      setTimeout(() => SFX.wrong(), 200);
    }
  };

  const handleAwardTeam = (teamName) => {
    if (awardedTeam) return;
    setAwardedTeam(teamName);
    const points = config.pointsPerCorrect || 20;
    addScore(teamName, points);
    SFX.award();
    setPointsFloater({ points: `+${points}` });
    setTimeout(() => setPointsFloater(null), 1200);
  };

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) { onComplete(); return; }
    setQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
    setAnswerRevealed(false);
    setShowingCorrectBurst(false);
    setAwardedTeam(null);
    setPointsFloater(null);
  }, [isLastQuestion, onComplete]);

  const options = currentQuestion.options || [];
  const timedOut = timer <= 0 && !answerRevealed;

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
        <span style={{
          fontSize: 14, fontWeight: 600, color: '#E74C3C',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          {config.name || 'Buzzer Round'}
        </span>
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
        {/* Timer */}
        <CircularTimer seconds={timer || 0} total={timePerQuestion} warning={warningThreshold} />

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={questionIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -30 }}
            style={{
              fontSize: 32, fontWeight: 600, textAlign: 'center',
              color: timedOut ? 'var(--error)' : 'var(--text-primary)',
              lineHeight: 1.3, maxWidth: 700,
            }}
          >
            {currentQuestion.questionText}
          </motion.h2>
        </AnimatePresence>

        {/* Options (if enabled) */}
        {config.showOptions && options.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: options.length <= 2 ? '1fr' : 'repeat(2, 1fr)',
            gap: 10, width: '100%', maxWidth: 700,
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
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: isUnselected ? 0.3 : 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
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
        )}
      </div>

      {/* Bottom Controls */}
      {!isProjector && (
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', padding: '16px 0 0',
          borderTop: '1px solid var(--border)', marginTop: 12,
        }}>
        {!answerRevealed ? (
          <>
            {config.showOptions && (
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
            )}
            <button
              className="btn btn-primary"
              onClick={handleRevealAnswer}
              style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8 }}
            >
              <Eye size={18} /> Show Answer
            </button>
          </>
        ) : (
          <>
            {!awardedTeam && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 8 }}>Award to:</span>
                {teams.map((team, i) => (
                  <button key={team} className="btn btn-success" onClick={() => handleAwardTeam(team)}
                    style={{ minHeight: 42, fontSize: 13, padding: '6px 14px', background: `hsl(${(i * 360) / teams.length}, 65%, 45%)` }}>
                    {team}
                  </button>
                ))}
                <button className="btn btn-secondary" onClick={() => setAwardedTeam('none')}
                  style={{ minHeight: 42, fontSize: 13, padding: '6px 14px' }}>No Award</button>
              </div>
            )}
            {awardedTeam && (
              <button className="btn btn-primary" onClick={handleNextQuestion}
                style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8 }}>
                <ChevronRight size={18} /> {isLastQuestion ? 'End Round' : 'Next Question'}
              </button>
            )}
          </>
        )}
      </div>
      )}

      {/* Points Floater */}
      <AnimatePresence>
        {pointsFloater && (
          <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }}
            transition={{ duration: 1.2 }} className="font-timer"
            style={{
              position: 'absolute', top: 80, right: 60,
              fontSize: 28, fontWeight: 900, color: 'var(--success)',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)', pointerEvents: 'none', zIndex: 30,
            }}>
            {pointsFloater.points} pts
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
