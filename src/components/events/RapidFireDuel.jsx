import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, ChevronRight, Check, X, Trophy } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { useSyncState } from '../../utils/syncManager';
import SFX from '../../utils/soundManager';

export default function RapidFireDuel({ event, teams, scores, onComplete }) {
  const gameData = useGameStore((s) => s.gameData);

  const [duelIndex, setDuelIndex] = useSyncState('rp_duelIdx', 0);
  const [questionIndex, setQuestionIndex] = useSyncState('duel_qIdx', 0);
  const [phase, setPhase] = useSyncState('duel_phs', 'intro'); // 'intro' → 'active' → 'result'
  const [duelScores, setDuelScores] = useSyncState('duel_scores', { team1: 0, team2: 0 });
  const [showAnswer, setShowAnswer] = useSyncState('duel_ans', false);
  const [buzzedTeam, setBuzzedTeam] = useSyncState('duel_buzzed', null);

  const addScore = useGameStore((s) => s.addScore);
  const config = event.config || {};
  const questions = event.questions || [];
  const questionsPerDuel = config.questionsPerDuel || 5;
  const pointsPerWin = config.pointsPerWin || 25;
  const pointsPerQuestion = config.pointsPerQuestion || 5;

  const [selectedTeams, setSelectedTeams] = useSyncState('rp_selTeams', [teams[0] || 'Team 1', teams[1] || 'Team 2']);
  
  if (teams.length < 2) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Not enough teams for duels
      </div>
    );
  }

  const team1 = selectedTeams[0];
  const team2 = selectedTeams[1];

  // Filter questions for this duel
  // Unassigned questions (no targetTeamSlot) or assigned to one of the dueling teams' slots
  const team1SlotIndex = teams.indexOf(team1);
  const team2SlotIndex = teams.indexOf(team2);
  const duelPool = questions.filter(q => {
    if (q.targetTeamSlot === '' || q.targetTeamSlot === undefined || q.targetTeamSlot === null) return true;
    return q.targetTeamSlot === team1SlotIndex || q.targetTeamSlot === team2SlotIndex;
  });
  const duelStartQ = duelIndex * questionsPerDuel;
  const duelQuestions = duelPool.slice(duelStartQ, duelStartQ + questionsPerDuel);
  const currentQuestion = duelQuestions[questionIndex];

  const startDuel = () => {
    setPhase('active');
    setQuestionIndex(0);
    setDuelScores({ team1: 0, team2: 0 });
    setShowAnswer(false);
    setBuzzedTeam(null);
    SFX.eventStart();
  };

  const handleBuzz = (team) => {
    if (buzzedTeam) return;
    SFX.buzz();
    setBuzzedTeam(team);
  };

  const handleMarkCorrect = () => {
    if (!buzzedTeam) return;
    const key = buzzedTeam === team1 ? 'team1' : 'team2';
    setDuelScores((prev) => ({ ...prev, [key]: prev[key] + pointsPerQuestion }));
    addScore(buzzedTeam, pointsPerQuestion);
    SFX.correct();
    advanceQuestion();
  };

  const handleMarkWrong = () => {
    // Give the point to the OTHER team
    if (!buzzedTeam) return;
    const otherTeam = buzzedTeam === team1 ? team2 : team1;
    const key = otherTeam === team1 ? 'team1' : 'team2';
    setDuelScores((prev) => ({ ...prev, [key]: prev[key] + pointsPerQuestion }));
    addScore(otherTeam, pointsPerQuestion);
    SFX.wrong();
    advanceQuestion();
  };

  const handleNoBuzz = () => {
    advanceQuestion();
  };

  const advanceQuestion = () => {
    setShowAnswer(false);
    setBuzzedTeam(null);
    if (questionIndex >= duelQuestions.length - 1 || !duelQuestions[questionIndex + 1]) {
      // Duel over
      finishDuel();
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const finishDuel = () => {
    // Award duel win bonus and immediately end round
    if (duelScores.team1 > duelScores.team2) {
      addScore(team1, pointsPerWin);
    } else if (duelScores.team2 > duelScores.team1) {
      addScore(team2, pointsPerWin);
    }
    setPhase('result');
  };


  const winner = duelScores.team1 > duelScores.team2 ? team1 : duelScores.team2 > duelScores.team1 ? team2 : 'Tie';

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
          <Swords size={18} style={{ color: '#1ABC9C' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1ABC9C', textTransform: 'uppercase', letterSpacing: 1 }}>
            {config.name || 'Rapid Fire Duel'}
          </span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Duel {duelIndex + 1}
        </span>
      </div>

      {/* VS Header (when active) */}
      {phase !== 'intro' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
          marginBottom: 20,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'hsl(200, 70%, 55%)' }}>{team1}</div>
            <div className="font-timer" style={{ fontSize: 32, fontWeight: 900, color: 'hsl(200, 70%, 55%)' }}>
              {duelScores.team1}
            </div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-muted)' }}>VS</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'hsl(350, 70%, 55%)' }}>{team2}</div>
            <div className="font-timer" style={{ fontSize: 32, fontWeight: 900, color: 'hsl(350, 70%, 55%)' }}>
              {duelScores.team2}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{ textAlign: 'center' }}
            >
              <Swords size={50} style={{ color: '#1ABC9C', marginBottom: 20 }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 40 }}>
                <select 
                  value={team1} 
                  onChange={(e) => setSelectedTeams([e.target.value, team2])}
                  className="input"
                  style={{ fontSize: 24, fontWeight: 700, color: 'hsl(200, 70%, 55%)', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}
                >
                  {teams.map(t => <option key={`t1-${t}`} value={t}>{t}</option>)}
                </select>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-muted)' }}>VS</div>
                <select 
                  value={team2} 
                  onChange={(e) => setSelectedTeams([team1, e.target.value])}
                  className="input"
                  style={{ fontSize: 24, fontWeight: 700, color: 'hsl(350, 70%, 55%)', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}
                >
                  {teams.map(t => <option key={`t2-${t}`} value={t}>{t}</option>)}
                </select>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
                {questionsPerDuel} questions • Winner gets {pointsPerWin} bonus pts
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={startDuel} className="btn btn-primary btn-large"
                  style={{ fontSize: 18, padding: '16px 48px', background: '#1ABC9C' }}>
                  Start Duel
                </motion.button>
            </motion.div>
          )}

          {phase === 'active' && currentQuestion && (
            <motion.div
              key={`q-${questionIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              style={{ width: '100%', maxWidth: 700, textAlign: 'center' }}
            >
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                Question {questionIndex + 1} / {duelQuestions.length}
              </p>
              <h2 style={{
                fontSize: 28, fontWeight: 600, lineHeight: 1.3,
                color: 'var(--text-primary)', marginBottom: 28,
              }}>
                {currentQuestion.questionText}
              </h2>

              {/* Buzz Buttons */}
              {!buzzedTeam && (
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleBuzz(team1)}
                    style={{
                      padding: '16px 36px', borderRadius: 12, fontSize: 18, fontWeight: 700,
                      background: 'hsl(200, 70%, 45%)', color: '#fff',
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
                    }}
                  >
                    🔔 {team1}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleBuzz(team2)}
                    style={{
                      padding: '16px 36px', borderRadius: 12, fontSize: 18, fontWeight: 700,
                      background: 'hsl(350, 70%, 45%)', color: '#fff',
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
                    }}
                  >
                    🔔 {team2}
                  </motion.button>
                </div>
              )}

              {/* Buzzed Team */}
              {buzzedTeam && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ marginBottom: 20 }}
                >
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                    🔔 {buzzedTeam} buzzed!
                  </p>
                </motion.div>
              )}

              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    background: 'rgba(39, 174, 96, 0.15)', border: '1px solid var(--success)',
                    fontSize: 16, fontWeight: 600, color: 'var(--success)', marginBottom: 16,
                  }}
                >
                  Answer: {currentQuestion.options?.[currentQuestion.correctOptionIndex] || 'See host'}
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center' }}
            >
              {winner !== 'Tie' ? (
                <>
                  <Trophy size={50} style={{ color: '#F1C40F', marginBottom: 16 }} />
                  <h2 className="font-display" style={{
                    fontSize: 40, fontWeight: 900, color: '#F1C40F',
                    textTransform: 'uppercase', marginBottom: 8,
                  }}>
                    {winner} Wins!
                  </h2>
                  <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                    +{pointsPerWin} bonus points
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display" style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-muted)' }}>
                    It's a Draw!
                  </h2>
                </>
              )}

              <div style={{
                display: 'flex', gap: 24, justifyContent: 'center', marginTop: 24, marginBottom: 32,
              }}>
                <div style={{ textAlign: 'center', padding: '12px 24px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'hsl(200, 70%, 55%)' }}>{team1}</div>
                  <div className="font-timer" style={{ fontSize: 28, fontWeight: 900 }}>{duelScores.team1}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 24px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'hsl(350, 70%, 55%)' }}>{team2}</div>
                  <div className="font-timer" style={{ fontSize: 28, fontWeight: 900 }}>{duelScores.team2}</div>
                </div>
              </div>

              <button className="btn btn-primary btn-large" onClick={onComplete}
                style={{ fontSize: 16, padding: '14px 40px', gap: 8 }}>
                <ChevronRight size={18} /> End Event
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls (during active) */}
      {phase === 'active' && currentQuestion && (
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center',
          padding: '16px 0 0', borderTop: '1px solid var(--border)', marginTop: 12,
        }}>
          {buzzedTeam ? (
            <>
              <button className="btn btn-success" onClick={handleMarkCorrect}
                style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8, background: 'var(--success)' }}>
                <Check size={18} /> Correct
              </button>
              <button className="btn btn-secondary" onClick={handleMarkWrong}
                style={{ minHeight: 48, fontSize: 15, padding: '10px 24px', gap: 8, color: 'var(--error)' }}>
                <X size={18} /> Wrong (Point to {buzzedTeam === team1 ? team2 : team1})
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={handleNoBuzz}
              style={{ minHeight: 42, fontSize: 13, padding: '8px 20px' }}>
              No Buzz — Skip
            </button>
          )}
          {!showAnswer && (
            <button className="btn btn-secondary" onClick={() => setShowAnswer(true)}
              style={{ minHeight: 42, fontSize: 13, padding: '8px 16px' }}>
              Show Answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
