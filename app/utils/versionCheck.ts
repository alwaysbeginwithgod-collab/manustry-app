// app/utils/versionCheck.ts

const VERSION_KEY = 'manustry_app_version';
const BUILD_TIME_KEY = 'manustry_build_time';

export interface VersionInfo {
  version: string;
  latestVersion: string;
  lastUpdated: string;
  changes: string[];
  updateAvailable: boolean;
  buildTime: number;
}

export const checkVersion = async (): Promise<{ needsRefresh: boolean; versionInfo: VersionInfo | null }> => {
  try {
    const response = await fetch('/api/version');
    const data: VersionInfo = await response.json();
    
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const storedBuildTime = localStorage.getItem(BUILD_TIME_KEY);
    
    if (!storedVersion) {
      localStorage.setItem(VERSION_KEY, data.version);
      localStorage.setItem(BUILD_TIME_KEY, String(data.buildTime));
      return { needsRefresh: false, versionInfo: data };
    }
    
    const needsRefresh = 
      storedVersion !== data.version || 
      (storedBuildTime && parseInt(storedBuildTime) < data.buildTime);
    
    if (needsRefresh) {
      localStorage.setItem(VERSION_KEY, data.version);
      localStorage.setItem(BUILD_TIME_KEY, String(data.buildTime));
    }
    
    return { needsRefresh, versionInfo: data };
  } catch (error) {
    console.error('Version check failed:', error);
    return { needsRefresh: false, versionInfo: null };
  }
};

export const hardRefresh = () => {
  if ('caches' in window) {
    caches.keys().then(keys => {
      keys.forEach(key => caches.delete(key));
    });
  }
  localStorage.removeItem(VERSION_KEY);
  localStorage.removeItem(BUILD_TIME_KEY);
  window.location.reload();
};

export const getUpdateNotification = (versionInfo: VersionInfo) => {
  return {
    id: 'version-update',
    title: '🔄 New Update Available!',
    message: `Version ${versionInfo.latestVersion} is ready. Tap to refresh and get the latest features.`,
    type: 'update',
    read: false,
    timestamp: new Date(),
    link: '/update',
  };
};