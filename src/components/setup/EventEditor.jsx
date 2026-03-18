import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, GripVertical, Edit3, ChevronLeft, Upload, Eye, X
} from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { EVENT_META, EVENT_DEFAULTS, OPTION_LABELS, createBlankQuestion, CARD_COVERS } from '../../utils/eventTypes';

// ── Config Field Renderers ──────────────────

function ConfigField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextConfig({ value, onChange, placeholder }) {
  return (
    <input
      className="input"
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function NumberConfig({ value, onChange, min, max }) {
  return (
    <input
      className="input"
      type="number"
      value={value ?? ''}
      onChange={(e) => onChange(parseInt(e.target.value) || min)}
      min={min}
      max={max}
      style={{ width: 120 }}
    />
  );
}

function ToggleConfig({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 13,
        background: value ? 'var(--accent)' : 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: 'white',
        position: 'absolute', top: 2,
        left: value ? 24 : 2,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

function SelectConfig({ value, onChange, options }) {
  return (
    <select
      className="input"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 200, cursor: 'pointer' }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

// ── Config panels per event type ──────────────────

function QARoundConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  return (
    <>
      <ConfigField label="Event Name">
        <TextConfig value={config.name} onChange={(v) => update('name', v)} placeholder="Q&A Round" />
      </ConfigField>
      <ConfigField label="Options per Question (2-6)">
        <NumberConfig value={config.optionsPerQuestion} onChange={(v) => update('optionsPerQuestion', Math.min(6, Math.max(2, v)))} min={2} max={6} />
      </ConfigField>
      <ConfigField label="Points per Correct Answer">
        <NumberConfig value={config.pointsPerCorrect} onChange={(v) => update('pointsPerCorrect', v)} min={1} max={100} />
      </ConfigField>
      <ConfigField label="Negative Marking">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ToggleConfig value={config.negativeMarking} onChange={(v) => update('negativeMarking', v)} />
          {config.negativeMarking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deduct:</span>
              <NumberConfig value={config.negativePoints} onChange={(v) => update('negativePoints', v)} min={1} max={50} />
            </div>
          )}
        </div>
      </ConfigField>
      <ConfigField label="Show Question Number">
        <ToggleConfig value={config.showQuestionNumber} onChange={(v) => update('showQuestionNumber', v)} />
      </ConfigField>
      <ConfigField label="Allow Skip">
        <ToggleConfig value={config.allowSkip} onChange={(v) => update('allowSkip', v)} />
      </ConfigField>
      <ConfigField label="Question Timer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ToggleConfig value={config.questionTimer} onChange={(v) => update('questionTimer', v)} />
          {config.questionTimer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Duration (s):</span>
              <NumberConfig value={config.timerDuration} onChange={(v) => update('timerDuration', v)} min={10} max={120} />
            </div>
          )}
        </div>
      </ConfigField>
    </>
  );
}

function BuzzerConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  return (
    <>
      <ConfigField label="Event Name">
        <TextConfig value={config.name} onChange={(v) => update('name', v)} />
      </ConfigField>
      <ConfigField label="Time per Question (seconds)">
        <NumberConfig value={config.timePerQuestion} onChange={(v) => update('timePerQuestion', v)} min={5} max={120} />
      </ConfigField>
      <ConfigField label="Points per Correct">
        <NumberConfig value={config.pointsPerCorrect} onChange={(v) => update('pointsPerCorrect', v)} min={1} max={100} />
      </ConfigField>
      <ConfigField label="Timer Style">
        <SelectConfig value={config.timerStyle} onChange={(v) => update('timerStyle', v)} options={[
          { value: 'circular', label: 'Circular Arc' },
          { value: 'linear', label: 'Linear Bar' },
          { value: 'digital', label: 'Digital Countdown' },
          { value: 'flipping', label: 'Flipping Numbers' },
        ]} />
      </ConfigField>
      <ConfigField label="Show Options">
        <ToggleConfig value={config.showOptions} onChange={(v) => update('showOptions', v)} />
      </ConfigField>
      <ConfigField label="Warning Threshold (seconds)">
        <NumberConfig value={config.warningThreshold} onChange={(v) => update('warningThreshold', v)} min={3} max={15} />
      </ConfigField>
      <ConfigField label="Auto-reveal on Timeout">
        <ToggleConfig value={config.autoRevealOnTimeout} onChange={(v) => update('autoRevealOnTimeout', v)} />
      </ConfigField>
    </>
  );
}

function LightningConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  return (
    <>
      <ConfigField label="Event Name">
        <TextConfig value={config.name} onChange={(v) => update('name', v)} />
      </ConfigField>
      <ConfigField label="Time per Team (seconds)">
        <NumberConfig value={config.timePerTeam} onChange={(v) => update('timePerTeam', v)} min={30} max={180} />
      </ConfigField>
      <ConfigField label="Questions per Team (0 = all)">
        <NumberConfig value={config.questionsPerTeam} onChange={(v) => update('questionsPerTeam', v)} min={0} max={50} />
      </ConfigField>
      <ConfigField label="Points per Correct">
        <NumberConfig value={config.pointsPerCorrect} onChange={(v) => update('pointsPerCorrect', v)} min={1} max={50} />
      </ConfigField>
      <ConfigField label="Pass Allowed">
        <ToggleConfig value={config.passAllowed} onChange={(v) => update('passAllowed', v)} />
      </ConfigField>
      <ConfigField label="Negative Marking">
        <ToggleConfig value={config.negativeMarking} onChange={(v) => update('negativeMarking', v)} />
      </ConfigField>
      <ConfigField label="Team Order">
        <SelectConfig value={config.teamOrder} onChange={(v) => update('teamOrder', v)} options={[
          { value: 'sequence', label: 'Sequential (1→4)' },
          { value: 'random', label: 'Random' },
          { value: 'mc_choice', label: 'MC Choice' },
        ]} />
      </ConfigField>
    </>
  );
}

function IdentifyConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  return (
    <>
      <ConfigField label="Event Name">
        <TextConfig value={config.name} onChange={(v) => update('name', v)} />
      </ConfigField>
      <ConfigField label="Sub-mode">
        <SelectConfig value={config.subMode} onChange={(v) => update('subMode', v)} options={[
          { value: 'mixed', label: 'Mixed' },
          { value: 'image', label: 'Image Only' },
          { value: 'sound', label: 'Sound Only' },
        ]} />
      </ConfigField>
      <ConfigField label="Points per Correct">
        <NumberConfig value={config.pointsPerCorrect} onChange={(v) => update('pointsPerCorrect', v)} min={1} max={100} />
      </ConfigField>
      <ConfigField label="Show Options">
        <ToggleConfig value={config.showOptions} onChange={(v) => update('showOptions', v)} />
      </ConfigField>
      <ConfigField label="Blur Reveal for Images">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ToggleConfig value={config.blurReveal} onChange={(v) => update('blurReveal', v)} />
          {config.blurReveal && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stages:</span>
              <NumberConfig value={config.blurStages} onChange={(v) => update('blurStages', v)} min={2} max={5} />
            </div>
          )}
        </div>
      </ConfigField>
    </>
  );
}

function WipeoutConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  return (
    <>
      <ConfigField label="Event Name">
        <TextConfig value={config.name} onChange={(v) => update('name', v)} />
      </ConfigField>
      <ConfigField label="Base Points">
        <NumberConfig value={config.basePoints} onChange={(v) => update('basePoints', v)} min={5} max={100} />
      </ConfigField>
      <ConfigField label="Show Team Wagers">
        <ToggleConfig value={config.showTeamWagers} onChange={(v) => update('showTeamWagers', v)} />
      </ConfigField>
      <ConfigField label="Allow Zero Wager">
        <ToggleConfig value={config.allowZeroWager} onChange={(v) => update('allowZeroWager', v)} />
      </ConfigField>
      <ConfigField label="Simultaneous Wager">
        <ToggleConfig value={config.simultaneousWager} onChange={(v) => update('simultaneousWager', v)} />
      </ConfigField>
    </>
  );
}

function RapidFireConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  return (
    <>
      <ConfigField label="Event Name">
        <TextConfig value={config.name} onChange={(v) => update('name', v)} />
      </ConfigField>
      <ConfigField label="Questions per Duel">
        <NumberConfig value={config.questionsPerDuel} onChange={(v) => update('questionsPerDuel', v)} min={3} max={10} />
      </ConfigField>
      <ConfigField label="Duel Format">
        <SelectConfig value={config.duelFormat} onChange={(v) => update('duelFormat', v)} options={[
          { value: 'round-robin', label: 'Round-Robin' },
          { value: 'bracket', label: 'Bracket' },
          { value: 'mc_choice', label: 'MC Choice' },
        ]} />
      </ConfigField>
      <ConfigField label="Points per Win">
        <NumberConfig value={config.pointsPerWin} onChange={(v) => update('pointsPerWin', v)} min={5} max={100} />
      </ConfigField>
      <ConfigField label="Points per Question">
        <NumberConfig value={config.pointsPerQuestion} onChange={(v) => update('pointsPerQuestion', v)} min={1} max={50} />
      </ConfigField>
      <ConfigField label="Time to Buzz (seconds)">
        <NumberConfig value={config.timeToBuzz} onChange={(v) => update('timeToBuzz', v)} min={3} max={15} />
      </ConfigField>
    </>
  );
}

function CardFlipConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  return (
    <>
      <ConfigField label="Event Name">
        <TextConfig value={config.name} onChange={(v) => update('name', v)} />
      </ConfigField>
      <ConfigField label="Info">
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Add cards below using the question editor. Toggle "Is Challenge Card" per card.
          Topic cards just show info; challenge cards have a question and optional negative marks.
        </p>
      </ConfigField>
    </>
  );
}

function MasterRoundConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });
  return (
    <>
      <ConfigField label="Event Name">
        <TextConfig value={config.name} onChange={(v) => update('name', v)} />
      </ConfigField>
    </>
  );
}

const CONFIG_PANELS = {
  QA_ROUND: QARoundConfig,
  IDENTIFY: IdentifyConfig,
  BUZZER: BuzzerConfig,
  LIGHTNING: LightningConfig,
  WIPEOUT: WipeoutConfig,
  RAPID_FIRE: RapidFireConfig,
  CARD_FLIP: CardFlipConfig,
  MASTER_ROUND: MasterRoundConfig,
};

// ── Question Edit Modal ──────────────────

function QuestionEditModal({ eventType, question, onClose, onSave, teamCount, optionsCount = 4 }) {
  const [form, setForm] = useState({ ...question });
  const [mediaPreview, setMediaPreview] = useState(form.mediaFile || null);
  const [audioEl, setAudioEl] = useState(null);
  const [itemType, setItemType] = useState(form.itemType || 'image');

  const isIdentify = eventType === 'IDENTIFY';
  const isCardFlip = eventType === 'CARD_FLIP';
  const isMasterRound = eventType === 'MASTER_ROUND';

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const updateOption = (idx, val) => {
    const newOpts = [...form.options];
    newOpts[idx] = val;
    update('options', newOpts);
  };

  const handleAddSubQuestion = () => {
    const newSq = { questionText: '', options: Array(optionsCount).fill(''), correctOptionIndex: 0 };
    update('subQuestions', [...(form.subQuestions || []), newSq]);
  };

  const handleRemoveSubQuestion = (idx) => {
    const arr = [...(form.subQuestions || [])];
    arr.splice(idx, 1);
    update('subQuestions', arr);
  };

  const updateSubQuestion = (idx, field, val) => {
    const arr = [...(form.subQuestions || [])];
    arr[idx] = { ...arr[idx], [field]: val };
    update('subQuestions', arr);
  };

  const updateSubQuestionOption = (qIdx, optIdx, val) => {
    const arr = [...(form.subQuestions || [])];
    const newOpts = [...arr[qIdx].options];
    newOpts[optIdx] = val;
    arr[qIdx] = { ...arr[qIdx], options: newOpts };
    update('subQuestions', arr);
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  // Check for Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  // Handle media file selection
  const handleMediaSelect = async () => {
    const currentItemType = form.itemType || 'image';
    if (isElectron) {
      // Use Electron's file picker - pass the type so it shows correct filter
      try {
        const result = await window.electronAPI.file.selectMedia(currentItemType);
        if (result) {
          update('mediaFile', result);
          update('mediaFileName', result.split(/[\\/]/).pop());
          setMediaPreview(result);
        }
      } catch (err) {
        console.error('Failed to select media:', err);
      }
    } else {
      // Browser fallback: trigger hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = currentItemType === 'sound' ? 'audio/*' : 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) {
             // 2MB warning because localStorage has a 5MB limit
             console.warn('Large file: might exceed localStorage limits.');
          }
          const reader = new FileReader();
          reader.onload = (ev) => {
            const base64 = ev.target.result;
            update('mediaFile', base64);
            update('mediaFileName', file.name);
            setMediaPreview(base64);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  const handleClearMedia = () => {
    update('mediaFile', null);
    update('mediaFileName', null);
    setMediaPreview(null);
    if (audioEl) {
      audioEl.pause();
      setAudioEl(null);
    }
  };

  const handlePlayAudio = () => {
    if (!mediaPreview) return;
    if (audioEl) {
      audioEl.pause();
      setAudioEl(null);
      return;
    }
    const audio = new Audio(mediaPreview);
    audio.play();
    audio.onended = () => setAudioEl(null);
    setAudioEl(audio);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        style={{ padding: '24px 28px', maxWidth: 720, maxHeight: '90vh', overflow: 'auto' }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            {question.id
              ? (isCardFlip ? 'Edit Card' : 'Edit Question')
              : (isCardFlip ? 'Add Card' : 'Add Question')}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Media Upload (Identify Only) ────────── */}
        {isIdentify && (
          <>
            {/* Item Type Selector */}
            <ConfigField label="Media Type">
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ value: 'image', label: '🖼️ Image' }, { value: 'sound', label: '🔊 Sound' }].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setItemType(opt.value);
                      update('itemType', opt.value);
                      handleClearMedia(); // clear if type changes
                    }}
                    style={{
                      padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                      background: itemType === opt.value ? 'var(--accent)' : 'var(--bg-tertiary)',
                      color: itemType === opt.value ? '#fff' : 'var(--text-secondary)',
                      border: itemType === opt.value ? '2px solid var(--accent)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </ConfigField>

            {/* Upload Zone */}
            <ConfigField label={itemType === 'sound' ? 'Audio File' : 'Image File'}>
              {!mediaPreview ? (
                <button
                  onClick={handleMediaSelect}
                  style={{
                    width: '100%', padding: '28px 20px',
                    borderRadius: 10,
                    border: '2px dashed var(--border)',
                    background: 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 10,
                    color: 'var(--text-muted)',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  <Upload size={28} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    Click to upload {itemType === 'sound' ? 'an audio file' : 'an image'}
                  </span>
                  <span style={{ fontSize: 11 }}>
                    {itemType === 'sound' ? 'MP3, WAV, OGG' : 'JPG, PNG, GIF, WEBP'}
                  </span>
                </button>
              ) : (
                <div style={{
                  borderRadius: 10, overflow: 'hidden',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  position: 'relative',
                }}>
                  {/* Image Preview */}
                  {itemType === 'image' && (
                    <div style={{
                      width: '100%', height: 180,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: '#111',
                      overflow: 'hidden',
                    }}>
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        style={{
                          maxWidth: '100%', maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  )}

                  {/* Audio Preview */}
                  {itemType === 'sound' && (
                    <div style={{
                      width: '100%', padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <button
                        onClick={handlePlayAudio}
                        style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: audioEl ? 'var(--error)' : 'var(--accent)',
                          border: 'none', color: '#fff',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, flexShrink: 0,
                          transition: 'background 0.2s',
                        }}
                      >
                        {audioEl ? '⏸' : '▶'}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {form.mediaFileName || 'Audio file'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Ready to play
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replace / Remove buttons */}
                  <div style={{
                    display: 'flex', gap: 8, padding: '8px 12px',
                    borderTop: '1px solid var(--border)',
                  }}>
                    <button
                      onClick={handleMediaSelect}
                      className="btn btn-secondary"
                      style={{ flex: 1, minHeight: 32, fontSize: 12, padding: '4px 8px' }}
                    >
                      Replace
                    </button>
                    <button
                      onClick={handleClearMedia}
                      className="btn btn-secondary"
                      style={{ minHeight: 32, fontSize: 12, padding: '4px 10px', color: 'var(--error)' }}
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </ConfigField>
          </>
        )}

        {/* Card Flip specific fields */}
        {isCardFlip && (
          <>
            {/* Card Front Settings */}
            <ConfigField label="Card Front / Cover Design">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {CARD_COVERS.map(cover => (
                  <button
                    key={cover.id}
                    onClick={() => update('coverImage', cover.id)}
                    style={{
                      padding: '12px 8px', borderRadius: 8, cursor: 'pointer',
                      backgroundImage: cover.gradient,
                      backgroundColor: cover.bgColor,
                      backgroundSize: cover.bgSize,
                      backgroundPosition: 'center',
                      border: form.coverImage === cover.id ? '2px solid white' : '2px solid transparent',
                      boxShadow: form.coverImage === cover.id ? '0 0 0 2px var(--accent)' : 'none',
                      color: 'white', fontWeight: 600, fontSize: 11, textAlign: 'center',
                      textShadow: '0px 1px 3px rgba(0,0,0,0.8)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {cover.label}
                  </button>
                ))}
              </div>
            </ConfigField>

            <ConfigField label="Card Details (Shown on Back)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <TextConfig value={form.icon ?? ''} onChange={(v) => update('icon', v)} placeholder="Card Icon (Emoji) - Leave blank for none" />
                <TextConfig value={form.topic || ''} onChange={(v) => update('topic', v)} placeholder="Topic Title" />
                <textarea
                  className="input"
                  value={form.instructions || ''}
                  onChange={(e) => update('instructions', e.target.value)}
                  placeholder="Instructions for the host..."
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </ConfigField>

            <ConfigField label="Scoring configuration">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, width: 140 }}>Points for Correct:</span>
                      <NumberConfig value={form.points || 10} onChange={(v) => update('points', v)} min={1} max={100} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ToggleConfig value={form.negativeMarks} onChange={(v) => update('negativeMarks', v)} />
                      <span style={{ fontSize: 13, width: form.negativeMarks ? 'auto' : 140 }}>Apply negative marks</span>
                      {form.negativeMarks && (
                        <>
                          <span style={{ fontSize: 13, marginLeft: 'auto' }}>Penalty:</span>
                          <NumberConfig value={form.negativePoints || 5} onChange={(v) => update('negativePoints', v)} min={1} max={100} />
                        </>
                      )}
                    </div>
                  </div>
                </ConfigField>

                {/* Sub Questions for Challenge Card */}
                <div style={{ marginTop: 24, padding: '24px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700 }}>Questions on this Card</h4>
                    <button className="btn btn-secondary" onClick={handleAddSubQuestion} style={{ fontSize: 12, padding: '8px 14px' }}>
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  {(!form.subQuestions || form.subQuestions.length === 0) ? (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No questions added to this card yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {form.subQuestions.map((sq, sqIdx) => (
                        <div key={sqIdx} style={{ 
                          padding: 20, 
                          background: 'var(--bg-secondary)', 
                          borderRadius: 12, 
                          border: '1px solid var(--border)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Question {sqIdx + 1}</span>
                            <button onClick={() => handleRemoveSubQuestion(sqIdx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.8 }} onMouseEnter={(e)=>e.currentTarget.style.opacity=1} onMouseLeave={(e)=>e.currentTarget.style.opacity=0.8}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <textarea
                            className="input"
                            value={sq.questionText}
                            onChange={(e) => updateSubQuestion(sqIdx, 'questionText', e.target.value)}
                            placeholder="Type question here..."
                            rows={3}
                            style={{ resize: 'vertical', marginBottom: 16, fontSize: 14 }}
                          />

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {sq.options.map((opt, oIdx) => (
                              <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button
                                  onClick={() => updateSubQuestion(sqIdx, 'correctOptionIndex', oIdx)}
                                  style={{
                                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                                    background: sq.correctOptionIndex === oIdx ? 'var(--success)' : 'var(--bg-tertiary)',
                                    border: sq.correctOptionIndex === oIdx ? '2px solid var(--success)' : '1px solid var(--border)',
                                    color: sq.correctOptionIndex === oIdx ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                                  }}
                                >
                                  {OPTION_LABELS[oIdx]}
                                </button>
                                <input
                                  className="input"
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateSubQuestionOption(sqIdx, oIdx, e.target.value)}
                                  placeholder={`Option ${OPTION_LABELS[oIdx]}`}
                                  style={{ flex: 1, padding: '6px 10px', fontSize: 13 }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
          </>
        )}

        {/* Question Text */}
        {!isCardFlip && (
          <ConfigField label={isIdentify ? 'Question / Hint (shown to players)' : 'Question Text'}>
            <textarea
              className="input"
              value={isIdentify ? (form.question || '') : (form.questionText || '')}
              onChange={(e) => update(isIdentify ? 'question' : 'questionText', e.target.value)}
              placeholder={isIdentify ? 'e.g. "Identify this landmark" or leave empty' : 'Type your question here...'}
              rows={2}
              style={{ resize: 'vertical', minHeight: 50 }}
            />
          </ConfigField>
        )}

        {/* Master Round specific fields (Hints & Points) */}
        {isMasterRound && (
          <>
            <ConfigField label="Progressive Hints">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <TextConfig value={form.hint1 || ''} onChange={(v) => update('hint1', v)} placeholder="Hint 1 (least helpful)" />
                <TextConfig value={form.hint2 || ''} onChange={(v) => update('hint2', v)} placeholder="Hint 2 (more helpful)" />
                <TextConfig value={form.hint3 || ''} onChange={(v) => update('hint3', v)} placeholder="Hint 3 (almost gives it away)" />
              </div>
            </ConfigField>
            
            <ConfigField label="Custom Point Tiers (leave blank for event defaults)">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>0 Hints</label>
                  <NumberConfig value={form.points0 || ''} onChange={(v) => update('points0', v)} min={1} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>1 Hint</label>
                  <NumberConfig value={form.points1 || ''} onChange={(v) => update('points1', v)} min={1} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>2 Hints</label>
                  <NumberConfig value={form.points2 || ''} onChange={(v) => update('points2', v)} min={1} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>3 Hints</label>
                  <NumberConfig value={form.points3 || ''} onChange={(v) => update('points3', v)} min={1} />
                </div>
              </div>
            </ConfigField>
          </>
        )}

        {/* Target Team (for Lightning/RapidFire) */}
        {(eventType === 'LIGHTNING' || eventType === 'RAPID_FIRE') && (
          <ConfigField label="Target Team Slot (Optional)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <select
                className="input"
                value={form.targetTeamSlot ?? ''}
                onChange={(e) => update('targetTeamSlot', e.target.value === '' ? '' : parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              >
                <option value="">Any / All Teams</option>
                {Array.from({ length: teamCount }, (_, i) => (
                  <option key={i} value={i}>Team {String.fromCharCode(65 + i)} (Slot {i + 1})</option>
                ))}
              </select>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Slot A = 1st team, Slot B = 2nd team, etc. (assigned at game start)
              </span>
            </div>
          </ConfigField>
        )}

        {/* Answer (for Identify & Master Round) */}
        {(isIdentify || isMasterRound) && (
          <ConfigField label="Answer">
            <TextConfig value={form.answer} onChange={(v) => update('answer', v)} placeholder="Correct answer text" />
          </ConfigField>
        )}

        {/* Options */}
        {(!isMasterRound && !isCardFlip) && (
          <ConfigField label="Options (click to mark as correct)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(form.options || []).map((opt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => update('correctOptionIndex', i)}
                    style={{
                      width: 32, height: 32, borderRadius: 6,
                      background: form.correctOptionIndex === i ? 'var(--success)' : 'var(--bg-tertiary)',
                      border: form.correctOptionIndex === i ? '2px solid var(--success)' : '1px solid var(--border)',
                      color: form.correctOptionIndex === i ? 'white' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: 13, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.15s',
                    }}
                  >
                    {OPTION_LABELS[i]}
                  </button>
                  <input
                    className="input"
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${OPTION_LABELS[i]}`}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </div>
          </ConfigField>
        )}

        {/* Explanation */}
        {(!isIdentify && !isCardFlip) && (
          <ConfigField label="Explanation (shown after reveal, optional)">
            <TextConfig
              value={form.explanation}
              onChange={(v) => update('explanation', v)}
              placeholder="Why this is the correct answer..."
            />
          </ConfigField>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24,
          borderTop: '1px solid var(--border)', paddingTop: 16,
        }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {question.id ? 'Save Changes' : 'Add Question'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Event Editor ──────────────────

export default function EventEditor() {
  const activeEventId = useUIStore((s) => s.activeEventId);
  const setSetupTab = useUIStore((s) => s.setSetupTab);
  const gameData = useGameStore((s) => s.gameData);
  const updateEventConfig = useGameStore((s) => s.updateEventConfig);
  const addQuestion = useGameStore((s) => s.addQuestion);
  const updateQuestion = useGameStore((s) => s.updateQuestion);
  const removeQuestion = useGameStore((s) => s.removeQuestion);

  const [editingQuestion, setEditingQuestion] = useState(null);

  const event = useMemo(() =>
    gameData?.sequence?.find((e) => e.id === activeEventId),
    [gameData?.sequence, activeEventId]
  );

  if (!event) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 12, color: 'var(--text-muted)',
      }}>
        <p style={{ fontSize: 16, fontWeight: 500 }}>No event selected</p>
        <p style={{ fontSize: 13 }}>Select an event from the Sequence Builder to configure it</p>
        <button className="btn btn-secondary" onClick={() => setSetupTab('sequence')} style={{ marginTop: 8 }}>
          <ChevronLeft size={16} />
          Go to Sequence Builder
        </button>
      </div>
    );
  }

  const meta = EVENT_META[event.type] || {};
  const Icon = meta.icon;
  const ConfigPanel = CONFIG_PANELS[event.type];
  const questions = event.questions || [];
  const optionsCount = event.config?.optionsPerQuestion || event.config?.optionsPerItem || 4;

  const handleConfigChange = (newConfig) => {
    updateEventConfig(event.id, newConfig);
  };

  const handleAddQuestion = () => {
    const blank = createBlankQuestion(event.type);
    const numOptions = event.config?.optionsPerQuestion || event.config?.optionsPerItem || 4;
    blank.options = Array.from({ length: numOptions }, () => '');
    setEditingQuestion(blank);
  };

  const handleSaveQuestion = (qData) => {
    if (qData.id) {
      updateQuestion(event.id, qData.id, qData);
    } else {
      addQuestion(event.id, qData);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion({ ...question });
  };

  const handleDeleteQuestion = (questionId) => {
    removeQuestion(event.id, questionId);
  };

  return (
    <div style={{
      height: '100%', display: 'flex', overflow: 'hidden',
    }}>
      {/* Left: Configuration */}
      <div style={{
        width: '40%', minWidth: 320, maxWidth: 440,
        height: '100%', overflow: 'auto',
        padding: '24px 24px',
        borderRight: '1px solid var(--border)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <button
            onClick={() => setSetupTab('sequence')}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4, display: 'flex',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `${meta.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {Icon && <Icon size={18} style={{ color: meta.color }} />}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{event.config?.name || meta.label}</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{meta.description}</p>
          </div>
        </div>

        {/* Config Fields */}
        <div>
          <h4 style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
          }}>
            Configuration
          </h4>
          {ConfigPanel && (
            <ConfigPanel config={event.config || {}} onChange={handleConfigChange} />
          )}
        </div>
      </div>

      {/* Right: Questions List */}
      <div style={{
        flex: 1, height: '100%', overflow: 'auto', padding: '24px 28px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Questions</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAddQuestion} style={{
            minHeight: 38, padding: '8px 16px', fontSize: 13,
          }}>
            <Plus size={16} />
            {event.type === 'CARD_FLIP' ? 'Add Card' : 'Add Question'}
          </button>
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <div style={{
            padding: '48px 20px', textAlign: 'center',
            background: 'var(--bg-card)', border: '2px dashed var(--border)',
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {event.type === 'CARD_FLIP' ? 'No cards yet' : 'No questions yet'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {event.type === 'CARD_FLIP' ? 'Click "Add Card" to create a new flipping card' : 'Click "Add Question" to start building this event'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {questions.map((q, i) => {
              const isIdentify = event.type === 'IDENTIFY';
              const isCardFlip = event.type === 'CARD_FLIP';
              const text = isCardFlip 
                ? (q.topic || 'Untitled') 
                : isIdentify 
                  ? (q.question || q.answer || 'Untitled') 
                  : (q.questionText || 'Untitled');
              const correctLabel = q.options?.[q.correctOptionIndex] || '—';

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {text}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 2 }}>
                      ✓ {correctLabel}
                    </div>
                  </div>

                  <button
                    onClick={() => handleEditQuestion(q)}
                    style={{
                      background: 'none', border: 'none', padding: 4,
                      color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    style={{
                      background: 'none', border: 'none', padding: 4,
                      color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Question Edit Modal */}
      <AnimatePresence>
        {editingQuestion && (
          <QuestionEditModal
            question={editingQuestion}
            eventType={event.type}
            optionsCount={optionsCount}
            teams={gameData?.meta?.teams || []}
            teamCount={(gameData?.meta?.teams || []).length || 4}
            onSave={handleSaveQuestion}
            onClose={() => setEditingQuestion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
