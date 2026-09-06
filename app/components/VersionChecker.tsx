// app/components/VersionChecker.tsx
"use client";

import { useEffect, useState } from "react";
import { checkVersion, hardRefresh } from "../utils/versionCheck";

export default function VersionChecker() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runVersionCheck = async () => {
      try {
        const { needsRefresh, versionInfo } = await checkVersion();
        
        if (needsRefresh && versionInfo) {
          console.log('🔄 New version detected! Refreshing...');
          // Show a small toast notification? Or just refresh
          setTimeout(() => {
            hardRefresh();
          }, 2000);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Version check failed:', error);
        setIsLoading(false);
      }
    };

    runVersionCheck();
  }, []);

  if (isLoading) {
    return null;
  }

  return null;
}