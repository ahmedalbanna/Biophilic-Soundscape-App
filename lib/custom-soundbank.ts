// Custom FLAC & Hi-Res Nature Soundbank Manager

export interface CustomSoundSlot {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'continuous_loop' | 'stochastic_event';
  categoryAr: string;
  durationSec: number;
  sampleRate: number;
  channels: number;
  fileFormat: string;
  volume: number; // 0.0 to 1.0
  pan: number; // -1.0 to 1.0
  minIntervalSec: number; // for stochastic events
  maxIntervalSec: number;
  pitchJitter: number; // in semitones
  isActive: boolean;
  waveformPoints: number[];
  audioBuffer?: AudioBuffer;
}

export function extractWaveformPeaks(buffer: AudioBuffer, numPoints = 36): number[] {
  const channelData = buffer.getChannelData(0);
  const step = Math.floor(channelData.length / numPoints);
  const peaks: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const start = i * step;
    let max = 0;
    for (let j = 0; j < step; j += 4) {
      const val = Math.abs(channelData[start + j] || 0);
      if (val > max) max = val;
    }
    peaks.push(Math.min(1.0, Math.max(0.08, max)));
  }

  return peaks;
}

// Generate high-fidelity procedural offline field buffers for initial preloaded slots
export function generateCuratedFieldBuffer(
  ctx: AudioContext,
  soundType: 'canyon_wadi' | 'asir_rain' | 'oasis_palms' | 'bulbul_bird'
): AudioBuffer {
  const sampleRate = ctx.sampleRate;

  if (soundType === 'bulbul_bird') {
    // 2.2 second authentic chirping sequence with melodic FM synthesis
    const duration = 2.2;
    const buffer = ctx.createBuffer(2, Math.floor(sampleRate * duration), sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const chirpNotes = [
      { start: 0.1, dur: 0.18, f1: 2800, f2: 3600 },
      { start: 0.35, dur: 0.15, f1: 3400, f2: 2900 },
      { start: 0.58, dur: 0.22, f1: 3100, f2: 4200 },
      { start: 0.9, dur: 0.35, f1: 2900, f2: 3800 },
      { start: 1.4, dur: 0.28, f1: 3500, f2: 2700 },
    ];

    for (let i = 0; i < left.length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      for (const note of chirpNotes) {
        if (t >= note.start && t <= note.start + note.dur) {
          const noteT = (t - note.start) / note.dur;
          const currentFreq = note.f1 + (note.f2 - note.f1) * noteT;
          const env = Math.sin(noteT * Math.PI);
          // FM vibrato
          const mod = Math.sin(2 * Math.PI * 45 * t) * 120;
          sample += Math.sin(2 * Math.PI * (currentFreq + mod) * t) * env * 0.45;
        }
      }

      left[i] = sample;
      right[i] = sample * 0.92;
    }
    return buffer;
  }

  // Continuous textures (canyon wadi, asir rain, oasis palms) - 6 seconds seamless crossfade buffer
  const duration = 6.0;
  const buffer = ctx.createBuffer(2, Math.floor(sampleRate * duration), sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  let b0L = 0, b1L = 0, b2L = 0;
  let b0R = 0, b1R = 0, b2R = 0;

  for (let i = 0; i < left.length; i++) {
    const t = i / sampleRate;
    const whiteL = Math.random() * 2 - 1;
    const whiteR = Math.random() * 2 - 1;

    if (soundType === 'canyon_wadi') {
      // Deep mountain water with rhythmic surging
      b0L = 0.992 * b0L + whiteL * 0.06;
      b0R = 0.992 * b0R + whiteR * 0.06;
      const surge = 0.7 + Math.sin(2 * Math.PI * 0.35 * t) * 0.25;
      left[i] = b0L * surge * 0.55;
      right[i] = b0R * surge * 0.55;
    } else if (soundType === 'asir_rain') {
      // Soft mountain droplet patter
      b0L = 0.85 * b0L + whiteL * 0.15;
      b0R = 0.85 * b0R + whiteR * 0.15;
      const droplet = Math.random() > 0.988 ? (Math.random() - 0.5) * 0.35 : 0;
      left[i] = (b0L * 0.35 + droplet) * 0.6;
      right[i] = (b0R * 0.35 + droplet * 0.8) * 0.6;
    } else {
      // Oasis date palms wind with gentle foliage friction
      b0L = 0.96 * b0L + whiteL * 0.08;
      b1L = 0.96 * b1L + b0L * 0.08;
      b0R = 0.96 * b0R + whiteR * 0.08;
      b1R = 0.96 * b1R + b0R * 0.08;
      const gust = 0.65 + Math.sin(2 * Math.PI * 0.2 * t) * 0.3;
      left[i] = b1L * gust * 0.7;
      right[i] = b1R * gust * 0.7;
    }
  }

  return buffer;
}

export const PRELOADED_SOUND_SLOTS: Omit<CustomSoundSlot, 'audioBuffer' | 'waveformPoints'>[] = [
  {
    id: 'slot_wadi',
    nameAr: 'خرير وادي لجب الجبلي الصخري',
    nameEn: 'Lajab Canyon Mountain Stream',
    type: 'continuous_loop',
    categoryAr: 'مياه ووديان جبلية',
    durationSec: 6.0,
    sampleRate: 48000,
    channels: 2,
    fileFormat: 'FLAC 24-bit / 48kHz',
    volume: 0.65,
    pan: -0.3,
    minIntervalSec: 0,
    maxIntervalSec: 0,
    pitchJitter: 0,
    isActive: true,
  },
  {
    id: 'slot_asir_rain',
    nameAr: 'رذاذ ضباب ومطر جبال السودة',
    nameEn: 'Asir Highlands Mist & Rain',
    type: 'continuous_loop',
    categoryAr: 'أمطار ورذاذ جبلي',
    durationSec: 6.0,
    sampleRate: 48000,
    channels: 2,
    fileFormat: 'FLAC 24-bit / 48kHz',
    volume: 0.5,
    pan: 0.25,
    minIntervalSec: 0,
    maxIntervalSec: 0,
    pitchJitter: 0,
    isActive: false,
  },
  {
    id: 'slot_palms',
    nameAr: 'نسيم حفيف واحة نخيل الأحساء',
    nameEn: 'Al-Ahsa Oasis Date Palm Breeze',
    type: 'continuous_loop',
    categoryAr: 'نباتات ونسيم واحات',
    durationSec: 6.0,
    sampleRate: 48000,
    channels: 2,
    fileFormat: 'FLAC 24-bit / 48kHz',
    volume: 0.45,
    pan: 0.0,
    minIntervalSec: 0,
    maxIntervalSec: 0,
    pitchJitter: 0,
    isActive: true,
  },
  {
    id: 'slot_bulbul',
    nameAr: 'تغريد البلبل العربي الأصيل',
    nameEn: 'Arabian Bulbul Morning Trills',
    type: 'stochastic_event',
    categoryAr: 'طيور برية عشوائية',
    durationSec: 2.2,
    sampleRate: 48000,
    channels: 2,
    fileFormat: 'FLAC 24-bit / 48kHz',
    volume: 0.7,
    pan: 0.4,
    minIntervalSec: 18,
    maxIntervalSec: 42,
    pitchJitter: 1.5,
    isActive: true,
  },
];
