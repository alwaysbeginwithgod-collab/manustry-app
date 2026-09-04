"use client";

import { useTheme } from "../context/ThemeContext";

export default function AboutViewport() {
  const { darkMode } = useTheme();

  const cardBg = darkMode ? "bg-[#0F1318]" : "bg-white";
  const cardBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const highlightBg = darkMode ? "bg-[#1A1F2E]" : "bg-gray-100";
  const highlightText = darkMode ? "text-[#E8D5A3]" : "text-[#B89A3A]";
  const goldText = "text-[#C9A84C]";

  return (
    <div className="h-full overflow-y-auto w-full max-w-4xl mx-auto px-6 py-6">
      {/* Main Card */}
      <div className={`${cardBg} border ${cardBorder} rounded-2xl p-8 md:p-10 shadow-xl`}>
        
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-block px-6 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 text-xs font-medium text-[#C9A84C] tracking-widest uppercase mb-4">
            ✦ A Hand in Ministry ✦
          </div>
          <h1 className="font-playfair text-5xl md:text-6xl text-[#C9A84C] font-bold tracking-wide leading-tight">
            MANUSTRY
          </h1>
          <p className={`text-lg md:text-xl ${highlightText} font-light mt-2 tracking-wide`}>
            A Free KJV Bible Study Tool
          </p>
          <div className="flex justify-center items-center gap-3 mt-3">
            <span className="w-12 h-px bg-[#C9A84C]/30"></span>
            <span className={`text-xs ${subTextColor}`}>Launched September 5, 2026</span>
            <span className="w-12 h-px bg-[#C9A84C]/30"></span>
          </div>
        </div>

        {/* ============================================================
            WHY EVERY BELIEVER NEEDS MANUSTRY TODAY — FOMO DRIVER
            ============================================================ */}
        <div className={`${highlightBg} rounded-xl p-6 md:p-8 border-l-4 border-[#C9A84C] mb-8`}>
          <h2 className="font-playfair text-2xl md:text-3xl text-[#C9A84C] mb-3">
            Why Every Believer Needs MANUSTRY Today
          </h2>
          <p className={`text-sm md:text-base ${textColor} leading-relaxed`}>
            In a digital age flooded with misinformation, shallow teaching, and compromised doctrine, finding a trustworthy, free, and biblically sound study tool has never been harder — <span className="text-[#C9A84C] font-semibold">or more urgent.</span>
          </p>
          <blockquote className={`mt-4 pl-4 border-l-2 border-[#C9A84C]/40 italic text-sm ${highlightText}`}>
            "My people are destroyed for lack of knowledge..." — Hosea 4:6 (KJV)
          </blockquote>
        </div>

        {/* ============================================================
            HOW DID IT START
            ============================================================ */}
        <div className="mb-8">
          <h2 className="font-playfair text-2xl md:text-3xl text-[#C9A84C] mb-3 flex items-center gap-2">
            <span className="text-2xl">🕊️</span> How Did It Start
          </h2>
          <p className={`text-sm md:text-base ${subTextColor} leading-relaxed`}>
            MANUSTRY is a dedicated Bible study tool, born from the burden of a preacher who saw countless believers struggling to find reliable, free, and doctrinally sound Bible study tools. Many resources are either too expensive, theologically compromised, or buried under confusing interfaces.
          </p>
          <p className={`text-sm md:text-base ${subTextColor} leading-relaxed mt-3`}>
            With much prayer and reliance on God's grace, MANUSTRY was developed to fill this gap. What started as a personal project has now become a free gift to the body of Christ worldwide.
          </p>
          <blockquote className={`mt-4 pl-4 border-l-2 border-[#C9A84C]/40 italic text-sm ${highlightText}`}>
            "Not by might, nor by power, but by my spirit, saith the LORD." — Zechariah 4:6 (KJV)
          </blockquote>
        </div>

        {/* ============================================================
            WHAT IS MANUSTRY
            ============================================================ */}
        <div className={`${highlightBg} rounded-xl p-6 md:p-8 mb-8 border border-[#C9A84C]/20`}>
          <h2 className="font-playfair text-2xl md:text-3xl text-[#C9A84C] mb-3">
            What Is MANUSTRY?
          </h2>
          <p className={`text-sm md:text-base ${textColor} leading-relaxed`}>
            <span className="font-semibold text-[#C9A84C]">MANUSTRY</span> = <span className="italic">MANUS</span> (Latin for <span className="italic">"Hand"</span>) + <span className="italic">MINISTRY</span> (<span className="italic">"To Serve"</span>)
          </p>
          <p className={`text-lg md:text-xl ${highlightText} font-light mt-2 tracking-wide`}>
            ✦ This is <span className="text-[#C9A84C] font-semibold">"A Hand in Ministry"</span> ✦
          </p>
        </div>

        {/* ============================================================
            OUR PURPOSE
            ============================================================ */}
        <div className="mb-8">
          <h2 className="font-playfair text-2xl md:text-3xl text-[#C9A84C] mb-3">
            Our Purpose
          </h2>
          <p className={`text-sm md:text-base ${subTextColor} leading-relaxed`}>
            Every feature, every response, every resource is designed to point you back to Scripture — <span className="text-[#C9A84C] font-semibold">not to entertain, but to equip.</span> Not to replace your Bible, but to help you love it more.
          </p>
        </div>

        {/* ============================================================
            KEY FEATURES — FOMO DRIVER
            ============================================================ */}
        <div className={`${highlightBg} rounded-xl p-6 md:p-8 mb-8 border-l-4 border-[#C9A84C]`}>
          <h2 className="font-playfair text-2xl md:text-3xl text-[#C9A84C] mb-3">
            ✦ What You Get ✦
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: "📖", label: "KJV Bible Study with AI assistance" },
              { icon: "🙏", label: "Daily Devotions with Scripture & Prayer" },
              { icon: "✍️", label: "Writer Workspace for Sermons & Devotions" },
              { icon: "📚", label: "Webster's 1828 Dictionary" },
              { icon: "📕", label: "Bookshelf with Study Resources" },
              { icon: "🔄", label: "Cross-device Chat History Sync" },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#C9A84C]/5 transition">
                <span className="text-lg">{feature.icon}</span>
                <span className={`text-sm ${textColor}`}>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            CALL TO ACTION — FOMO DRIVER
            ============================================================ */}
        <div className="text-center pt-6 border-t border-[#C9A84C]/20 mb-8">
          <p className={`text-base ${textColor} leading-relaxed max-w-2xl mx-auto`}>
            Don't let another day pass without digging deeper into God's Word.
          </p>
          <p className={`text-sm ${subTextColor} mt-2 max-w-2xl mx-auto`}>
            Use it freely. Share it freely. Grow in grace and in the knowledge of our Lord Jesus Christ.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-8 py-3 bg-[#C9A84C] text-[#1A1F2E] font-semibold rounded-lg hover:bg-[#E8D5A3] transition shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            Start Studying Now →
          </a>
        </div>

        {/* ============================================================
            FOOTER
            ============================================================ */}
        <div className="text-center pt-6 border-t border-[#C9A84C]/20">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="w-16 h-px bg-[#C9A84C]/30"></div>
            <span className="text-[#C9A84C] text-sm tracking-widest">✦ ✦ ✦</span>
            <div className="w-16 h-px bg-[#C9A84C]/30"></div>
          </div>

          <p className={`text-sm italic ${highlightText} max-w-2xl mx-auto`}>
            "I am just a pen here. Any glory in MANUSTRY does not belong to me but to our Lord and Saviour Jesus Christ alone."
          </p>

          <p className={`text-sm italic ${subTextColor} mt-4`}>
            "A dose of God's Word a day, will keep you going all day."
          </p>

          <a
            href="https://www.facebook.com/BeginWithGod/"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${goldText} hover:text-[#E8D5A3] transition inline-block mt-1 font-medium`}
          >
            — ALWAYS BEGIN WITH GOD —
          </a>

          <div className={`mt-6 pt-4 border-t border-[#C9A84C]/10 text-center`}>
            <p className={`text-[10px] leading-relaxed ${subTextColor}`}>
              *This is not a replacement for the infallible Word of God.
              <br />
              The Bible is still the final Authority in all matters of our faith and practice.
            </p>
            <p className={`text-[10px] ${subTextColor} mt-3`}>
              © 2026 MANUSTRY. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}