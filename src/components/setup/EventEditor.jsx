import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, GripVertical, Edit3, ChevronLeft, Upload, Eye, X
} from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useUIStore from '../../store/uiStore';
import { EVENT_META, EVENT_DEFAULTS, OPTION_LABELS, createBlankQuestion } from '../../utils/eventTypes';

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

const CONFIG_PANELS = {
  QA_ROUND: QARoundConfig,
  IDENTIFY: IdentifyConfig,
  BUZZER: BuzzerConfig,
  LIGHTNING: LightningConfig,
  WIPEOUT: WipeoutConfig,
  RAPID_FIRE: RapidFireConfig,
};

// ── Question Edit Modal ──────────────────

function QuestionEditModal({ question, eventType, optionsCount, teams = [], onSave, onClose }) {
  const [form, setForm] = useState({ ...question });
  const [mediaPreview, setMediaPreview] = useState(question.mediaFile || null);
  const [audioEl, setAudioEl] = useState(null);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const updateOption = (index, val) => {
    const opts = [...(form.options || [])];
    opts[index] = val;
    update('options', opts);
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const isIdentify = eventType === 'IDENTIFY';

  // Check for Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  // Handle media file selection
  const handleMediaSelect = async () => {
    if (isElectron) {
      // Use Electron's file picker
      try {
        const result = await window.electronAPI.file.selectMedia();
        if (result && result.filePath) {
          update('mediaFile', result.filePath);
          setMediaPreview(result.filePath);
        }
      } catch (err) {
        console.error('Failed to select media:', err);
      }
    } else {
      // Browser fallback: trigger hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      const itemType = form.itemType || 'image';
      input.accept = itemType === 'sound' ? 'audio/*' : 'image/*';
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

  const itemType = form.itemType || 'image';

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
            {question.id ? 'Edit Question' : 'Add Question'}
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

        {/* Question Text */}
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

        {/* Target Team (for Lightning/RapidFire) */}
        {(eventType === 'LIGHTNING' || eventType === 'RAPID_FIRE') && (
          <ConfigField label="Target Team (Optional)">
            <select
              className="input"
              value={form.targetTeam || ''}
              onChange={(e) => update('targetTeam', e.target.value)}
              style={{ width: '100%', cursor: 'pointer' }}
            >
              <option value="">Any / All Teams</option>
              {teams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </ConfigField>
        )}

        {/* Answer (for Identify) */}
        {isIdentify && (
          <ConfigField label="Answer">
            <TextConfig value={form.answer} onChange={(v) => update('answer', v)} placeholder="Correct answer text" />
          </ConfigField>
        )}

        {/* Options */}
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

        {/* Explanation */}
        {!isIdentify && (
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
            Add Question
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
              No questions yet
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Click "Add Question" to start building this event
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {questions.map((q, i) => {
              const isIdentify = event.type === 'IDENTIFY';
              const text = isIdentify ? (q.question || q.answer || 'Untitled') : (q.questionText || 'Untitled');
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
            onSave={handleSaveQuestion}
            onClose={() => setEditingQuestion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
