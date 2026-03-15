import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Lightbulb, Eye } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import SFX from '../../utils/soundManager';

/* ─── Master Round ────────────────────────────────────────────────────────────
   Each question has up to 3 progressive hints.
   The fewer hints you use, the more points you earn.
   ─────────────────────────────────────────────────────────────────────────── */

export default function MasterRound({ event, teams, scores, onComplete }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [phase, setPhase] = useState('question'); // question | reveal
  const [showingHint, setShowingHint] = useState(null); // null | 0 | 1 | 2

  const addScore = useGameStore((s) => s.addScore);

  const config = event?.config || {};
  const questions = event?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex >= totalQuestions - 1;

  if (totalQuestions === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 16 }}>No questions in this event. Add questions in the Event Editor.</p>
      </div>
    );
  }

  // Points tier: index 0 = no hints, 1 = after 1 hint, 2 = after 2 hints, 3 = after all 3 hints
  const pointTiers = [
    currentQuestion?.points0 ?? config.points0 ?? 30,
    currentQuestion?.points1 ?? config.points1 ?? 20,
    currentQuestion?.points2 ?? config.points2 ?? 10,
    currentQuestion?.points3 ?? config.points3 ?? 5,
  ];

  const currentPoints = pointTiers[Math.min(hintsUsed, 3)];
  const hints = [currentQuestion?.hint1, currentQuestion?.hint2, currentQuestion?.hint3].filter(Boolean);

  const handleUseHint = (hintIndex) => {
    if (hintIndex >= hintsUsed && hintIndex < hints.length) {
      setHintsUsed(hintIndex + 1);
      setShowingHint(hintIndex);
      SFX.select?.();
    } else {
      setShowingHint(hintIndex);
    }
  };

  const handleRevealAnswer = () => {
    SFX.reveal?.();
    setPhase('reveal');
  };

  const handleAwardTeam = (team) => {
    addScore(team, currentPoints);
    SFX.correct?.();
    goNext();
  };

  const handleNoCorrect = () => {
    goNext();
  };

  const goNext = () => {
    if (isLastQuestion) { onComplete(); return; }
    setQuestionIndex((prev) => prev + 1);
    setHintsUsed(0);
    setPhase('question');
    setShowingHint(null);
  };

  const pointColors = ['#2ECC71', '#F1C40F', '#E67E22', '#E74C3C'];

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: '60px 40px 24px',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'hsl(280,70%,60%)', textTransform: 'uppercase', letterSpacing: 2 }}>
            {config.name || 'Master Questions'}
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

      {/* Points Banner */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
        {pointTiers.map((pts, i) => (
          <div key={i} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: i === Math.min(hintsUsed, 3) ? pointColors[i] : 'var(--bg-card)',
            color: i === Math.min(hintsUsed, 3) ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${i === Math.min(hintsUsed, 3) ? pointColors[i] : 'var(--border)'}`,
            transition: 'all 0.3s',
            boxShadow: i === Math.min(hintsUsed, 3) ? `0 2px 8px ${pointColors[i]}40` : 'none',
          }}>
            {pts} pts
            <span style={{ fontSize: 10, marginLeft: 6, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
              {i === 0 ? 'No Hints' : `${i} Hint${i > 1 ? 's' : ''}`}
            </span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 800, width: '100%', margin: '0 auto' }}>
        {/* Question */}
        <motion.h2
          key={questionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 28, fontWeight: 700, color: 'var(--text-primary)',
            textAlign: 'center', lineHeight: 1.35, marginBottom: 28,
          }}
        >
          {currentQuestion?.questionText || 'No question text'}
        </motion.h2>

        {/* Hints Section */}
        {hints.length > 0 && (
          <div style={{ width: '100%', maxWidth: 600, marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
              {hints.map((hint, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleUseHint(i)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  disabled={phase === 'reveal'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: i < hintsUsed ? 'rgba(241,196,15,0.15)' : 'var(--bg-card)',
                    border: `1px solid ${i < hintsUsed ? 'var(--warning)' : 'var(--border)'}`,
                    color: i < hintsUsed ? 'var(--warning)' : 'var(--text-muted)',
                    cursor: phase === 'reveal' ? 'default' : 'pointer',
                  }}
                >
                  <Lightbulb size={14} />
                  Hint {i + 1}
                  {i >= hintsUsed && (
                    <span style={{ fontSize: 10, opacity: 0.6, marginLeft: 2 }}>
                      (-{pointTiers[i] - pointTiers[i + 1] || '?'} pts)
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Active Hint Display */}
            <AnimatePresence mode="wait">
              {showingHint !== null && hints[showingHint] && (
                <motion.div
                  key={showingHint}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '14px 20px', borderRadius: 10,
                    background: 'rgba(241,196,15,0.1)',
                    border: '1px solid var(--warning)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Hint {showingHint + 1}
                  </div>
                  <div style={{ fontSize: 16, color: 'var(--text-primary)' }}>
                    {hints[showingHint]}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Answer reveal */}
        {phase === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '16px 28px', borderRadius: 12,
              background: 'rgba(39,174,96,0.15)',
              border: '2px solid var(--success)',
              textAlign: 'center', marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Correct Answer
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentQuestion?.answer || currentQuestion?.options?.[currentQuestion?.correctOptionIndex] || '—'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--warning)', marginTop: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Worth: {currentPoints} points {hintsUsed === 0 ? '— No hints used' : `— ${hintsUsed} hint${hintsUsed > 1 ? 's' : ''} used`}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center',
        flexWrap: 'wrap', padding: '16px 0 0',
        borderTop: '1px solid var(--border)',
      }}>
        {phase === 'question' && (
          <button className="btn btn-primary" onClick={handleRevealAnswer}
            style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8 }}>
            <Eye size={18} /> Reveal Answer
          </button>
        )}

        {phase === 'reveal' && (
          <>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Who answered correctly? (+{currentPoints} pts)
            </span>
            {teams.map((team) => (
              <button key={team} className="btn btn-success" onClick={() => handleAwardTeam(team)}
                style={{ fontSize: 13, padding: '8px 16px', background: 'var(--success)', gap: 6 }}>
                {team}
              </button>
            ))}
            <button className="btn btn-secondary" onClick={handleNoCorrect}
              style={{ fontSize: 13, padding: '8px 14px', color: 'var(--error)' }}>
              None Correct
            </button>
          </>
        )}
      </div>
    </div>
  );
}
