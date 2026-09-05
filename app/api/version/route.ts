// app/api/version/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const currentVersion = '1.0.0';
  const lastUpdated = '2026-09-05';
  const changes = [
    '✨ New devotions added',
    '🐛 Fixed scripture link errors',
    '📝 Improved WriterViewport',
    '🚀 Performance improvements'
  ];
  
  return NextResponse.json({
    version: currentVersion,
    lastUpdated,
    changes,
    updateAvailable: false,
  });
}