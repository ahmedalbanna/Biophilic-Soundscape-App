// Regional Biophilic Soundscapes & Geographic Nature Biomes

export interface RegionalBiome {
  id: string;
  nameAr: string;
  nameEn: string;
  regionAr: string;
  regionEn: string;
  altitudeMeters: number;
  climateTypeAr: string;
  floraFaunaAr: string;
  acousticAuraAr: string;
  badgeColor: string;
  accentGradient: string;
  tagAr: string;
  layers: {
    water: number;
    breeze: number;
    rain: number;
    ocean: number;
  };
  stochasticWeights: {
    birds: number;
    leaves: number;
    drops: number;
    twigs: number;
  };
  filterProfile: {
    breezeLpfHz: number;
    waterLpfHz: number;
  };
  spatialPan: {
    water: number;
    breeze: number;
    rain: number;
    ocean: number;
  };
  suggestedTimeOfDayAr: string;
  iconName: string;
}

export const REGIONAL_BIOMES: RegionalBiome[] = [
  {
    id: 'asir_soudah',
    nameAr: 'مرتفعات السودة وغابات العرعر الضبابية',
    nameEn: 'Asir Al-Soudah Heights & Cloud Forest',
    regionAr: 'منطقة عسير - سلسلة جبال السروات',
    regionEn: 'Asir Region, Sarawat Mountain Range',
    altitudeMeters: 3015,
    climateTypeAr: 'مناخ ألبيني جبلي بارد، ضباب سحابي مستمر، ورذاذ مطري ناعم',
    floraFaunaAr: 'غابات العرعر الفينيقي العتيقة، زهور اللافندر الجبلية، طائر العقعق العسيري، ونقار الخشب العربي',
    acousticAuraAr: 'هدير نسيم بارد يمر عبر إبر شجر العرعر مع قطرات الندى المطرية على الصخور البازلتية، مما يُبطئ إيقاع ضربات القلب فورياً.',
    badgeColor: '#059669',
    accentGradient: 'from-emerald-950 via-teal-950 to-stone-950',
    tagAr: 'برودة وانتعاش ذهني',
    layers: {
      water: 0.45,
      breeze: 0.8,
      rain: 0.6,
      ocean: 0.0,
    },
    stochasticWeights: {
      birds: 0.85,
      leaves: 0.75,
      drops: 0.9,
      twigs: 0.4,
    },
    filterProfile: {
      breezeLpfHz: 750,
      waterLpfHz: 620,
    },
    spatialPan: {
      water: -0.3,
      breeze: 0.2,
      rain: 0.0,
      ocean: 0.0,
    },
    suggestedTimeOfDayAr: 'الظهيرة وبعد العصر (للتخفيف من حرارة الصيف والضغوط)',
    iconName: 'mountain',
  },
  {
    id: 'ahsa_oasis',
    nameAr: 'واحة نخيل الأحساء ومجاري العيون العذبة',
    nameEn: 'Al-Ahsa Ancient Oasis & Spring Canals',
    regionAr: 'المنطقة الشرقية - واحة الأحساء التاريخية',
    regionEn: 'Eastern Province, UNESCO World Heritage Oasis',
    altitudeMeters: 150,
    climateTypeAr: 'واحة مائية خصبة وسط محيط صحراوي، رطوبة منعشة وظلال وارفة',
    floraFaunaAr: 'أكثر من 2.5 مليون نخلة خلاس ورزيز، اليمام المطوق (حمام النخيل)، البلبل أصفر العجز، وسواقي الري التقليدية',
    acousticAuraAr: 'تدفق مياه الينابيع العذبة في سواقي الري الطينية مع حفيف سعف النخيل في النسيم، يُعزز مشاعر الأمان النفسي والاسترخاء العميق.',
    badgeColor: '#10b981',
    accentGradient: 'from-emerald-950 via-lime-950 to-stone-950',
    tagAr: 'سكينة وبركة واحات',
    layers: {
      water: 0.85,
      breeze: 0.55,
      rain: 0.0,
      ocean: 0.0,
    },
    stochasticWeights: {
      birds: 0.9,
      leaves: 0.8,
      drops: 0.4,
      twigs: 0.2,
    },
    filterProfile: {
      breezeLpfHz: 550,
      waterLpfHz: 800,
    },
    spatialPan: {
      water: 0.2,
      breeze: -0.2,
      rain: 0.0,
      ocean: 0.0,
    },
    suggestedTimeOfDayAr: 'ساعات الصباح الباكر وقبل الغروب',
    iconName: 'palmtree',
  },
  {
    id: 'farasan_islands',
    nameAr: 'شواطئ جزر فرسان وغابات القرم (المانجروف)',
    nameEn: 'Farasan Islands Coral Shores & Mangroves',
    regionAr: 'منطقة جازان - أرخبيل جزر البحر الأحمر',
    regionEn: 'Jazan Region, Red Sea Marine Biosphere',
    altitudeMeters: 8,
    climateTypeAr: 'بيئة بحرية استوائية ناعمة، مياه فيروزية ضحلة، ونسيم يودي مهدئ',
    floraFaunaAr: 'أشجار الشورى (المانجروف) البحرية، طيور النورس الفاحم، خرشنة بحر القلزم، والأسماك الصغيرة بين الشعاب',
    acousticAuraAr: 'تكسر أمواج البحر الأحمر الفيروزية البطيئة على الرمل المرجاني مع نسمات بحرية متناغمة تنشط التنفس العميق وتحسن جودة النوم.',
    badgeColor: '#0ea5e9',
    accentGradient: 'from-sky-950 via-cyan-950 to-stone-950',
    tagAr: 'استرخاء ونوم عميق',
    layers: {
      water: 0.25,
      breeze: 0.6,
      rain: 0.0,
      ocean: 0.85,
    },
    stochasticWeights: {
      birds: 0.6,
      leaves: 0.4,
      drops: 0.2,
      twigs: 0.1,
    },
    filterProfile: {
      breezeLpfHz: 650,
      waterLpfHz: 500,
    },
    spatialPan: {
      water: -0.4,
      breeze: 0.3,
      rain: 0.0,
      ocean: 0.0,
    },
    suggestedTimeOfDayAr: 'المساء والليل للاستغراق في النوم',
    iconName: 'waves',
  },
  {
    id: 'najd_wadi_hanifa',
    nameAr: 'رياض نجد ووادي حنيفة بعد المطر',
    nameEn: 'Najd Plateaus & Wadi Hanifa Spring Runoff',
    regionAr: 'منطقة الرياض - هضبة نجد والوديان النجدية',
    regionEn: 'Riyadh Region, Central Arabian Plateau',
    altitudeMeters: 640,
    climateTypeAr: 'هواء صحراوي نقي ومنعش بعد انجلاء المطر، روائح الخزامى والطلح',
    floraFaunaAr: 'شجيرات الطلح والسدر البري، نباتات الخزامى والشيح والقيصوم، القبرة المتوجة، وعصافير الوادي الحصوي',
    acousticAuraAr: 'جريان وادٍ حصوي خفيف ينساب بين شجيرات السدر، مع نداءات طيور الصحراء المنعشة، يُصفي الذهن ويُعزز التركيز الذهني والإنتاجية.',
    badgeColor: '#f59e0b',
    accentGradient: 'from-amber-950 via-stone-900 to-stone-950',
    tagAr: 'تصفية ذهن وتركيز',
    layers: {
      water: 0.7,
      breeze: 0.5,
      rain: 0.25,
      ocean: 0.0,
    },
    stochasticWeights: {
      birds: 0.75,
      leaves: 0.5,
      drops: 0.6,
      twigs: 0.4,
    },
    filterProfile: {
      breezeLpfHz: 600,
      waterLpfHz: 700,
    },
    spatialPan: {
      water: 0.0,
      breeze: -0.3,
      rain: 0.2,
      ocean: 0.0,
    },
    suggestedTimeOfDayAr: 'ساعات العمل الصباحية وجلسات القراءة والمذاكرة',
    iconName: 'compass',
  },
  {
    id: 'taif_roses',
    nameAr: 'مدرجات مزارع ورد الطائف وجبال الهدا',
    nameEn: 'Taif Rose Terraces & Mountain Cascades',
    regionAr: 'منطقة مكة المكرمة - جبال الطائف والهدا والشفا',
    regionEn: 'Taif Highlands, Western Escarpment',
    altitudeMeters: 1879,
    climateTypeAr: 'نسيم عليل رطب، مدرجات زراعية خضراء، وشلالات مياه منحدرة',
    floraFaunaAr: 'حقول الورد الجوري الطائفي، أشجار التين والرمان، الحمام البري، وطيور الصرد الرمادي',
    acousticAuraAr: 'خرير شلالات المدرجات الجبلية الصخرية مع نسيم يحمل روح عبير الورد، يمنح شعوراً عميقاً بالبهجة والتجدد العاطفي.',
    badgeColor: '#f43f5e',
    accentGradient: 'from-rose-950 via-pink-950 to-stone-950',
    tagAr: 'بهجة وتجدد عاطفي',
    layers: {
      water: 0.75,
      breeze: 0.65,
      rain: 0.35,
      ocean: 0.0,
    },
    stochasticWeights: {
      birds: 0.8,
      leaves: 0.7,
      drops: 0.5,
      twigs: 0.3,
    },
    filterProfile: {
      breezeLpfHz: 700,
      waterLpfHz: 750,
    },
    spatialPan: {
      water: -0.2,
      breeze: 0.2,
      rain: 0.0,
      ocean: 0.0,
    },
    suggestedTimeOfDayAr: 'أوقات الراحة بعد العمل ولقاءات الأسرة المسائية',
    iconName: 'flower2',
  },
];
