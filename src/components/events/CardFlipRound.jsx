import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, X, AlertTriangle, Users } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import SFX from '../../utils/soundManager';
import { OPTION_LABELS, CARD_COVERS } from '../../utils/eventTypes';

/* ─── Card Flip Round ────────────────────────────────────────────────────────
   Cards are face-down. Teams pick a card. It flips 3D to reveal:
   - Topic Card → shows topic + instructions (no scoring)
   - Challenge Card → shows a question (with optional negative marking)
   ─────────────────────────────────────────────────────────────────────────── */

function CardFace({ card, isFront, isFlipped, onStartQuiz, teams, selectedTeam, setSelectedTeam, isTopicCard }) {
  const cover = CARD_COVERS.find(c => c.id === card.coverImage) || CARD_COVERS[0];

  return (
    <div style={{
      width: '100%', height: '100%',
      position: 'absolute', inset: 0,
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      borderRadius: 24,
      display: 'flex', flexDirection: 'column',
      padding: '32px',
      ...(isFront
        ? {
            backgroundImage: cover.gradient,
            backgroundColor: cover.bgColor,
            backgroundSize: cover.bgSize,
            backgroundPosition: 'center',
            border: '4px solid rgba(255,255,255,0.1)',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
          }
        : {
            transform: 'rotateY(180deg)',
            background: card.isChallenge
              ? 'linear-gradient(135deg, rgba(231,76,60,0.15), rgba(192,57,43,0.1))'
              : 'linear-gradient(135deg, rgba(52,152,219,0.15), rgba(41,128,185,0.1))',
            border: `3px solid ${card.isChallenge ? 'var(--error)' : 'var(--accent)'}`,
            alignItems: 'center', justifyContent: 'flex-start',
            backgroundColor: 'var(--bg-secondary)',
          }),
    }}>
      {isFront ? (
        <>
          <div style={{ fontSize: 72, marginBottom: 16, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}>{card.icon || '🃏'}</div>
          <div className="font-timer" style={{ fontSize: 32, fontWeight: 700, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            Card {card.number}
          </div>
        </>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{card.icon || (card.isChallenge ? '🎯' : '📚')}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: card.isChallenge ? 'var(--error)' : 'var(--accent)', marginBottom: 8 }}>
              {card.topic || (card.isChallenge ? 'Challenge Time!' : 'Topic Info')}
            </div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {card.instructions || 'Read the question carefully.'}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Team Selection */}
            {card.isChallenge && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>Assign card to team:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {teams.map(team => {
                    const isSelectedHere = selectedTeam === team;
                    // Check if team is assigned to ANY OTHER card
                    const isAssignedElsewhere = Object.entries(selectedTeamsLayer).some(([idx, t]) => t === team && Number(idx) !== card.index);
                    const isDisabled = isAssignedElsewhere && !isSelectedHere;

                    return (
                      <button
                        key={team}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isDisabled) setSelectedTeam(team);
                        }}
                        disabled={isDisabled}
                        style={{
                          padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                          background: isSelectedHere ? 'var(--accent)' : 'var(--bg-tertiary)',
                          color: isSelectedHere ? '#fff' : isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
                          border: isSelectedHere ? '2px solid var(--accent)' : '1px solid var(--border)',
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {team}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Start Quiz Action */}
            <button
              className={`btn ${card.isChallenge ? 'btn-primary' : 'btn-secondary'}`}
              onClick={(e) => { e.stopPropagation(); onStartQuiz(); }}
              disabled={card.isChallenge && !selectedTeam}
              style={{ padding: '16px', fontSize: 18, width: '100%', marginTop: 8 }}
            >
              {card.isChallenge ? 'Start Quiz' : 'Mark as Done'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FlippableCard({ card, isFlipped, onFlip, onStartQuiz, teams, selectedTeamsLayer, selectedTeam, setSelectedTeam }) {
  return (
    <motion.div
      onClick={!isFlipped ? onFlip : undefined}
      whileHover={!isFlipped ? { y: -8, scale: 1.02 } : {}}
      style={{
        width: '100%', height: '100%',
        perspective: 1500,
        cursor: isFlipped ? 'default' : 'pointer',
      }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 60, damping: 14 }}
        style={{
          width: '100%', height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        <CardFace card={card} isFront={true} />
        <CardFace
          card={card}
          isFront={false}
          isFlipped={isFlipped}
          onStartQuiz={onStartQuiz}
          teams={teams}
          selectedTeamsLayer={selectedTeamsLayer}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
        />
      </motion.div>
    </motion.div>
  );
}

export default function CardFlipRound({ event, teams, scores, onComplete }) {
  const [flippedCards, setFlippedCards] = useState({});
  const [activeCard, setActiveCard] = useState(null); // card actively in the quiz modal
  const [selectedTeamsLayer, setSelectedTeamsLayer] = useState({}); // cardIdx -> team assigned
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [cardResults, setCardResults] = useState({}); // cardIdx -> { team, completed: true }

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

  // Round ends if all cards are flipped OR if the number of picked cards equals the number of teams
  const pickedCount = Object.keys(cardResults).length;
  const allTeamsPicked = pickedCount >= teams.length;
  const allCardsFlipped = pickedCount >= cards.length;
  const canEndRound = allTeamsPicked || allCardsFlipped;

  const handleFlipCard = (index) => {
    if (flippedCards[index]) return;
    SFX.select?.();

    const card = cards[index];
    setFlippedCards((prev) => ({ ...prev, [index]: true }));
  };

  const handleStartQuiz = (index) => {
    SFX.select?.();
    const card = cards[index];

    if (card.isChallenge && card.subQuestions && card.subQuestions.length > 0) {
      setActiveCard({ ...card, index });
      setCurrentSubIndex(0);
      setSelectedOption(null);
      setAnswerRevealed(false);
    } else {
      // It's a topic card (or empty challenge), mark complete
      const assignedTeam = selectedTeamsLayer[index];
      setCardResults((prev) => ({ ...prev, [index]: { completed: true, team: assignedTeam } }));
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
    if (subQ) {
      const correct = selectedOption === subQ.correctOptionIndex;
      if (correct) setTimeout(() => SFX.correct?.(), 200);
      else setTimeout(() => SFX.wrong?.(), 200);
    }
  };

  const nextSubQuestion = () => {
    if (currentSubIndex < activeCard.subQuestions.length - 1) {
      setCurrentSubIndex(prev => prev + 1);
      setSelectedOption(null);
      setAnswerRevealed(false);
    } else {
      const assignedTeam = selectedTeamsLayer[activeCard.index];
      setCardResults((prev) => ({ ...prev, [activeCard.index]: { completed: true, team: assignedTeam } }));
      setActiveCard(null);
    }
  };

  const handleAwardTeam = (team) => {
    if (!activeCard) return;
    const pts = activeCard.points || 10;
    addScore(team, pts);
    nextSubQuestion();
  };

  const handleNoTeamCorrect = () => {
    if (!activeCard) return;
    if (activeCard.negativeMarks) {
      const assignedTeam = selectedTeamsLayer[activeCard.index];
      if (assignedTeam) {
        deductScore(assignedTeam, activeCard.negativePoints || 5);
      }
    }
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
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${cards.length <= 4 ? '40%' : cards.length <= 6 ? '30%' : '250px'}, 1fr))`,
        gap: 24,
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: '0 40px',
      }}>
        {cards.map((card, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex' }}>
            <FlippableCard
              card={{ ...card, number: i + 1, index: i }}
              isFlipped={!!flippedCards[i]}
              onFlip={() => handleFlipCard(i)}
              onStartQuiz={() => handleStartQuiz(i)}
              teams={teams}
              selectedTeamsLayer={selectedTeamsLayer}
              selectedTeam={selectedTeamsLayer[i]}
              setSelectedTeam={(team) => setSelectedTeamsLayer(prev => ({ ...prev, [i]: team }))}
            />
            {cardResults[i] && (
              <div style={{
                position: 'absolute', top: -10, right: -10,
                borderRadius: '50%', width: 36, height: 36,
                background: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid var(--bg-primary)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                zIndex: 10,
              }}>
                <Check size={18} color="#fff" />
              </div>
            )}
            {cardResults[i]?.team && (
              <div style={{
                position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--bg-secondary)', border: '2px solid var(--border)',
                padding: '4px 12px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                color: 'var(--text-primary)', zIndex: 10, whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                Done: {cardResults[i].team}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* End Round button when all cards done or all teams have picked */}
      {canEndRound && !activeCard && (
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
                width: '100%', maxWidth: 900,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 20, padding: '40px 48px',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <AlertTriangle size={36} style={{ color: 'var(--error)', marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 16 }}>
                  Challenge Card {activeCard.index + 1} — Question {currentSubIndex + 1} of {activeCard.subQuestions.length}
                </p>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {currentSubQ?.questionText}
                </h2>
              </div>

              {/* Options */}
              {options.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
                  {options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === currentSubQ?.correctOptionIndex;
                    const isRevealedCorrect = answerRevealed && isCorrect;
                    const isWrongSelected = answerRevealed && isSelected && !isCorrect;

                    let bg = 'var(--bg-card)', border = '2px solid var(--border)';
                    if (isSelected && !answerRevealed) { bg = 'rgba(243,156,18,0.1)'; border = '2px solid var(--warning)'; }
                    if (isRevealedCorrect) { bg = 'rgba(39,174,96,0.2)'; border = '2px solid var(--success)'; }
                    if (isWrongSelected) { bg = 'rgba(231,76,60,0.2)'; border = '2px solid var(--error)'; }

                    return (
                      <button key={i} onClick={() => handleSelectOption(i)} disabled={answerRevealed}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                          borderRadius: 12, background: bg, border, cursor: answerRevealed ? 'default' : 'pointer',
                          color: 'var(--text-primary)', textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!answerRevealed && !isSelected) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = 'var(--text-muted)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!answerRevealed && !isSelected) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'var(--border)';
                          }
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                          background: isRevealedCorrect ? 'var(--success)' : isWrongSelected ? 'var(--error)' : 'var(--bg-tertiary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: (isRevealedCorrect || isWrongSelected) ? '#fff' : 'var(--text-secondary)',
                        }}>
                          {isRevealedCorrect ? <Check size={18} /> : isWrongSelected ? <X size={18} /> : OPTION_LABELS[i]}
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 500 }}>{opt}</span>
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
                  <button className="btn btn-primary" onClick={() => {
                    const subQ = activeCard?.subQuestions?.[currentSubIndex];
                    if (subQ && selectedOption === subQ.correctOptionIndex) {
                      handleAwardTeam(selectedTeamsLayer[activeCard.index]);
                    } else {
                      handleNoTeamCorrect();
                    }
                  }}
                    style={{ fontSize: 14, padding: '10px 20px', background: 'var(--success)' }}>
                    Continue
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
