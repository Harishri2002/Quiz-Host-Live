import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronRight, SkipForward, Volume2, VolumeX, Check, X } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { useSyncState } from '../../utils/syncManager';
import { OPTION_LABELS } from '../../utils/eventTypes';
import CorrectBurst from '../animations/CorrectBurst';
import SFX from '../../utils/soundManager';

export default function IdentifyRound({ event, teams, scores, onComplete }) {
  const gameData = useGameStore((s) => s.gameData);

  const [questionIndex, setQuestionIndex] = useSyncState('id_qIdx', 0);
  const [selectedOption, setSelectedOption] = useSyncState('id_selOpt', null);
  const [answerRevealed, setAnswerRevealed] = useSyncState('id_ansRev', false);
  const [showingCorrectBurst, setShowingCorrectBurst] = useSyncState('id_burst', false);
  const [awardedTeam, setAwardedTeam] = useSyncState('id_awdTm', null);
  const [blurLevel, setBlurLevel] = useSyncState('id_blur', null); // null = full blur initially
  const [isPlaying, setIsPlaying] = useSyncState('id_isPlaying', false);
  const [audioRef, setAudioRef] = useState(null); // Keep audioRef local (DOM element)
  const [pointsFloater, setPointsFloater] = useSyncState('id_ptsDrop', null);

  const addScore = useGameStore((s) => s.addScore);
  const config = event.config || {};
  const questions = event.questions || [];
  const currentQuestion = questions[questionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = questionIndex >= totalQuestions - 1;

  const blurStages = config.blurStages || 3;
  const maxBlur = 30;

  // Initialize blur level
  if (blurLevel === null && config.blurReveal) {
    setBlurLevel(maxBlur);
  }

  if (!currentQuestion) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)',
      }}>
        No items in this event
      </div>
    );
  }

  const itemType = currentQuestion.itemType || 'image';
  const mediaFile = currentQuestion.mediaFile;
  const isCorrect = selectedOption === currentQuestion.correctOptionIndex;

  const handleRevealStep = () => {
    if (!config.blurReveal) return;
    const step = maxBlur / blurStages;
    const newBlur = Math.max(0, (blurLevel || maxBlur) - step);
    setBlurLevel(newBlur);
  };

  const handlePlayAudio = () => {
    if (!mediaFile) return;
    if (audioRef) {
      audioRef.pause();
      setAudioRef(null);
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(mediaFile);
    audio.play();
    audio.onended = () => { setIsPlaying(false); setAudioRef(null); };
    setAudioRef(audio);
    setIsPlaying(true);
  };

  const handleSelectOption = (index) => {
    if (answerRevealed || selectedOption !== null) return;
    SFX.select();
    setSelectedOption(index);
  };

  const handleRevealAnswer = () => {
    if (selectedOption === null || answerRevealed) return;
    setAnswerRevealed(true);
    setBlurLevel(0);
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
    const points = currentQuestion.points || config.pointsPerCorrect || 15;
    addScore(teamName, points);
    SFX.award();
    setPointsFloater({ team: teamName, points: `+${points}` });
    setTimeout(() => setPointsFloater(null), 1200);
  };

  const handleNextQuestion = useCallback(() => {
    if (audioRef) { audioRef.pause(); setAudioRef(null); }
    if (isLastQuestion) { onComplete(); return; }
    setQuestionIndex((prev) => prev + 1);
    setSelectedOption(null);
    setAnswerRevealed(false);
    setShowingCorrectBurst(false);
    setAwardedTeam(null);
    setBlurLevel(config.blurReveal ? maxBlur : 0);
    setIsPlaying(false);
    setPointsFloater(null);
  }, [isLastQuestion, onComplete, audioRef, config.blurReveal, maxBlur]);

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
        marginBottom: 16,
      }}>
        <span style={{
          fontSize: 14, fontWeight: 600, color: '#9B59B6',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          {config.name || 'Identify Round'}
        </span>
        <span className="font-timer" style={{
          fontSize: 16, fontWeight: 700, color: 'var(--text-secondary)',
          background: 'var(--bg-card)', padding: '6px 14px', borderRadius: 8,
          border: '1px solid var(--border)',
        }}>
          {questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex', gap: 24,
        maxWidth: 1100, width: '100%', margin: '0 auto',
        alignItems: 'center',
      }}>
        {/* Left: Media Display */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          {itemType === 'image' && mediaFile ? (
            <motion.div
              key={questionIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                width: '100%', maxWidth: 500, aspectRatio: '4/3',
                borderRadius: 14, overflow: 'hidden',
                border: '2px solid var(--border)',
                position: 'relative',
              }}
            >
              <img
                src={mediaFile}
                alt="Identify"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: `blur(${blurLevel || 0}px)`,
                  transition: 'filter 0.5s ease',
                }}
              />
              {config.blurReveal && blurLevel > 0 && !answerRevealed && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRevealStep}
                  style={{
                    position: 'absolute', bottom: 12, right: 12,
                    padding: '8px 16px', borderRadius: 8,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  <Eye size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Reveal More ({Math.round((1 - (blurLevel / maxBlur)) * 100)}%)
                </motion.button>
              )}
            </motion.div>
          ) : itemType === 'sound' ? (
            <motion.div
              key={questionIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                width: '100%', maxWidth: 400, padding: '48px 32px',
                borderRadius: 14, textAlign: 'center',
                background: 'var(--bg-card)', border: '2px solid var(--border)',
              }}
            >
              <motion.button
                onClick={handlePlayAudio}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isPlaying ? { scale: [1, 1.05, 1] } : {}}
                transition={isPlaying ? { repeat: Infinity, duration: 1 } : {}}
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: isPlaying
                    ? 'linear-gradient(135deg, #E74C3C, #C0392B)'
                    : 'linear-gradient(135deg, #9B59B6, #8E44AD)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: isPlaying
                    ? '0 0 30px rgba(231, 76, 60, 0.4)'
                    : '0 0 20px rgba(155, 89, 182, 0.3)',
                }}
              >
                {isPlaying ? <VolumeX size={40} /> : <Volume2 size={40} />}
              </motion.button>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                {isPlaying ? 'Playing...' : 'Click to Play Sound'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {currentQuestion.mediaFileName || 'Audio clip'}
              </p>
            </motion.div>
          ) : (
            <div style={{
              width: '100%', maxWidth: 400, aspectRatio: '4/3',
              borderRadius: 14, border: '2px dashed var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', fontSize: 14,
            }}>
              No media attached
            </div>
          )}

          {/* Question hint */}
          {currentQuestion.question && (
            <p style={{
              fontSize: 18, fontWeight: 500, color: 'var(--text-secondary)',
              textAlign: 'center', maxWidth: 400,
            }}>
              {currentQuestion.question}
            </p>
          )}
        </div>

        {/* Right: Options or Correct Answer */}
        {config.showOptions !== false && options.length > 0 ? (
          <div style={{
            width: 360, display: 'flex', flexDirection: 'column', gap: 10,
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

              if (isSelected && !answerRevealed) {
                borderColor = 'var(--warning)';
                bg = 'rgba(243, 156, 18, 0.1)';
              }
              if (isRevealedCorrect) {
                bg = 'rgba(39, 174, 96, 0.2)';
                borderColor = 'var(--success)';
              }
              if (isWrongSelected) {
                bg = 'rgba(231, 76, 60, 0.2)';
                borderColor = 'var(--error)';
              }

              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: isUnselectedWrong ? 0.3 : 1, x: 0 }}
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
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{option}</span>
                </motion.button>
              );
            })}

            {showingCorrectBurst && <CorrectBurst />}
          </div>
        ) : answerRevealed && options.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: 360, padding: 24, borderRadius: 14,
              background: 'rgba(39, 174, 96, 0.15)', border: '2px solid var(--success)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--success)', marginBottom: 8, fontWeight: 700 }}>
              Correct Answer
            </span>
            <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)' }}>
              {options[currentQuestion.correctOptionIndex] || 'N/A'}
            </span>
            {showingCorrectBurst && <CorrectBurst />}
          </motion.div>
        ) : null}
      </div>

      {/* Bottom Controls */}
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', padding: '16px 0 0',
          borderTop: '1px solid var(--border)', marginTop: 12,
        }}>
        {!answerRevealed ? (
          <>
            {config.showOptions !== false && (
              <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
                {options.map((_, i) => (
                  <button
                    key={i}
                    className={`btn ${selectedOption === i ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleSelectOption(i)}
                    style={{ minHeight: 42, minWidth: 52, fontSize: 15, fontWeight: 700, padding: '8px 14px' }}
                  >
                    {OPTION_LABELS[i]}
                  </button>
                ))}
              </div>
            )}
            <button
              className={`btn btn-primary ${(selectedOption === null && config.showOptions !== false) ? 'btn-disabled' : ''}`}
              onClick={handleRevealAnswer}
              disabled={selectedOption === null && config.showOptions !== false}
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
                  style={{ minHeight: 42, fontSize: 13, padding: '6px 14px' }}>
                  No Award
                </button>
              </div>
            )}
            {awardedTeam && (
              <button className="btn btn-primary" onClick={handleNextQuestion}
                style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8 }}>
                <ChevronRight size={18} /> {isLastQuestion ? 'End Round' : 'Next Item'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Points Floater */}
      <AnimatePresence>
        {pointsFloater && (
          <motion.div
            initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -40 }}
            transition={{ duration: 1.2 }}
            className="font-timer"
            style={{
              position: 'absolute', top: 80, right: 60,
              fontSize: 28, fontWeight: 900,
              color: 'var(--success)', textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              pointerEvents: 'none', zIndex: 30,
            }}
          >
            {pointsFloater.points} pts
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
