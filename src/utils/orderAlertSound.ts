const SOUND_KEY = 'smartfood_kitchen_sound';

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let sharedCtx: AudioContext | null = null;
let audioReady = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSoundEnabled(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    if (raw === null) return true;
    return raw === '1';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? '1' : '0');
  } catch {
    // ignore
  }
  emit();
}

export function isAudioReady() {
  return audioReady;
}

export function subscribeSoundState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function createContext(): AudioContext | null {
  try {
    const Ctx =
      window.AudioContext || (window as AudioWindow).webkitAudioContext;
    if (!Ctx) return null;
    return new Ctx();
  } catch {
    return null;
  }
}

async function ensureRunning(ctx: AudioContext) {
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

function tone(
  ctx: AudioContext,
  {
    frequency,
    start,
    duration,
    volume = 0.22,
  }: {
    frequency: number;
    start: number;
    duration: number;
    volume?: number;
  },
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

async function playKitchenAlert(ctx: AudioContext) {
  await ensureRunning(ctx);
  const now = ctx.currentTime;
  [
    { frequency: 880, start: now, duration: 0.18 },
    { frequency: 1174, start: now + 0.22, duration: 0.18 },
    { frequency: 1318, start: now + 0.44, duration: 0.28 },
  ].forEach((p) => tone(ctx, p));

  window.setTimeout(() => {
    void (async () => {
      try {
        await ensureRunning(ctx);
        const t = ctx.currentTime;
        tone(ctx, { frequency: 988, start: t, duration: 0.16, volume: 0.2 });
        tone(ctx, {
          frequency: 1318,
          start: t + 0.2,
          duration: 0.32,
          volume: 0.24,
        });
      } catch {
        // ignore
      }
    })();
  }, 900);
}

export async function unlockOrderAlertAudio(): Promise<boolean> {
  if (!sharedCtx) sharedCtx = createContext();
  if (!sharedCtx) return false;
  await ensureRunning(sharedCtx);
  audioReady = true;
  emit();
  return true;
}

export async function playNewOrderAlert(): Promise<void> {
  if (!getSoundEnabled()) return;
  if (!sharedCtx) sharedCtx = createContext();
  if (!sharedCtx) return;
  await playKitchenAlert(sharedCtx);
  audioReady = true;
  emit();
}
