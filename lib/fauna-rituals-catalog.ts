// Fauna, Aviary & Cultural Rituals Master Taxonomy & Diurnal Schedule Engine
// Comprehensive sound elements covering wildlife, Saudi aviary, traditional hospitality rituals, and 24h circadian mapping.

export type SoundCategory = 'birds' | 'wildlife' | 'cultural_rituals';
export type DiurnalPeriodId = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'deep_night';
export type SocialContextId =
  | 'majlis'
  | 'hospitality_majlis'
  | 'family_tea'
  | 'study_focus'
  | 'friday_gathering'
  | 'mindful_reading'
  | 'midnight_sanctuary';

export interface SoundElementItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: SoundCategory;
  categoryLabelAr: string;
  scientificOrCulturalContextAr: string;
  audioDescriptionAr: string;
  diurnalPeriods: DiurnalPeriodId[];
  socialContexts: SocialContextId[];
  acousticSignature: {
    fundamentalFreqHz: number;
    decaySec: number;
    timbreDescriptionAr: string;
    proceduralType: 'fm_synth' | 'granular_crackle' | 'modal_resonance' | 'formant_chirp';
  };
  triggerEngineMethod: string;
}

export interface DiurnalPeriodDefinition {
  id: DiurnalPeriodId;
  nameAr: string;
  nameEn: string;
  timeRangeAr: string;
  startHour: number;
  endHour: number;
  acousticAtmosphereAr: string;
  dominantElements: string[];
}

export const DIURNAL_PERIODS: DiurnalPeriodDefinition[] = [
  {
    id: 'dawn',
    nameAr: 'فترة السحر والفجر',
    nameEn: 'Astronomical Dawn & Fajr',
    timeRangeAr: '04:00 - 06:30',
    startHour: 4,
    endHour: 6.5,
    acousticAtmosphereAr: 'سكون تام، قطرات ندى، نداءات طيور منفردة تبشر بالنهار، وسكينة صلاة الفجر.',
    dominantElements: ['البلبل أبيض الخدين', 'الهدهد المهلل', 'أوعية التأمل 432Hz'],
  },
  {
    id: 'morning',
    nameAr: 'فترة البكور والشروق',
    nameEn: 'Golden Morning & Awakening',
    timeRangeAr: '06:30 - 10:30',
    startHour: 6.5,
    endHour: 10.5,
    acousticAtmosphereAr: 'حيوية نشطة، كورس طيور كامل، حفيف نسيم الصباح، وتدفق مائي ناصع مع قهوة الصباح.',
    dominantElements: ['كورس طيور البساتين', 'نسيم قمم الأشجار', 'صب الدلة وتصاعد الهيل'],
  },
  {
    id: 'midday',
    nameAr: 'فترة الضحى والظهيرة',
    nameEn: 'Midday Zenith & High Sun',
    timeRangeAr: '10:30 - 15:30',
    startHour: 10.5,
    endHour: 15.5,
    acousticAtmosphereAr: 'انحسار أصوات الطيور مع اشتداد الحرارة، جداجد النخيل الخافتة، قناع ضوضاء التكييف، وخرير السواقي.',
    dominantElements: ['جداجد وصرار النخيل', 'سواقي الأحساء ونواعير الماء', 'خرير الماء الإجرائي العازل'],
  },
  {
    id: 'afternoon',
    nameAr: 'فترة العصر وما قبل الغروب',
    nameEn: 'Afternoon Shade & Asr Gathering',
    timeRangeAr: '15:30 - 18:30',
    startHour: 15.5,
    endHour: 18.5,
    acousticAtmosphereAr: 'تراجع التوهج، هديل الحمام القمري في ظلال النخيل، دقات نجر القهوة، وجلسة شاي العصر العائلية.',
    dominantElements: ['هديل حمام القمري', 'دقات النجر النحاسي', 'حفيف سعف النخيل'],
  },
  {
    id: 'evening',
    nameAr: 'فترة الغسق والمغرب والعشاء',
    nameEn: 'Twilight & Majlis Hospitality',
    timeRangeAr: '18:30 - 22:30',
    startHour: 18.5,
    endHour: 22.5,
    acousticAtmosphereAr: 'مجالس الضيافة الدافئة، تفرقع جمرات المبخرة والعود الأزرق، كشف لحظي للكلام VAD، وسكينة الأذان.',
    dominantElements: ['جمر المبخرة والعود', 'أحاديث المجلس وتدفق النافورة', 'أجراس القوافل الهادئة'],
  },
  {
    id: 'deep_night',
    nameAr: 'فترة السكون والليل العميق',
    nameEn: 'Midnight Silent Sanctuary',
    timeRangeAr: '22:30 - 04:00',
    startHour: 22.5,
    endHour: 4,
    acousticAtmosphereAr: 'صوت ليلي خافت جداً (30 dB)، صراصير الحقول الهادئة، أمواج البحر البعيدة، وحراسة نوم الأطفال.',
    dominantElements: ['صراصير الليل الحقلية', 'أمواج جزر فرسان الهادئة', 'نداء بومة السكون البعيدة'],
  },
];

export const ALL_SOUND_ELEMENTS: SoundElementItem[] = [
  // --- 1. الطيور (Birds & Aviary) ---
  {
    id: 'elem_bulbul',
    nameAr: 'البلبل أبيض الخدين (White-cheeked Bulbul)',
    nameEn: 'White-cheeked Bulbul Morning Warble',
    category: 'birds',
    categoryLabelAr: 'طيور الجزيرة الأصيلة',
    scientificOrCulturalContextAr: 'طائر مقيم رمز الصباح في واحات وبساتين الجزيرة، يتميز بزقزقة نغمية ثلاثية ناعمة.',
    audioDescriptionAr: 'تغريد سائل نقي (2.8kHz - 4.2kHz) مع تموجات ترددية سريعة تضفي إشراقاً عاطفياً.',
    diurnalPeriods: ['dawn', 'morning'],
    socialContexts: ['family_tea', 'friday_gathering', 'hospitality_majlis'],
    acousticSignature: {
      fundamentalFreqHz: 3200,
      decaySec: 0.35,
      timbreDescriptionAr: 'نغمات جيبية متدفقة عالية النقاء',
      proceduralType: 'formant_chirp',
    },
    triggerEngineMethod: 'triggerProceduralBird',
  },
  {
    id: 'elem_hoopoe',
    nameAr: 'الهدهد المهلل (Eurasian Hoopoe)',
    nameEn: 'Hoopoe Rhythmic Pulse Call',
    category: 'birds',
    categoryLabelAr: 'طيور السكينة والبكور',
    scientificOrCulturalContextAr: 'طائر أليف محبوب في الثقافة العربية، يطلق نداءً إيقاعياً ثلاثي الضربات "هوب-هوب-هوب" في الضحى.',
    audioDescriptionAr: 'نبضات منخفضة التردد ناعمة جداً (480Hz - 540Hz) تعطي شعوراً باتساع المدى والأمان.',
    diurnalPeriods: ['dawn', 'morning', 'afternoon'],
    socialContexts: ['mindful_reading', 'family_tea'],
    acousticSignature: {
      fundamentalFreqHz: 490,
      decaySec: 0.65,
      timbreDescriptionAr: 'نبضات ناعمة رنانة تشبه المزامير الخشبية',
      proceduralType: 'fm_synth',
    },
    triggerEngineMethod: 'triggerHoopoeCall',
  },
  {
    id: 'elem_turtle_dove',
    nameAr: 'حمام القمري وحمام النخيل (Turtle & Palm Dove)',
    nameEn: 'Turtle Dove Afternoon Cooing',
    category: 'birds',
    categoryLabelAr: 'هديل الواحات والعصر',
    scientificOrCulturalContextAr: 'صوت أصيل في جلسات شاي العصر في نجد والأحساء، يرتبط في الذاكرة بالدفء العائلي والحنين.',
    audioDescriptionAr: 'هديل حلقي دافئ متدرج (520Hz إلى 580Hz) مع فيبراتو ناعم يحاكي تنفس الغابة.',
    diurnalPeriods: ['afternoon', 'evening'],
    socialContexts: ['family_tea', 'hospitality_majlis', 'mindful_reading'],
    acousticSignature: {
      fundamentalFreqHz: 550,
      decaySec: 0.9,
      timbreDescriptionAr: 'هديل نغمي دافئ مهدئ للأعصاب',
      proceduralType: 'fm_synth',
    },
    triggerEngineMethod: 'triggerTurtleDoveCoo',
  },
  {
    id: 'elem_night_owl',
    nameAr: 'بومة الليل والسكون (Little Sanctuary Owl)',
    nameEn: 'Little Owl Distant Night Call',
    category: 'birds',
    categoryLabelAr: 'سكينة الليل العميق',
    scientificOrCulturalContextAr: 'نداء ليلي خافت بعيد لا يقطع النوم، بل يعطي إيحاءً بالسكينة وسعة البرية والهدوء المطلق.',
    audioDescriptionAr: 'نداء خافت مبحوح (750Hz) يتلاشى بانسياب في الصمت الليلي التام.',
    diurnalPeriods: ['deep_night'],
    socialContexts: ['midnight_sanctuary'],
    acousticSignature: {
      fundamentalFreqHz: 750,
      decaySec: 1.2,
      timbreDescriptionAr: 'نداء حلقي خافت جداً بعيد المدى',
      proceduralType: 'fm_synth',
    },
    triggerEngineMethod: 'triggerHoopoeCall',
  },

  // --- 2. الحيوانات والبيئة الحية (Wildlife & Nature Fauna) ---
  {
    id: 'elem_night_crickets',
    nameAr: 'صراصير وجداجد الحقول الليلية (Night Crickets)',
    nameEn: 'Field Crickets Micro-Texture',
    category: 'wildlife',
    categoryLabelAr: 'نسيج الليل الطبيعي',
    scientificOrCulturalContextAr: 'حبيبات صوتية دقيقة غير متزامنة تعمل كقناع طبيعي عازل للضوضاء ومثبت لموجات دلتا وثيتا.',
    audioDescriptionAr: 'حفيف بلوري خافت عالي التردد (4.8kHz) بتموجات خفية تنوم الجهاز العصبي.',
    diurnalPeriods: ['evening', 'deep_night'],
    socialContexts: ['midnight_sanctuary', 'mindful_reading'],
    acousticSignature: {
      fundamentalFreqHz: 4800,
      decaySec: 0.15,
      timbreDescriptionAr: 'حبيبات بلورية خافتة ذات تموج عشوائي',
      proceduralType: 'granular_crackle',
    },
    triggerEngineMethod: 'triggerNightCrickets',
  },
  {
    id: 'elem_midday_cicadas',
    nameAr: 'صرار نخيل الأحساء في الظهيرة (Midday Oasis Cicadas)',
    nameEn: 'Oasis Palm Cicada Shimmer',
    category: 'wildlife',
    categoryLabelAr: 'شمس الظهيرة وقناع التركيز',
    scientificOrCulturalContextAr: 'صوت الصيف الدافئ في بساتين النخيل، ممتاز لحجب أصوات أجهزة التكييف أثناء المذاكرة.',
    audioDescriptionAr: 'تموج رنيني هوائي ناعم (3.8kHz) يخفت ويعلو مع هبوب حرارة النهار.',
    diurnalPeriods: ['midday'],
    socialContexts: ['study_focus'],
    acousticSignature: {
      fundamentalFreqHz: 3800,
      decaySec: 2.5,
      timbreDescriptionAr: 'رنين حشري هوائي مهدئ للضوضاء',
      proceduralType: 'granular_crackle',
    },
    triggerEngineMethod: 'triggerNightCrickets',
  },
  {
    id: 'elem_caravan_bell',
    nameAr: 'أجراس الإبل والقوافل في السكون (Caravan Chimes)',
    nameEn: 'Distant Desert Caravan Brass Chime',
    category: 'wildlife',
    categoryLabelAr: 'هدوء الصحراء والتراث الأصيل',
    scientificOrCulturalContextAr: 'رنين خافت يحاكي أجراس قوافل الإبل العابرة تحت النجوم، يثير السكينة والتأمل.',
    audioDescriptionAr: 'رنين نحاسي عميق (340Hz) مع توافقيات نحاسية متطاولة وتلاشٍ بطيء.',
    diurnalPeriods: ['evening', 'deep_night'],
    socialContexts: ['hospitality_majlis', 'midnight_sanctuary'],
    acousticSignature: {
      fundamentalFreqHz: 340,
      decaySec: 3.5,
      timbreDescriptionAr: 'جرس نحاسي ثقيل ذو صدى تراثي عميق',
      proceduralType: 'modal_resonance',
    },
    triggerEngineMethod: 'triggerDesertCaravanBell',
  },

  // --- 3. الطقوس والمناسبات الاجتماعية (Traditional Cultural Rituals) ---
  {
    id: 'elem_coffee_nejir',
    nameAr: 'دقات النجر النحاسي وإعداد القهوة (Brass Nejir Mortar)',
    nameEn: 'Rhythmic Brass Coffee Mortar Resonances',
    category: 'cultural_rituals',
    categoryLabelAr: 'طقوس المجلس والكرم العربي',
    scientificOrCulturalContextAr: 'رمز الضيافة في شبه الجزيرة، دقات إيقاعية خافتة رنانة تعلن عن الترحيب وصب القهوة بالهيل.',
    audioDescriptionAr: 'رنين نحاسي صافٍ (980Hz مع توافقية 2.8kHz) واضمحلال معدني طبيعي ممتع للأذن.',
    diurnalPeriods: ['morning', 'afternoon', 'evening'],
    socialContexts: ['hospitality_majlis', 'family_tea', 'friday_gathering'],
    acousticSignature: {
      fundamentalFreqHz: 980,
      decaySec: 2.2,
      timbreDescriptionAr: 'رنين هاون نحاسي أصيل ناصع النغمة',
      proceduralType: 'modal_resonance',
    },
    triggerEngineMethod: 'triggerCoffeeNejir',
  },
  {
    id: 'elem_incense_ember',
    nameAr: 'جمر المبخرة والعود الأزرق (Incense Ember Crackle)',
    nameEn: 'Oud & Frankincense Incense Ember Crackle',
    category: 'cultural_rituals',
    categoryLabelAr: 'سكينة المساء والتعطير التراثي',
    scientificOrCulturalContextAr: 'صوت تفرقع الجمر وتصاعد بخور العود واللبان الحوجري، يرتبط بالهدوء الروحي والترحيب بالزوار.',
    audioDescriptionAr: 'طقطقة عضوية متناهية الصغر (Micro-crackles) تمنح شعوراً بالدفء الفيزيائي والحميمية.',
    diurnalPeriods: ['afternoon', 'evening'],
    socialContexts: ['hospitality_majlis', 'friday_gathering', 'mindful_reading'],
    acousticSignature: {
      fundamentalFreqHz: 1800,
      decaySec: 0.08,
      timbreDescriptionAr: 'طقطقة حبيبية عضوية ناعمة',
      proceduralType: 'granular_crackle',
    },
    triggerEngineMethod: 'triggerIncenseEmber',
  },
  {
    id: 'elem_tibetan_bowl',
    nameAr: 'أوعية التأمل الكريستالية 432Hz (Singing Bowl Resonator)',
    nameEn: 'Harmonic 432Hz Sacred Singing Bowl',
    category: 'cultural_rituals',
    categoryLabelAr: 'السكينة والصفاء الذهني',
    scientificOrCulturalContextAr: 'رنين توافقي بتردد 432Hz للتهيئة الذهنية قبل الأذكار وتخفيف نبض القلب.',
    audioDescriptionAr: 'رنين موجة جيبية متصلة مع أوفرتون نقي واضمحلال يدوم 4.5 ثوانٍ.',
    diurnalPeriods: ['dawn', 'deep_night'],
    socialContexts: ['mindful_reading', 'midnight_sanctuary'],
    acousticSignature: {
      fundamentalFreqHz: 432,
      decaySec: 4.5,
      timbreDescriptionAr: 'رنين نقي بلوري طويل التلاشي',
      proceduralType: 'modal_resonance',
    },
    triggerEngineMethod: 'triggerSingingBowl',
  },
];

// Technical Evolution Plan Framework (خطة تطوير المحرك الصوتي)
export interface TechnicalPlanPhase {
  phaseNumber: number;
  titleAr: string;
  titleEn: string;
  timelineAr: string;
  focusAr: string;
  keyInnovations: string[];
  architecturalImpactAr: string;
}

export const AUDIO_ENGINE_EVOLUTION_PLAN: TechnicalPlanPhase[] = [
  {
    phaseNumber: 1,
    titleAr: 'المرحلة الأولى: النمذجة الإجرائية الفيزيائية وتوسيع مكتبة الكائنات الصوتية',
    titleEn: 'Phase 1: Procedural Physical Modeling & Sound Library Expansion',
    timelineAr: 'جاهزة ومفعلة حالياً في المتصفح',
    focusAr: 'بناء مولدات صوتية فيزيائية فورية للأصوات التراثية والطيور والحيوانات باستخدام معادلات Web Audio API الرياضية.',
    keyInnovations: [
      'توليف رنين النجر النحاسي (Modal Synthesis 980Hz/2.8kHz) مع اضمحلال فيزيائي دقيق.',
      'محاكاة نداء الهدهد وحمام القمري عبر توليف ترددي FM متدرج.',
      'محاكاة طقطقة جمر المبخرة وبخور العود بحبيبات عشوائية غير متكررة.',
      'تشفير كامل للأصوات بدون الحاجة لملفات صوتية ثقيلة قابلة للكسر أو الانقطاع.',
    ],
    architecturalImpactAr: 'استقلالية تامة 100%، استجابة سريعة <5ms، وتحميل فوري بدون استهلاك للإنترنت.',
  },
  {
    phaseNumber: 2,
    titleAr: 'المرحلة الثانية: سلاسل ماركوف وجداول التوزيع الاحتمالي على مدار اليوم (24h Diurnal Schedulers)',
    titleEn: 'Phase 2: Markov-Chain Polyphonic Schedulers & Diurnal Mapping',
    timelineAr: 'قيد التفعيل والتكامل اللحظي',
    focusAr: 'بناء مصفوفة احتمالات زمنية ترصد الساعة البيولوجية وموقع الشمس لإطلاق أصوات الطيور والطقوس بتوقيت طبيعي.',
    keyInnovations: [
      'سلاسل ماركوف (Markov Chains) لتحديد احتمالية ظهور الصوت (مثال: الهدهد يظهر فقط في الضحى والصباح بنسبة 25%).',
      'منع التكرار الرتيب (Zero Auditory Fatigue) بفضل فترات Poisson العشوائية المتوافقة.',
      'كبح الأصوات المفاجئة في فترات السكون الليلي ومذاكرة الأبناء لحماية التركيز والنوم.',
    ],
    architecturalImpactAr: 'بيئة صوتية حية تتنفس مع فترات اليوم دون أن يشعر الساكن بوجود آلة أو مسجل يعيد المقاطع.',
  },
  {
    phaseNumber: 3,
    titleAr: 'المرحلة الثالثة: التوزيع الفراغي الكروي وتأثير دوبلر الحركي (3D Ambisonics & Doppler Motion)',
    titleEn: 'Phase 3: Spherical Ambisonics & In-Ceiling Flying Fauna Motion',
    timelineAr: 'الربع القادم',
    focusAr: 'تحريك الكائنات الصوتية (كالسنونو والبلبل المحلق) بمسارات ثلاثية الأبعاد بين سماعات السقف مع انزياح دوبلر الترددي.',
    keyInnovations: [
      'تشفير صوتي بصيغة B-Format Ambisonics متوافق مع أنظمة Dolby Atmos السقفية الموزعة.',
      'تطبيق انزياح دوبلر (Doppler Frequency Shift) لنداءات الطيور المحلقة عبر الغرفة.',
      'تموضع عمودي واقعي: جداجد في الأسفل، نسيم في الأعلى، وطيور تطوف في زوايا السقف.',
    ],
    architecturalImpactAr: 'انغماس مكاني فائق يشعر الساكن وكأن سقف المنزل قد تحول إلى نافذة مفتوحة على سماء الطبيعة.',
  },
  {
    phaseNumber: 4,
    titleAr: 'المرحلة الرابعة: التوليف الطيفي التكيفي بالذكاء الاصطناعي على الحافة (On-Device Neural Synthesis)',
    titleEn: 'Phase 4: On-Device Neural Synthesis & Environmental Micro-Adaptation',
    timelineAr: 'مستقبلي تجاري',
    focusAr: 'دمج نماذج ذكاء اصطناعي خفيفة (Edge Neural Audio) لتعديل نبرة الصوت لحظياً وفق مستوى رطوبة الغرفة ونبض المستخدم.',
    keyInnovations: [
      'توليف طيفي حيوي يتكيف مع أبعاد الغرفة ومستوى الضوضاء الخارجية بدقة مليمترية.',
      'تحويل نبرة الطيور إلى طبقة أكثر دفئاً عند كشف إجهاد عصبي عبر الساعات الذكية.',
    ],
    architecturalImpactAr: 'تحول المنزل إلى كائن حيوي يتفاعل عضوياً ووجدانياً مع صحة قاطنيه.',
  },
];
