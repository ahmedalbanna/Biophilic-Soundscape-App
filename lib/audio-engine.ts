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

import { RoomEqBand } from './room-calibration';
import { BrainwaveBandId, EntrainmentMode } from './neuro-entrainment';
import { CalmingProfileId, CALMING_PROFILES } from './acoustic-stress-relief';
import { HvacFanSpeed, HVAC_MASKING_FLAVORS, IAQ_BIOPHILIC_PROFILES } from './hvac-iaq-sync';

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

  // Room EQ Biquad Filter Bank
  private eqFilters: BiquadFilterNode[] = [];
  private isEqBypassed = false;
  private currentEqBands: RoomEqBand[] = [];

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

  // Neuro-Acoustic Entrainment Audio Nodes
  private entrainmentBusGain: GainNode | null = null;
  private entrainmentOscLeft: OscillatorNode | null = null;
  private entrainmentOscRight: OscillatorNode | null = null;
  private entrainmentPannerLeft: StereoPannerNode | null = null;
  private entrainmentPannerRight: StereoPannerNode | null = null;
  private isochronicCarrierOsc: OscillatorNode | null = null;
  private isochronicAmpGain: GainNode | null = null;
  private isochronicLfo: OscillatorNode | null = null;
  private isochronicLfoGain: GainNode | null = null;
  private entrainmentState: {
    active: boolean;
    bandId: BrainwaveBandId;
    targetHz: number;
    carrierHz: number;
    mode: EntrainmentMode;
    intensity: number;
  } = {
    active: false,
    bandId: 'alpha',
    targetHz: 10.0,
    carrierHz: 256,
    mode: 'hybrid',
    intensity: 0.35,
  };

  // Acoustic Stress Auto-Relief & Noise Calming Nodes
  private stressSofteningFilter: BiquadFilterNode | null = null;
  private calmingReliefBusGain: GainNode | null = null;
  private calmingGroundingOsc: OscillatorNode | null = null;
  private calmingPacerGain: GainNode | null = null;
  private calmingPacerNoiseSource: AudioBufferSourceNode | null = null;
  private calmingPacerTimer: NodeJS.Timeout | null = null;
  private isAcousticStressActive = false;
  private activeCalmingProfile: CalmingProfileId = 'coherence_ocean';
  private calmingBreathStep = 0; // 0..9 representing second in 10s cycle

  // Adaptive HVAC Masking & IAQ Sync Nodes
  private hvacNotchFilter: BiquadFilterNode | null = null;
  private hvacMaskingBusGain: GainNode | null = null;
  private isHvacAdaptiveActive = false;
  private currentHvacSpeed: HvacFanSpeed = 'normal_med';
  private currentHvacFlavorId = 'marble_fountain_aflaj';

  // Custom FLAC & Hi-Res Soundbank Slots
  private customSlots: Map<
    string,
    {
      buffer: AudioBuffer;
      isLoop: boolean;
      volume: number;
      pan: number;
      sourceNode?: AudioBufferSourceNode;
      gainNode?: GainNode;
      pannerNode?: StereoPannerNode;
      timeout?: NodeJS.Timeout;
    }
  > = new Map();

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

    // Room EQ Calibration 5-band Filter Chain
    this.eqFilters = [];
    for (let i = 0; i < 5; i++) {
      const f = this.ctx.createBiquadFilter();
      f.gain.setValueAtTime(0, this.ctx.currentTime);
      this.eqFilters.push(f);
    }
    this.eqFilters[0].type = 'lowshelf';
    this.eqFilters[0].frequency.setValueAtTime(80, this.ctx.currentTime);
    this.eqFilters[1].type = 'peaking';
    this.eqFilters[1].frequency.setValueAtTime(250, this.ctx.currentTime);
    this.eqFilters[2].type = 'peaking';
    this.eqFilters[2].frequency.setValueAtTime(1000, this.ctx.currentTime);
    this.eqFilters[3].type = 'peaking';
    this.eqFilters[3].frequency.setValueAtTime(3500, this.ctx.currentTime);
    this.eqFilters[4].type = 'highshelf';
    this.eqFilters[4].frequency.setValueAtTime(8000, this.ctx.currentTime);

    // Psychoacoustic Stress Softening Filter (dynamic high-frequency absorption)
    this.stressSofteningFilter = this.ctx.createBiquadFilter();
    this.stressSofteningFilter.type = 'lowpass';
    this.stressSofteningFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
    this.stressSofteningFilter.Q.setValueAtTime(0.707, this.ctx.currentTime);

    // Adaptive HVAC Anti-Rumble Notch Filter (50-120Hz compressor resonance neutralization)
    this.hvacNotchFilter = this.ctx.createBiquadFilter();
    this.hvacNotchFilter.type = 'notch';
    this.hvacNotchFilter.frequency.setValueAtTime(60, this.ctx.currentTime);
    this.hvacNotchFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    // Connect bus: Master -> Ducking -> AdhanSilence -> EQ[0..4] -> HVAC Notch -> Softening Filter -> Analyser -> Output
    this.masterGain.connect(this.duckingGain);
    this.duckingGain.connect(this.adhanSilenceGain);

    let lastNode: AudioNode = this.adhanSilenceGain;
    for (const eqNode of this.eqFilters) {
      lastNode.connect(eqNode);
      lastNode = eqNode;
    }
    lastNode.connect(this.hvacNotchFilter);
    this.hvacNotchFilter.connect(this.stressSofteningFilter);
    this.stressSofteningFilter.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Media & Recitation Overlay Gain (connects into AdhanSilence so it respects prayer windows)
    this.mediaGain = this.ctx.createGain();
    this.mediaGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.mediaGain.connect(this.adhanSilenceGain);

    // Neuro-Acoustic Entrainment Master Bus
    this.entrainmentBusGain = this.ctx.createGain();
    this.entrainmentBusGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.entrainmentBusGain.connect(this.adhanSilenceGain);

    // Acoustic Stress Auto-Relief Calming Bus
    this.calmingReliefBusGain = this.ctx.createGain();
    this.calmingReliefBusGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.calmingReliefBusGain.connect(this.adhanSilenceGain);

    // Adaptive HVAC Masking Dedicated Stream Bus
    this.hvacMaskingBusGain = this.ctx.createGain();
    this.hvacMaskingBusGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.hvacMaskingBusGain.connect(this.adhanSilenceGain);

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

  public setLayerPan(id: ContinuousLayerId, pan: number) {
    if (!this.ctx) return;
    const clamped = Math.max(-1, Math.min(1, pan));
    let panner: StereoPannerNode | null = null;
    switch (id) {
      case 'water':
        panner = this.waterPanner;
        break;
      case 'breeze':
        panner = this.breezePanner;
        break;
      case 'rain':
        panner = this.rainPanner;
        break;
      case 'ocean':
        panner = this.oceanPanner;
        break;
    }
    if (panner) {
      panner.pan.setTargetAtTime(clamped, this.ctx.currentTime, 0.1);
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

  // --- Automated Room EQ & Acoustic Calibration ---
  public applyRoomEq(bands: RoomEqBand[], bypass = false) {
    if (!this.ctx) this.init();
    if (!this.ctx || this.eqFilters.length === 0) return;
    this.currentEqBands = bands;
    this.isEqBypassed = bypass;

    for (let i = 0; i < this.eqFilters.length; i++) {
      const filter = this.eqFilters[i];
      const band = bands[i];
      if (band) {
        filter.type = band.type;
        filter.frequency.setTargetAtTime(band.frequency, this.ctx.currentTime, 0.05);
        filter.Q.setTargetAtTime(band.q, this.ctx.currentTime, 0.05);
        const gain = bypass ? 0 : band.gainDb;
        filter.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.05);
      } else {
        filter.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
    }
  }

  public setRoomEqBypass(bypass: boolean) {
    if (!this.ctx || this.eqFilters.length === 0) return;
    this.isEqBypassed = bypass;
    for (let i = 0; i < this.eqFilters.length; i++) {
      const filter = this.eqFilters[i];
      const band = this.currentEqBands[i];
      const targetGain = bypass || !band ? 0 : band.gainDb;
      filter.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
  }

  public getIsEqBypassed(): boolean {
    return this.isEqBypassed;
  }

  public async playCalibrationSweep(durationSec = 3.5): Promise<void> {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const sweepGain = ctx.createGain();

    osc.type = 'sine';
    // Logarithmic sweep 20 Hz to 16,000 Hz
    osc.frequency.setValueAtTime(20, now);
    osc.frequency.exponentialRampToValueAtTime(16000, now + durationSec);

    // Smooth envelope to avoid speaker pops
    sweepGain.gain.setValueAtTime(0, now);
    sweepGain.gain.linearRampToValueAtTime(0.28, now + 0.12);
    sweepGain.gain.setValueAtTime(0.28, now + durationSec - 0.15);
    sweepGain.gain.linearRampToValueAtTime(0, now + durationSec);

    osc.connect(sweepGain);
    sweepGain.connect(this.masterGain || ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec + 0.05);

    return new Promise((resolve) => {
      setTimeout(resolve, (durationSec + 0.1) * 1000);
    });
  }

  public async playPinkNoiseBurst(durationSec = 2.5): Promise<void> {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (!this.ctx) return;

    const ctx = this.ctx;
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Pink Noise algorithm (Kellet filter approximation)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const gainNode = ctx.createGain();

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.1);
    gainNode.gain.setValueAtTime(0.22, now + durationSec - 0.15);
    gainNode.gain.linearRampToValueAtTime(0, now + durationSec);

    noiseSource.connect(gainNode);
    gainNode.connect(this.masterGain || ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + durationSec + 0.05);

    return new Promise((resolve) => {
      setTimeout(resolve, (durationSec + 0.1) * 1000);
    });
  }

  // --- Neuro-Acoustic Entrainment & Brainwave Synchronizer ---
  public startNeuroEntrainment(
    bandId: BrainwaveBandId = 'alpha',
    targetHz = 10.0,
    carrierHz = 256,
    mode: EntrainmentMode = 'hybrid',
    intensity = 0.35
  ) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.entrainmentBusGain) return;
    const now = this.ctx.currentTime;

    this.stopNeuroEntrainment(0.05);

    this.entrainmentState = {
      active: true,
      bandId,
      targetHz,
      carrierHz,
      mode,
      intensity: Math.max(0.05, Math.min(1.0, intensity)),
    };

    const masterEntrainVol = this.entrainmentState.intensity * 0.22;
    this.entrainmentBusGain.gain.cancelScheduledValues(now);
    this.entrainmentBusGain.gain.setValueAtTime(0, now);
    this.entrainmentBusGain.gain.linearRampToValueAtTime(masterEntrainVol, now + 0.8);

    // 1. Binaural Beats Stereo Synthesis (Left: carrier, Right: carrier + targetHz)
    if (mode === 'binaural_stereo' || mode === 'hybrid') {
      this.entrainmentOscLeft = this.ctx.createOscillator();
      this.entrainmentOscRight = this.ctx.createOscillator();
      this.entrainmentPannerLeft = this.ctx.createStereoPanner();
      this.entrainmentPannerRight = this.ctx.createStereoPanner();

      this.entrainmentOscLeft.type = 'sine';
      this.entrainmentOscRight.type = 'sine';

      this.entrainmentOscLeft.frequency.setValueAtTime(carrierHz, now);
      this.entrainmentOscRight.frequency.setValueAtTime(carrierHz + targetHz, now);

      this.entrainmentPannerLeft.pan.setValueAtTime(-1.0, now);
      this.entrainmentPannerRight.pan.setValueAtTime(1.0, now);

      const binauralGain = this.ctx.createGain();
      binauralGain.gain.setValueAtTime(0.48, now);

      this.entrainmentOscLeft.connect(this.entrainmentPannerLeft);
      this.entrainmentOscRight.connect(this.entrainmentPannerRight);

      this.entrainmentPannerLeft.connect(binauralGain);
      this.entrainmentPannerRight.connect(binauralGain);
      binauralGain.connect(this.entrainmentBusGain);

      this.entrainmentOscLeft.start(now);
      this.entrainmentOscRight.start(now);
    }

    // 2. Subliminal Isochronic Amplitude Modulation (Natural pulsing for speakers)
    if (mode === 'isochronic_biophilic' || mode === 'hybrid') {
      this.isochronicCarrierOsc = this.ctx.createOscillator();
      this.isochronicCarrierOsc.type = 'sine';
      this.isochronicCarrierOsc.frequency.setValueAtTime(carrierHz * 0.5, now);

      this.isochronicAmpGain = this.ctx.createGain();
      this.isochronicAmpGain.gain.setValueAtTime(0.32, now);

      this.isochronicLfo = this.ctx.createOscillator();
      this.isochronicLfo.type = 'sine';
      this.isochronicLfo.frequency.setValueAtTime(targetHz, now);

      this.isochronicLfoGain = this.ctx.createGain();
      this.isochronicLfoGain.gain.setValueAtTime(0.25, now);

      this.isochronicLfo.connect(this.isochronicLfoGain);
      this.isochronicLfoGain.connect(this.isochronicAmpGain.gain);

      this.isochronicCarrierOsc.connect(this.isochronicAmpGain);
      this.isochronicAmpGain.connect(this.entrainmentBusGain);

      this.isochronicCarrierOsc.start(now);
      this.isochronicLfo.start(now);
    }
  }

  public updateNeuroEntrainment(params: Partial<{ targetHz: number; carrierHz: number; mode: EntrainmentMode; intensity: number }>) {
    if (!this.ctx || !this.entrainmentState.active) return;
    const now = this.ctx.currentTime;

    if (params.intensity !== undefined) {
      this.entrainmentState.intensity = Math.max(0.05, Math.min(1.0, params.intensity));
      if (this.entrainmentBusGain) {
        const targetVol = this.entrainmentState.intensity * 0.22;
        this.entrainmentBusGain.gain.setTargetAtTime(targetVol, now, 0.2);
      }
    }

    if (params.targetHz !== undefined) {
      this.entrainmentState.targetHz = params.targetHz;
      if (this.entrainmentOscRight) {
        this.entrainmentOscRight.frequency.setTargetAtTime(
          this.entrainmentState.carrierHz + params.targetHz,
          now,
          0.1
        );
      }
      if (this.isochronicLfo) {
        this.isochronicLfo.frequency.setTargetAtTime(params.targetHz, now, 0.1);
      }
    }

    if (params.carrierHz !== undefined) {
      this.entrainmentState.carrierHz = params.carrierHz;
      if (this.entrainmentOscLeft) {
        this.entrainmentOscLeft.frequency.setTargetAtTime(params.carrierHz, now, 0.1);
      }
      if (this.entrainmentOscRight) {
        this.entrainmentOscRight.frequency.setTargetAtTime(
          params.carrierHz + this.entrainmentState.targetHz,
          now,
          0.1
        );
      }
      if (this.isochronicCarrierOsc) {
        this.isochronicCarrierOsc.frequency.setTargetAtTime(params.carrierHz * 0.5, now, 0.1);
      }
    }

    if (params.mode !== undefined && params.mode !== this.entrainmentState.mode) {
      this.startNeuroEntrainment(
        this.entrainmentState.bandId,
        this.entrainmentState.targetHz,
        this.entrainmentState.carrierHz,
        params.mode,
        this.entrainmentState.intensity
      );
    }
  }

  public stopNeuroEntrainment(fadeSeconds = 0.5) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.entrainmentBusGain) {
      this.entrainmentBusGain.gain.cancelScheduledValues(now);
      this.entrainmentBusGain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
    }

    setTimeout(() => {
      try {
        if (this.entrainmentOscLeft) {
          this.entrainmentOscLeft.stop();
          this.entrainmentOscLeft.disconnect();
          this.entrainmentOscLeft = null;
        }
        if (this.entrainmentOscRight) {
          this.entrainmentOscRight.stop();
          this.entrainmentOscRight.disconnect();
          this.entrainmentOscRight = null;
        }
        if (this.isochronicCarrierOsc) {
          this.isochronicCarrierOsc.stop();
          this.isochronicCarrierOsc.disconnect();
          this.isochronicCarrierOsc = null;
        }
        if (this.isochronicLfo) {
          this.isochronicLfo.stop();
          this.isochronicLfo.disconnect();
          this.isochronicLfo = null;
        }
      } catch {
        // Safe disposal
      }
      this.entrainmentState.active = false;
    }, fadeSeconds * 1000 + 50);
  }

  public getNeuroEntrainmentState() {
    return { ...this.entrainmentState };
  }

  // --- Acoustic Stress Auto-Relief & Noise Calming Engine ---
  public startAcousticStressIntervention(
    profileId: CalmingProfileId = 'coherence_ocean',
    volume = 0.85
  ) {
    if (!this.ctx) this.init();
    if (!this.ctx || !this.calmingReliefBusGain) return;
    const now = this.ctx.currentTime;

    this.stopAcousticStressIntervention(0.2);

    this.isAcousticStressActive = true;
    this.activeCalmingProfile = profileId;
    const profile = CALMING_PROFILES[profileId] || CALMING_PROFILES.coherence_ocean;

    // 1. Engage Psychoacoustic Frequency Softening Filter
    if (this.stressSofteningFilter) {
      this.stressSofteningFilter.frequency.cancelScheduledValues(now);
      this.stressSofteningFilter.frequency.setTargetAtTime(profile.lowpassCutoffHz, now, 0.25);
    }

    // 2. Fade in Calming Bus
    this.calmingReliefBusGain.gain.cancelScheduledValues(now);
    this.calmingReliefBusGain.gain.setValueAtTime(0, now);
    this.calmingReliefBusGain.gain.linearRampToValueAtTime(
      Math.max(0.1, Math.min(1.0, volume * 0.5)),
      now + 0.8
    );

    // 3. Grounding Carrier Tone (e.g. 108Hz, 128Hz, 136.1Hz)
    try {
      this.calmingGroundingOsc = this.ctx.createOscillator();
      this.calmingGroundingOsc.type = 'sine';
      this.calmingGroundingOsc.frequency.setValueAtTime(profile.carrierHz, now);

      const groundGain = this.ctx.createGain();
      groundGain.gain.setValueAtTime(0.18, now);

      this.calmingGroundingOsc.connect(groundGain);
      groundGain.connect(this.calmingReliefBusGain);
      this.calmingGroundingOsc.start(now);
    } catch {
      // Safe handle
    }

    // 4. Synthesize Cardiorespiratory Coherence Breath Modulation (6 BPM / 0.1 Hz)
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }

      this.calmingPacerNoiseSource = this.ctx.createBufferSource();
      this.calmingPacerNoiseSource.buffer = buffer;
      this.calmingPacerNoiseSource.loop = true;

      const pacerLpf = this.ctx.createBiquadFilter();
      pacerLpf.type = 'lowpass';
      pacerLpf.frequency.setValueAtTime(800, now);

      this.calmingPacerGain = this.ctx.createGain();
      this.calmingPacerGain.gain.setValueAtTime(0.2, now);

      this.calmingPacerNoiseSource.connect(pacerLpf);
      pacerLpf.connect(this.calmingPacerGain);
      this.calmingPacerGain.connect(this.calmingReliefBusGain);
      this.calmingPacerNoiseSource.start(now);

      this.calmingBreathStep = 0;
      if (this.calmingPacerTimer) clearInterval(this.calmingPacerTimer);
      this.calmingPacerTimer = setInterval(() => {
        if (!this.ctx || !this.isAcousticStressActive || !this.calmingPacerGain) return;
        this.calmingBreathStep = (this.calmingBreathStep + 1) % 10;
        const cTime = this.ctx.currentTime;
        if (this.calmingBreathStep < 4) {
          const ratio = (this.calmingBreathStep + 1) / 4;
          this.calmingPacerGain.gain.setTargetAtTime(0.2 + ratio * 0.55, cTime, 0.4);
        } else {
          const ratio = (this.calmingBreathStep - 3) / 6;
          this.calmingPacerGain.gain.setTargetAtTime(0.75 - ratio * 0.55, cTime, 0.5);
        }
      }, 1000);
    } catch {
      // Safe fallback
    }
  }

  public stopAcousticStressIntervention(fadeSec = 2.5) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.calmingReliefBusGain) {
      this.calmingReliefBusGain.gain.cancelScheduledValues(now);
      this.calmingReliefBusGain.gain.linearRampToValueAtTime(0, now + fadeSec);
    }

    if (this.stressSofteningFilter) {
      this.stressSofteningFilter.frequency.cancelScheduledValues(now);
      this.stressSofteningFilter.frequency.setTargetAtTime(20000, now, fadeSec * 0.8);
    }

    if (this.calmingPacerTimer) {
      clearInterval(this.calmingPacerTimer);
      this.calmingPacerTimer = null;
    }

    setTimeout(() => {
      try {
        if (this.calmingGroundingOsc) {
          this.calmingGroundingOsc.stop();
          this.calmingGroundingOsc.disconnect();
          this.calmingGroundingOsc = null;
        }
        if (this.calmingPacerNoiseSource) {
          this.calmingPacerNoiseSource.stop();
          this.calmingPacerNoiseSource.disconnect();
          this.calmingPacerNoiseSource = null;
        }
      } catch {
        // Safe disposal
      }
      this.isAcousticStressActive = false;
    }, fadeSec * 1000 + 100);
  }

  public isAcousticStressActiveNow(): boolean {
    return this.isAcousticStressActive;
  }

  public getActiveCalmingProfile(): CalmingProfileId {
    return this.activeCalmingProfile;
  }

  public setStressSofteningCutoff(cutoffHz: number) {
    if (!this.ctx || !this.stressSofteningFilter) return;
    this.stressSofteningFilter.frequency.setTargetAtTime(
      Math.max(1200, Math.min(20000, cutoffHz)),
      this.ctx.currentTime,
      0.15
    );
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

  // --- Adaptive HVAC Masking & IAQ Sync Engine ---
  public applyAdaptiveHvacAndIaqMask(
    speed: HvacFanSpeed = 'normal_med',
    flavorId = 'marble_fountain_aflaj',
    iaqProfileId = 'pristine',
    intensity = 1.0
  ) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    this.isHvacAdaptiveActive = true;
    this.currentHvacSpeed = speed;
    this.currentHvacFlavorId = flavorId;

    const flavor =
      HVAC_MASKING_FLAVORS.find((f) => f.id === flavorId) || HVAC_MASKING_FLAVORS[0];
    const iaq =
      IAQ_BIOPHILIC_PROFILES[iaqProfileId] || IAQ_BIOPHILIC_PROFILES.pristine;

    // 1. Determine HVAC mechanical intensity scale
    const speedScaleMap: Record<HvacFanSpeed, number> = {
      off: 0.05,
      eco_low: 0.35,
      normal_med: 0.65,
      high_cool: 0.85,
      turbo_boost: 1.0,
    };
    const hvacScale = speedScaleMap[speed] ?? 0.65;
    const effIntensity = Math.max(0.1, Math.min(1.2, intensity));

    // 2. Adjust dynamic anti-rumble notch filter for AC compressor resonance
    if (this.hvacNotchFilter) {
      const targetNotchHz = speed === 'off' ? 20 : flavor.notchCutoffHz;
      this.hvacNotchFilter.frequency.cancelScheduledValues(now);
      this.hvacNotchFilter.frequency.setTargetAtTime(targetNotchHz, now, 0.3);
    }

    // 3. Shape biophilic continuous layers to psychoacoustically absorb duct hiss
    const waterTarget = Math.min(
      1.0,
      flavor.waterWeight * (0.35 + hvacScale * 0.55) * iaq.waterModifier * effIntensity
    );
    const breezeTarget = Math.min(
      0.95,
      flavor.breezeWeight * (0.3 + hvacScale * 0.5) * iaq.breezeModifier * effIntensity
    );
    const oceanTarget = Math.min(
      0.85,
      flavor.oceanWeight * (0.15 + hvacScale * 0.6) * effIntensity
    );
    const rainTarget = Math.min(
      0.65,
      flavor.rainWeight * (0.05 + hvacScale * 0.45) * effIntensity
    );
    const birdsTarget = Math.min(
      1.0,
      (speed === 'off' || speed === 'eco_low' ? 0.75 : 0.38) * iaq.birdsModifier
    );

    if (this.waterGain) this.waterGain.gain.setTargetAtTime(waterTarget, now, 0.4);
    if (this.breezeGain) this.breezeGain.gain.setTargetAtTime(breezeTarget, now, 0.4);
    if (this.oceanGain) this.oceanGain.gain.setTargetAtTime(oceanTarget, now, 0.4);
    if (this.rainGain) this.rainGain.gain.setTargetAtTime(rainTarget, now, 0.4);
    if (this.birdsGain) this.birdsGain.gain.setTargetAtTime(birdsTarget, now, 0.5);
  }

  public stopAdaptiveHvacMask() {
    this.isHvacAdaptiveActive = false;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.waterGain) this.waterGain.gain.setTargetAtTime(0.65, now, 0.5);
    if (this.breezeGain) this.breezeGain.gain.setTargetAtTime(0.5, now, 0.5);
    if (this.oceanGain) this.oceanGain.gain.setTargetAtTime(0.0, now, 0.5);
    if (this.rainGain) this.rainGain.gain.setTargetAtTime(0.0, now, 0.5);
    if (this.birdsGain) this.birdsGain.gain.setTargetAtTime(0.6, now, 0.5);
    if (this.hvacNotchFilter) {
      this.hvacNotchFilter.frequency.setTargetAtTime(20, now, 0.5);
    }
  }

  public isAdaptiveHvacActiveNow(): boolean {
    return this.isHvacAdaptiveActive;
  }

  public setHvacNotchFrequency(freqHz: number) {
    if (!this.ctx || !this.hvacNotchFilter) return;
    const clamped = Math.max(30, Math.min(250, freqHz));
    this.hvacNotchFilter.frequency.setTargetAtTime(clamped, this.ctx.currentTime, 0.1);
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

  // --- Custom FLAC & Hi-Res Soundbank Engine ---
  public async decodeAudioBlob(blob: Blob): Promise<AudioBuffer> {
    if (!this.ctx) {
      this.init();
    }
    const arrayBuffer = await blob.arrayBuffer();
    return await this.ctx!.decodeAudioData(arrayBuffer);
  }

  public registerCustomSoundSlot(
    slotId: string,
    buffer: AudioBuffer,
    isLoop: boolean,
    volume = 0.7,
    pan = 0
  ) {
    this.removeCustomSlot(slotId);
    this.customSlots.set(slotId, {
      buffer,
      isLoop,
      volume,
      pan,
    });
  }

  public startCustomLoopSlot(slotId: string) {
    const slot = this.customSlots.get(slotId);
    if (!slot || !this.ctx || !this.masterGain) return;

    this.stopCustomLoopSlot(slotId);

    const source = this.ctx.createBufferSource();
    source.buffer = slot.buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(slot.volume, this.ctx.currentTime);

    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(slot.pan, this.ctx.currentTime);

    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    source.start();

    slot.sourceNode = source;
    slot.gainNode = gain;
    slot.pannerNode = panner;
  }

  public stopCustomLoopSlot(slotId: string) {
    const slot = this.customSlots.get(slotId);
    if (!slot) return;
    if (slot.sourceNode) {
      try {
        slot.sourceNode.stop();
        slot.sourceNode.disconnect();
      } catch {
        // already stopped
      }
      slot.sourceNode = undefined;
    }
    if (slot.gainNode) {
      slot.gainNode.disconnect();
      slot.gainNode = undefined;
    }
    if (slot.pannerNode) {
      slot.pannerNode.disconnect();
      slot.pannerNode = undefined;
    }
  }

  public triggerCustomStochasticSlot(slotId: string, pitchVariation = 0) {
    const slot = this.customSlots.get(slotId);
    if (!slot || !this.ctx || !this.masterGain) return;

    const source = this.ctx.createBufferSource();
    source.buffer = slot.buffer;
    source.loop = false;

    // Apply slight pitch variance (semitone detune)
    if (pitchVariation !== 0) {
      source.detune.setValueAtTime(pitchVariation * 100, this.ctx.currentTime);
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(slot.volume, this.ctx.currentTime);

    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(slot.pan, this.ctx.currentTime);

    source.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain);

    source.start();
  }

  public startCustomStochasticScheduler(
    slotId: string,
    minIntervalSec: number,
    maxIntervalSec: number,
    pitchJitter = 1.0
  ) {
    const slot = this.customSlots.get(slotId);
    if (!slot) return;
    this.stopCustomStochasticScheduler(slotId);

    const scheduleNext = () => {
      const intervalSec = minIntervalSec + Math.random() * (maxIntervalSec - minIntervalSec);
      slot.timeout = setTimeout(() => {
        if (!this.isRunning) return;
        const randomPitch = (Math.random() * 2 - 1) * pitchJitter;
        this.triggerCustomStochasticSlot(slotId, randomPitch);
        scheduleNext();
      }, intervalSec * 1000);
    };

    scheduleNext();
  }

  public stopCustomStochasticScheduler(slotId: string) {
    const slot = this.customSlots.get(slotId);
    if (slot && slot.timeout) {
      clearTimeout(slot.timeout);
      slot.timeout = undefined;
    }
  }

  public setCustomSlotVolume(slotId: string, volume: number) {
    const slot = this.customSlots.get(slotId);
    if (!slot) return;
    slot.volume = volume;
    if (slot.gainNode && this.ctx) {
      slot.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
    }
  }

  public setCustomSlotPan(slotId: string, pan: number) {
    const slot = this.customSlots.get(slotId);
    if (!slot) return;
    slot.pan = pan;
    if (slot.pannerNode && this.ctx) {
      slot.pannerNode.pan.setTargetAtTime(pan, this.ctx.currentTime, 0.05);
    }
  }

  public removeCustomSlot(slotId: string) {
    this.stopCustomLoopSlot(slotId);
    this.stopCustomStochasticScheduler(slotId);
    this.customSlots.delete(slotId);
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

  // 5. Hoopoe Rhythmic Pulse Call (الهدهد المهلل: هوب-هوب-هوب)
  public triggerHoopoeCall(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const baseFreq = 480 + Math.random() * 20;

    // 3 rhythmic pulses spaced 180ms apart
    for (let i = 0; i < 3; i++) {
      const pulseTime = now + i * 0.18;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, pulseTime);
      osc.frequency.linearRampToValueAtTime(baseFreq - 15, pulseTime + 0.12);

      gain.gain.setValueAtTime(0.0001, pulseTime);
      gain.gain.linearRampToValueAtTime(0.08, pulseTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(pulseTime);
      osc.stop(pulseTime + 0.16);
    }
  }

  // 6. Turtle Dove Warm Coo (هديل حمام القمري)
  public triggerTurtleDoveCoo(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const pan = this.ctx.createStereoPanner();

    pan.pan.value = Math.random() * 1.2 - 0.6;
    osc.type = 'sine';
    // Gentle throat coo from 560Hz gliding down to 480Hz
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.linearRampToValueAtTime(560, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(470, now + 0.7);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.12);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(gain);
    gain.connect(pan);
    pan.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.9);
  }

  // 7. Shimmering Night Crickets (صراصير الليل وجداجد الحقول)
  public triggerNightCrickets(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const env = this.ctx.createGain();

    carrier.type = 'sine';
    carrier.frequency.value = 4750 + Math.random() * 200;

    mod.type = 'sawtooth';
    mod.frequency.value = 38; // fast high-frequency AM flutter
    modGain.gain.value = 280;

    mod.connect(modGain);
    modGain.connect(carrier.frequency);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.035, now + 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    carrier.connect(env);
    env.connect(this.masterGain);

    carrier.start(now);
    mod.start(now);
    carrier.stop(now + 0.7);
    mod.stop(now + 0.7);
  }

  // 8. Traditional Brass Coffee Mortar Resonator (دقات النجر النحاسي وإعداد القهوة)
  public triggerCoffeeNejir(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const oscFundamental = this.ctx.createOscillator();
    const oscHarmonic = this.ctx.createOscillator();
    const hitGain = this.ctx.createGain();
    const pan = this.ctx.createStereoPanner();

    pan.pan.value = Math.random() * 0.8 - 0.4;

    // Resonant brass strike: Fundamental at 980Hz, overtone at 2420Hz
    oscFundamental.type = 'sine';
    oscFundamental.frequency.setValueAtTime(980, now);
    oscHarmonic.type = 'sine';
    oscHarmonic.frequency.setValueAtTime(2420, now);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0.35, now);
    oscHarmonic.connect(harmGain);
    harmGain.connect(hitGain);

    oscFundamental.connect(hitGain);
    hitGain.connect(pan);
    pan.connect(this.masterGain);

    // Sharp metallic impact followed by warm brass decay (2.2s)
    hitGain.gain.setValueAtTime(0.0001, now);
    hitGain.gain.linearRampToValueAtTime(0.18, now + 0.015);
    hitGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    oscFundamental.start(now);
    oscHarmonic.start(now);
    oscFundamental.stop(now + 2.3);
    oscHarmonic.stop(now + 2.3);
  }

  // 9. Incense Ember Crackle & Oud (جمر المبخرة والعود وتفرقع اللبان)
  public triggerIncenseEmber(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const noiseBuffer = this.createPinkNoiseBuffer();
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 2200 + Math.random() * 800;
    bpf.Q.value = 5.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    source.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.masterGain);

    source.start(now);
    source.stop(now + 0.1);
  }

  // 10. Distant Desert Caravan Chime (أجراس الإبل والقوافل في السكون)
  public triggerDesertCaravanBell(force = false) {
    if (!this.ctx || !this.masterGain) return;
    if (!force && !this.isRunning) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscHarm = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    const pan = this.ctx.createStereoPanner();

    pan.pan.value = Math.random() * 1.4 - 0.7;

    // Deep resonant copper/brass bell at 340Hz
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);

    oscHarm.type = 'sine';
    oscHarm.frequency.setValueAtTime(340 * 2.38, now);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0.25, now);
    oscHarm.connect(harmGain);
    harmGain.connect(bellGain);

    osc.connect(bellGain);
    bellGain.connect(pan);
    pan.connect(this.masterGain);

    bellGain.gain.setValueAtTime(0.0001, now);
    bellGain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

    osc.start(now);
    oscHarm.start(now);
    osc.stop(now + 3.5);
    oscHarm.stop(now + 3.5);
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
