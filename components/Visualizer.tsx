'use client';

import React, { useEffect, useRef } from 'react';
import { getAudioEngine } from '@/lib/audio-engine';

interface VisualizerProps {
  isDucked?: boolean;
  duckingEnvelope?: number;
}

export function Visualizer({ isDucked = false, duckingEnvelope = 1.0 }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = getAudioEngine();
    const analyser = engine.getAnalyser();

    // High DPI Canvas support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);
    const timeArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);

      const width = rect.width;
      const height = rect.height;

      // Dark background clearing with subtle motion blur
      ctx.fillStyle = 'rgba(12, 10, 9, 0.25)';
      ctx.fillRect(0, 0, width, height);

      const isPlaying = engine.getIsRunning();

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(timeArray);

        // Draw frequency spectrum bars
        const barWidth = (width / (bufferLength * 0.45)) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength * 0.45; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.65);

          // Emerald to golden teal gradient
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          if (isDucked) {
            // Amber shift when ducked for speech
            gradient.addColorStop(0, 'rgba(217, 119, 6, 0.4)');
            gradient.addColorStop(1, 'rgba(245, 158, 11, 0.85)');
          } else {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
            gradient.addColorStop(0.5, 'rgba(52, 211, 153, 0.7)');
            gradient.addColorStop(1, 'rgba(167, 243, 208, 0.95)');
          }

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight - 4, barWidth - 1.5, barHeight);
          x += barWidth;
        }

        // Draw smooth organic waveform overlay
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = isDucked ? 'rgba(251, 191, 36, 0.85)' : 'rgba(52, 211, 153, 0.85)';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let wx = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeArray[i] / 128.0;
          const y = (v * (height * 0.35)) + (height * 0.25);

          if (i === 0) {
            ctx.moveTo(wx, y);
          } else {
            ctx.lineTo(wx, y);
          }
          wx += sliceWidth;
        }

        ctx.stroke();
      } else {
        // Subtle ambient resting wave
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(87, 83, 78, 0.35)';
        ctx.beginPath();
        const time = Date.now() * 0.0015;
        for (let x = 0; x < width; x += 4) {
          const y = (height / 2) + Math.sin(x * 0.015 + time) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isDucked]);

  return (
    <div className="relative w-full h-28 bg-stone-950/80 rounded-xl border border-stone-800/80 overflow-hidden shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Overlay indicators */}
      <div className="absolute top-2.5 right-3.5 flex items-center gap-3 text-xs pointer-events-none">
        <div className="flex items-center gap-1.5 font-mono text-stone-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>96kHz / 24-bit DSP</span>
        </div>
        <span className="text-stone-600">·</span>
        <div className="flex items-center gap-1.5 font-mono text-stone-400">
          <span>التنظيم الذكي (Ducking):</span>
          <span className={`font-semibold tabular-nums ${isDucked ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isDucked ? `${Math.round(duckingEnvelope * 100)}% (-18dB)` : '100% (طبيعي)'}
          </span>
        </div>
      </div>
    </div>
  );
}
