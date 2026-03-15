/**
 * SoundManager - Synthesized quiz sound effects using Web Audio API
 * No audio files needed — all sounds are generated programmatically
 */

let audioCtx = null;
let soundEnabled = true;
let volume = 0.5;

function isProjector() {
    return new URLSearchParams(window.location.search).get('projector') === 'true';
}

function getCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function ensureResumed() {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

// ── Core oscillator helpers ──────────────────

function playTone(freq, duration, type = 'sine', gainVal = volume * 0.3) {
    if (!soundEnabled || isProjector()) return;
    const ctx = ensureResumed();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

function playNoise(duration, gainVal = volume * 0.15) {
    if (!soundEnabled || isProjector()) return;
    const ctx = ensureResumed();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
}

// ── Sound Effects ──────────────────

const SFX = {
    /** Correct answer — ascending chime */
    correct() {
        if (!soundEnabled) return;
        playTone(523.25, 0.12, 'sine', volume * 0.25); // C5
        setTimeout(() => playTone(659.25, 0.12, 'sine', volume * 0.25), 80); // E5
        setTimeout(() => playTone(783.99, 0.25, 'sine', volume * 0.3), 160); // G5
    },

    /** Wrong answer — descending buzz */
    wrong() {
        if (!soundEnabled) return;
        playTone(300, 0.15, 'sawtooth', volume * 0.15);
        setTimeout(() => playTone(220, 0.3, 'sawtooth', volume * 0.12), 100);
    },

    /** Option selected — soft click */
    select() {
        if (!soundEnabled) return;
        playTone(800, 0.06, 'sine', volume * 0.15);
    },

    /** Button hover — very subtle tick */
    hover() {
        if (!soundEnabled) return;
        playTone(1200, 0.03, 'sine', volume * 0.05);
    },

    /** Timer tick — clock tick */
    tick() {
        if (!soundEnabled) return;
        playTone(1000, 0.04, 'square', volume * 0.08);
    },

    /** Timer warning — urgent beep */
    tickWarning() {
        if (!soundEnabled) return;
        playTone(880, 0.08, 'square', volume * 0.2);
    },

    /** Timer expired — alarm */
    timeUp() {
        if (!soundEnabled) return;
        playTone(440, 0.15, 'square', volume * 0.25);
        setTimeout(() => playTone(440, 0.15, 'square', volume * 0.25), 200);
        setTimeout(() => playTone(440, 0.3, 'square', volume * 0.25), 400);
    },

    /** Award points — sparkle arpeggio */
    award() {
        if (!soundEnabled) return;
        const notes = [523, 659, 784, 1047]; // C5-E5-G5-C6
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.15, 'sine', volume * 0.2), i * 60);
        });
    },

    /** Deduct points — negative tone */
    deduct() {
        if (!soundEnabled) return;
        playTone(330, 0.3, 'triangle', volume * 0.15);
        setTimeout(() => playTone(262, 0.4, 'triangle', volume * 0.12), 150);
    },

    /** Buzzer press / buzz in */
    buzz() {
        if (!soundEnabled) return;
        playTone(880, 0.1, 'square', volume * 0.3);
        setTimeout(() => playTone(1100, 0.08, 'square', volume * 0.25), 80);
    },

    /** Event start — fanfare */
    eventStart() {
        if (!soundEnabled) return;
        const notes = [523, 659, 784, 1047, 784, 1047]; // C-E-G-C6-G-C6
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.12, 'sine', volume * 0.2), i * 80);
        });
    },

    /** Event complete — victory jingle */
    eventComplete() {
        if (!soundEnabled) return;
        const notes = [523, 659, 784, 1047, 1319]; // C-E-G-C6-E6
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.18, 'sine', volume * 0.25), i * 100);
        });
    },

    /** Transition whoosh — noise sweep */
    whoosh() {
        if (!soundEnabled) return;
        playNoise(0.25, volume * 0.1);
    },

    /** Countdown beep (3-2-1) */
    countdown() {
        if (!soundEnabled) return;
        playTone(660, 0.12, 'sine', volume * 0.2);
    },

    /** Finale — grand arpeggio */
    finale() {
        if (!soundEnabled) return;
        const notes = [262, 330, 392, 523, 659, 784, 1047, 1319, 1568];
        notes.forEach((freq, i) => {
            setTimeout(() => playTone(freq, 0.25, 'sine', volume * 0.2), i * 70);
        });
    },

    /** Skip question */
    skip() {
        if (!soundEnabled) return;
        playTone(600, 0.08, 'triangle', volume * 0.12);
        setTimeout(() => playTone(400, 0.12, 'triangle', volume * 0.1), 60);
    },

    /** Reveal answer */
    reveal() {
        if (!soundEnabled) return;
        playTone(440, 0.08, 'sine', volume * 0.2);
        setTimeout(() => playTone(554, 0.08, 'sine', volume * 0.2), 60);
        setTimeout(() => playTone(660, 0.15, 'sine', volume * 0.25), 120);
    },
};

// ── Settings ──────────────────

export function setSoundEnabled(enabled) {
    soundEnabled = enabled;
}

export function setVolume(vol) {
    volume = Math.max(0, Math.min(1, vol));
}

export function isSoundEnabled() {
    return soundEnabled;
}

export function getVolume() {
    return volume;
}

export default SFX;
