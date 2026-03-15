import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, SkipForward, Eye } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { useSyncState } from '../../utils/syncManager';
import { OPTION_LABELS } from '../../utils/eventTypes';
import CorrectBurst from '../animations/CorrectBurst';
import PointsFloat from '../animations/PointsFloat';
import SFX from '../../utils/soundManager';

export default function QARound({ event, teams, scores, onComplete }) {
  const isProjector = useUIStore((s) => s.isProjector);
  
  const [questionIndex, setQuestionIndex] = useSyncState('qa_qIdx', 0);
  const [selectedOption, setSelectedOption] = useSyncState('qa_selOpt', null);
  const [answerRevealed, setAnswerRevealed] = useSyncState('qa_ansRev', false);
  const [showingCorrectBurst, setShowingCorrectBurst] = useSyncState('qa_burst', false);
  const [pointsFloater, setPointsFloater] = useSyncState('qa_ptsDrop', null);
  const [awardedTeam, setAwardedTeam] = useSyncState('qa_awdTm', null);
  const addScore = useGameStore((s) => s.addScore);
  const deductScore = useGameStore((s) => s.deductScore);

  const questions = event.questions || [];
  const config = event.config || {};
  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = questionIndex >= totalQuestions - 1;

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

  const isCorrect = selectedOption === currentQuestion.correctOptionIndex;

  const handleSelectOption = (index) => {
    if (answerRevealed || selectedOption !== null) return;
    SFX.select();
    setSelectedOption(index);
  };

  const handleRevealAnswer = () => {
    if (selectedOption === null || answerRevealed) return;
    setAnswerRevealed(true);

    SFX.reveal();
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
    const points = currentQuestion.points || config.pointsPerCorrect || 10;
    addScore(teamName, points);
    SFX.award();
    setPointsFloater({ team: teamName, points: `+${points}` });
    setTimeout(() => setPointsFloater(null), 1200);
  };

  const handleDeductTeam = (teamName) => {
    if (!config.negativeMarking) return;
    const points = config.negativePoints || 5;
    deductScore(teamName, points);
    SFX.deduct();
    setPointsFloater({ team: teamName, points: `-${points}` });
    setTimeout(() => setPointsFloater(null), 1200);
  };

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion) {
      onComplete();
      return;
    }
    setIsTransitioning(true);
    setTimeout(() => {
      setQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setAnswerRevealed(false);
      setShowingCorrectBurst(false);
      setAwardedTeam(null);
      setPointsFloater(null);
      setIsTransitioning(false);
    }, 300);
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
        marginBottom: 24,
      }}>
        <span style={{
          fontSize: 14, fontWeight: 600, color: 'var(--accent)',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          {config.name || 'Q&A Round'}
        </span>

        {config.showQuestionNumber !== false && (
          <motion.span
            key={questionIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-timer"
            style={{
              fontSize: 16, fontWeight: 700,
              color: 'var(--text-secondary)',
              background: 'var(--bg-card)',
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          >
            Q {questionIndex + 1} / {totalQuestions}
          </motion.span>
        )}
      </div>

      {/* Question Area */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        maxWidth: 900, width: '100%', margin: '0 auto',
      }}>
        {/* Question Text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={questionIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              textAlign: 'center', marginBottom: 40,
              width: '100%',
            }}
          >
            <h2 style={{
              fontSize: Math.min(42, Math.max(28, 600 / Math.max(currentQuestion.questionText.length, 20) * 10)),
              fontWeight: 600, lineHeight: 1.3,
              color: 'var(--text-primary)',
              maxWidth: 800, margin: '0 auto',
            }}>
              {currentQuestion.questionText}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Options Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: options.length <= 2 ? '1fr' : 'repeat(2, 1fr)',
          gap: 12, width: '100%', maxWidth: 800,
          position: 'relative',
        }}>
          {options.map((option, i) => {
            const isSelected = selectedOption === i;
            const isCorrectOption = i === currentQuestion.correctOptionIndex;
            const isWrongSelected = answerRevealed && isSelected && !isCorrectOption;
            const isRevealedCorrect = answerRevealed && isCorrectOption;
            const isUnselectedWrong = answerRevealed && !isCorrectOption && !isSelected;

            let bg = 'var(--bg-card)';
            let borderColor = 'var(--border)';
            let textColor = 'var(--text-primary)';
            let opacity = 1;
            let scaleEffect = false;
            let shakeEffect = false;

            if (isSelected && !answerRevealed) {
              borderColor = 'var(--warning)';
              bg = 'rgba(243, 156, 18, 0.1)';
            }
            if (isRevealedCorrect) {
              bg = 'rgba(39, 174, 96, 0.2)';
              borderColor = 'var(--success)';
              scaleEffect = true;
            }
            if (isWrongSelected) {
              bg = 'rgba(231, 76, 60, 0.2)';
              borderColor = 'var(--error)';
              shakeEffect = true;
            }
            if (isUnselectedWrong) {
              opacity = 0.3;
            }

            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity,
                  x: 0,
                  scale: scaleEffect ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.3,
                  scale: scaleEffect ? { duration: 0.5, times: [0, 0.5, 1] } : {},
                }}
                onClick={() => handleSelectOption(i)}
                disabled={answerRevealed}
                className={shakeEffect ? 'animate-shake' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', borderRadius: 12,
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  cursor: answerRevealed ? 'default' : 'pointer',
                  textAlign: 'left',
                  color: textColor,
                  transition: answerRevealed ? 'all 0.4s ease' : 'all 0.15s ease',
                  minHeight: 60,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected && !answerRevealed
                    ? '0 0 15px rgba(243, 156, 18, 0.2)'
                    : isRevealedCorrect
                      ? '0 0 20px rgba(39, 174, 96, 0.3)'
                      : 'none',
                }}
              >
                {/* Option Label */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: isRevealedCorrect
                    ? 'var(--success)'
                    : isWrongSelected
                      ? 'var(--error)'
                      : 'var(--bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700,
                  color: (isRevealedCorrect || isWrongSelected) ? '#fff' : 'var(--text-secondary)',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                }}>
                  {isRevealedCorrect ? <Check size={18} /> :
                   isWrongSelected ? <X size={18} /> :
                   OPTION_LABELS[i]}
                </div>

                {/* Option Text */}
                <span style={{
                  fontSize: 18, fontWeight: 500,
                  flex: 1,
                }}>
                  {option}
                </span>
              </motion.button>
            );
          })}

          {/* Correct Burst Particles */}
          {showingCorrectBurst && (
            <CorrectBurst />
          )}
        </div>
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
            {/* Option selection buttons for operator */}
            <div style={{
              display: 'flex', gap: 8, marginRight: 16,
            }}>
              {options.map((_, i) => (
                <button
                  key={i}
                  className={`btn ${selectedOption === i ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleSelectOption(i)}
                  style={{
                    minHeight: 42, minWidth: 56,
                    fontSize: 16, fontWeight: 700,
                    padding: '8px 16px',
                  }}
                >
                  {OPTION_LABELS[i]}
                </button>
              ))}
            </div>

            {/* Show Answer */}
            <button
              className={`btn btn-primary ${selectedOption === null ? 'btn-disabled' : ''}`}
              onClick={handleRevealAnswer}
              disabled={selectedOption === null}
              style={{
                minHeight: 48, fontSize: 15, padding: '10px 24px',
                gap: 8,
              }}
            >
              <Eye size={18} />
              Show Answer
            </button>
          </>
        ) : (
          <>
            {/* Award points to team */}
            {!awardedTeam && (
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <span style={{
                  fontSize: 13, color: 'var(--text-muted)', marginRight: 8,
                }}>
                  Award to:
                </span>
                {teams.map((team, i) => (
                  <button
                    key={team}
                    className="btn btn-success"
                    onClick={() => handleAwardTeam(team)}
                    style={{
                      minHeight: 42, fontSize: 13, padding: '6px 14px',
                      background: `hsl(${(i * 360) / teams.length}, 65%, 45%)`,
                    }}
                  >
                    {team}
                  </button>
                ))}
                <button
                  className="btn btn-secondary"
                  onClick={() => setAwardedTeam('none')}
                  style={{ minHeight: 42, fontSize: 13, padding: '6px 14px' }}
                >
                  No Award
                </button>
              </div>
            )}

            {/* Next Question */}
            {(awardedTeam || !isCorrect) && (
              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
                style={{
                  minHeight: 48, fontSize: 15, padding: '10px 24px',
                  gap: 8,
                }}
              >
                <ChevronRight size={18} />
                {isLastQuestion ? 'End Round' : 'Next Question'}
              </button>
            )}
          </>
        )}

        {/* Skip button */}
        {config.allowSkip && !answerRevealed && (
          <button
            className="btn btn-secondary"
            onClick={handleNextQuestion}
            style={{ minHeight: 42, fontSize: 13, padding: '6px 14px', gap: 6 }}
          >
            <SkipForward size={14} />
            Skip
          </button>
        )}
      </div>
      )}

      {/* Points Floater */}
      <AnimatePresence>
        {pointsFloater && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              position: 'absolute',
              top: 80, right: 60,
              fontSize: 28, fontWeight: 900,
              color: pointsFloater.points.startsWith('+') ? 'var(--success)' : 'var(--error)',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              zIndex: 30,
            }}
            className="font-timer"
          >
            {pointsFloater.points} pts
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      <AnimatePresence>
        {answerRevealed && currentQuestion.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              position: 'absolute', bottom: 100, left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 20px', borderRadius: 8,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--text-secondary)',
              maxWidth: 600, textAlign: 'center',
            }}
          >
            💡 {currentQuestion.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
