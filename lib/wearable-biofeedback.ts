// Wearable Biofeedback & Closed-Loop Acoustic Entrainment Engine
// Connects to Bluetooth Low Energy (BLE) Heart Rate Monitors (Apple Watch, Garmin, Polar, Whoop)

export type AutonomicState = 'vagal_coherence' | 'calm_rest' | 'balanced' | 'sympathetic_stress' | 'deep_meditation';

export interface BiofeedbackReading {
  heartRateBpm: number;
  hrvRmssdMs: number; // 15 to 120 ms (Heart Rate Variability)
  rrIntervalsMs: number[];
  autonomicState: AutonomicState;
  stateLabelAr: string;
  stressScore: number; // 0 (Zero stress / Coherent) to 100 (High stress)
  timestamp: string;
  isBleConnected: boolean;
  deviceName?: string;
}

export interface EntrainmentAcousticModulation {
  waterTempoFactor: number; // 0.6 (slow peaceful) to 1.4 (rapid)
  breezeFilterCutoffHz: number; // 350Hz (warm) to 1800Hz
  birdChirpProbabilityMultiplier: number;
  resonantBreathingActive: boolean;
  suggestedActionAr: string;
}

// Standard Bluetooth GATT Heart Rate Service UUIDs
export const BLE_HEART_RATE_SERVICE = 0x180d;
export const BLE_HEART_RATE_MEASUREMENT_CHAR = 0x2a37;

// Parse standard Bluetooth GATT Heart Rate Measurement packet (0x2A37)
export function parseHeartRateDataView(value: DataView): { hr: number; rrIntervals: number[] } {
  const flags = value.getUint8(0);
  const is16BitHr = (flags & 0x01) !== 0;
  const hasRrIntervals = (flags & 0x10) !== 0;

  let offset = 1;
  let hr = 0;

  if (is16BitHr) {
    hr = value.getUint16(offset, true); // Little endian
    offset += 2;
  } else {
    hr = value.getUint8(offset);
    offset += 1;
  }

  // Energy expensed flag (bit 3)
  if ((flags & 0x08) !== 0) {
    offset += 2;
  }

  const rrIntervals: number[] = [];
  if (hasRrIntervals) {
    while (offset + 1 < value.byteLength) {
      const rawRr = value.getUint16(offset, true);
      // RR-intervals are in 1/1024 seconds
      const rrMs = Math.round((rawRr / 1024) * 1000);
      rrIntervals.push(rrMs);
      offset += 2;
    }
  }

  return { hr, rrIntervals };
}

// Calculate RMSSD (Root Mean Square of Successive Differences) from RR-intervals
export function calculateRmssd(rrList: number[]): number {
  if (rrList.length < 2) return 45; // default healthy baseline

  let sumSquaredDiffs = 0;
  for (let i = 0; i < rrList.length - 1; i++) {
    const diff = rrList[i + 1] - rrList[i];
    sumSquaredDiffs += diff * diff;
  }

  const meanSquared = sumSquaredDiffs / (rrList.length - 1);
  return Math.round(Math.sqrt(meanSquared));
}

// Determine Autonomic Nervous System State from HR & HRV
export function evaluateAutonomicState(hr: number, hrv: number): {
  state: AutonomicState;
  labelAr: string;
  stressScore: number;
} {
  // Higher HRV (>50ms) and lower HR (<68) = Vagal Coherence
  // Lower HRV (<30ms) and higher HR (>85) = Sympathetic Stress
  if (hrv >= 65 && hr <= 65) {
    return {
      state: 'vagal_coherence',
      labelAr: 'تناغم مبهمي فائق (Vagal Coherence & Parasympathetic Dominance)',
      stressScore: 12,
    };
  } else if (hrv >= 45 && hr <= 75) {
    return {
      state: 'calm_rest',
      labelAr: 'استرخاء وراحة هادئة (Calm Restful State)',
      stressScore: 28,
    };
  } else if (hrv >= 35 && hr <= 85) {
    return {
      state: 'balanced',
      labelAr: 'توازن حيوي معتدل (Balanced Homeostasis)',
      stressScore: 50,
    };
  } else if (hr > 85 || hrv < 28) {
    return {
      state: 'sympathetic_stress',
      labelAr: 'توتر عصبي وودي مرتفع (Sympathetic Stress Overdrive)',
      stressScore: 84,
    };
  } else {
    return {
      state: 'deep_meditation',
      labelAr: 'سكون تأملي عميق (Deep Somatosensory Stillness)',
      stressScore: 20,
    };
  }
}

// Map physiological metrics into closed-loop acoustic entrainment parameters
export function getClosedLoopAcousticModulation(hr: number, hrv: number): EntrainmentAcousticModulation {
  if (hr > 85 || hrv < 30) {
    // High stress -> Slow down water flow, soften high frequencies, prompt resonant breathing
    return {
      waterTempoFactor: 0.65,
      breezeFilterCutoffHz: 450,
      birdChirpProbabilityMultiplier: 0.3,
      resonantBreathingActive: true,
      suggestedActionAr: 'تهدئة تدفق المياه تلقائياً وتفعيل إيقاع التنفس الرنان (4-6 ثوانٍ) لإعادة التوازن العصبي',
    };
  } else if (hrv >= 60 && hr <= 68) {
    // Vagal Coherence -> Rich organic nature sounds, crystalline clarity
    return {
      waterTempoFactor: 1.0,
      breezeFilterCutoffHz: 1200,
      birdChirpProbabilityMultiplier: 1.2,
      resonantBreathingActive: false,
      suggestedActionAr: 'تناغم قلبي ممتاز: كورس طبيعة ناصع مع أصوات قطرات المياه الصافية وزقزقة البلبل',
    };
  } else {
    // Balanced
    return {
      waterTempoFactor: 0.9,
      breezeFilterCutoffHz: 850,
      birdChirpProbabilityMultiplier: 0.8,
      resonantBreathingActive: false,
      suggestedActionAr: 'استقرار نبضي متوازن: تدفق مائي متسق مع نسيم عليل معتدل',
    };
  }
}
