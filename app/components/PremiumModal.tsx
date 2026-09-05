"use client";

import { useTheme } from "../context/ThemeContext";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (plan: 'monthly' | 'lifetime') => void;
  remainingQueries?: number;
}

export default function PremiumModal({ isOpen, onClose, onUpgrade, remainingQueries = 0 }: PremiumModalProps) {
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  const bgColor = darkMode ? "bg-[#0F1318]" : "bg-white";
  const cardBg = darkMode ? "bg-[#1A1F2E]" : "bg-[#F5F0EB]";
  const cardBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className={`${bgColor} border ${cardBorder} rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🙏</div>
          <h2 className={`text-2xl font-bold ${textColor}`}>Upgrade to Premium</h2>
          <p className={`text-sm ${subTextColor} mt-1`}>
            {remainingQueries > 0 
              ? `You have ${remainingQueries} free queries remaining today.`
              : "You've used all 10 free queries today!"}
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-4 mb-6">
          {/* Monthly Plan */}
          <div 
            className={`${cardBg} border ${cardBorder} rounded-xl p-4 cursor-pointer hover:border-[#C9A84C] transition group`}
            onClick={() => onUpgrade('monthly')}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-semibold ${textColor}`}>💎 Monthly Premium</h3>
                <p className={`text-xs ${subTextColor}`}>Unlimited queries + priority support</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#C9A84C]">$5</p>
                <p className={`text-xs ${subTextColor}`}>/month</p>
              </div>
            </div>
            <button className="mt-3 w-full bg-[#C9A84C] text-[#1A1F2E] py-2 rounded-lg hover:bg-[#E8D5A3] transition font-medium text-sm">
              Choose Monthly
            </button>
          </div>

          {/* Lifetime Plan */}
          <div 
            className={`${cardBg} border-2 border-[#C9A84C]/50 rounded-xl p-4 cursor-pointer hover:border-[#C9A84C] transition group`}
            onClick={() => onUpgrade('lifetime')}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`font-semibold ${textColor}`}>👑 Lifetime Premium</h3>
                <p className={`text-xs ${subTextColor}`}>Unlimited forever + all future features</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#C9A84C]">$49</p>
                <p className={`text-xs ${subTextColor}`}>one-time</p>
              </div>
            </div>
            <button className="mt-3 w-full bg-[#C9A84C] text-[#1A1F2E] py-2 rounded-lg hover:bg-[#E8D5A3] transition font-medium text-sm">
              Choose Lifetime
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs ${subTextColor}`}>
            🙏 Your support helps keep MANUSTRY free for everyone.
          </p>
          <button
            onClick={onClose}
            className={`text-xs ${subTextColor} hover:text-[#C9A84C] transition mt-2`}
          >
            Continue with free (limited queries)
          </button>
        </div>
      </div>
    </div>
  );
}