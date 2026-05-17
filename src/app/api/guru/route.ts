import { NextRequest, NextResponse } from 'next/server';
import { guruResponses } from '@/lib/vaathi-data';

export async function POST(request: NextRequest) {
  try {
    const { message, language } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Find matching response
    const lower = message.toLowerCase();
    let response = guruResponses['default'];

    for (const [key, value] of Object.entries(guruResponses)) {
      if (key !== 'default' && lower.includes(key)) {
        response = value;
        break;
      }
    }

    // Add language prefix
    const langPrefix = language === 'hi' ? '[Hindi mode] ' : language === 'ta' ? '[Tamil mode] ' : '';

    return NextResponse.json({
      response: langPrefix + response,
      language: language || 'en',
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
