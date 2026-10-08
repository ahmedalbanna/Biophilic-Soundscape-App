// Adaptive HVAC Masking & IAQ Sync Engine (نظام التكيف مع ضوضاء التكييف المركزي وحساسات جودة الهواء)
// Psychoacoustic HVAC turbulence masking, dynamic 60/120Hz anti-rumble compensation,
// and multisensory Indoor Air Quality (IAQ: PM2.5, CO2, TVOC, AQI) biophilic resonance.

export type HvacFanSpeed = 'off' | 'eco_low' | 'normal_med' | 'high_cool' | 'turbo_boost';

export interface HvacTelemetry {
  speed: HvacFanSpeed;
  speedNameAr: string;
  speedNameEn: string;
  compressorActive: boolean;
  fanRpm: number;
  estAcousticDb: number; // Estimated mechanical SPL in dBA (e.g. 28dB idle up to 55dB turbo)
  ductTurbulenceRatio: number; // 0.0 to 1.0 (aerodynamic hiss through diffusers)
  compressorRumbleHz: number; // 50 to 120 Hz fundamental
  zone: string;
  zoneNameAr: string;
}

export interface IaqTelemetry {
  pm25: number; // µg/m3 (Dust / Particulate)
  pm10: number; // µg/m3
  co2: number; // ppm (Carbon dioxide)
  tvoc: number; // ppb (Volatile organic compounds / oud / cooking)
  aqi: number; // Air Quality Index (0 - 500)
  temperatureC: number;
  humidityPercent: number;
  overallStatus: 'pristine' | 'good' | 'moderate_dust' | 'stale_co2' | 'elevated_voc';
  statusLabelAr: string;
  statusLabelEn: string;
  color: string;
}

export interface HvacMaskingFlavor {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  bestFor: string;
  waterWeight: number; // 0 to 1
  breezeWeight: number;
  rainWeight: number;
  oceanWeight: number;
  notchCutoffHz: number; // Anti-rumble notch frequency
  maskingFrequencyBand: string;
  color: string;
  icon: string;
}

export const HVAC_MASKING_FLAVORS: HvacMaskingFlavor[] = [
  {
    id: 'marble_fountain_aflaj',
    nameAr: 'خرير نافورة الرخام وأفلاج الواحة',
    nameEn: 'Marble Fountain & Oasis Aflaj',
    descAr: 'ترددات ماء طبيعي مستمر تمتص حفيف مجاري الهواء (Duct Hiss) بنعومة إكوستيكية فائقة تمنع الإجهاد.',
    descEn: 'Continuous natural spring turbulence perfectly absorbing duct hiss and diffuser velocity.',
    bestFor: 'مجاري الهواء السقفية وموزعات التبريد المخفية (Concealed Ducts & Diffusers)',
    waterWeight: 0.85,
    breezeWeight: 0.4,
    rainWeight: 0.15,
    oceanWeight: 0.3,
    notchCutoffHz: 75,
    maskingFrequencyBand: '350Hz - 1500Hz',
    color: '#06b6d4',
    icon: 'droplets',
  },
  {
    id: 'palm_oasis_breeze',
    nameAr: 'حفيف سعف النخيل والنسيم العليل',
    nameEn: 'Palm Canopy & Desert Oasis Breeze',
    descAr: 'تحويل صوت اندفاع الهواء الميكانيكي إلى هدير نسيم رقيق يمر عبر بساتين النخيل والحديقة الداخلية.',
    descEn: 'Transmutes mechanical air velocity into an organic canopy rustle of palm fronds.',
    bestFor: 'دفع المراوح وتدفق الهواء العالي (Airflow & High Fan Speeds)',
    waterWeight: 0.45,
    breezeWeight: 0.9,
    rainWeight: 0.05,
    oceanWeight: 0.25,
    notchCutoffHz: 90,
    maskingFrequencyBand: '400Hz - 2200Hz',
    color: '#10b981',
    icon: 'wind',
  },
  {
    id: 'mountain_spring_cascade',
    nameAr: 'شلال جبلي رقيق ورذاذ الوديان',
    nameEn: 'Mountain Cascade & Canyon Mist',
    descAr: 'طيف كامل عريض النطاق (Full Pink Cascade) يوفر أقصى عزل صوتي عند تشغيل التكييف على أقصى طاقة.',
    descEn: 'Broadband pink spectrum cascade for maximum masking during extreme cooling loads.',
    bestFor: 'أقصى طاقة تبريد وذروة الحرارة الخارجية (Turbo Compressor & Peak Summer)',
    waterWeight: 0.95,
    breezeWeight: 0.55,
    rainWeight: 0.4,
    oceanWeight: 0.65,
    notchCutoffHz: 60,
    maskingFrequencyBand: '100Hz - 3500Hz',
    color: '#3b82f6',
    icon: 'mountain',
  },
  {
    id: 'coastal_veranda_calm',
    nameAr: 'هدوء الشرفة الساحلية وأمواج الخليج',
    nameEn: 'Coastal Veranda & Gulf Swell',
    descAr: 'تداخل مدّ بحري دافئ مع أمواج ناعمة يغطي طنين الضواغط المنخفض (Compressor Hum) دون رفع مستوى الصوت.',
    descEn: 'Warm tidal swells neutralizing low-frequency compressor hum without increasing perceived loudness.',
    bestFor: 'طنين الضواغط المنخفض والاهتزازات الهيكلية (50Hz - 120Hz Compressor Drone)',
    waterWeight: 0.5,
    breezeWeight: 0.45,
    rainWeight: 0.1,
    oceanWeight: 0.9,
    notchCutoffHz: 60,
    maskingFrequencyBand: '50Hz - 250Hz',
    color: '#8b5cf6',
    icon: 'waves',
  },
];

export interface IaqBiophilicProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  triggerConditionAr: string;
  triggerConditionEn: string;
  acousticModulationAr: string;
  acousticModulationEn: string;
  birdsModifier: number; // Multiplier
  waterModifier: number;
  breezeModifier: number;
  targetToneHz: number;
  color: string;
  icon: string;
}

export const IAQ_BIOPHILIC_PROFILES: Record<string, IaqBiophilicProfile> = {
  pristine: {
    id: 'pristine',
    nameAr: 'حيوية الغابة والنقاء الفائق',
    nameEn: 'Pristine Forest Vitality',
    triggerConditionAr: 'AQI < 35 و CO2 < 600 ppm (هواء نقي منعش)',
    triggerConditionEn: 'AQI < 35 & CO2 < 600 ppm (Ultra Clean Air)',
    acousticModulationAr: 'إبراز نغمات تغريد الطيور الصباحية ورذاذ الندى، وتحفيز التيقظ الذهني والبهجة الحسية.',
    acousticModulationEn: 'Highlights morning birdsong and crystal dew, promoting cognitive alertness and vitality.',
    birdsModifier: 1.35,
    waterModifier: 0.9,
    breezeModifier: 0.85,
    targetToneHz: 528,
    color: '#10b981',
    icon: 'sparkles',
  },
  moderate_dust: {
    id: 'moderate_dust',
    nameAr: 'ملاذ الواحة والسكينة المحمية',
    nameEn: 'Oasis Deep Sanctuary (Dust Defense)',
    triggerConditionAr: 'PM2.5 > 65 µg/m³ (غبار خارجي أو عاصفة رملية)',
    triggerConditionEn: 'PM2.5 > 65 µg/m³ (Sandstorm / Outdoor Dust)',
    acousticModulationAr: 'تعزيز خرير مياه الأفلاج المهدئة وخفض الترددات الحادة لتقليل التوتر التنفسي والشعور بالأمان.',
    acousticModulationEn: 'Deep soothing aflaj water streams and attenuated highs, relieving respiratory anxiety.',
    birdsModifier: 0.4,
    waterModifier: 1.4,
    breezeModifier: 0.7,
    targetToneHz: 432,
    color: '#f59e0b',
    icon: 'shield',
  },
  stale_co2: {
    id: 'stale_co2',
    nameAr: 'تنبيه التهوية وتجديد الأكسجين',
    nameEn: 'Cognitive Awakening & Fresh Air Cue',
    triggerConditionAr: 'CO2 > 1050 ppm (ركود الهواء والخمول الذهني)',
    triggerConditionEn: 'CO2 > 1050 ppm (Stale Air & Cognitive Lethargy)',
    acousticModulationAr: 'إطلاق رنين مائي بلوري ناعم ينبه بلطف لتجديد الهواء، مع رفع وتيرة النسيم لدفع النعاس.',
    acousticModulationEn: 'Subtle harmonic crystalline cues prompting ventilation while crisp breeze reduces lethargy.',
    birdsModifier: 1.1,
    waterModifier: 1.15,
    breezeModifier: 1.3,
    targetToneHz: 639,
    color: '#ef4444',
    icon: 'activity',
  },
  elevated_voc: {
    id: 'elevated_voc',
    nameAr: 'تناغم البخور والحديقة العطرية',
    nameEn: 'Botanical Garden Zen (VOC Cleansing)',
    triggerConditionAr: 'TVOC > 450 ppb (بخور، عطور، أو روائح طهي)',
    triggerConditionEn: 'TVOC > 450 ppb (Incense, Oud, or Cooking Events)',
    acousticModulationAr: 'مواءمة الأجواء بنفحات مائية نقية وأصوات أوراق الشجر لمحاكاة حدائق الزهور المفتوحة.',
    acousticModulationEn: 'Airy botanical water cascades and gentle foliage simulating an open fragrance courtyard.',
    birdsModifier: 0.8,
    waterModifier: 1.2,
    breezeModifier: 1.25,
    targetToneHz: 417,
    color: '#8b5cf6',
    icon: 'flower',
  },
};

export interface HvacIaqSyncState {
  enabled: boolean;
  autoSyncMode: boolean; // Auto-track simulated or incoming MQTT data
  activeFlavorId: string;
  hvacTelemetry: HvacTelemetry;
  iaqTelemetry: IaqTelemetry;
  activeIaqProfileId: string;
  maskingEfficiencyPercent: number; // e.g. 88%
  acousticSPLReductionDb: number; // e.g. 7.4 dB effective psychoacoustic attenuation
  haMqttConnected: boolean;
  lastSyncTimestamp: string;
}

export interface HvacIncidentLog {
  id: string;
  timestamp: string;
  eventAr: string;
  hvacSpeed: HvacFanSpeed;
  iaqStatus: string;
  actionTakenAr: string;
  efficiency: number;
}

// Singleton Manager for HVAC Masking & IAQ Sync
class HvacIaqSyncManager {
  private state: HvacIaqSyncState = {
    enabled: true,
    autoSyncMode: true,
    activeFlavorId: 'marble_fountain_aflaj',
    hvacTelemetry: {
      speed: 'normal_med',
      speedNameAr: 'سرعة متوسطة (تكييف قياسي)',
      speedNameEn: 'Normal Cooling (50% Airflow)',
      compressorActive: true,
      fanRpm: 1050,
      estAcousticDb: 42.5,
      ductTurbulenceRatio: 0.55,
      compressorRumbleHz: 75,
      zone: 'ground_majlis',
      zoneNameAr: 'المجلس الرئيسي والصالة',
    },
    iaqTelemetry: {
      pm25: 18.2,
      pm10: 29.4,
      co2: 580,
      tvoc: 140,
      aqi: 28,
      temperatureC: 22.8,
      humidityPercent: 48,
      overallStatus: 'pristine',
      statusLabelAr: 'نقي جداً ومثالي (Pristine Forest)',
      statusLabelEn: 'Ultra Pristine & Invigorating',
      color: '#10b981',
    },
    activeIaqProfileId: 'pristine',
    maskingEfficiencyPercent: 89,
    acousticSPLReductionDb: 8.2,
    haMqttConnected: true,
    lastSyncTimestamp: 'الآن (متصل بالزمن الحقيقي)',
  };

  private listeners: Array<(state: HvacIaqSyncState) => void> = [];
  private historyLogs: HvacIncidentLog[] = [
    {
      id: 'log-1',
      timestamp: 'منذ 10 دقائق',
      eventAr: 'ارتفاع سرعة المروحة لتدارك حمل الظهيرة (Normal → High)',
      hvacSpeed: 'high_cool',
      iaqStatus: 'هواء نقي (AQI 32)',
      actionTakenAr: 'تكثيف خرير الماء الصخري بنسبة +28% مع ضبط مرشح 85Hz لامتصاص أزيز الضاغط',
      efficiency: 91,
    },
    {
      id: 'log-2',
      timestamp: 'منذ 45 دقيقة',
      eventAr: 'تصاعد تركيز البخور في المجلس (TVOC 520 ppb)',
      hvacSpeed: 'normal_med',
      iaqStatus: 'بخور / مركبات عطرية',
      actionTakenAr: 'تفعيل نمط الحديقة العطرية وزيادة نسيم الأشجار الخشبي لطمأنة الجهاز التنفسي',
      efficiency: 87,
    },
    {
      id: 'log-3',
      timestamp: 'منذ ساعتين',
      eventAr: 'انتقال التكييف للوضع الاقتصادي الهادئ (Eco Inverter)',
      hvacSpeed: 'eco_low',
      iaqStatus: 'ممتاز جداً',
      actionTakenAr: 'خفض مستويات القناع الصوتي تلقائياً وإبراز نقاء نغمات الطيور',
      efficiency: 94,
    },
  ];

  public getState(): HvacIaqSyncState {
    return { ...this.state };
  }

  public getLogs(): HvacIncidentLog[] {
    return [...this.historyLogs];
  }

  public subscribe(cb: (state: HvacIaqSyncState) => void): () => void {
    this.listeners.push(cb);
    cb(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.state);
      } catch (err) {
        console.error('HVAC IAQ Sync notify error:', err);
      }
    });
  }

  public setEnabled(enabled: boolean) {
    this.state.enabled = enabled;
    this.recalculateMasking();
    this.notify();
  }

  public setAutoSyncMode(auto: boolean) {
    this.state.autoSyncMode = auto;
    this.notify();
  }

  public setMaskingFlavor(flavorId: string) {
    this.state.activeFlavorId = flavorId;
    this.recalculateMasking();
    this.notify();
  }

  public setHvacFanSpeed(speed: HvacFanSpeed) {
    const specs: Record<
      HvacFanSpeed,
      {
        nameAr: string;
        nameEn: string;
        rpm: number;
        db: number;
        turb: number;
        rumble: number;
        comp: boolean;
      }
    > = {
      off: {
        nameAr: 'متوقف (صمت ميكانيكي تام)',
        nameEn: 'HVAC Idle (Off)',
        rpm: 0,
        db: 26.5,
        turb: 0.05,
        rumble: 0,
        comp: false,
      },
      eco_low: {
        nameAr: 'هادئ اقتصادي (Inverter 25%)',
        nameEn: 'Whisper Eco Mode (25%)',
        rpm: 650,
        db: 33.8,
        turb: 0.3,
        rumble: 55,
        comp: true,
      },
      normal_med: {
        nameAr: 'سرعة متوسطة (تكييف قياسي 50%)',
        nameEn: 'Normal Cooling (50%)',
        rpm: 1050,
        db: 42.5,
        turb: 0.55,
        rumble: 75,
        comp: true,
      },
      high_cool: {
        nameAr: 'تبريد مكثف (مروحة قوية 75%)',
        nameEn: 'High Velocity (75%)',
        rpm: 1420,
        db: 49.2,
        turb: 0.78,
        rumble: 95,
        comp: true,
      },
      turbo_boost: {
        nameAr: 'ذروة التبريد القصوى (Turbo 100%)',
        nameEn: 'Turbo Maximum (100%)',
        rpm: 1780,
        db: 55.4,
        turb: 0.95,
        rumble: 110,
        comp: true,
      },
    };

    const s = specs[speed];
    this.state.hvacTelemetry = {
      ...this.state.hvacTelemetry,
      speed,
      speedNameAr: s.nameAr,
      speedNameEn: s.nameEn,
      fanRpm: s.rpm,
      estAcousticDb: s.db,
      ductTurbulenceRatio: s.turb,
      compressorRumbleHz: s.rumble,
      compressorActive: s.comp,
    };

    this.recalculateMasking();

    // Log incident
    this.logEvent(
      `تغيير سرعة التكييف يدوياً إلى [${s.nameAr}]`,
      speed,
      this.state.iaqTelemetry.statusLabelAr,
      `ضبط مستوى قناع الصوت البيوفيلي ليتوافق مع انبعاث ${s.db} dBA`
    );

    this.notify();
  }

  public updateIaqTelemetry(partial: Partial<IaqTelemetry>) {
    const updated = { ...this.state.iaqTelemetry, ...partial };

    // Determine status & profile
    let status: IaqTelemetry['overallStatus'] = 'pristine';
    let labelAr = 'نقي جداً ومثالي (Pristine Forest)';
    let labelEn = 'Ultra Pristine & Invigorating';
    let color = '#10b981';
    let profileId = 'pristine';

    if (updated.pm25 > 60 || updated.aqi > 110) {
      status = 'moderate_dust';
      labelAr = 'محتوى غبار مرتفع (Sandstorm / PM2.5)';
      labelEn = 'High Dust Incursion';
      color = '#f59e0b';
      profileId = 'moderate_dust';
    } else if (updated.co2 > 1000) {
      status = 'stale_co2';
      labelAr = 'ارتفاع CO2 وبحاجة تهوية (High CO2)';
      labelEn = 'Ventilation Required';
      color = '#ef4444';
      profileId = 'stale_co2';
    } else if (updated.tvoc > 400) {
      status = 'elevated_voc';
      labelAr = 'مركبات عطرية وبخور (High TVOC)';
      labelEn = 'Aromatic / VOC Elevation';
      color = '#8b5cf6';
      profileId = 'elevated_voc';
    } else if (updated.aqi > 50) {
      status = 'good';
      labelAr = 'جيد ومقبول';
      labelEn = 'Good & Stable';
      color = '#06b6d4';
      profileId = 'pristine';
    }

    updated.overallStatus = status;
    updated.statusLabelAr = labelAr;
    updated.statusLabelEn = labelEn;
    updated.color = color;

    this.state.iaqTelemetry = updated;
    this.state.activeIaqProfileId = profileId;

    this.recalculateMasking();
    this.notify();
  }

  // Preset Scenario Simulator
  public applyScenario(scenarioId: 'pristine_quiet' | 'summer_noon' | 'dust_storm' | 'majlis_gathering' | 'night_eco') {
    switch (scenarioId) {
      case 'pristine_quiet':
        this.setHvacFanSpeed('eco_low');
        this.updateIaqTelemetry({
          pm25: 12.0,
          co2: 520,
          tvoc: 90,
          aqi: 22,
          temperatureC: 22.2,
          humidityPercent: 45,
        });
        break;
      case 'summer_noon':
        this.setHvacFanSpeed('turbo_boost');
        this.updateIaqTelemetry({
          pm25: 35.0,
          co2: 640,
          tvoc: 180,
          aqi: 58,
          temperatureC: 24.5,
          humidityPercent: 42,
        });
        break;
      case 'dust_storm':
        this.setHvacFanSpeed('high_cool');
        this.updateIaqTelemetry({
          pm25: 118.5,
          pm10: 165.0,
          co2: 780,
          tvoc: 210,
          aqi: 142,
          temperatureC: 23.8,
          humidityPercent: 38,
        });
        break;
      case 'majlis_gathering':
        this.setHvacFanSpeed('normal_med');
        this.updateIaqTelemetry({
          pm25: 22.0,
          co2: 1180, // High CO2 from people
          tvoc: 540, // Bukhoor & oud
          aqi: 78,
          temperatureC: 21.8,
          humidityPercent: 52,
        });
        break;
      case 'night_eco':
        this.setHvacFanSpeed('eco_low');
        this.updateIaqTelemetry({
          pm25: 14.0,
          co2: 680,
          tvoc: 110,
          aqi: 25,
          temperatureC: 21.0,
          humidityPercent: 50,
        });
        break;
    }
  }

  private recalculateMasking() {
    if (!this.state.enabled) {
      this.state.maskingEfficiencyPercent = 0;
      this.state.acousticSPLReductionDb = 0;
      return;
    }

    const hvac = this.state.hvacTelemetry;
    const turb = hvac.ductTurbulenceRatio;
    const flavor =
      HVAC_MASKING_FLAVORS.find((f) => f.id === this.state.activeFlavorId) || HVAC_MASKING_FLAVORS[0];

    // Compute psychoacoustic efficiency based on flavor match and turbulence
    let baseEff = 85;
    if (hvac.speed === 'off') {
      baseEff = 98;
    } else if (hvac.speed === 'eco_low') {
      baseEff = 94;
    } else if (hvac.speed === 'normal_med') {
      baseEff = 89;
    } else if (hvac.speed === 'high_cool') {
      baseEff = 86;
    } else if (hvac.speed === 'turbo_boost') {
      baseEff = 82;
    }

    if (flavor.id === 'mountain_spring_cascade' && (hvac.speed === 'high_cool' || hvac.speed === 'turbo_boost')) {
      baseEff += 6;
    } else if (flavor.id === 'marble_fountain_aflaj' && (hvac.speed === 'normal_med' || hvac.speed === 'eco_low')) {
      baseEff += 5;
    } else if (flavor.id === 'palm_oasis_breeze' && turb > 0.6) {
      baseEff += 4;
    }

    this.state.maskingEfficiencyPercent = Math.min(99, Math.max(65, Math.round(baseEff)));
    this.state.acousticSPLReductionDb = Number((turb * 9.5 + 2.5).toFixed(1));
  }

  private logEvent(eventAr: string, speed: HvacFanSpeed, iaqStatus: string, actionTakenAr: string) {
    const newLog: HvacIncidentLog = {
      id: `log-${Date.now()}`,
      timestamp: 'الآن',
      eventAr,
      hvacSpeed: speed,
      iaqStatus,
      actionTakenAr,
      efficiency: this.state.maskingEfficiencyPercent,
    };
    this.historyLogs.unshift(newLog);
    if (this.historyLogs.length > 20) {
      this.historyLogs.pop();
    }
  }
}

let instance: HvacIaqSyncManager | null = null;
export function getHvacIaqSyncManager(): HvacIaqSyncManager {
  if (!instance) {
    instance = new HvacIaqSyncManager();
  }
  return instance;
}
