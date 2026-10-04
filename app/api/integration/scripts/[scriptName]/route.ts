import { NextRequest, NextResponse } from 'next/server';
import {
  BASH_INSTALLER_SCRIPT,
  ALSA_PIPEWIRE_CONF,
  HOME_ASSISTANT_AUTOMATIONS_YAML,
  LOVELACE_CARD_YAML,
} from '@/lib/home-assistant-config';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scriptName: string }> }
) {
  const { scriptName } = await params;

  let content = '';
  let contentType = 'text/plain; charset=utf-8';
  let filename = scriptName;

  switch (scriptName) {
    case 'install-hub.sh':
      content = BASH_INSTALLER_SCRIPT;
      contentType = 'application/x-sh; charset=utf-8';
      break;

    case 'biophilic-soundscape.service':
      content = `[Unit]
Description=Biophilic Soundscape DSP Engine & Acoustic Hub
After=network.target sound.target pipewire.service
Wants=sound.target

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/biophilic-soundscape
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
LimitRTPRIO=95
LimitMEMLOCK=infinity
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
`;
      break;

    case 'pipewire-dsp.conf':
      content = ALSA_PIPEWIRE_CONF;
      break;

    case 'homeassistant-automations.yaml':
      content = HOME_ASSISTANT_AUTOMATIONS_YAML;
      contentType = 'text/yaml; charset=utf-8';
      break;

    case 'lovelace-card.yaml':
      content = LOVELACE_CARD_YAML;
      contentType = 'text/yaml; charset=utf-8';
      break;

    default:
      return new NextResponse('Script not found', { status: 404 });
  }

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
