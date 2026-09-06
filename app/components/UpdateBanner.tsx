// app/components/UpdateBanner.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface UpdateBannerProps {
  version: string;
  changes?: string[];
  onUpdate: () => void;
  autoUpdateDelay?: number; // seconds before auto-update
}

export default function UpdateBanner({ 
  version, 
  changes = [], 
  onUpdate,
  autoUpdateDelay = 10 // 10 seconds default
}: UpdateBannerProps) {
  const { darkMode } = useTheme();
  const [countdown, setCountdown] = useState(autoUpdateDelay);
  const [isVisible, setIsVisible] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Auto-update countdown
  useEffect(() => {
    if (!isVisible || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleUpdate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, countdown]);

  const handleUpdate = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(key => caches.delete(key));
      });
    }
    
    // Remove version storage
    localStorage.removeItem('manustry_app_version');
    localStorage.removeItem('manustry_build_time');
    
    // Notify parent
    onUpdate();
    
    // Hard reload after a small delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleLater = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const bgColor = darkMode ? "bg-[#1A1F2E]" : "bg-white";
  const borderColor = darkMode ? "border-[#C9A84C]/30" : "border-[#C9A84C]/40";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div 
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl ${bgColor} border ${borderColor} rounded-xl shadow-2xl p-5 animate-slide-up`}
      style={{
        boxShadow: darkMode 
          ? '0 20px 60px rgba(0,0,0,0.8)' 
          : '0 20px 60px rgba(0,0,0,0.15)'
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-12 h-12 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
            <span className="text-2xl">🔄</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-sm font-semibold ${textColor}`}>
              New Update Available
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C]`}>
              v{version}
            </span>
          </div>
          
          <p className={`text-xs ${subTextColor} mt-1`}>
            {changes.length > 0 ? (
              <>
                What's new:
                {changes.slice(0, 3).map((change, i) => (
                  <span key={i} className="block ml-3 mt-0.5">• {change}</span>
                ))}
                {changes.length > 3 && (
                  <span className="block ml-3 text-[#C9A84C] text-[10px]">
                    +{changes.length - 3} more improvements
                  </span>
                )}
              </>
            ) : (
              'A new version is ready with improvements and bug fixes.'
            )}
          </p>

          {/* Progress Bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#C9A84C] rounded-full transition-all duration-1000 ease-linear"
                style={{ 
                  width: `${((autoUpdateDelay - countdown) / autoUpdateDelay) * 100}%` 
                }}
              />
            </div>
            <span className={`text-[10px] ${subTextColor} font-mono tabular-nums min-w-[28px] text-right`}>
              {countdown}s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition ${
              isUpdating 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-[#C9A84C] text-[#1A1F2E] hover:bg-[#E8D5A3]'
            }`}
          >
            {isUpdating ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border-2 border-[#1A1F2E] border-t-transparent rounded-full animate-spin"></span>
                Updating...
              </span>
            ) : (
              'Update Now'
            )}
          </button>
          <button
            onClick={handleLater}
            className={`text-[10px] ${subTextColor} hover:text-[#C9A84C] transition`}
          >
            Later
          </button>
        </div>
      </div>

      {/* ✅ CSS Animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}