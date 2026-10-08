// Neuro-Acoustic Entrainment & Subliminal Brainwave Synchronizer
// Science-backed brainwave frequency-following response (FFR) embedded into Biophilic audio

export type BrainwaveBandId = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';
export type EntrainmentMode = 'isochronic_biophilic' | 'binaural_stereo' | 'hybrid';

export interface BrainwaveBandConfig {
  id: BrainwaveBandId;
  nameAr: string;
  nameEn: string;
  symbol: string;
  hzRange: [number, number];
  defaultHz: number;
  carrierHz: number;
  descriptionAr: string;
  descriptionEn: string;
  stateAr: string;
  stateEn: string;
  recommendedBiophilicPreset: string;
  circadianWindowAr: string;
  circadianWindowEn: string;
  clinicalImpactAr: string;
}

export interface EntrainmentSessionState {
  isActive: boolean;
  bandId: BrainwaveBandId;
  targetHz: number;
  carrierHz: number;
  mode: EntrainmentMode;
  subliminalIntensity: number; // 0.0 to 1.0 (recommended 0.25 - 0.45 for subliminal)
  isIsochronicActive: boolean;
  isBinauralActive: boolean;
  pinkNoiseMaskingLevel: number; // 0.0 to 1.0
  elapsedSeconds: number;
}

export const BRAINWAVE_BANDS: Record<BrainwaveBandId, BrainwaveBandConfig> = {
  delta: {
    id: 'delta',
    nameAr: 'موجات دلتا (Delta - δ)',
    nameEn: 'Delta Waves (0.5 - 4 Hz)',
    symbol: 'δ',
    hzRange: [0.5, 4.0],
    defaultHz: 2.0,
    carrierHz: 108,
    descriptionAr: 'تردد النوم العميق وترميم الخلايا، تعزز إفراز هرمون النمو والميلاتونين وتثبيط الكورتيزول تماماً.',
    descriptionEn: 'Deep restorative sleep, cellular regeneration, melatonin release, and cortisol suppression.',
    stateAr: 'نوم عميق وترميم بدني',
    stateEn: 'Deep Restorative Sleep',
    recommendedBiophilicPreset: 'whispering_breeze',
    circadianWindowAr: 'منتصف الليل والفجر (11:00 م - 05:00 ص)',
    circadianWindowEn: 'Late Night to Pre-Dawn (11 PM - 5 AM)',
    clinicalImpactAr: 'خفض مستويات التوتر المزمن ومساعدة حالات الأرق دون الحاجة لأدوية منومة.'
  },
  theta: {
    id: 'theta',
    nameAr: 'موجات ثيتا (Theta - θ)',
    nameEn: 'Theta Waves (4 - 8 Hz)',
    symbol: 'θ',
    hzRange: [4.0, 8.0],
    defaultHz: 5.5,
    carrierHz: 136.1, // Earth resonance / Om harmonic
    descriptionAr: 'حالة الاسترخاء الفائق والتأمل وتفريغ الضغوط النفسية بعد يوم عمل شاق، وحالة الوعي الشفقي قبل النوم.',
    descriptionEn: 'Deep relaxation, emotional decompression, hypnagogic creativity, and meditative stillness.',
    stateAr: 'استرخاء عميق وتأمل',
    stateEn: 'Deep Decompression & Stillness',
    recommendedBiophilicPreset: 'gentle_stream',
    circadianWindowAr: 'المساء وساعات الغروب (06:00 م - 09:30 م)',
    circadianWindowEn: 'Evening & Dusk (6 PM - 9:30 PM)',
    clinicalImpactAr: 'تفريغ التوتر العصبي التراكمي وتسهيل الانتقال الطبيعي نحو مرحلة النوم.'
  },
  alpha: {
    id: 'alpha',
    nameAr: 'موجات ألفا (Alpha - α)',
    nameEn: 'Alpha Waves (8 - 13 Hz)',
    symbol: 'α',
    hzRange: [8.0, 13.0],
    defaultHz: 10.0,
    carrierHz: 256, // Pure Pythagorean C
    descriptionAr: 'اليقظة الهادئة وحالة التدفق الذهني (Flow State)، مثالية للقراءة، صلاة الخشوع، والعمل الإبداعي الهادئ.',
    descriptionEn: 'Calm alertness, flow state, contemplative focus, effortless creative productivity.',
    stateAr: 'تدفق ذهني وهدوء يقظ',
    stateEn: 'Calm Focus & Flow State',
    recommendedBiophilicPreset: 'morning_canals',
    circadianWindowAr: 'الصباح الباكر وبعد الظهيرة (07:30 ص - 12:00 م / 04:00 م - 06:00 م)',
    circadianWindowEn: 'Early Morning & Mid-Afternoon',
    clinicalImpactAr: 'تحسين قدرة الاستيعاب الذهني بنسبة 35% وخفض تشتت الانتباه وسرعة نبض القلب.'
  },
  beta: {
    id: 'beta',
    nameAr: 'موجات بيتا المنخفضة (SMR / Beta - β)',
    nameEn: 'Low Beta / SMR (13 - 20 Hz)',
    symbol: 'β',
    hzRange: [13.0, 20.0],
    defaultHz: 15.0,
    carrierHz: 288,
    descriptionAr: 'التركيز التنفيذي والوضوح التحليلي والنشاط الصباحي النشط دون إثارة توتر أو قلق.',
    descriptionEn: 'Executive cognition, analytical processing, and morning alertness without jitteriness.',
    stateAr: 'تركيز تنفيذي ويقظة نشطة',
    stateEn: 'Executive Clarity & Alertness',
    recommendedBiophilicPreset: 'mountain_mist',
    circadianWindowAr: 'ساعات العمل الصباحية (09:00 ص - 01:30 م)',
    circadianWindowEn: 'Peak Morning Work Hours (9 AM - 1:30 PM)',
    clinicalImpactAr: 'التغلب على خمول الاستيقاظ الصباحي (Sleep Inertia) وتنشيط القشرة الجبهية.'
  },
  gamma: {
    id: 'gamma',
    nameAr: 'موجات غاما (Gamma - γ 40Hz)',
    nameEn: 'Gamma Sensory Rhythm (40 Hz)',
    symbol: 'γ',
    hzRange: [38.0, 42.0],
    defaultHz: 40.0,
    carrierHz: 320,
    descriptionAr: 'تردد التوافق العصبي 40Hz المدعوم بأبحاث معهد MIT لتحفيز الذاكرة وحماية الخلايا العصبية من التنكس.',
    descriptionEn: '40Hz neuro-entrainment validated in clinical research for memory consolidation and neural clarity.',
    stateAr: 'أقصى حدة ذهنية وتوافق عصبي',
    stateEn: 'Peak Cognition & 40Hz Neuro-Sync',
    recommendedBiophilicPreset: 'crystal_water',
    circadianWindowAr: 'جلسات العمل المركزة عالية الكثافة (20 - 45 دقيقة)',
    circadianWindowEn: 'High-Intensity Focus Sprints (20-45 min)',
    clinicalImpactAr: 'تعزيز الربط المشبكي بين فصوص الدماغ وتنشيط الخلايا الدبقية المجهرية لتنظيف الشوائب العصبية.'
  }
};

export interface EntrainmentProtocol {
  id: string;
  nameAr: string;
  nameEn: string;
  durationMinutes: number;
  primaryBand: BrainwaveBandId;
  targetHz: number;
  mode: EntrainmentMode;
  targetIntensity: number;
  descriptionAr: string;
}

export const PRESET_PROTOCOLS: EntrainmentProtocol[] = [
  {
    id: 'deep_slumber_delta',
    nameAr: 'بروتوكول الغرق في النوم العميق (Delta Slumber)',
    nameEn: 'Deep Delta Sleep Induction',
    durationMinutes: 45,
    primaryBand: 'delta',
    targetHz: 1.8,
    mode: 'hybrid',
    targetIntensity: 0.38,
    descriptionAr: 'تدرج موجات دلتا خفي مدمج بأمواج المحيط ورياح الواحة يهدئ ترددات الدماغ حتى النوم غير المتقطع.'
  },
  {
    id: 'decompression_theta',
    nameAr: 'بروتوكول تفريغ ضغوط نهاية اليوم (Theta Decompress)',
    nameEn: 'Evening Theta Decompression',
    durationMinutes: 30,
    primaryBand: 'theta',
    targetHz: 5.5,
    mode: 'isochronic_biophilic',
    targetIntensity: 0.32,
    descriptionAr: 'نبض إيقاعي غير مسموع بوضوح في خرير الماء يفرغ إجهاد العضلات والأعصاب بعد العمل.'
  },
  {
    id: 'creative_flow_alpha',
    nameAr: 'بروتوكول التدفق والإنتاجية الهادئة (Alpha Flow State)',
    nameEn: 'Creative Alpha Flow',
    durationMinutes: 60,
    primaryBand: 'alpha',
    targetHz: 10.0,
    mode: 'hybrid',
    targetIntensity: 0.30,
    descriptionAr: 'مزامنة ثنائية عند تردد 10 هرتز تحافظ على صفاء الذهن لساعات دون إجهاد سمعي أو توتر.'
  },
  {
    id: 'mit_40hz_gamma',
    nameAr: 'بروتوكول شحذ الذاكرة والحدة الذهنية (MIT 40Hz Gamma)',
    nameEn: 'MIT 40Hz Sensory Binding',
    durationMinutes: 25,
    primaryBand: 'gamma',
    targetHz: 40.0,
    mode: 'isochronic_biophilic',
    targetIntensity: 0.28,
    descriptionAr: 'تحفيز إيقاعي طبيعي دقيق بتردد 40Hz يرفع سرعة معالجة المعلومات والتركيز الاستثنائي.'
  }
];
