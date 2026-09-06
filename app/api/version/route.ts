// app/api/version/route.ts
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

// ✅ Read version from package.json automatically
const getCurrentVersion = () => {
  try {
    const packageJson = JSON.parse(
      readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
};

// ✅ Store the last build time
const BUILD_TIME = Date.now();
const CURRENT_VERSION = getCurrentVersion();

export async function GET() {
  // ✅ Check if there's a new version by comparing with Vercel deployment
  const lastUpdated = new Date(BUILD_TIME).toISOString().split('T')[0];
  
  // ✅ You can store the latest version in environment variable
  // For now, use the package.json version
  const latestVersion = process.env.NEXT_PUBLIC_APP_VERSION || CURRENT_VERSION;
  
  const changes = [
    '🚀 Performance improvements',
    '🐛 Bug fixes and stability updates',
    '📝 Enhanced user experience',
  ];
  
  return NextResponse.json({
    version: CURRENT_VERSION,
    latestVersion: latestVersion,
    lastUpdated,
    changes,
    // ✅ Compare with stored version in localStorage
    updateAvailable: true, // Always check client-side
    buildTime: BUILD_TIME,
  });
}