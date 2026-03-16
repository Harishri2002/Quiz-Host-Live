import { useState } from 'react';

const GITHUB = 'https://github.com/Harishri2002/Quiz-Host-Live';
const RELEASES = 'https://github.com/Harishri2002/Quiz-Host-Live/releases';

const ROUNDS = [
  { name: 'Q&A Round', desc: 'Classic question-and-answer round. Display text, images, or videos and teams buzz in with their answer.' },
  { name: 'Identify Round', desc: 'Show a blurred image or play a sound clip and let teams identify it before the reveal.' },
  { name: 'Buzzer Round', desc: 'Fast-paced trivia — first team to buzz in gets to answer. Wrong answer? Other teams get a chance.' },
  { name: 'Lightning Round', desc: 'Consecutive questions directed at specific teams. Configure per-team question counts and time limits.' },
  { name: 'Wipeout Round', desc: 'High-stakes wagering. Teams commit points before answering — one wrong answer wipes their wager.' },
  { name: 'Rapid Fire (Duel)', desc: 'Pick two teams for a head-to-head showdown. Both teams race through questions with a shared timer.' },
  { name: 'Card Flip Round', desc: 'Teams pick from a beautiful grid of custom-styled challenge cards. Each card hides a mini-quiz.' },
  { name: 'Master Questions', desc: 'Deduction-based round. Teams can request hints — the more hints used, the fewer points awarded.' },
];

const FEATURES = [
  { icon: '🎮', title: 'Multiple Round Types', desc: '8 unique, fully configurable round types for any quiz format.' },
  { icon: '🖥️', title: 'Desktop App', desc: 'Native Windows and macOS desktop application via Electron.' },
  { icon: '💾', title: 'Save & Load', desc: 'Save your entire quiz including media as a portable JSON file.' },
  { icon: '🔊', title: 'Built-in SFX', desc: 'Manage sound effects for correct answers, buzzers, and transitions.' },
  { icon: '🏆', title: 'Live Scoreboard', desc: 'Real-time scoreboard overlay with full-screen mode.' },
  { icon: '🎨', title: 'Themes & Customization', desc: 'Multiple visual themes including dark galaxy and more.' },
  { icon: '📁', title: 'Media Support', desc: 'Embed images and audio directly in your quiz questions.' },
  { icon: '👥', title: 'Team Management', desc: 'Configure up to 8 teams, assign custom names and colors.' },
];

const STEPS = [
  { num: '1', title: 'Install the App', desc: 'Download and install the Windows (.exe) or macOS (.dmg) installer from the releases page.' },
  { num: '2', title: 'Create a Game', desc: 'Click "Create New Game" on the launch screen, then set your game title, teams, logo, and theme.' },
  { num: '3', title: 'Build Events', desc: 'Open the Event Editor. Add rounds in any order — mix different event types for the best experience.' },
  { num: '4', title: 'Sequence Your Show', desc: 'Drag and reorder events in the Sequence Builder to create your perfect show flow.' },
  { num: '5', title: 'Start the Game', desc: 'Hit "Start Game" when you\'re ready. Control each round in real-time from the host dashboard.' },
  { num: '6', title: 'Export & Share', desc: 'Export your game config as a JSON file to reuse or share with others.' },
];

const FAQS = [
  { q: 'Can I use my own images and audio?', a: 'Yes! In the question editor, switch the Media Type to Image or Sound and upload any file. Files are embedded as base64 in the save file for portability.' },
  { q: 'How do I uninstall?', a: 'On Windows, open Control Panel → Programs → Uninstall a program, find "Quiz-Host Live" and click Uninstall. On macOS, drag the app from Applications to Trash.' },
  { q: 'Can I run it without internet?', a: 'Fully offline supported. All data is stored locally. An internet connection is only needed to load Google Fonts in the UI.' },
  { q: 'Does it work on a projector?', a: "Yes — use the game screen on a projector while you control the host dashboard. Full-screen mode is available via View → Full Screen." },
  { q: 'Can I save and resume later?', a: 'Yes. Use Ctrl+S (or the Save Game button) at any time. Your game progress, questions, and scores are all saved locally.' },
  { q: 'How do I import a game someone shared?', a: 'On the launch screen, click "Import" and select the .json file. The game will load immediately with all settings intact.' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <>
      {/* Nav */}
      <header>
        <div className="container">
          <nav className="nav">
            <div className="nav-logo">
              <img src="https://raw.githubusercontent.com/Harishri2002/Quiz-Host-Live/main/assets/icon.png" alt="Logo" onError={e => e.target.style.display='none'} />
              Quiz-Host Live
            </div>
            <div className="nav-links">
              <a href="#features">Features</a>
              <a href="#rounds">Rounds</a>
              <a href="#getting-started">Guide</a>
              <a href="#faq">FAQ</a>
              <a href={GITHUB} target="_blank" rel="noreferrer" className="nav-cta">GitHub</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">⚡ Version 1.0.0 — Available Now</div>
          <h1>Host <span>Professional</span><br />Quiz Events</h1>
          <p>Quiz-Host Live is a powerful, broadcast-ready quiz hosting platform built for live events, college fests, and real-time team competitions.</p>
          <div className="hero-buttons">
            <a href={RELEASES} target="_blank" rel="noreferrer" className="btn-primary">Download Now</a>
            <a href={GITHUB} target="_blank" rel="noreferrer" className="btn-outline">View Source →</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: 'var(--bg2)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Features</div>
            <h2>Everything you need to run a great quiz</h2>
            <p>Designed for real events, not just practice sessions.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rounds */}
      <section id="rounds">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Round Types</div>
            <h2>8 Unique Event Formats</h2>
            <p>Mix and match for the perfect show flow.</p>
          </div>
          <div className="rounds-list">
            {ROUNDS.map((r) => (
              <div className="round-row" key={r.name}>
                <div className="round-badge">{r.name}</div>
                <div className="round-content">
                  <p>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" style={{ background: 'var(--bg2)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Getting Started</div>
            <h2>Up and running in minutes</h2>
            <p>Follow these steps to host your first event.</p>
          </div>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.num}>
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="container">
          <div className="section-header">
            <div className="section-label">FAQ</div>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq">
            {FAQS.map((f) => (
              <div className="faq-item" key={f.q}>
                <div className="faq-q">Q: {f.q}</div>
                <div className="faq-a">A: {f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section>
        <div className="container">
          <div className="download-cta">
            <h2>Ready to host your first event?</h2>
            <p>Download Quiz-Host Live for free. Available for Windows and macOS.</p>
            <div className="download-buttons">
              <a href={RELEASES} target="_blank" rel="noreferrer" className="dl-btn">
                <span className="dl-btn-icon">🪟</span>
                <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>Download for</div><div>Windows (.exe)</div></div>
              </a>
              <a href={RELEASES} target="_blank" rel="noreferrer" className="dl-btn">
                <span className="dl-btn-icon">🍎</span>
                <div><div style={{ fontSize: 10, color: 'var(--muted)' }}>Download for</div><div>macOS (.dmg)</div></div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>Built with ❤️ by <a href={GITHUB} target="_blank" rel="noreferrer">Harishri</a> · Quiz-Host Live v1.0.0 · <a href={GITHUB} target="_blank" rel="noreferrer">View on GitHub</a></p>
        </div>
      </footer>
    </>
  );
}
