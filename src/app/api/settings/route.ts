import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'settings.json');

async function getSettings() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      paymentMethods: {
        cash: true,
        card: false,
        online: false,
        bank_transfer: false,
      },
      disabledDays: [],
      notificationSettings: {
        sameDay: true,
        emailOnBooking: true,
      },
    };
  }
}

async function saveSettings(settings: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await saveSettings(body);
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
