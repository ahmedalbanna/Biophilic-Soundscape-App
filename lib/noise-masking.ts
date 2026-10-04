// Active Urban Noise Masking & Acoustic Spectrum Profiler

export interface NoiseProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  targetBand: 'low_hvac' | 'mid_traffic' | 'speech_murmur' | 'high_construction';
  freqRange: string;
  descAr: string;
  descEn: string;
  acousticMaskAr: string;
  color: string;
  icon: string;
}

export const URBAN_NOISE_PROFILES: NoiseProfile[] = [
  {
    id: 'hvac_drone',
    nameAr: 'أزيز التكييف والضاغط المنخفض',
    nameEn: 'HVAC & Compressor Drone',
    targetBand: 'low_hvac',
    freqRange: '50Hz - 140Hz',
    descAr: 'طنين مستمر من ضواغط التكييف ومضخات المبنى يخلق إجهاداً سمعياً غير محسوس.',
    descEn: 'Persistent low-frequency drone from AC compressors and building pumps.',
    acousticMaskAr: 'يتم حقن أمواج براونية عميقة وخرير ماء صخري لامتصاص الطنين المنخفض.',
    color: '#3b82f6',
    icon: 'fan',
  },
  {
    id: 'traffic_rumble',
    nameAr: 'حركة السيارات وضوضاء الشارع',
    nameEn: 'Street Traffic & Engine Rumble',
    targetBand: 'mid_traffic',
    freqRange: '160Hz - 480Hz',
    descAr: 'هدير محركات المركبات، الشاحنات، واحتكاك الإطارات بالأسفلت الخارجي.',
    descEn: 'Vehicular engine hum, heavy trucks, and asphalt tyre friction.',
    acousticMaskAr: 'تكثيف نسيم الأشجار الخشبي وقاع الجدول المائي لتغطية هدير المرور.',
    color: '#f59e0b',
    icon: 'car',
  },
  {
    id: 'speech_murmur',
    nameAr: 'تمتمة وأحاديث الشقق المجاورة',
    nameEn: 'Speech Murmur & Chatter',
    targetBand: 'speech_murmur',
    freqRange: '500Hz - 2000Hz',
    descAr: 'أصوات المحادثات غير المرغوبة وخطوات الأقدام التي تشتت الانتباه وتمنع التركيز.',
    descEn: 'Distracting neighbouring conversations, phone calls, and hallway footfalls.',
    acousticMaskAr: 'خفض مؤشر وضوح الكلام (STI) بنشر رذاذ مطري خماسي النغمات يُعجز الدماغ عن فك تشفير الكلمات.',
    color: '#10b981',
    icon: 'users',
  },
  {
    id: 'construction_drills',
    nameAr: 'أعمال البناء والمعدات المعدنية',
    nameEn: 'Construction & Mechanical Noise',
    targetBand: 'high_construction',
    freqRange: '2200Hz - 6000Hz',
    descAr: 'أصوات الحفر والمطارق والصفير المرتفع الحاد الذي يرفع مستويات الكورتيزول.',
    descEn: 'High-pitched drilling, hammering, and metallic scraping from worksites.',
    acousticMaskAr: 'تطبيق ستارة مطرية سقفية تحجب الترددات الحادة دون الحاجة لرفع صوت الغرفة.',
    color: '#ef4444',
    icon: 'hammer',
  },
];

export interface SpectrumBands {
  lowSub: number; // 0 to 100
  midLow: number; // 0 to 100
  midSpeech: number; // 0 to 100
  high: number; // 0 to 100
  dominantBand: 'low_hvac' | 'mid_traffic' | 'speech_murmur' | 'high_construction';
  ambientDbApprox: number;
}

// Microphone Spectrum Analyzer for Acoustic Fingerprinting
export class RoomAcousticProfiler {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;

  public async startMicrophone(): Promise<void> {
    if (this.stream) return;
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;
    source.connect(this.analyser);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public getLiveSpectrumBands(): SpectrumBands {
    if (!this.analyser || !this.dataArray) {
      // Fallback baseline simulation
      return {
        lowSub: 25,
        midLow: 35,
        midSpeech: 28,
        high: 15,
        dominantBand: 'mid_traffic',
        ambientDbApprox: 42,
      };
    }

    (this.analyser as any).getByteFrequencyData(this.dataArray);
    const binCount = this.dataArray.length;

    // Approximate bin ranges (assuming 48kHz sampleRate, bin width = 48000 / 512 = ~93Hz)
    // LowSub: bins 0-2 (0-280Hz)
    // MidLow: bins 2-6 (280-600Hz)
    // MidSpeech: bins 6-22 (600-2000Hz)
    // High: bins 22-80 (2000-7500Hz)

    let sumLow = 0;
    for (let i = 0; i < 3; i++) sumLow += this.dataArray[i];
    const lowSub = Math.min(100, Math.round((sumLow / 3 / 255) * 100));

    let sumMidLow = 0;
    for (let i = 3; i < 7; i++) sumMidLow += this.dataArray[i];
    const midLow = Math.min(100, Math.round((sumMidLow / 4 / 255) * 100));

    let sumSpeech = 0;
    for (let i = 7; i < 22; i++) sumSpeech += this.dataArray[i];
    const midSpeech = Math.min(100, Math.round((sumSpeech / 15 / 255) * 100));

    let sumHigh = 0;
    for (let i = 22; i < 80; i++) sumHigh += this.dataArray[i];
    const high = Math.min(100, Math.round((sumHigh / 58 / 255) * 100));

    // Determine dominant nuisance band
    let dominant: 'low_hvac' | 'mid_traffic' | 'speech_murmur' | 'high_construction' = 'mid_traffic';
    const maxVal = Math.max(lowSub, midLow, midSpeech, high);
    if (maxVal === lowSub) dominant = 'low_hvac';
    else if (maxVal === midLow) dominant = 'mid_traffic';
    else if (maxVal === midSpeech) dominant = 'speech_murmur';
    else dominant = 'high_construction';

    // Approximate ambient dBA (calibrated roughly for room mic)
    const overallAvg = (lowSub + midLow + midSpeech + high) / 4;
    const ambientDbApprox = Math.round(35 + overallAvg * 0.45);

    return {
      lowSub,
      midLow,
      midSpeech,
      high,
      dominantBand: dominant,
      ambientDbApprox,
    };
  }

  public stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }
}
