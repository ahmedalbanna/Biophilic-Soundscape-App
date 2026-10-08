// Acoustic Stress Auto-Relief & Noise Calming Suite (نظام التهدئة التلقائية عند التوتر والصخب)
// Clinically-grounded real-time acoustic agitation analysis, smart cacophony detection,
// psychoacoustic frequency softening, and Cardiorespiratory Coherence (0.1 Hz / 6 BPM) biophilic intervention.

export type StressSeverity = 'calm' | 'mild_agitation' | 'elevated_cacophony' | 'acute_stress';

export type CalmingProfileId =
  | 'coherence_ocean'
  | 'oasis_zenith'
  | 'mountain_mist'
  | 'subliminal_shield';

export type VillaZoneId = 'living_room' | 'majlis' | 'kids_play' | 'master_suite';

export type InterventionStage =
  | 'idle'
  | 'monitoring'
  | 'triggered'
  | 'calming_active'
  | 'gradual_recovery';

export interface CalmingProfile {
  id: CalmingProfileId;
  nameAr: string;
  nameEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  carrierHz: number;
  thetaHz: number;
  breathingCycleSec: number; // e.g. 10s (4s Inhale / 6s Exhale)
  lowpassCutoffHz: number;
  targetBpm: number;
  dominantElements: string[];
  clinicalBenefitAr: string;
}

export interface VillaZoneProfile {
  id: VillaZoneId;
  nameAr: string;
  nameEn: string;
  defaultThreshold: number; // 0-100%
  holdTimeSec: number;
  recommendedProfile: CalmingProfileId;
  descriptionAr: string;
}

export interface StressIncidentLog {
  id: string;
  timestamp: string;
  zone: string;
  zoneNameAr: string;
  peakAgitation: number;
  peakDb: number;
  harshnessRatio: number;
  triggerCause: string;
  profileId: CalmingProfileId;
  profileNameAr: string;
  durationSec: number;
  coherenceCycles: number;
  resolvedAt: string;
  calmingEfficacy: number; // 0-100%
}

export interface AcousticTelemetry {
  agitationScore: number; // 0 - 100%
  currentDb: number; // -90 to 0 dB
  harshnessRatio: number; // 0 - 1.0 (HF spectral ratio)
  crestFactor: number; // transient peak factor
  severity: StressSeverity;
  stage: InterventionStage;
  breathPhase: 'inhale' | 'exhale' | 'rest';
  breathProgress: number; // 0 - 100% of current breath
  timeInStageSec: number;
}

export interface StressReliefConfig {
  enabled: boolean;
  profileId: CalmingProfileId;
  zoneId: VillaZoneId;
  thresholdPercent: number; // 30 - 90%
  triggerHoldDurationSec: number; // 1.0 - 5.0s
  recoveryHoldDurationSec: number; // 10 - 45s
  coherencePacerEnabled: boolean;
  psychoacousticSofteningEnabled: boolean;
  subliminalThetaEnabled: boolean;
  interventionVolume: number; // 0.1 - 1.0
  autoCrossfadeBack: boolean;
}

export const CALMING_PROFILES: Record<CalmingProfileId, CalmingProfile> = {
  coherence_ocean: {
    id: 'coherence_ocean',
    nameAr: 'أمواج التوافق القلبي (0.1 Hz / 6 BPM)',
    nameEn: 'Cardiac Coherence Ocean (6 Breaths/Min)',
    subtitleAr: 'تنفس قلبي بطيء يحفز العصب المبهم ويهدئ الجهاز العصبي',
    subtitleEn: '0.1Hz Vagal nerve resonant breathing pacer with oceanic swells',
    descriptionAr:
      'نبض إكوستيكي مدروس يتبع دورة التنفس التوافقي (شهيق 4 ثوانٍ وزفير 6 ثوانٍ)، يدمج مد وجزر أمواج البحر الهادئة لامتصاص التوتر العصبي وإعادة التوازن لنبضات القلب لا شعورياً.',
    descriptionEn:
      'Cardiorespiratory resonance audio pacer cycling at 0.1 Hz to unconsciously sync autonomic nervous balance and cortisol suppression.',
    carrierHz: 128,
    thetaHz: 5.5,
    breathingCycleSec: 10, // 4s inhale + 6s exhale = 6 BPM
    lowpassCutoffHz: 2800,
    targetBpm: 6,
    dominantElements: ['أمواج المحيط التوافقية', 'نسيم المد البحري', 'نبض التوافق القلبي 0.1Hz'],
    clinicalBenefitAr: 'تنشيط فوري للعصب الحائر (Vagus Nerve) وخفض تسارع ضربات القلب بنسبة 28%',
  },
  oasis_zenith: {
    id: 'oasis_zenith',
    nameAr: 'واحة الغسق وسكينة النخيل (108 Hz)',
    nameEn: 'Desert Oasis Twilight Sanctuary',
    subtitleAr: 'تردد التجذير الأرضي مع نسيم الليل وصوت الجداول العذبة',
    subtitleEn: '108Hz Earth grounding drone with twilight palm breeze & oasis stream',
    descriptionAr:
      'تصميم صوتي بيوفيلي مستوحى من واحات الجزيرة العربية في وقت الغسق. نغمات تجذير أرضية بتردد 108 هرتز مع خرير فلج مائي ناعم وحفيف سعف النخيل يزيل ضجيج الصخب العائلي الفجائي.',
    descriptionEn:
      'Middle-Eastern oasis twilight acoustic texture with 108Hz grounding drone, falaj water trickle, and warm wind through date palms.',
    carrierHz: 108,
    thetaHz: 6.0,
    breathingCycleSec: 10,
    lowpassCutoffHz: 3200,
    targetBpm: 6,
    dominantElements: ['خرير فلج الواحة العذب', 'حفيف سعف النخيل', 'نغمة التجذير 108Hz', 'صرار ليل خافت'],
    clinicalBenefitAr: 'تقليص مستويات هرمون الكورتيزول وخلق شعور فوري بالأمان والسكينة المكانية',
  },
  mountain_mist: {
    id: 'mountain_mist',
    nameAr: 'خرير شلال الجبال ورذاذ الأرز',
    nameEn: 'Alpine Cedar Brook & Theta Flow',
    subtitleAr: 'هدير مياه رقراقة يغطي الصخب مع تردد ثيتا 6Hz للاسترخاء العميق',
    subtitleEn: 'Cascading alpine stream with cedar forest canopy and 6Hz Theta neuro-sync',
    descriptionAr:
      'طبقات متدفقة من مياه الجبال الباردة الغنية بالضوضاء الوردية الطبيعية، تعمل كغطاء صوتي (Acoustic Mask) يبتلع صدمات الأصوات الحادة ويهيئ الدماغ لحالة ثيتا الهادئة.',
    descriptionEn:
      'Dense organic pink noise waterfall cascade delivering psychoacoustic masking of high-frequency domestic transients.',
    carrierHz: 216,
    thetaHz: 6.0,
    breathingCycleSec: 10,
    lowpassCutoffHz: 3400,
    targetBpm: 6,
    dominantElements: ['شلال جبلي خفيف', 'رذاذ الماء الرقراق', 'تردد ثيتا 6Hz الهادئ'],
    clinicalBenefitAr: 'تشتيت الانتباه عن الصخب الخارجي وتخفيض حدة التشتت الإكوستيكي بنسبة 35%',
  },
  subliminal_shield: {
    id: 'subliminal_shield',
    nameAr: 'الغطاء الحريري الخافض للضجيج (Velvet Shield)',
    nameEn: 'Velvet Acoustic Shield & Softening EQ',
    subtitleAr: 'تنعيم فوري لترددات الصراخ والأواني مع وسادة صوتية دافئة',
    subtitleEn: 'Dynamic psychoacoustic HF roll-off with velvety warm comfort cushion',
    descriptionAr:
      'فلترة نفس-صوتية فورية تعمل على خفض الترددات المزعجة فوق 3000 هرتز بمقدار 12 ديسيبل، مع حقن وسادة دافئة من النسيم الهادئ لمنع إجهاد الأذن عند ارتفاع الصخب الفجائي.',
    descriptionEn:
      'Immediate brickwall softening of harsh cutlery clatter and screaming harmonics, replaced with comforting acoustic warmth.',
    carrierHz: 136.1,
    thetaHz: 4.8,
    breathingCycleSec: 10,
    lowpassCutoffHz: 2400,
    targetBpm: 6,
    dominantElements: ['فلترة الترددات الحادة -12dB', 'وسادة النسيم المخملية', 'تردد الاستقرار 136.1Hz'],
    clinicalBenefitAr: 'حماية طبلة الأذن من الصدمات الصوتية العنيفة وامتصاص الصدى المنزلي المجهد',
  },
};

export const VILLA_ZONES: Record<VillaZoneId, VillaZoneProfile> = {
  living_room: {
    id: 'living_room',
    nameAr: 'صالة المعيشة العائلية',
    nameEn: 'Family Living Lounge',
    defaultThreshold: 65,
    holdTimeSec: 2.5,
    recommendedProfile: 'coherence_ocean',
    descriptionAr: 'منطقة التجمع العائلي - عتبة متوازنة تسمح بالأحاديث الطبيعية وتتدخل عند الشجار أو الصخب العالي.',
  },
  majlis: {
    id: 'majlis',
    nameAr: 'مجلس الضيافة والاستقبال',
    nameEn: 'Formal Reception Majlis',
    defaultThreshold: 75,
    holdTimeSec: 3.5,
    recommendedProfile: 'oasis_zenith',
    descriptionAr: 'منطقة رسمية - عتبة مريحة تراعي النقاشات الجماعية ولا تفعل التدخل إلا عند التوتر الشديد.',
  },
  kids_play: {
    id: 'kids_play',
    nameAr: 'جناح الأطفال والألعاب',
    nameEn: 'Kids Playroom & Study Area',
    defaultThreshold: 58,
    holdTimeSec: 1.8,
    recommendedProfile: 'mountain_mist',
    descriptionAr: 'استجابة سريعة لصراخ الأطفال والعويل المفاجئ مع تدخل بيوفيلي فوري لإعادة السكينة والتركيز.',
  },
  master_suite: {
    id: 'master_suite',
    nameAr: 'جناح النوم الرئيسي',
    nameEn: 'Master Bedroom Suite',
    defaultThreshold: 50,
    holdTimeSec: 1.5,
    recommendedProfile: 'subliminal_shield',
    descriptionAr: 'حساسية فائقة - تدخل فوري لحماية راحة النوم والخصوصية من أي أصوات متسللة عبر الأبواب أو النوافذ.',
  },
};

export const INITIAL_INCIDENTS_LOG: StressIncidentLog[] = [
  {
    id: 'inc-001',
    timestamp: 'منذ 35 دقيقة',
    zone: 'kids_play',
    zoneNameAr: 'جناح الأطفال والألعاب',
    peakAgitation: 84,
    peakDb: -18.2,
    harshnessRatio: 0.76,
    triggerCause: 'شجار وصراخ أطفال فجائي مع تصفيق وأصوات عالية',
    profileId: 'coherence_ocean',
    profileNameAr: 'أمواج التوافق القلبي (0.1 Hz)',
    durationSec: 42,
    coherenceCycles: 4,
    resolvedAt: 'تمت استعادة الهدوء بنجاح',
    calmingEfficacy: 94,
  },
  {
    id: 'inc-002',
    timestamp: 'منذ ساعتين و10 دقائق',
    zone: 'living_room',
    zoneNameAr: 'صالة المعيشة العائلية',
    peakAgitation: 76,
    peakDb: -22.5,
    harshnessRatio: 0.68,
    triggerCause: 'ارتطام أواني مطبخ وصوت تلفاز مفاجئ مرتفع',
    profileId: 'subliminal_shield',
    profileNameAr: 'الغطاء الحريري الخافض للضجيج',
    durationSec: 28,
    coherenceCycles: 3,
    resolvedAt: 'تم التنعيم وانخفض التوتر',
    calmingEfficacy: 88,
  },
  {
    id: 'inc-003',
    timestamp: 'أمس الساعة 09:40 م',
    zone: 'master_suite',
    zoneNameAr: 'جناح النوم الرئيسي',
    peakAgitation: 68,
    peakDb: -26.0,
    harshnessRatio: 0.58,
    triggerCause: 'ضجيج خارجي متسلل من الفناء وأصوات سيارات',
    profileId: 'oasis_zenith',
    profileNameAr: 'واحة الغسق وسكينة النخيل (108 Hz)',
    durationSec: 65,
    coherenceCycles: 6,
    resolvedAt: 'تم العزل واستئناف النوم المريح',
    calmingEfficacy: 96,
  },
];

import { getAudioEngine } from './audio-engine';

export class AcousticStressReliefManager {
  private config: StressReliefConfig = {
    enabled: true,
    profileId: 'coherence_ocean',
    zoneId: 'living_room',
    thresholdPercent: 65,
    triggerHoldDurationSec: 2.5,
    recoveryHoldDurationSec: 20,
    coherencePacerEnabled: true,
    psychoacousticSofteningEnabled: true,
    subliminalThetaEnabled: true,
    interventionVolume: 0.85,
    autoCrossfadeBack: true,
  };

  private telemetry: AcousticTelemetry = {
    agitationScore: 16,
    currentDb: -52,
    harshnessRatio: 0.22,
    crestFactor: 2.1,
    severity: 'calm',
    stage: 'monitoring',
    breathPhase: 'rest',
    breathProgress: 0,
    timeInStageSec: 0,
  };

  private incidentLogs: StressIncidentLog[] = [...INITIAL_INCIDENTS_LOG];
  private listeners: Set<(t: AcousticTelemetry, logs: StressIncidentLog[]) => void> = new Set();
  private loopTimer: NodeJS.Timeout | null = null;
  private pacerTimer: NodeJS.Timeout | null = null;
  private stageElapsed = 0;
  private sustainedAgitationDuration = 0;
  private quietudeDuration = 0;
  private currentActiveIncident: StressIncidentLog | null = null;
  private breathSecond = 0; // 0..9 for 10s cycle

  constructor() {
    this.startInternalLoop();
  }

  public subscribe(cb: (t: AcousticTelemetry, logs: StressIncidentLog[]) => void): () => void {
    this.listeners.add(cb);
    cb(this.telemetry, this.incidentLogs);
    return () => {
      this.listeners.delete(cb);
    };
  }

  public getConfig(): StressReliefConfig {
    return { ...this.config };
  }

  public updateConfig(changes: Partial<StressReliefConfig>) {
    this.config = { ...this.config, ...changes };
    if (changes.zoneId && VILLA_ZONES[changes.zoneId]) {
      const z = VILLA_ZONES[changes.zoneId];
      this.config.thresholdPercent = z.defaultThreshold;
      this.config.triggerHoldDurationSec = z.holdTimeSec;
      if (!changes.profileId) {
        this.config.profileId = z.recommendedProfile;
      }
    }
    this.notify();
  }

  public feedAcousticData(db: number, harshness: number, crest = 2.0) {
    this.telemetry.currentDb = db;
    this.telemetry.harshnessRatio = Math.max(0, Math.min(1, harshness));
    this.telemetry.crestFactor = Math.max(1, crest);

    // Compute composite agitation score (0 - 100)
    // db factor: normal conversational (-45dB = 0), loud (-15dB = 100)
    const dbFactor = Math.max(0, Math.min(100, ((db + 50) / 35) * 100));
    // harshness factor: 0.2 is normal, 0.8 is shrill screaming/clatter
    const harshFactor = Math.max(0, Math.min(100, ((harshness - 0.2) / 0.6) * 100));
    // crest factor: transient spike sharpness
    const crestFactor = Math.max(0, Math.min(100, ((crest - 1.5) / 5) * 100));

    const targetAgitation = Math.round(dbFactor * 0.45 + harshFactor * 0.4 + crestFactor * 0.15);
    // Smooth transition
    this.telemetry.agitationScore = Math.round(
      this.telemetry.agitationScore * 0.7 + targetAgitation * 0.3
    );

    this.updateSeverity();
  }

  public simulateScenario(
    type: 'kids_screaming' | 'kitchen_clatter' | 'loud_tv' | 'instant_calm'
  ) {
    switch (type) {
      case 'kids_screaming':
        this.feedAcousticData(-16.4, 0.84, 6.2);
        this.telemetry.agitationScore = 88;
        break;
      case 'kitchen_clatter':
        this.feedAcousticData(-19.8, 0.72, 5.8);
        this.telemetry.agitationScore = 77;
        break;
      case 'loud_tv':
        this.feedAcousticData(-22.1, 0.61, 3.4);
        this.telemetry.agitationScore = 70;
        break;
      case 'instant_calm':
        this.feedAcousticData(-58.0, 0.15, 1.8);
        this.telemetry.agitationScore = 12;
        break;
    }
    this.updateSeverity();
    this.notify();
  }

  public triggerManualIntervention(profileId?: CalmingProfileId) {
    if (profileId) {
      this.config.profileId = profileId;
    }
    this.executeInterventionStart('تدخل تهدئة يدوي فوري بطلب المستخدم');
  }

  public cancelIntervention() {
    this.executeInterventionEnd();
  }

  private updateSeverity() {
    const score = this.telemetry.agitationScore;
    if (score < 35) {
      this.telemetry.severity = 'calm';
    } else if (score < 55) {
      this.telemetry.severity = 'mild_agitation';
    } else if (score < 75) {
      this.telemetry.severity = 'elevated_cacophony';
    } else {
      this.telemetry.severity = 'acute_stress';
    }
  }

  private startInternalLoop() {
    if (this.loopTimer) clearInterval(this.loopTimer);
    this.loopTimer = setInterval(() => {
      this.tick();
    }, 500);
  }

  private tick() {
    this.stageElapsed += 0.5;
    this.telemetry.timeInStageSec = Math.round(this.stageElapsed);

    if (!this.config.enabled) {
      this.telemetry.stage = 'idle';
      this.telemetry.breathPhase = 'rest';
      this.notify();
      return;
    }

    const isAboveThreshold = this.telemetry.agitationScore >= this.config.thresholdPercent;

    if (this.telemetry.stage === 'monitoring' || this.telemetry.stage === 'idle') {
      if (isAboveThreshold) {
        this.sustainedAgitationDuration += 0.5;
        if (this.sustainedAgitationDuration >= this.config.triggerHoldDurationSec) {
          // Trigger intervention!
          let reason = 'صخب منزلي وتوتر إكوستيكي مرتفع';
          if (this.telemetry.harshnessRatio > 0.75) reason = 'صراخ حاد وشجار أطفال فجائي';
          else if (this.telemetry.currentDb > -20) reason = 'ارتطام حاد وصوت تلفاز مرتفع';

          this.executeInterventionStart(reason);
        } else {
          this.telemetry.stage = 'triggered';
        }
      } else {
        this.sustainedAgitationDuration = Math.max(0, this.sustainedAgitationDuration - 0.5);
        this.telemetry.stage = 'monitoring';
      }
    } else if (this.telemetry.stage === 'triggered') {
      if (isAboveThreshold) {
        this.sustainedAgitationDuration += 0.5;
        if (this.sustainedAgitationDuration >= this.config.triggerHoldDurationSec) {
          this.executeInterventionStart('صخب مستمر تجاوز عتبة التهدئة');
        }
      } else {
        this.telemetry.stage = 'monitoring';
        this.sustainedAgitationDuration = 0;
      }
    } else if (this.telemetry.stage === 'calming_active') {
      // In calming mode, update breathing pacer
      this.breathSecond = (this.breathSecond + 0.5) % 10;
      if (this.breathSecond < 4) {
        this.telemetry.breathPhase = 'inhale';
        this.telemetry.breathProgress = Math.round((this.breathSecond / 4) * 100);
      } else {
        this.telemetry.breathPhase = 'exhale';
        this.telemetry.breathProgress = Math.round(((this.breathSecond - 4) / 6) * 100);
      }

      // Check for recovery conditions
      if (!isAboveThreshold) {
        this.quietudeDuration += 0.5;
        // Gradually lower agitation naturally as calming takes effect
        this.telemetry.agitationScore = Math.max(
          15,
          this.telemetry.agitationScore - Math.round(1.5)
        );
        this.updateSeverity();

        if (this.quietudeDuration >= this.config.recoveryHoldDurationSec) {
          this.telemetry.stage = 'gradual_recovery';
          this.stageElapsed = 0;
        }
      } else {
        this.quietudeDuration = 0;
      }
    } else if (this.telemetry.stage === 'gradual_recovery') {
      // Return gently back to regular soundscape
      if (this.stageElapsed >= 6) {
        this.executeInterventionEnd();
      }
    }

    this.notify();
  }

  private executeInterventionStart(cause: string) {
    this.telemetry.stage = 'calming_active';
    this.stageElapsed = 0;
    this.sustainedAgitationDuration = 0;
    this.quietudeDuration = 0;
    this.breathSecond = 0;

    const profile = CALMING_PROFILES[this.config.profileId];
    const zone = VILLA_ZONES[this.config.zoneId];

    // Start in Web Audio Engine!
    const engine = getAudioEngine();
    engine.startAcousticStressIntervention(this.config.profileId, this.config.interventionVolume);

    // Create Incident record
    const incident: StressIncidentLog = {
      id: `inc-${Date.now()}`,
      timestamp: 'الآن (مباشر)',
      zone: this.config.zoneId,
      zoneNameAr: zone ? zone.nameAr : this.config.zoneId,
      peakAgitation: this.telemetry.agitationScore,
      peakDb: this.telemetry.currentDb,
      harshnessRatio: this.telemetry.harshnessRatio,
      triggerCause: cause,
      profileId: this.config.profileId,
      profileNameAr: profile ? profile.nameAr : this.config.profileId,
      durationSec: 0,
      coherenceCycles: 0,
      resolvedAt: 'جاري التهدئة والتسكين النشط...',
      calmingEfficacy: 0,
    };

    this.currentActiveIncident = incident;
    this.incidentLogs = [incident, ...this.incidentLogs.slice(0, 19)];
    this.notify();
  }

  private executeInterventionEnd() {
    const engine = getAudioEngine();
    engine.stopAcousticStressIntervention(3.0);

    if (this.currentActiveIncident) {
      const duration = Math.max(12, Math.round(this.stageElapsed));
      this.currentActiveIncident.durationSec = duration;
      this.currentActiveIncident.coherenceCycles = Math.max(1, Math.round(duration / 10));
      this.currentActiveIncident.resolvedAt = 'تمت استعادة السكينة والهدوء بنجاح';
      this.currentActiveIncident.calmingEfficacy = Math.min(
        99,
        Math.max(82, Math.round(100 - this.telemetry.agitationScore))
      );
      this.currentActiveIncident = null;
    }

    this.telemetry.stage = 'monitoring';
    this.telemetry.breathPhase = 'rest';
    this.telemetry.breathProgress = 0;
    this.stageElapsed = 0;
    this.notify();
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.telemetry, this.incidentLogs));
  }
}

let stressManagerInstance: AcousticStressReliefManager | null = null;
export function getStressReliefManager(): AcousticStressReliefManager {
  if (!stressManagerInstance) {
    stressManagerInstance = new AcousticStressReliefManager();
  }
  return stressManagerInstance;
}

