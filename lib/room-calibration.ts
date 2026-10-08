// Automated Room EQ & Acoustic Calibration Engine

export type RoomProfileId =
  | 'marble_majlis'
  | 'glass_living'
  | 'carpet_bedroom'
  | 'courtyard_atrium'
  | 'custom_measured';

export interface RoomEqBand {
  id: string;
  frequency: number; // Hz
  gainDb: number; // -12 to +12 dB
  q: number; // 0.5 to 10
  type: BiquadFilterType;
  labelAr: string;
}

export interface RoomAcousticProfile {
  id: RoomProfileId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  estimatedRt60Seconds: number;
  acousticImpressionAr: string;
  surfacesAr: string;
  correctionObjectiveAr: string;
  eqBands: RoomEqBand[];
}

export interface CalibrationMeasurementResult {
  measuredAt: string;
  measuredRt60Seconds: number;
  roomModeResonances: number[]; // e.g. [120, 240, 3200]
  averageDbSpl: number;
  acousticClarityScore: number; // 0 to 100
  suggestedEqBands: RoomEqBand[];
}

export const DEFAULT_ROOM_PROFILES: RoomAcousticProfile[] = [
  {
    id: 'marble_majlis',
    nameAr: 'مجلس رخامي ذو ارتداد عالٍ (High RT60 Marble Majlis)',
    nameEn: 'Reflective Marble & High Ceiling Majlis',
    descriptionAr: 'أرضيات رخامية ناعمة، أسقف جبسية مرتفعة، ونوافذ واسعة تسبب ارتداداً حاداً ورنيناً متضخماً في الترددات المتوسطة والعالية.',
    estimatedRt60Seconds: 0.95,
    acousticImpressionAr: 'صدى حاد وترددات معدنية قد تسبب إجهاداً سمعياً مع خرير الماء المستمر دون معايرة.',
    surfacesAr: 'رخام طبيعي 70%، زجاج 15%، جبس مصمت 15%',
    correctionObjectiveAr: 'كبح الترددات المعدنية الحادة عند 3.5kHz وتخفيف التضخم الجهير عند 140Hz لتحقيق صوت عضوي دافئ.',
    eqBands: [
      { id: 'b1', frequency: 80, gainDb: -2.5, q: 0.9, type: 'lowshelf', labelAr: 'تخفيف التضخم الجهيري' },
      { id: 'b2', frequency: 140, gainDb: -4.0, q: 2.2, type: 'peaking', labelAr: 'كبح رنين النمط الغرفي' },
      { id: 'b3', frequency: 600, gainDb: 1.0, q: 1.2, type: 'peaking', labelAr: 'تعزيز دفء الطبيعة' },
      { id: 'b4', frequency: 3200, gainDb: -4.5, q: 1.8, type: 'peaking', labelAr: 'إخماد حدة ارتداد الرخام' },
      { id: 'b5', frequency: 8000, gainDb: -2.0, q: 0.7, type: 'highshelf', labelAr: 'تنعيم الهواء السطحي' },
    ],
  },
  {
    id: 'glass_living',
    nameAr: 'صالة معيشة مفتوحة بواجهات زجاجية (Glass Open Villa)',
    nameEn: 'Open Concept Villa with Panoramic Glass',
    descriptionAr: 'واجهات زجاجية مزدوجة ممتدة تطل على الحديقة، تتسبب في ارتداد سريع فوري وتشتت في التموضع الفراغي لصوت النسيم والمياه.',
    estimatedRt60Seconds: 0.72,
    acousticImpressionAr: 'خشونة في الأصوات السريعة مثل حفيف الشجر وزقزقة الطيور بسبب انعكاسات الزجاج المباشرة.',
    surfacesAr: 'زجاج بانورامي 40%، بورسلان 40%، خشب 20%',
    correctionObjectiveAr: 'إخماد ارتداد الواجهات الزجاجية عند 2.4kHz و 5kHz مع فتح الترددات المنخفضة للشعور بالعمق.',
    eqBands: [
      { id: 'b1', frequency: 90, gainDb: -1.5, q: 0.8, type: 'lowshelf', labelAr: 'موازنة أطراف الغرفة' },
      { id: 'b2', frequency: 220, gainDb: -3.0, q: 1.8, type: 'peaking', labelAr: 'تنظيف الطنين السفلي' },
      { id: 'b3', frequency: 1000, gainDb: 0.5, q: 1.0, type: 'peaking', labelAr: 'استقرار الحضور الصوتي' },
      { id: 'b4', frequency: 2400, gainDb: -3.8, q: 2.0, type: 'peaking', labelAr: 'تكسير صدى الزجاج' },
      { id: 'b5', frequency: 7500, gainDb: -2.5, q: 0.8, type: 'highshelf', labelAr: 'تخفيف الخشونة الزجاجية' },
    ],
  },
  {
    id: 'carpet_bedroom',
    nameAr: 'غرفة نوم موكيت وأثاث ماص (Treated Bedroom)',
    nameEn: 'Carpeted & Fabric Damped Bedroom',
    descriptionAr: 'سجاد سميك، ستائر قماشية عاتمة، وأسرة مبطنة تمتص الترددات العالية بشكل مفرط مما قد يجعل صوت الطبيعة خافتاً ومكتوماً.',
    estimatedRt60Seconds: 0.32,
    acousticImpressionAr: 'صوت مكتوم وميت (Overdamped) يحتاج إلى إنعاش طيف الهواء والنسيم الخفيف.',
    surfacesAr: 'موكيت وسجاد 50%، أقمشة وستائر 30%، جدران 20%',
    correctionObjectiveAr: 'إضافة وضوح لطيف النسيم وتغريد الطيور وتخفيف الكتمان مع الحفاظ على هدوء النوم.',
    eqBands: [
      { id: 'b1', frequency: 80, gainDb: 1.0, q: 0.7, type: 'lowshelf', labelAr: 'دفء قاعدي للنوم' },
      { id: 'b2', frequency: 250, gainDb: -2.0, q: 1.5, type: 'peaking', labelAr: 'إزالة الغبش الصوتي' },
      { id: 'b3', frequency: 1200, gainDb: 1.5, q: 1.2, type: 'peaking', labelAr: 'إبراز تفاصيل خرير الماء' },
      { id: 'b4', frequency: 4000, gainDb: 3.0, q: 1.4, type: 'peaking', labelAr: 'تعويض امتصاص الستائر' },
      { id: 'b5', frequency: 9000, gainDb: 2.5, q: 0.7, type: 'highshelf', labelAr: 'إنعاش هواء الطبيعة والنسيم' },
    ],
  },
  {
    id: 'courtyard_atrium',
    nameAr: 'فناء داخلي مفتوح ونافورات (Courtyard Atrium)',
    nameEn: 'Courtyard & Indoor Garden Atrium',
    descriptionAr: 'فناء داخلي بنباتات حية وأحواض حجرية، يتميز بتوزيع انتشار صوتي طبيعي متسع يحتاج إلى ضبط خفيف لتعزيز الشعور بالانغماس.',
    estimatedRt60Seconds: 0.58,
    acousticImpressionAr: 'بيئة حيوية متزنة ذات انتشار طبيعي تحتاج فقط إلى ضبط أنماط الصدى الحجري.',
    surfacesAr: 'حجر طبيعي 40%، نباتات حية 30%، ماء 15%، خشب 15%',
    correctionObjectiveAr: 'معايرة هرمونية خفيفة وتثبيت وضوح زقزقة الطيور مع تدفق الماء الطبيعي.',
    eqBands: [
      { id: 'b1', frequency: 100, gainDb: -1.0, q: 0.7, type: 'lowshelf', labelAr: 'ضبط ارتداد الأحواض' },
      { id: 'b2', frequency: 320, gainDb: -1.5, q: 1.5, type: 'peaking', labelAr: 'تصفية الصدى الحجري' },
      { id: 'b3', frequency: 1500, gainDb: 1.0, q: 1.0, type: 'peaking', labelAr: 'إبراز تكسر قطرات الماء' },
      { id: 'b4', frequency: 3500, gainDb: -1.5, q: 1.6, type: 'peaking', labelAr: 'تخفيف الرنين الحاد' },
      { id: 'b5', frequency: 8500, gainDb: 1.0, q: 0.8, type: 'highshelf', labelAr: 'إشراق النسيم العلوي' },
    ],
  },
];
