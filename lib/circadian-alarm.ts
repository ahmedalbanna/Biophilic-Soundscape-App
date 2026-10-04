// Circadian Sunrise Alarm & Sleep Induction Protocol Engine

export type AwakeningPhase = 'idle' | 'pre_dawn_stirring' | 'golden_rise' | 'full_dawn' | 'completed';
export type SleepInductionPhase = 'idle' | 'cognitive_calm' | 'somnolence_drift' | 'delta_maintenance' | 'faded_out';

export interface SunriseAlarmConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  enabled: boolean;
  mode: 'fajr_relative' | 'custom_time';
  fajrOffsetMinutes: number; // e.g. -25 means 25 min before Fajr
  customTimeStr: string; // "05:30"
  durationMinutes: number; // ramping duration: 15, 20, or 30 min
  soundscapeProfile: 'asir_mountain_dawn' | 'ahsa_palm_sunrise' | 'farasan_sea_dawn' | 'tibetan_golden_wake';
  finalVolumePct: number; // 20 to 100%
  lightSyncEnabled: boolean;
  gentleChimeEnabled: boolean;
}

export interface SleepInductionConfig {
  enabled: boolean;
  durationMinutes: number; // 15, 30, 45, 60
  startVolumePct: number;
  finalVolumePct: number; // 0 for full mute, or 10% for night murmur
  oceanDeltaBoost: boolean; // boost ocean/brownian floor
  disableBirdsGradually: boolean;
  noiseMaskingProfile: 'pink_hvac' | 'deep_brownian' | 'soft_mist';
}

export const INITIAL_ALARM_CONFIG: SunriseAlarmConfig = {
  id: 'fajr_sunrise_alarm',
  nameAr: 'منبه الفجر وبزوغ الشروق الطبيعي',
  nameEn: 'Fajr & Natural Sunrise Alarm',
  enabled: true,
  mode: 'fajr_relative',
  fajrOffsetMinutes: -25, // 25 min before Fajr
  customTimeStr: '05:00',
  durationMinutes: 20,
  soundscapeProfile: 'asir_mountain_dawn',
  finalVolumePct: 75,
  lightSyncEnabled: true,
  gentleChimeEnabled: true,
};

export const INITIAL_SLEEP_CONFIG: SleepInductionConfig = {
  enabled: false,
  durationMinutes: 45,
  startVolumePct: 60,
  finalVolumePct: 10, // faint night murmur
  oceanDeltaBoost: true,
  disableBirdsGradually: true,
  noiseMaskingProfile: 'deep_brownian',
};

// Calculate envelope values (0.0 to 1.0) given progress (0.0 to 1.0)
export function getSunriseEnvelope(progress: number): {
  volume: number;
  kelvin: number;
  brightnessPct: number;
  waterVol: number;
  breezeVol: number;
  birdProbability: number;
  phase: AwakeningPhase;
} {
  const p = Math.max(0, Math.min(1, progress));

  if (p < 0.33) {
    // Stage 1: Pre-dawn stirring (0 to 33%)
    const t = p / 0.33;
    return {
      volume: 0.05 + 0.2 * t,
      kelvin: Math.round(1800 + 400 * t), // 1800K to 2200K
      brightnessPct: Math.round(5 + 15 * t), // 5% to 20%
      waterVol: 0.1 + 0.3 * t,
      breezeVol: 0.2 + 0.3 * t,
      birdProbability: 0.1 * t,
      phase: 'pre_dawn_stirring',
    };
  } else if (p < 0.75) {
    // Stage 2: Golden Rise (33% to 75%)
    const t = (p - 0.33) / (0.75 - 0.33);
    return {
      volume: 0.25 + 0.35 * t,
      kelvin: Math.round(2200 + 800 * t), // 2200K to 3000K
      brightnessPct: Math.round(20 + 35 * t), // 20% to 55%
      waterVol: 0.4 + 0.3 * t,
      breezeVol: 0.5 + 0.2 * t,
      birdProbability: 0.1 + 0.5 * t,
      phase: 'golden_rise',
    };
  } else {
    // Stage 3: Full Dawn (75% to 100%)
    const t = (p - 0.75) / (1.0 - 0.75);
    return {
      volume: 0.6 + 0.4 * t,
      kelvin: Math.round(3000 + 1000 * t), // 3000K to 4000K
      brightnessPct: Math.round(55 + 30 * t), // 55% to 85%
      waterVol: 0.7 + 0.2 * t,
      breezeVol: 0.7 + 0.1 * t,
      birdProbability: 0.6 + 0.4 * t,
      phase: 'full_dawn',
    };
  }
}

// Calculate sleep induction envelope (0.0 to 1.0 progress)
export function getSleepEnvelope(progress: number, startVol: number, endVol: number): {
  volume: number;
  oceanVol: number;
  breezeVol: number;
  waterVol: number;
  birdsEnabled: boolean;
  phase: SleepInductionPhase;
} {
  const p = Math.max(0, Math.min(1, progress));
  const currentVol = startVol - (startVol - endVol) * p;

  if (p < 0.3) {
    return {
      volume: currentVol,
      oceanVol: 0.6,
      breezeVol: 0.5,
      waterVol: 0.4,
      birdsEnabled: true,
      phase: 'cognitive_calm',
    };
  } else if (p < 0.7) {
    return {
      volume: currentVol,
      oceanVol: 0.8,
      breezeVol: 0.4,
      waterVol: 0.2,
      birdsEnabled: false,
      phase: 'somnolence_drift',
    };
  } else if (p < 1.0) {
    return {
      volume: currentVol,
      oceanVol: 0.5,
      breezeVol: 0.3,
      waterVol: 0.1,
      birdsEnabled: false,
      phase: 'delta_maintenance',
    };
  } else {
    return {
      volume: endVol,
      oceanVol: 0.2,
      breezeVol: 0.2,
      waterVol: 0.0,
      birdsEnabled: false,
      phase: 'faded_out',
    };
  }
}
