// app/components/VersionChecker.tsx
"use client";

import { useEffect, useState } from "react";
import { checkVersion, hardRefresh } from "../utils/versionCheck";
import UpdateBanner from "./UpdateBanner";

export default function VersionChecker() {
  const [isLoading, setIsLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [versionInfo, setVersionInfo] = useState<any>(null);

  // ✅ Check on mount
  useEffect(() => {
    const runVersionCheck = async () => {
      try {
        const { needsRefresh, versionInfo: info } = await checkVersion();
        
        if (needsRefresh && info) {
          console.log('🔄 New version detected! Showing update banner.');
          setVersionInfo(info);
          setShowBanner(true);
        } else {
          console.log('✅ App is up to date.');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Version check failed:', error);
        setIsLoading(false);
      }
    };

    runVersionCheck();
  }, []);

  // ✅ Background check every 30 seconds
  useEffect(() => {
    if (showBanner) return; // Don't check if banner already showing

    const interval = setInterval(async () => {
      try {
        const { needsRefresh, versionInfo: info } = await checkVersion();
        if (needsRefresh && info) {
          console.log('🔄 New version detected in background!');
          setVersionInfo(info);
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Background version check failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [showBanner]);

  const handleUpdate = () => {
    console.log('🔄 User initiated update...');
    hardRefresh();
  };

  const handleBannerClose = () => {
    setShowBanner(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      {showBanner && versionInfo && (
        <UpdateBanner 
          version={versionInfo.version}
          changes={versionInfo.changes}
          onUpdate={handleUpdate}
          autoUpdateDelay={10}
        />
      )}
    </>
  );
}