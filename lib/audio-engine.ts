// Web Audio API procedural synthesis engine for Biophilic Soundscape
// Generates non-fatiguing, continuous background nature beds and stochastic events.

export type ContinuousLayerId = 'water' | 'breeze' | 'rain' | 'ocean';
export type StochasticEventId = 'birds' | 'leaves' | 'crickets' | 'chimes';

export interface SoundscapeLayerState {
  id: ContinuousLayerId;
  name: string;
  nameAr: string;
  volume: number; // 0 to 1
  enabled: boolean;
  color: string;
}

export interface StochasticLayerState {
  id: StochasticEventId;
  name: string;
  nameAr: string;
  density: number; // 0 to 1 (controls average frequency of occurrence)
  enabled: boolean;
  color: string;
}

export interface AcousticEventLog {
  id: string;
  timestamp: string;
  type: StochasticEventId;
  labelAr: string;
  labelEn: string;
  pan: number;
  pitch: number;
}

class BiophilicAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning = false;
  private masterGain: GainNode | null = null;
  private duckingGain: GainNode | null = null;
  private adhanSilenceGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Background layers
  private waterGain: GainNode | null = null;
  private waterPanner: StereoPannerNode | null = null;
  private breezeGain: GainNode | null = null;
  private breezePanner: StereoPannerNode | null = null;
  private rainGain: GainNode | null = null;
  private rainPanner: StereoPannerNode | null = null;
  private oceanGain: GainNode | null = null;
  private oceanPanner: StereoPannerNode | null = null;
  private oceanLpf: BiquadFilterNode | null = null;
  private oceanWaveGain: GainNode | null = null;

  // Media & Recitation Overlay Bus
  private mediaGain: GainNode | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;

  // Active audio nodes to clean up
  private noiseNodes: AudioNode[] = [];
  private intervals: NodeJS.Timeout[] = [];

  // Ducking state
  private isDucked = false;
  private duckingTargetDb = -18; // dB
  private currentDuckEnvelope = 1.0; // 0.0 to 1.0 for UI telemetry

  // Event listener for stochastic notifications
  private onStochasticTrigger?: (event: AcousticEventLog) => void;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);

    // Smart Audio Ducking node
    this.duckingGain = this.ctx.createGain();
    this.duckingGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Adhan & Prayer silence protection node
    this.adhanSilenceGain = this.ctx.createGain();
    this.adhanSilenceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Master Analyser for UI visualizers
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.85;

    // Connect bus: Master -> Ducking -> AdhanSilence -> Analyser -> Output
    this.masterGain.connect(this.duckingGain);
    this.duckingGain.connect(this.adhanSilenceGain);
    this.adhanSilenceGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Media & Recitation Overlay Gain (connects into AdhanSilence so it respects prayer windows)
    this.mediaGain = this.ctx.createGain();
    this.mediaGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.mediaGain.connect(this.adhanSilenceGain);

    // Build Continuous Generators
    this.setupWaterLayer();
    this.setupBreezeLayer();
    this.setupRainLayer();
    this.setupOceanLayer();
  }

  public setStochasticCallback(cb: (event: AcousticEventLog) => void) {
    this.onStochasticTrigger = cb;
  }

  public async start() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isRunning = true;
    this.startStochasticSchedulers();
  }

  public pause() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    this.isRunning = false;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setMasterVolume(val: number) {
    if (!this.ctx || !this.masterGain) return;
    const clamped = Math.max(0, Math.min(1, val));
    this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
  }

  public setLayerVolume(id: ContinuousLayerId, volume: number, enabled: boolean) {
    if (!this.ctx) return;
    const target = enabled ? Math.max(0, Math.min(1, volume)) : 0;
    const node = this.getLayerGainNode(id);
    if (node) {
      node.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }
  }

  private getLayerGainNode(id: ContinuousLayerId): GainNode | null {
    switch (id) {
      case 'water':
        return this.waterGain;
      case 'breeze':
        return this.breezeGain;
      case 'rain':
        return this.rainGain;
      case 'ocean':
        return this.oceanGain;
    }
  }

  // --- Smart Ducking Execution ---
  public applyDucking(ducked: boolean, depthDb = -18, attackSec = 0.15, releaseSec = 1.6) {
    if (!this.ctx || !this.duckingGain) return;
    this.isDucked = ducked;
    this.duckingTargetDb = depthDb;

    // Convert dB to linear gain: 10^(dB/20)
    // E.g. -18dB ~= 0.125
    const duckedGain = Math.pow(10, depthDb / 20);
    const target = ducked ? duckedGain : 1.0;
    const timeConstant = ducked ? attackSec : releaseSec;

    this.duckingGain.gain.setTargetAtTime(target, this.ctx.currentTime, timeConstant);
    this.currentDuckEnvelope = target;
  }

  public getDuckingEnvelope(): number {
    if (!this.duckingGain) return 1.0;
    return this.duckingGain.gain.value;
  }

  public isCurrentlyDucked(): boolean {
    return this.isDucked;
  }

  // --- Adhan & Prayer Silence Protection ---
  public setAdhanSilence(inSilence: boolean, fadeSec = 4) {
    if (!this.ctx || !this.adhanSilenceGain) return;
    const target = inSilence ? 0.0001 : 1.0;
    this.adhanSilenceGain.gain.setTargetAtTime(target, this.ctx.currentTime, Math.max(0.1, fadeSec / 3));
  }

  public getAdhanSilenceEnvelope(): number {
    if (!this.adhanSilenceGain) return 1.0;
    return this.adhanSilenceGain.gain.value;
  }

  // --- Active Urban Noise Masking Mode ---
  public applyUrbanNoiseMask(
    targetBand: 'low_hvac' | 'mid_traffic' | 'speech_murmur' | 'high_construction' | 'none',
    intensity = 0.5
  ) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const scaled = Math.max(0, Math.min(1, intensity));

    switch (targetBand) {
      case 'low_hvac':
        // Boost ocean brown noise and deep water bass to counter low humming
        if (this.oceanGain) this.oceanGain.gain.setTargetAtTime(0.5 + scaled * 0.45, now, 0.4);
        if (this.waterGain) this.waterGain.gain.setTargetAtTime(0.7, now, 0.4);
        if (this.rainGain) this.rainGain.gain.setTargetAtTime(0.1, now, 0.4);
        break;
      case 'mid_traffic':
        // Boost canopy breeze and babbling brook body (200-450Hz)
        if (this.breezeGain) this.breezeGain.gain.setTargetAtTime(0.55 + scaled * 0.4, now, 0.4);
        if (this.waterGain) this.waterGain.gain.setTargetAtTime(0.75, now, 0.4);
        if (this.oceanGain) this.oceanGain.gain.setTargetAtTime(0.3, now, 0.4);
        break;
      case 'speech_murmur':
        // Reduce Speech Transmission Index (STI) by boosting pink-noise rain and water stream
        if (this.rainGain) this.rainGain.gain.setTargetAtTime(0.4 + scaled * 0.45, now, 0.4);
        if (this.waterGain) this.waterGain.gain.setTargetAtTime(0.85, now, 0.4);
        if (this.breezeGain) this.breezeGain.gain.setTargetAtTime(0.45, now, 0.4);
        break;
      case 'high_construction':
        // Mask sharp metallic/drilling noise with dense rain droplet and breeze mask
        if (this.rainGain) this.rainGain.gain.setTargetAtTime(0.6 + scaled * 0.35, now, 0.4);
        if (this.breezeGain) this.breezeGain.gain.setTargetAtTime(0.7, now, 0.4);
        if (this.waterGain) this.waterGain.gain.setTargetAtTime(0.6, now, 0.4);
        break;
      case 'none':
      default:
        // Restore standard balance
        if (this.waterGain) this.waterGain.gain.setTargetAtTime(0.65, now, 0.5);
        if (this.breezeGain) this.breezeGain.gain.setTargetAtTime(0.5, now, 0.5);
        if (this.rainGain) this.rainGain.gain.setTargetAtTime(0.0, now, 0.5);
        if (this.oceanGain) this.oceanGain.gain.setTargetAtTime(0.0, now, 0.5);
        break;
    }
  }

  // --- Media & Quran Recitation Overlay Routing ---
  public connectMediaElement(element: HTMLAudioElement) {
    if (!this.ctx || !this.mediaGain) return;
    try {
      if (!this.mediaSourceNode) {
        this.mediaSourceNode = this.ctx.createMediaElementSource(element);
        this.mediaSourceNode.connect(this.mediaGain);
      }
    } catch {
      // Element already connected
    }
  }

  public setMediaVolume(vol: number) {
    if (!this.ctx || !this.mediaGain) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.mediaGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
  }

  public setMediaOverlayDucking(active: boolean, depthDb = -16) {
    if (!this.ctx || !this.duckingGain) return;
    const targetGain = active ? Math.pow(10, depthDb / 20) : 1.0;
    this.duckingGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, active ? 0.3 : 1.8);
  }

  // --- Procedural Continuous Layers ---
  private createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds loopable buffer
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  private createBrownianNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Scale
      }
    }
    return buffer;
  }

  // 1. Water Stream / Babbling Brook
  private setupWaterLayer() {
    if (!this.ctx || !this.masterGain) return;
    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.value = 0.65;

    const noiseBuffer = this.createPinkNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Resonant bandpass filter for rushing water
    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 750;
    bpf.Q.value = 1.4;

    // Secondary highpass filter to remove mud
    const hpf = this.ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 280;

    // Subtle LFO modulation to simulate organic water flow waves
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.25; // 0.25 Hz slow wave
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(bpf.frequency);

    noiseSource.connect(bpf);
    bpf.connect(hpf);
    hpf.connect(this.waterGain);

    this.waterPanner = this.ctx.createStereoPanner();
    this.waterGain.connect(this.waterPanner);
    this.waterPanner.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
    this.noiseNodes.push(noiseSource, lfo);
  }

  // 2. Forest Breeze / Wind Canopy
  private setupBreezeLayer() {
    if (!this.ctx || !this.masterGain) return;
    this.breezeGain = this.ctx.createGain();
    this.breezeGain.gain.value = 0.5;

    const noiseBuffer = this.createPinkNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Lowpass filter for soft warm whisper
    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 450;
    lpf.Q.value = 2.0;

    // Slow wind swell LFO
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.12; // slow 8-second swell
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain);
    lfoGain.connect(lpf.frequency);

    noiseSource.connect(lpf);
    lpf.connect(this.breezeGain);

    this.breezePanner = this.ctx.createStereoPanner();
    this.breezeGain.connect(this.breezePanner);
    this.breezePanner.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
    this.noiseNodes.push(noiseSource, lfo);
  }

  // 3. Gentle Rain / Droplet Mask
  private setupRainLayer() {
    if (!this.ctx || !this.masterGain) return;
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0.0; // muted by default, activated in rainy/focus mode

    const noiseBuffer = this.createPinkNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 2200;
    bpf.Q.value = 0.8;

    noiseSource.connect(bpf);
    bpf.connect(this.rainGain);

    this.rainPanner = this.ctx.createStereoPanner();
    this.rainGain.connect(this.rainPanner);
    this.rainPanner.connect(this.masterGain);

    noiseSource.start();
    this.noiseNodes.push(noiseSource);
  }

  // 4. Ocean Surf / Tidal Rhythms
  private setupOceanLayer() {
    if (!this.ctx || !this.masterGain) return;
    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.value = 0.0; // default zero

    const noiseBuffer = this.createBrownianNoiseBuffer();
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lpf = this.ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 350;

    // Rhythmic 12-second tidal wave envelope
    const waveGain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.08; // ~12s cycle
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain);
    lfoGain.connect(lpf.frequency);

    this.oceanLpf = lpf;
    this.oceanWaveGain = waveGain;

    noiseSource.connect(lpf);
    lpf.connect(waveGain);
    waveGain.connect(this.oceanGain);

    this.oceanPanner = this.ctx.createStereoPanner();
    this.oceanGain.connect(this.oceanPanner);
    this.oceanPanner.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
    this.noiseNodes.push(noiseSource, lfo);
  }

  // --- Biometric Biofeedback & Paced Breathing Wave Swell ---
  public triggerBreathingSwell(phase: 'inhale' | 'hold' | 'exhale', durationSec: number) {
    if (!this.ctx || !this.oceanGain) return;
    const now = this.ctx.currentTime;
    const timeConstant = Math.max(0.1, durationSec / 2.8);

    // Make sure ocean layer is audible during breathing exercises
    if (this.oceanGain.gain.value < 0.25) {
      this.oceanGain.gain.setTargetAtTime(0.65, now, 0.5);
    }

    if (phase === 'inhale') {
      // Swell up: brighter resonance and rising wave volume
      if (this.oceanLpf) {
        this.oceanLpf.frequency.setTargetAtTime(620, now, timeConstant);
      }
      if (this.oceanWaveGain) {
        this.oceanWaveGain.gain.setTargetAtTime(1.0, now, timeConstant);
      }
    } else if (phase === 'hold') {
      // Gentle plateau at top of lungs
      if (this.oceanWaveGain) {
        this.oceanWaveGain.gain.setTargetAtTime(0.85, now, 0.4);
      }
    } else if (phase === 'exhale') {
      // Release & retreat: deeper, softer rumble onto smooth shoreline
      if (this.oceanLpf) {
        this.oceanLpf.frequency.setTargetAtTime(240, now, timeConstant);
      }
      if (this.oceanWaveGain) {
        this.oceanWaveGain.gain.setTargetAtTime(0.18, now, timeConstant);
      }
    }
  }

  // Pure 432Hz Tibetan Singing Bowl chime for transition pacing
  public triggerSingingBowl(freq = 432) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const bowlGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    // Subtle harmonic overtone
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.76, now);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.2, now);
    osc2.connect(subGain);
    subGain.connect(bowlGain);

    osc1.connect(bowlGain);
    bowlGain.connect(this.masterGain);

    // Gentle strike and long, peaceful 4.5-second decay
    bowlGain.gain.setValueAtTime(0.0001, now);
    bowlGain.gain.linearRampToValueAtTime(0.25, now + 0.08);
    bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 4.6);
    osc2.stop(now + 4.6);
  }

  // 2D Spatial Positioning: Pan (-1 to 1) and Distance Attenuation (0 to 1)
  public setLayerSpatialPosition(id: ContinuousLayerId, pan: number, distanceFactor = 1.0) {
    if (!this.ctx) return;
    const clampedPan = Math.max(-1, Math.min(1, pan));
    let panner: StereoPannerNode | null = null;
    let gainNode: GainNode | null = null;

    switch (id) {
      case 'water':
        panner = this.waterPanner;
        gainNode = this.waterGain;
        break;
      case 'breeze':
        panner = this.breezePanner;
        gainNode = this.breezeGain;
        break;
      case 'rain':
        panner = this.rainPanner;
        gainNode = this.rainGain;
        break;
      case 'ocean':
        panner = this.oceanPanner;
        gainNode = this.oceanGain;
        break;
    }

    if (panner && this.ctx.state === 'running') {
      panner.pan.setTargetAtTime(clampedPan, this.ctx.currentTime, 0.05);
    }
  }

  // --- Stochastic Foreground Events ---
  private startStochasticSchedulers() {
    this.intervals.forEach((i) => clearInterval(i));
    this.intervals = [];

    // Periodic stochastic dice-roll check every 2.5 seconds
    const interval = setInterval(() => {
      if (!this.isRunning || !this.ctx || this.ctx.state !== 'running') return;

      const roll = Math.random();
      if (roll < 0.45) {
        this.triggerProceduralBird();
      } else if (roll < 0.65) {
        this.triggerFoliageRustle();
      } else if (roll < 0.78) {
        this.triggerWindChime();
      }
    }, 2800);

    this.intervals.push(interval);
  }

  // 1. Procedural Bird Chirp (زقزقة عصافير طبيعية)
  public triggerProceduralBird(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const panner = this.ctx.createStereoPanner();

    // Randomize stereo position across architectural ceiling
    const panVal = (Math.random() * 1.6 - 0.8);
    panner.pan.value = panVal;

    // Pitch sweep mimicking songbird warble (e.g. Nightingale or Lark)
    const baseFreq = 2600 + Math.random() * 1200;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.24);

    // Envelope
    oscGain.gain.setValueAtTime(0.001, now);
    oscGain.gain.linearRampToValueAtTime(0.075, now + 0.04);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(oscGain);
    oscGain.connect(panner);
    panner.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);

    if (this.onStochasticTrigger) {
      const date = new Date();
      const timeStr = date.toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.onStochasticTrigger({
        id: `bird-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        type: 'birds',
        labelAr: 'تغريد عصفور الفجر (توزيع فراغي)',
        labelEn: 'Songbird Chirp (Spatial Pan)',
        pan: Math.round(panVal * 100) / 100,
        pitch: Math.round(baseFreq),
      });
    }
  }

  // 2. Foliage Rustle (حفيف أوراق الشجر)
  public triggerFoliageRustle(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const noiseBuffer = this.createPinkNoiseBuffer();
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 1600 + Math.random() * 600;
    bpf.Q.value = 3.0;

    const gain = this.ctx.createGain();
    const pan = this.ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.4 - 0.7;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    source.connect(bpf);
    bpf.connect(gain);
    gain.connect(pan);
    pan.connect(this.masterGain);

    source.start(now);
    source.stop(now + 1.25);

    if (this.onStochasticTrigger) {
      const date = new Date();
      const timeStr = date.toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.onStochasticTrigger({
        id: `leaves-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        type: 'leaves',
        labelAr: 'حفيف أوراق شجر خفيف',
        labelEn: 'Gentle Canopy Rustle',
        pan: Math.round(pan.pan.value * 100) / 100,
        pitch: Math.round(bpf.frequency.value),
      });
    }
  }

  // 3. Evening Cicadas / Crickets (صرار الليل)
  public triggerCicadaBurst(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const env = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.value = 4600 + Math.random() * 400;

    mod.type = 'sawtooth';
    mod.frequency.value = 32; // 32 Hz fluttering pulse
    modGain.gain.value = 300;

    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.04, now + 0.15);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    carrier.connect(env);
    env.connect(this.masterGain);

    carrier.start(now);
    mod.start(now);
    carrier.stop(now + 0.85);
    mod.stop(now + 0.85);

    if (this.onStochasticTrigger) {
      const date = new Date();
      const timeStr = date.toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.onStochasticTrigger({
        id: `crickets-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        type: 'crickets',
        labelAr: 'نبضات صرار الليل الهادئة',
        labelEn: 'Evening Cicada Pulse',
        pan: 0,
        pitch: Math.round(carrier.frequency.value),
      });
    }
  }

  // 4. Harmonic Wind Chimes (أجراس الرياح الهادئة)
  public triggerWindChime(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const pentatonicFrequencies = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760];
    const freq = pentatonicFrequencies[Math.floor(Math.random() * pentatonicFrequencies.length)];

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const pan = this.ctx.createStereoPanner();

    pan.pan.value = Math.random() * 1.6 - 0.8;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4); // Long resonant ring

    osc.connect(gain);
    gain.connect(pan);
    pan.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.5);

    if (this.onStochasticTrigger) {
      const date = new Date();
      const timeStr = date.toLocaleTimeString('ar-EG', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.onStochasticTrigger({
        id: `chimes-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        type: 'chimes',
        labelAr: 'رنين جرس ريح معدني هادئ',
        labelEn: 'Wind Chime Resonant Ring',
        pan: Math.round(pan.pan.value * 100) / 100,
        pitch: Math.round(freq),
      });
    }
  }

  public destroy() {
    this.intervals.forEach((i) => clearInterval(i));
    this.intervals = [];
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton instance for client use
let engineInstance: BiophilicAudioEngine | null = null;

export function getAudioEngine(): BiophilicAudioEngine {
  if (typeof window === 'undefined') {
    return new BiophilicAudioEngine();
  }
  if (!engineInstance) {
    engineInstance = new BiophilicAudioEngine();
  }
  return engineInstance;
}
