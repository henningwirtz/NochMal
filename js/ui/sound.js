// ============================================================================
// ui/sound.js
// Kleine Soundeffekte über die WebAudio-API - keine externen Audiodateien nötig.
// Töne werden live synthetisiert (Würfeln, Ankreuzen, Spielende).
// ============================================================================

let ctx = null;
let muted = false;

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

function audio() {
  if (ctx === null) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = AC ? new AC() : false;
    } catch {
      ctx = false;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx || null;
}

// Einzelner Ton mit kurzer Hüllkurve.
function tone(freq, start, dur, { type = 'sine', gain = 0.18 } = {}) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

// Kurzer Rausch-Burst (für das Würfeln).
function noise(start, dur, gain = 0.16) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const n = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.value = gain;
  const filt = ac.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 1800;
  src.connect(filt).connect(g).connect(ac.destination);
  src.start(t0);
}

export function playRoll() {
  if (muted) return;
  noise(0, 0.18);
  noise(0.09, 0.12, 0.12);
}

export function playMark() {
  if (muted) return;
  tone(660, 0, 0.08, { type: 'triangle', gain: 0.15 });
  tone(990, 0.06, 0.1, { type: 'triangle', gain: 0.13 });
}

export function playEnd() {
  if (muted) return;
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.32, { type: 'sine', gain: 0.16 }));
}
