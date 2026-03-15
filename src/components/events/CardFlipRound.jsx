import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, X, AlertTriangle } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import SFX from '../../utils/soundManager';
import { OPTION_LABELS } from '../../utils/eventTypes';

/* ─── Card Flip Round ────────────────────────────────────────────────────────
   Cards are face-down. Teams pick a card. It flips 3D to reveal:
   - Topic Card → shows topic + instructions (no scoring)
   - Challenge Card → shows a question (with optional negative marking)
   ─────────────────────────────────────────────────────────────────────────── */

function CardFace({ card, isFront }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'absolute', inset: 0,
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      borderRadius: 16,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 16,
      ...(isFront
        ? {
            background: 'linear-gradient(135deg, var(--bg-card), var(--bg-tertiary))',
            border: '2px solid var(--border)',
          }
        : {
            transform: 'rotateY(180deg)',
            background: card.isChallenge
              ? 'linear-gradient(135deg, rgba(231,76,60,0.15), rgba(192,57,43,0.1))'
              : 'linear-gradient(135deg, rgba(52,152,219,0.15), rgba(41,128,185,0.1))',
            border: `2px solid ${card.isChallenge ? 'var(--error)' : 'var(--accent)'}`,
          }),
    }}>
      {isFront ? (
        <>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{card.icon || '🃏'}</div>
          <div className="font-timer" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-muted)' }}>
            Card {card.number}
          </div>
        </>
      ) : (
        <>
          {card.isChallenge ? (
            <>
              <AlertTriangle size={24} style={{ color: 'var(--error)', marginBottom: 8 }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Challenge Card
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.4 }}>
                {card.questionText || 'No question set'}
              </div>
              {card.negativeMarks && (
                <div style={{ fontSize: 11, color: 'var(--error)', marginTop: 8 }}>
                  ⚠️ Negative marks: -{card.negativePoints || 5} for wrong answer
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{card.icon || '📚'}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', textAlign: 'center', marginBottom: 8 }}>
                {card.topic || 'Topic'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                {card.instructions || 'Follow the host\'s instructions for this topic.'}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function FlippableCard({ card, isFlipped, onClick }) {
  return (
    <motion.div
      onClick={!isFlipped ? onClick : undefined}
      whileHover={!isFlipped ? { y: -6, scale: 1.03 } : {}}
      style={{
        width: 160, height: 220,
        perspective: 1000,
        cursor: isFlipped ? 'default' : 'pointer',
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 16 }}
        style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        <CardFace card={card} isFront={true} />
        <CardFace card={card} isFront={false} />
      </motion.div>
    </motion.div>
  );
}

export default function CardFlipRound({ event, teams, scores, onComplete }) {
  const [flippedCards, setFlippedCards] = useState({});
  const [activeCard, setActiveCard] = useState(null); // card being answered
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [cardResults, setCardResults] = useState({}); // cardIdx -> { completed: true }

  const addScore = useGameStore((s) => s.addScore);
  const deductScore = useGameStore((s) => s.deductScore);

  const config = event?.config || {};
  const cards = event?.questions || [];

  if (cards.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 48 }}>🃏</div>
        <p>No cards in this event. Add cards in the Event Editor.</p>
      </div>
    );
  }

  const allFlipped = cards.every((_, i) => flippedCards[i]);

  const handleFlipCard = (index) => {
    if (flippedCards[index]) return;
    SFX.select?.();

    const card = cards[index];
    setFlippedCards((prev) => ({ ...prev, [index]: true }));

    if (card.isChallenge && card.subQuestions && card.subQuestions.length > 0) {
      setTimeout(() => {
        setActiveCard({ ...card, index });
        setCurrentSubIndex(0);
        setSelectedOption(null);
        setAnswerRevealed(false);
      }, 700);
    } else if (card.isChallenge) {
      // Empty challenge card, just mark complete
      setCardResults((prev) => ({ ...prev, [index]: { completed: true } }));
    }
  };

  const handleSelectOption = (i) => {
    if (answerRevealed) return;
    setSelectedOption(i);
  };

  const handleRevealAnswer = () => {
    if (selectedOption === null || !activeCard) return;
    SFX.reveal?.();
    setAnswerRevealed(true);
    const subQ = activeCard.subQuestions[currentSubIndex];
    const correct = selectedOption === subQ.correctOptionIndex;
    if (correct) setTimeout(() => SFX.correct?.(), 200);
    else setTimeout(() => SFX.wrong?.(), 200);
  };

  const nextSubQuestion = () => {
    if (currentSubIndex < activeCard.subQuestions.length - 1) {
      setCurrentSubIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswerRevealed(false);
    } else {
      setCardResults((prev) => ({ ...prev, [activeCard.index]: { completed: true } }));
      setActiveCard(null);
    }
  };

  const handleAwardTeam = (team) => {
    if (!activeCard) return;
    const pts = config.pointsPerCard || 10;
    addScore(team, pts);
    nextSubQuestion();
  };

  const handleNoTeamCorrect = () => {
    if (!activeCard) return;
    nextSubQuestion();
  };

  const currentSubQ = activeCard?.subQuestions?.[currentSubIndex];
  const options = currentSubQ?.options || [];

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      padding: '60px 40px 24px',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🃏</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1 }}>
            {config.name || 'Card Flip Round'}
          </span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {Object.keys(flippedCards).length} / {cards.length} cards revealed
        </span>
      </div>

      {/* Cards Grid */}
      <div style={{
        flex: 1,
        display: 'flex', flexWrap: 'wrap',
        gap: 20, justifyContent: 'center', alignItems: 'center',
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <FlippableCard
              card={{ ...card, number: i + 1 }}
              isFlipped={!!flippedCards[i]}
              onClick={() => handleFlipCard(i)}
            />
            {cardResults[i] && (
              <div style={{
                position: 'absolute', top: 4, right: 4,
                borderRadius: '50%', width: 24, height: 24,
                background: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-primary)',
              }}>
                <Check size={12} color="#fff" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* End Round button when all cards done */}
      {allFlipped && !activeCard && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button className="btn btn-primary btn-large" onClick={onComplete}
            style={{ fontSize: 16, padding: '14px 48px', gap: 8 }}>
            <ChevronRight size={18} /> End Round
          </button>
        </div>
      )}

      {/* Challenge Question Modal */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              style={{
                width: '100%', maxWidth: 640,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 20, padding: '32px 36px',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <AlertTriangle size={28} style={{ color: 'var(--error)', marginBottom: 8 }} />
                <p style={{ fontSize: 12, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
                  Challenge Card {activeCard.index + 1} — Question {currentSubIndex + 1} of {activeCard.subQuestions.length}
                </p>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {currentSubQ?.questionText}
                </h2>
              </div>

              {/* Options */}
              {options.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
                  {options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === currentSubQ?.correctOptionIndex;
                    const isRevealedCorrect = answerRevealed && isCorrect;
                    const isWrongSelected = answerRevealed && isSelected && !isCorrect;

                    let bg = 'var(--bg-card)', border = '1px solid var(--border)';
                    if (isSelected && !answerRevealed) { bg = 'rgba(243,156,18,0.1)'; border = '2px solid var(--warning)'; }
                    if (isRevealedCorrect) { bg = 'rgba(39,174,96,0.2)'; border = '2px solid var(--success)'; }
                    if (isWrongSelected) { bg = 'rgba(231,76,60,0.2)'; border = '2px solid var(--error)'; }

                    return (
                      <button key={i} onClick={() => handleSelectOption(i)} disabled={answerRevealed}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                          borderRadius: 10, background: bg, border, cursor: answerRevealed ? 'default' : 'pointer',
                          color: 'var(--text-primary)', textAlign: 'left',
                        }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                          background: isRevealedCorrect ? 'var(--success)' : isWrongSelected ? 'var(--error)' : 'var(--bg-tertiary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: (isRevealedCorrect || isWrongSelected) ? '#fff' : 'var(--text-secondary)',
                        }}>
                          {isRevealedCorrect ? <Check size={14} /> : isWrongSelected ? <X size={14} /> : OPTION_LABELS[i]}
                        </div>
                        <span style={{ fontSize: 14 }}>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Bottom actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {!answerRevealed && (
                  <button className="btn btn-primary" onClick={handleRevealAnswer}
                    disabled={options.length > 0 && selectedOption === null}
                    style={{ fontSize: 14, padding: '10px 20px' }}>
                    Show Answer
                  </button>
                )}
                {answerRevealed && (
                  <>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', alignSelf: 'center' }}>Award points to:</span>
                    {teams.map((team) => (
                      <button key={team} className="btn btn-secondary" onClick={() => handleAwardTeam(team)}
                        style={{ fontSize: 13, padding: '8px 14px' }}>
                        {team}
                      </button>
                    ))}
                    <button className="btn btn-secondary" onClick={handleNoTeamCorrect}
                      style={{ fontSize: 13, padding: '8px 14px', color: 'var(--error)' }}>
                      None Correct
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
