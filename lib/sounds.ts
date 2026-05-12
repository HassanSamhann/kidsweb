'use client';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playStartSound() {
  playTone(523, 0.15, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 150);
  setTimeout(() => playTone(784, 0.25, 'sine', 0.12), 300);
}

export function playQuestionEndSound() {
  playTone(440, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(523, 0.15, 'sine', 0.1), 100);
}

export function playAzkarCompleteSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.1), i * 120);
  });
}

export function playClickSound() {
  playTone(800, 0.05, 'square', 0.05);
}

export function playCorrectSound() {
  playTone(523, 0.1, 'sine', 0.1);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 200);
}

export function playWrongSound() {
  playTone(300, 0.15, 'sawtooth', 0.08);
  setTimeout(() => playTone(250, 0.2, 'sawtooth', 0.08), 150);
}

export function playWinSound() {
  const notes = [523, 659, 784, 1047, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.1), i * 150);
  });
}

export function playLoseSound() {
  playTone(400, 0.2, 'sawtooth', 0.08);
  setTimeout(() => playTone(350, 0.2, 'sawtooth', 0.08), 200);
  setTimeout(() => playTone(300, 0.3, 'sawtooth', 0.08), 400);
}
