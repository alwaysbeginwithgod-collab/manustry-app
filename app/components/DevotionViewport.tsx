"use client";

import { useTheme } from "../context/ThemeContext";
import { devotions, Devotion } from "../data/devotions";
import { useState, useEffect } from "react";

export default function DevotionViewport() {
  const { darkMode } = useTheme();
  const [todayDevotion, setTodayDevotion] = useState<Devotion | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    const index = dayOfYear % devotions.length;
    setCurrentIndex(index);
    setTodayDevotion(devotions[index]);
  }, []);

  const cardBg = darkMode ? "bg-[#0F1318]" : "bg-white";
  const cardBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const goldText = darkMode ? "text-[#E8D5A3]" : "text-[#B89A3A]";

  const formatTextWithScripture = (text: string) => {
    const parts = text.split(/(\"[^\"]+\"|“[^”]+”)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('"') || part.startsWith('“')) {
        return <span key={index} className="italic text-inherit">{part}</span>;
      }
      
      const scriptureRefPattern = /\b([1-3]?\s?[A-Za-z]+)\s(\d+):(\d+)(?:-(\d+))?\b/g;
      
      let lastIndex = 0;
      const result = [];
      let match;
      
      scriptureRefPattern.lastIndex = 0;
      
      while ((match = scriptureRefPattern.exec(part)) !== null) {
        if (match.index > lastIndex) {
          result.push(
            <span key={`text-${index}-${lastIndex}`}>
              {part.substring(lastIndex, match.index)}
            </span>
          );
        }
        
        const fullRef = match[0];
        result.push(
          <span key={`ref-${index}-${match.index}`} className="font-bold text-[#C9A84C]">
            {fullRef}
          </span>
        );
        
        lastIndex = match.index + fullRef.length;
      }
      
      if (lastIndex < part.length) {
        result.push(
          <span key={`text-${index}-end`}>
            {part.substring(lastIndex)}
          </span>
        );
      }
      
      if (result.length === 0) {
        return <span key={index}>{part}</span>;
      }
      
      return <span key={index}>{result}</span>;
    });
  };

  const renderContent = (content: string) => {
    const parts = content.split(/\n---\n|\n— SCENE BREAK —\n/);
    
    return parts.map((part, index) => {
      const paragraphs = part.split('\n\n').filter(p => p.trim());
      
      return (
        <div key={index}>
          {paragraphs.map((para, pIndex) => (
            <p key={pIndex} className={`text-sm leading-relaxed ${textColor} mb-3`}>
              {formatTextWithScripture(para)}
            </p>
          ))}
          {index < parts.length - 1 && (
            <div className="flex justify-center my-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-[#C9A84C]/30"></div>
                <span className="text-[#C9A84C] text-sm tracking-widest">✦ ✦ ✦</span>
                <div className="w-12 h-px bg-[#C9A84C]/30"></div>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Daily Devotion: ${todayDevotion?.title}`);
    const text = encodeURIComponent(`"${todayDevotion?.tagline}" - Read more at MANUSTRY`);
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
      email: `mailto:?subject=${title}&body=${text}%0A%0ARead more: ${url}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
    setShowShareMenu(false);
  };

  if (!todayDevotion) {
    return (
      <div className="h-full overflow-y-auto w-full max-w-3xl mx-auto px-4 py-4">
        <div className="text-center mb-6">
          <h2 className="font-playfair text-3xl md:text-4xl text-[#C9A84C]">
            Daily Devotion
          </h2>
          <p className={`text-xs ${subTextColor} mt-1`}>
            Loading devotion...
          </p>
        </div>
        <div className={`${cardBg} border ${cardBorder} rounded-lg p-12 text-center`}>
          <p className={subTextColor}>Loading devotion...</p>
        </div>
      </div>
    );
  }

  const dayNumber = currentIndex + 1;
  const totalDevotions = devotions.length;
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="h-full overflow-y-auto w-full max-w-3xl mx-auto px-4 py-4">
      {/* ✅ UPDATED HEADER */}
      <div className="text-center mb-6">
        <h2 className="font-playfair text-3xl md:text-4xl text-[#C9A84C]">
          Daily Devotion
        </h2>
        <div className="flex justify-center items-center gap-2 mt-1">
          <p className={`text-xs text-[#C9A84C`}>
            ✦ {formattedDate} ✦
          </p>
        </div>
        <div className="flex justify-center items-center gap-2 mt-1">
          <p className={`text-xs ${subTextColor}`}>
            Day {dayNumber} of {totalDevotions}
          </p>
        </div>
      </div>

      {/* Devotion Card */}
      <div className={`${cardBg} border ${cardBorder} rounded-lg p-6`}>
        {/* Image */}
        {todayDevotion.image && (
          <div className="w-full rounded-lg overflow-hidden mb-6 bg-[#1A1F2E] border border-[#C9A84C]/10">
            <img
              src={todayDevotion.image}
              alt={todayDevotion.title}
              className="w-full h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-devotion.jpg";
              }}
            />
          </div>
        )}

        {/* Title */}
        <h3 className={`font-playfair text-3xl md:text-5xl text-[#C9A84C] text-center mb-4 font-bold`}>
          {todayDevotion.title}
        </h3>

        {/* Tagline (Rhyming Quote) */}
        {todayDevotion.tagline && (
          <div className="mb-6 text-center">
            <p className={`text-sm italic ${goldText} whitespace-pre-line`}>
              {todayDevotion.tagline}
            </p>
          </div>
        )}

        {/* Scripture Reference */}
        {todayDevotion.scripture && (
          <div className="mb-6 p-4 border-l-4 border-[#C9A84C] bg-[#C9A84C]/5 rounded-r-lg">
            <p className={`text-base font-medium ${goldText}`}>
              {todayDevotion.scripture}
            </p>
          </div>
        )}

        {/* Content with Scene Breaks */}
        <div className="space-y-2">
          {renderContent(todayDevotion.content)}
        </div>

        {/* Prayer */}
        {todayDevotion.prayer && (
          <div className="mt-6 p-4 bg-[#1A1F2E] rounded-lg border border-[#C9A84C]/10">
            <p className={`text-sm leading-relaxed ${textColor}`}>
              <span className="text-[#C9A84C] font-semibold">🙏 Prayer:</span> {todayDevotion.prayer}
            </p>
          </div>
        )}

        {/* ✅ UPDATED FOOTER */}
        <div className="mt-6 pt-4 border-t border-[#C9A84C]/20 text-center">
          <p className={`text-sm italic ${subTextColor}`}>
            "A dose of God's Word a day, will keep you going all day."
          </p>
          <a
            href={todayDevotion.facebookLink || "https://www.facebook.com/BeginWithGod/"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#C9A84C] hover:text-[#E8D5A3] transition mt-1 inline-block"
          >
            — ALWAYS BEGIN WITH GOD —
          </a>

          {/* Share Buttons */}
          <div className="mt-4 flex justify-center items-center gap-3 flex-wrap">
            <div className="relative inline-block">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="text-xs text-[#C9A84C] hover:text-[#E8D5A3] transition border border-[#C9A84C]/30 px-3 py-1 rounded hover:bg-[#C9A84C]/10"
              >
                📤 Share this devotion
              </button>
              
              {showShareMenu && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#1A1F2E] border border-[#C9A84C]/30 rounded-lg shadow-xl p-2 flex gap-2 whitespace-nowrap z-10">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="text-xs bg-[#1877F2] text-white px-3 py-1 rounded hover:opacity-80 transition"
                  >
                    📘 Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="text-xs bg-[#000000] text-white px-3 py-1 rounded hover:opacity-80 transition"
                  >
                    🐦 X
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="text-xs bg-[#25D366] text-white px-3 py-1 rounded hover:opacity-80 transition"
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="text-xs bg-[#EA4335] text-white px-3 py-1 rounded hover:opacity-80 transition"
                  >
                    ✉️ Email
                  </button>
                </div>
              )}
            </div>

            {todayDevotion.facebookLink && (
              <a
                href={todayDevotion.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#C9A84C] hover:text-[#E8D5A3] transition border border-[#C9A84C]/30 px-3 py-1 rounded hover:bg-[#C9A84C]/10"
              >
                📘 More on Facebook
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}