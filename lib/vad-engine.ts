// Voice Activity Detection (VAD) & Smart Audio Ducking Manager
// Provides real-time microphone analysis, speech threshold detection,
// and simulation controls for the Biophilic Soundscape.

import { getAudioEngine } from './audio-engine';
import { getStressReliefManager } from './acoustic-stress-relief';

export interface VadConfig {
  sensitivityThresholdDb: number; // e.g. -40 dB
  duckingDepthDb: number; // e.g. -18 dB
  attackMs: number; // e.g. 150 ms
  holdMs: number; // e.g. 1800 ms
  releaseMs: number; // e.g. 1500 ms
  speechBandMinHz: number; // 300 Hz
  speechBandMaxHz: number; // 3400 Hz
}

export interface VadStatus {
  isListening: boolean;
  isSimulating: boolean;
  isSpeaking: boolean;
  isDucked: boolean;
  currentDb: number;
  currentSpeechScore: number; // 0 to 100
  duckingEnvelope: number; // 0 to 1
  micError: string | null;
}

export class VadManager {
  private config: VadConfig = {
    sensitivityThresholdDb: -42,
    duckingDepthDb: -18,
    attackMs: 150,
    holdMs: 1800,
    releaseMs: 1500,
    speechBandMinHz: 300,
    speechBandMaxHz: 3400,
  };

  private micStream: MediaStream | null = null;
  private micAudioCtx: AudioContext | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private isListening = false;
  private isSimulating = false;
  private isSpeaking = false;
  private isDucked = false;

  private holdTimeout: NodeJS.Timeout | null = null;
  private lastSpeechTimestamp = 0;
  private currentDb = -90;
  private currentSpeechScore = 0;
  private micError: string | null = null;

  private onStatusUpdate?: (status: VadStatus) => void;

  public setCallback(cb: (status: VadStatus) => void) {
    this.onStatusUpdate = cb;
  }

  public getConfig(): VadConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<VadConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public async startMicrophone(): Promise<boolean> {
    this.micError = null;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('المتصفح لا يدعم الوصول المباشر للميكروفون في هذا النطاق');
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.micAudioCtx = new AudioCtx();
      const source = this.micAudioCtx.createMediaStreamSource(this.micStream);

      this.micAnalyser = this.micAudioCtx.createAnalyser();
      this.micAnalyser.fftSize = 512;
      this.micAnalyser.smoothingTimeConstant = 0.4;
      source.connect(this.micAnalyser);

      this.isListening = true;
      this.isSimulating = false;
      this.startAnalysisLoop();
      this.notify();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تشغيل الميكروفون';
      this.micError = msg;
      this.isListening = false;
      this.notify();
      return false;
    }
  }

  public stopMicrophone() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.micAudioCtx) {
      this.micAudioCtx.close();
      this.micAudioCtx = null;
    }
    this.isListening = false;
    this.isSpeaking = false;
    this.currentDb = -90;
    this.currentSpeechScore = 0;
    this.checkDucking(false);
    this.notify();
  }

  // Interactive Speech Simulation (مفتاح محاكاة الكلام لاختبار التنظيم الذكي)
  public setSimulatedSpeech(speaking: boolean) {
    this.isSimulating = true;
    if (speaking) {
      this.currentDb = -26;
      this.currentSpeechScore = 88;
      this.handleSpeechDetected(true);
    } else {
      this.currentDb = -62;
      this.currentSpeechScore = 12;
      this.handleSpeechDetected(false);
    }
    this.notify();
  }

  public toggleSimulationPulse() {
    this.setSimulatedSpeech(true);
    setTimeout(() => {
      this.setSimulatedSpeech(false);
    }, 2400);
  }

  private startAnalysisLoop() {
    if (!this.micAnalyser || !this.micAudioCtx) return;

    const dataArray = new Float32Array(this.micAnalyser.frequencyBinCount);
    const sampleRate = this.micAudioCtx.sampleRate;
    const binWidth = sampleRate / this.micAnalyser.fftSize;

    const loop = () => {
      if (!this.isListening || !this.micAnalyser) return;

      this.micAnalyser.getFloatFrequencyData(dataArray);

      // Measure total RMS energy in dB
      let sumEnergy = 0;
      let speechBandEnergy = 0;
      let speechBinCount = 0;
      let highFreqEnergy = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const freq = i * binWidth;
        const linear = Math.pow(10, dataArray[i] / 10);
        sumEnergy += linear;

        if (freq >= this.config.speechBandMinHz && freq <= this.config.speechBandMaxHz) {
          speechBandEnergy += linear;
          speechBinCount++;
        }
        if (freq >= 3400) {
          highFreqEnergy += linear;
        }
      }

      const avgDb = 10 * Math.log10(Math.max(1e-9, sumEnergy / dataArray.length));
      this.currentDb = Math.max(-90, Math.min(0, Math.round(avgDb * 10) / 10));

      const speechRatio = speechBinCount > 0 ? speechBandEnergy / Math.max(1e-9, sumEnergy) : 0;
      this.currentSpeechScore = Math.min(100, Math.round(speechRatio * 120));

      const harshnessRatio = sumEnergy > 0 ? highFreqEnergy / sumEnergy : 0.2;
      getStressReliefManager().feedAcousticData(this.currentDb, harshnessRatio);

      // Voice Activity Condition:
      // 1. RMS level exceeds sensitivity threshold (e.g. -42 dB)
      // 2. Significant concentration in human vocal fundamental/formant bandwidth
      const voiceActive = this.currentDb > this.config.sensitivityThresholdDb && this.currentSpeechScore > 35;

      this.handleSpeechDetected(voiceActive);
      this.notify();

      this.animFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  private handleSpeechDetected(detected: boolean) {
    const engine = getAudioEngine();
    const now = Date.now();

    if (detected) {
      this.isSpeaking = true;
      this.lastSpeechTimestamp = now;

      if (this.holdTimeout) {
        clearTimeout(this.holdTimeout);
        this.holdTimeout = null;
      }

      if (!this.isDucked) {
        this.isDucked = true;
        engine.applyDucking(
          true,
          this.config.duckingDepthDb,
          this.config.attackMs / 1000,
          this.config.releaseMs / 1000
        );
      }
    } else {
      this.isSpeaking = false;

      // Hold time before releasing the ducking envelope
      if (this.isDucked && !this.holdTimeout) {
        this.holdTimeout = setTimeout(() => {
          this.isDucked = false;
          engine.applyDucking(
            false,
            this.config.duckingDepthDb,
            this.config.attackMs / 1000,
            this.config.releaseMs / 1000
          );
          this.holdTimeout = null;
          this.notify();
        }, this.config.holdMs);
      }
    }
  }

  private checkDucking(ducked: boolean) {
    this.isDucked = ducked;
    const engine = getAudioEngine();
    engine.applyDucking(
      ducked,
      this.config.duckingDepthDb,
      this.config.attackMs / 1000,
      this.config.releaseMs / 1000
    );
  }

  private notify() {
    if (this.onStatusUpdate) {
      const engine = getAudioEngine();
      this.onStatusUpdate({
        isListening: this.isListening,
        isSimulating: this.isSimulating,
        isSpeaking: this.isSpeaking,
        isDucked: this.isDucked,
        currentDb: this.currentDb,
        currentSpeechScore: this.currentSpeechScore,
        duckingEnvelope: engine.getDuckingEnvelope(),
        micError: this.micError,
      });
    }
  }

  public getStatus(): VadStatus {
    const engine = getAudioEngine();
    return {
      isListening: this.isListening,
      isSimulating: this.isSimulating,
      isSpeaking: this.isSpeaking,
      isDucked: this.isDucked,
      currentDb: this.currentDb,
      currentSpeechScore: this.currentSpeechScore,
      duckingEnvelope: engine.getDuckingEnvelope(),
      micError: this.micError,
    };
  }

  public getMicAnalyser(): AnalyserNode | null {
    return this.micAnalyser;
  }
}

let vadInstance: VadManager | null = null;
export function getVadManager(): VadManager {
  if (typeof window === 'undefined') {
    return new VadManager();
  }
  if (!vadInstance) {
    vadInstance = new VadManager();
  }
  return vadInstance;
}
