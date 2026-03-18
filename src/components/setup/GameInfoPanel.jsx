import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Palette } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import { getThemeList, applyTheme } from '../../themes/themes';

export default function GameInfoPanel() {
  const gameData = useGameStore((s) => s.gameData);
  const updateTitle = useGameStore((s) => s.updateTitle);
  const updateTeams = useGameStore((s) => s.updateTeams);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const updateMeta = useGameStore((s) => s.updateMeta);
  const resetScores = useGameStore((s) => s.resetScores);

  const teams = gameData?.meta?.teams || [];
  const themeList = getThemeList();
  const currentTheme = gameData?.settings?.theme || 'dark_galaxy';

  const handleTeamChange = (index, value) => {
    const newTeams = [...teams];
    newTeams[index] = value;
    updateTeams(newTeams);
  };

  const addTeam = () => {
    if (teams.length >= 8) return;
    updateTeams([...teams, `Team ${teams.length + 1}`]);
  };

  const removeTeam = (index) => {
    if (teams.length <= 1) return;
    updateTeams(teams.filter((_, i) => i !== index));
  };

  const handleThemeChange = (themeId) => {
    updateSettings({ theme: themeId });
    applyTheme(themeId);
  };

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (updateMeta) {
          updateMeta({ logo: ev.target.result });
        } else {
          updateSettings({ logo: ev.target.result });
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleClearLogo = () => {
    if (updateMeta) updateMeta({ logo: null });
    else updateSettings({ logo: null });
  };

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      padding: '32px 40px',
    }}>
      <h2 style={{
        fontSize: 24,
        fontWeight: 700,
        marginBottom: 32,
        color: 'var(--text-primary)',
      }}>
        Game Information
      </h2>

      {/* Game Title */}
      <section style={{ marginBottom: 32 }}>
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          Game Title
        </label>
        <input
          className="input"
          type="text"
          value={gameData?.meta?.title || ''}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Enter your quiz title..."
          style={{ fontSize: 16, padding: '12px 16px', marginBottom: 16 }}
        />

        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          Title Screen Subtitle
        </label>
        <input
          className="input"
          type="text"
          value={gameData?.settings?.introSubtitle ?? 'Welcome to the Event'}
          onChange={(e) => updateSettings({ introSubtitle: e.target.value })}
          placeholder="e.g. Annual Tech Fest 2026"
          style={{ fontSize: 14, padding: '10px 14px', marginBottom: 16 }}
        />

        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: 8,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          Title Font Style
        </label>
        <select
          className="input"
          value={gameData?.settings?.introFont || 'display'}
          onChange={(e) => updateSettings({ introFont: e.target.value })}
          style={{ fontSize: 14, padding: '10px 14px', width: '100%', cursor: 'pointer' }}
        >
          <option value="display">Display (Orbitron) - Sci-Fi & Modern</option>
          <option value="sans">Sans Serif (Inter) - Clean & Professional</option>
          <option value="serif">Serif (Georgia) - Classic & Elegant</option>
        </select>
      </section>

      {/* Logo Upload */}
      <section style={{ marginBottom: 32 }}>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 600,
          color: 'var(--text-secondary)', marginBottom: 8,
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Quiz Logo (shown on title screen)
        </label>
        {gameData?.meta?.logo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={gameData.meta.logo}
              alt="Quiz Logo"
              style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 4 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-secondary" onClick={handleLogoUpload} style={{ fontSize: 12, padding: '6px 12px' }}>Change Logo</button>
              <button className="btn btn-secondary" onClick={handleClearLogo} style={{ fontSize: 12, padding: '6px 12px', color: 'var(--error)' }}>Remove Logo</button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogoUpload}
            style={{
              width: '100%', padding: '20px', borderRadius: 10,
              border: '2px dashed var(--border)', background: 'var(--bg-card)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8, color: 'var(--text-muted)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
          >
            <span style={{ fontSize: 28 }}>🖼️</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Click to upload logo</span>
            <span style={{ fontSize: 11 }}>PNG, JPG, SVG — shown on intro screen</span>
          </button>
        )}
      </section>

      {/* Team Names */}
      <section style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <label style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            Teams ({teams.length}/8)
          </label>
          <button
            onClick={addTeam}
            disabled={teams.length >= 8}
            className="btn btn-secondary"
            style={{
              minHeight: 32,
              padding: '4px 12px',
              fontSize: 12,
              opacity: teams.length >= 8 ? 0.4 : 1,
            }}
          >
            <Plus size={14} />
            Add Team
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {teams.map((team, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: `hsl(${(i * 360) / teams.length}, 65%, 55%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <input
                className="input"
                type="text"
                value={team}
                onChange={(e) => handleTeamChange(i, e.target.value)}
                placeholder={`Team ${i + 1}`}
                style={{ flex: 1 }}
              />
              <button
                onClick={() => removeTeam(i)}
                disabled={teams.length <= 1}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: teams.length <= 1 ? 'not-allowed' : 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                  opacity: teams.length <= 1 ? 0.3 : 1,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => teams.length > 1 && (e.currentTarget.style.color = 'var(--error)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Minus size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Theme Selector */}
      <section style={{ marginBottom: 32 }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          <Palette size={14} />
          Color Theme
        </label>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 10,
        }}>
          {themeList.map((theme) => (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: currentTheme === theme.id
                  ? 'var(--bg-card-hover)'
                  : 'var(--bg-card)',
                border: currentTheme === theme.id
                  ? '2px solid var(--accent)'
                  : '1px solid var(--border)',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--text-primary)',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${theme.preview.bg}, ${theme.preview.accent})`,
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.1)',
              }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{theme.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {theme.description.split('—')[0].trim()}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Reset Scoreboard */}
      <section style={{ marginBottom: 32 }}>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 600,
          color: 'var(--text-secondary)', marginBottom: 8,
          textTransform: 'uppercase', letterSpacing: 1,
        }}>
          Scoreboard
        </label>
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Reset All Scores to Zero</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Sets every team's score back to 0. This cannot be undone.</div>
          </div>
          <button
            className="btn"
            onClick={() => {
              if (window.confirm('Reset all team scores to 0? This cannot be undone.')) {
                resetScores();
              }
            }}
            style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#f87171', borderRadius: 8, padding: '8px 18px',
              fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
              flexShrink: 0, transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          >
            🔄 Reset Scores
          </button>
        </div>
      </section>

    </div>
  );
}
