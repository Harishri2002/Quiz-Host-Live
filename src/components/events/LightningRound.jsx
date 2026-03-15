import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight, SkipForward, Zap } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { useSyncState } from '../../utils/syncManager';
import SFX from '../../utils/soundManager';

export default function LightningRound({ event, teams, scores, onComplete }) {

  const [currentTeamIndex, setCurrentTeamIndex] = useSyncState('lt_teamIdx', 0);
  const [questionIndex, setQuestionIndex] = useSyncState('lt_qIdx', 0);
  const [timer, setTimer] = useSyncState('lt_timer', null);
  const [timerActive, setTimerActive] = useSyncState('lt_tmrAct', false);
  const [showAnswer, setShowAnswer] = useSyncState('lt_shwAns', false);
  const [teamStarted, setTeamStarted] = useSyncState('lt_tmStrt', false);
  const [teamResults, setTeamResults] = useSyncState('lt_res', {}); // { teamName: { correct: n, wrong: n, passed: n } }
  const timerRef = useRef(null);

  const addScore = useGameStore((s) => s.addScore);
  const deductScore = useGameStore((s) => s.deductScore);
  const config = event.config || {};
  const questions = event.questions || [];
  const timePerTeam = config.timePerTeam || 60;

  // Team order
  const orderedTeams = config.teamOrder === 'random'
    ? [...teams].sort(() => Math.random() - 0.5)
    : [...teams];

  const currentTeam = orderedTeams[currentTeamIndex];

  const unassignedQuestions = questions.filter(q => q.targetTeamSlot === '' || q.targetTeamSlot === undefined || q.targetTeamSlot === null);
  const teamSpecificQuestions = questions.filter(q => q.targetTeamSlot === currentTeamIndex);

  let teamQuestions = [];
  if (teamSpecificQuestions.length > 0) {
    // Use questions specifically assigned to this team's slot
    teamQuestions = teamSpecificQuestions;
  } else {
    const questionsPerTeam = config.questionsPerTeam || 0;
    teamQuestions = questionsPerTeam > 0
      ? unassignedQuestions.slice(currentTeamIndex * questionsPerTeam, (currentTeamIndex + 1) * questionsPerTeam)
      : unassignedQuestions;
  }
  const currentQuestion = teamQuestions[questionIndex];
  const isLastTeam = currentTeamIndex >= orderedTeams.length - 1;

  // Timer countdown
  useEffect(() => {
    if (!timerActive || timer <= 0) return;
    timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timer, timerActive]);

  // Auto-stop when timer hits zero
  useEffect(() => {
    if (timer === 0 && timerActive) {
      setTimerActive(false);
    }
  }, [timer, timerActive]);

  const startTeam = () => {
    setTeamStarted(true);
    setTimer(timePerTeam);
    setTimerActive(true);
    setQuestionIndex(0);
    setShowAnswer(false);
    SFX.eventStart();
  };

  const handleMarkCorrect = () => {
    const points = config.pointsPerCorrect || 5;
    addScore(currentTeam, points);
    SFX.correct();
    setTeamResults((prev) => ({
      ...prev,
      [currentTeam]: { ...(prev[currentTeam] || { correct: 0, wrong: 0, passed: 0 }), correct: (prev[currentTeam]?.correct || 0) + 1 },
    }));
    advanceQuestion();
  };

  const handleMarkWrong = () => {
    if (config.negativeMarking) {
      deductScore(currentTeam, config.pointsPerCorrect || 5);
    }
    SFX.wrong();
    setTeamResults((prev) => ({
      ...prev,
      [currentTeam]: { ...(prev[currentTeam] || { correct: 0, wrong: 0, passed: 0 }), wrong: (prev[currentTeam]?.wrong || 0) + 1 },
    }));
    advanceQuestion();
  };

  const handlePass = () => {
    setTeamResults((prev) => ({
      ...prev,
      [currentTeam]: { ...(prev[currentTeam] || { correct: 0, wrong: 0, passed: 0 }), passed: (prev[currentTeam]?.passed || 0) + 1 },
    }));
    advanceQuestion();
  };

  const advanceQuestion = () => {
    setShowAnswer(false);
    if (timer <= 0) {
      setTimerActive(false);
    } else if (questionIndex >= teamQuestions.length - 1) {
      setTimerActive(false);
      setQuestionIndex((prev) => prev + 1);
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const handleNextTeam = () => {
    if (isLastTeam) {
      onComplete();
      return;
    }
    setCurrentTeamIndex((prev) => prev + 1);
    setTeamStarted(false);
    setShowAnswer(false);
  };

  const timerColor = timer <= 10 ? 'var(--error)' : timer <= 20 ? 'var(--warning)' : 'var(--success)';
  const timerProgress = timer !== null ? (timer / timePerTeam) * 100 : 100;

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
          <Zap size={18} style={{ color: '#F39C12' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#F39C12', textTransform: 'uppercase', letterSpacing: 1 }}>
            {config.name || 'Lightning Round'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {orderedTeams.map((team, i) => (
            <span key={team} style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: i === currentTeamIndex ? 'var(--accent)' : i < currentTeamIndex ? 'var(--bg-tertiary)' : 'var(--bg-card)',
              color: i === currentTeamIndex ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              opacity: i < currentTeamIndex ? 0.5 : 1,
            }}>
              {team}
            </span>
          ))}
        </div>
      </div>

      {/* Timer Bar */}
      {teamStarted && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 6,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {currentTeam}'s Turn
            </span>
            <span className="font-timer" style={{ fontSize: 24, fontWeight: 900, color: timerColor }}>
              {timer}s
            </span>
          </div>
          <div style={{
            width: '100%', height: 6, borderRadius: 3,
            background: 'var(--bg-tertiary)', overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${timerProgress}%` }}
              transition={{ duration: 0.5 }}
              style={{ height: '100%', borderRadius: 3, background: timerColor }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {!teamStarted ? (
          /* Team Intro */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <h2 className="font-display" style={{
              fontSize: 48, fontWeight: 700, color: 'var(--accent)',
              marginBottom: 12, textTransform: 'uppercase',
            }}>
              {currentTeam}
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {timePerTeam} seconds • {teamQuestions.length} questions available
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>
              Answer as many questions as possible before time runs out!
            </p>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startTeam}
                className="btn btn-primary btn-large"
                style={{ fontSize: 18, padding: '16px 48px', background: '#F39C12' }}
              >
                <Zap size={20} /> Start Round
              </motion.button>
          </motion.div>
        ) : timer <= 0 || !currentQuestion ? (
          /* Time's Up or No More Questions */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <h2 className="font-display" style={{ fontSize: 48, fontWeight: 700, color: 'var(--error)', marginBottom: 16 }}>
              {timer <= 0 ? "Time's Up!" : 'All Questions Done!'}
            </h2>
            <div style={{
              display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 32,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div className="font-timer" style={{ fontSize: 36, fontWeight: 900, color: 'var(--success)' }}>
                  {teamResults[currentTeam]?.correct || 0}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Correct</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="font-timer" style={{ fontSize: 36, fontWeight: 900, color: 'var(--error)' }}>
                  {teamResults[currentTeam]?.wrong || 0}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Wrong</div>
              </div>
              {config.passAllowed && (
                <div style={{ textAlign: 'center' }}>
                  <div className="font-timer" style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-muted)' }}>
                    {teamResults[currentTeam]?.passed || 0}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Passed</div>
                </div>
              )}
            </div>
            <button className="btn btn-primary btn-large" onClick={handleNextTeam}
              style={{ fontSize: 16, padding: '14px 36px', gap: 8 }}>
              <ChevronRight size={18} /> {isLastTeam ? 'End Round' : `Next: ${orderedTeams[currentTeamIndex + 1]}`}
            </button>
          </motion.div>
        ) : (
          /* Active Question */
          <div style={{ width: '100%', maxWidth: 700, textAlign: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={questionIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.2 }}
              >
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Question {questionIndex + 1}
                </p>
                <h2 style={{
                  fontSize: 30, fontWeight: 600, lineHeight: 1.3,
                  color: 'var(--text-primary)', marginBottom: 24,
                }}>
                  {currentQuestion.questionText}
                </h2>

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '12px 20px', borderRadius: 8,
                      background: 'rgba(39, 174, 96, 0.15)',
                      border: '1px solid var(--success)',
                      fontSize: 18, fontWeight: 600, color: 'var(--success)',
                      marginBottom: 16,
                    }}
                  >
                    {currentQuestion.options?.[currentQuestion.correctOptionIndex] || 'See answer above'}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Controls (when active question) */}
      {teamStarted && timer > 0 && currentQuestion && (
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center',
          flexWrap: 'wrap', padding: '16px 0 0',
          borderTop: '1px solid var(--border)', marginTop: 12,
        }}>
          {!showAnswer ? (
            <button className="btn btn-secondary" onClick={() => setShowAnswer(true)}
              style={{ minHeight: 48, fontSize: 15, padding: '10px 24px' }}>
              Show Answer
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-success" onClick={handleMarkCorrect}
                style={{ padding: '10px 20px', fontSize: 14 }}>
                <Check size={18} style={{ marginRight: 6 }} /> Correct
              </button>
              <button className="btn btn-error" onClick={handleMarkWrong}
                style={{ padding: '10px 20px', fontSize: 14 }}>
                <X size={18} style={{ marginRight: 6 }} /> Wrong
              </button>
            </div>
          )}
          {config.passAllowed && (
            <button className="btn btn-secondary" onClick={handlePass}
              style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8 }}>
              <SkipForward size={18} /> Pass
            </button>
          )}
        </div>
      )}
    </div>
  );
}
