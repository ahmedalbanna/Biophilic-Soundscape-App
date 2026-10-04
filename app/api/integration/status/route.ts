import { NextResponse } from 'next/server';

export async function GET() {
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  let currentPhase = 'night';
  if (currentHour >= 5 && currentHour < 8.5) currentPhase = 'dawn';
  else if (currentHour >= 8.5 && currentHour < 16.5) currentPhase = 'midday';
  else if (currentHour >= 16.5 && currentHour < 19.5) currentPhase = 'afternoon';
  else if (currentHour >= 19.5 && currentHour < 23) currentPhase = 'evening';

  return NextResponse.json({
    status: 'online',
    device: 'Biophilic Soundscape Central Controller (RPi5 / Mini PC)',
    firmware: 'v2.8.4',
    samplingRate: '96.0 kHz / 24-bit PCM',
    circadian: {
      hour: Math.round(currentHour * 100) / 100,
      phase: currentPhase,
      timeString: now.toLocaleTimeString('en-US', { hour12: false }),
    },
    vad: {
      enabled: true,
      duckingDepthDb: -18,
      status: 'idle',
    },
    dsp: {
      latencyMs: 3.8,
      cpuLoadPercent: 12.4,
      coreTempCelsius: 41.2,
      activeChannels: 8,
    },
  });
}
