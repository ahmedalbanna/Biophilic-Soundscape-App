// Biometric Biofeedback & Paced Breathing Engine

export interface BreathingPattern {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  inhaleSec: number;
  holdSec: number;
  exhaleSec: number;
  holdAfterExhaleSec: number;
  breathsPerMin: number;
  badge: string;
  color: string;
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'resonance_4_6',
    nameAr: 'رنين التناغم القلبي (4 - 6 ثواني)',
    nameEn: 'Resonant Frequency Breathing',
    descAr: 'شهيق 4 ثوانٍ مع زفير ممتد 6 ثوانٍ (6 أنفاس في الدقيقة). الوتيرة الذهبية لموازنة الجهاز العصبي ورفع تقلب نبض القلب (HRV).',
    descEn: '4s inhale, 6s exhale (6 breaths/min). Clinical standard for activating vagal tone and elevating Heart Rate Variability.',
    inhaleSec: 4,
    holdSec: 0,
    exhaleSec: 6,
    holdAfterExhaleSec: 0,
    breathsPerMin: 6.0,
    badge: 'تخفيف التوتر والسكينة',
    color: '#10b981',
  },
  {
    id: 'sleep_4_7_8',
    nameAr: 'استرخاء النوم العميق (4 - 7 - 8)',
    nameEn: '4-7-8 Deep Sleep Pacer',
    descAr: 'شهيق 4 ثوانٍ، حبس النفس 7 ثوانٍ، زفير ناعم وبطيء 8 ثوانٍ. تكتيك د. أندرو وايل لتهدئة الدماغ وإبطاء النبض السريع.',
    descEn: '4s inhale, 7s hold, 8s slow exhale. Powerful method for quieting mental noise and transitioning into restorative sleep.',
    inhaleSec: 4,
    holdSec: 7,
    exhaleSec: 8,
    holdAfterExhaleSec: 0,
    breathsPerMin: 3.1,
    badge: 'الاسترخاء والتهيئة للنوم',
    color: '#38bdf8',
  },
  {
    id: 'box_4_4_4_4',
    nameAr: 'تنفس المربع المتوازن (4 - 4 - 4 - 4)',
    nameEn: 'Box Breathing (Focus)',
    descAr: 'شهيق 4 ثوانٍ، حبس 4، زفير 4، حبس 4. أسلوب معتمد لتصفية الذهن، تعزيز التركيز، وخفض مستويات هرمون الكورتيزول.',
    descEn: '4s inhale, 4s hold, 4s exhale, 4s hold. Equal phases to sharpen mental clarity, reduce cortisol, and stabilize panic.',
    inhaleSec: 4,
    holdSec: 4,
    exhaleSec: 4,
    holdAfterExhaleSec: 4,
    breathsPerMin: 3.75,
    badge: 'التركيز وصفاء الذهن',
    color: '#f59e0b',
  },
  {
    id: 'coherence_5_5',
    nameAr: 'التناغم المتوازن المتساوي (5 - 5 ثواني)',
    nameEn: 'Heart-Brain Coherence 5-5',
    descAr: '5 ثوانٍ شهيق مع 5 ثوانٍ زفير بتوازن هندسي كامل يعيد مزامنة النبض مع الدورة التنفسية.',
    descEn: '5s inhale, 5s exhale. Symmetrical flow promoting autonomic nervous system homeostasis.',
    inhaleSec: 5,
    holdSec: 0,
    exhaleSec: 5,
    holdAfterExhaleSec: 0,
    breathsPerMin: 6.0,
    badge: 'توازن واستقرار يومي',
    color: '#a855f7',
  },
];

export interface BiometricReading {
  bpm: number;
  hrvMs: number;
  stressLevel: 'low' | 'moderate' | 'elevated';
  stressLabelAr: string;
  source: 'bluetooth' | 'simulated';
  connectedDeviceName?: string;
}

export function evaluateStressLevel(bpm: number, hrvMs: number): {
  level: 'low' | 'moderate' | 'elevated';
  labelAr: string;
  recommendationAr: string;
} {
  if (bpm <= 72 && hrvMs >= 50) {
    return {
      level: 'low',
      labelAr: 'استرخاء ممتاز (Parasympathetic Rest)',
      recommendationAr: 'جهازك العصبي في حالة توازن وراحة مثالية؛ البيئة الصوتية الحالية تحافظ على هذه السكينة.',
    };
  } else if (bpm <= 84 && hrvMs >= 35) {
    return {
      level: 'moderate',
      labelAr: 'يقظة معتدلة (Active Attention)',
      recommendationAr: 'مستويات إجهاد طبيعية للعمل والنشاط؛ يُوصى بتطبيق وتيرة تنفس 4-6 لدقيقتين لتجديد الطاقة.',
    };
  } else {
    return {
      level: 'elevated',
      labelAr: 'إجهاد وتوتر مرتفع (High Sympathetic Arousal)',
      recommendationAr: 'رُصد تسارع في النبض وانخفاض في HRV؛ يقوم النظام تلقائياً بإبطاء موجات البحر ورفع خرير الماء لإعادة ضبط الهدوء.',
    };
  }
}

// Web Bluetooth API Heart Rate Profile Handler
export class BluetoothHeartRateManager {
  private device: any = null;
  private characteristic: any = null;
  private onDataCallback?: (reading: { bpm: number; hrvMs: number }) => void;

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'bluetooth' in navigator;
  }

  public async connect(onData: (reading: { bpm: number; hrvMs: number }) => void): Promise<string> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported on this browser or platform.');
    }

    this.onDataCallback = onData;

    const nav = navigator as unknown as {
      bluetooth: {
        requestDevice: (options: any) => Promise<any>;
      };
    };

    const device = await nav.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['battery_service'],
    });

    this.device = device;
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('heart_rate');
    const characteristic = await service.getCharacteristic('heart_rate_measurement');
    this.characteristic = characteristic;

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
      this.handleHeartRateNotification(event);
    });

    return device.name || 'Bluetooth Heart Rate Monitor';
  }

  private handleHeartRateNotification(event: any) {
    const value = event.target.value as DataView;
    const flags = value.getUint8(0);

    // 0th bit of flags determines 8-bit or 16-bit BPM format
    let bpm = 0;
    let offset = 1;
    if ((flags & 0x01) === 0) {
      bpm = value.getUint8(offset);
      offset += 1;
    } else {
      bpm = value.getUint16(offset, /* littleEndian= */ true);
      offset += 2;
    }

    // Check if RR-interval (HRV) is present (bit 4)
    let hrvMs = 45; // default fallback
    if ((flags & 0x10) !== 0) {
      // RR intervals are in 1/1024 seconds
      if (offset + 2 <= value.byteLength) {
        const rawRr = value.getUint16(offset, true);
        const rrMs = (rawRr / 1024) * 1000;
        // Approximation of RMSSD / instantaneous HRV
        hrvMs = Math.round(Math.abs(rrMs - 1000) * 0.15 + 40);
      }
    }

    if (this.onDataCallback) {
      this.onDataCallback({ bpm, hrvMs });
    }
  }

  public disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }
}
