"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ScriptureLinkProps {
  reference: string;
  children: React.ReactNode;
}

// Map of common abbreviations to full book names
const BOOK_ABBREVIATIONS: { [key: string]: string } = {
  'gn': 'Genesis', 'gen': 'Genesis', 'ge': 'Genesis',
  'ex': 'Exodus', 'exod': 'Exodus',
  'lev': 'Leviticus',
  'nu': 'Numbers', 'num': 'Numbers',
  'de': 'Deuteronomy', 'deut': 'Deuteronomy',
  'jos': 'Joshua', 'josh': 'Joshua',
  'jud': 'Judges', 'jdg': 'Judges',
  'ru': 'Ruth',
  '1 sa': '1 Samuel', '1 sam': '1 Samuel',
  '2 sa': '2 Samuel', '2 sam': '2 Samuel',
  '1 ki': '1 Kings', '1 kin': '1 Kings',
  '2 ki': '2 Kings', '2 kin': '2 Kings',
  '1 ch': '1 Chronicles', '1 chr': '1 Chronicles',
  '2 ch': '2 Chronicles', '2 chr': '2 Chronicles',
  'ezr': 'Ezra',
  'ne': 'Nehemiah', 'neh': 'Nehemiah',
  'es': 'Esther', 'esth': 'Esther',
  'job': 'Job',
  'ps': 'Psalm', 'psa': 'Psalm',
  'pr': 'Proverbs', 'prov': 'Proverbs',
  'ec': 'Ecclesiastes', 'ecc': 'Ecclesiastes', 'eccl': 'Ecclesiastes',
  'so': 'Song of Solomon', 'song': 'Song of Solomon',
  'isa': 'Isaiah', 'is': 'Isaiah',
  'jer': 'Jeremiah',
  'la': 'Lamentations', 'lam': 'Lamentations',
  'ez': 'Ezekiel', 'ezek': 'Ezekiel',
  'dan': 'Daniel',
  'hos': 'Hosea',
  'joe': 'Joel', 'joel': 'Joel',
  'amos': 'Amos',
  'ob': 'Obadiah', 'obad': 'Obadiah',
  'jon': 'Jonah', 'jonah': 'Jonah',
  'mic': 'Micah',
  'nah': 'Nahum',
  'hab': 'Habakkuk',
  'zep': 'Zephaniah',
  'hag': 'Haggai',
  'zac': 'Zechariah', 'zech': 'Zechariah',
  'mal': 'Malachi',
  'mt': 'Matthew', 'matt': 'Matthew',
  'mk': 'Mark',
  'lu': 'Luke', 'luke': 'Luke',
  'jn': 'John', 'joh': 'John',
  'ac': 'Acts',
  'ro': 'Romans', 'rom': 'Romans',
  '1 co': '1 Corinthians', '1 cor': '1 Corinthians',
  '2 co': '2 Corinthians', '2 cor': '2 Corinthians',
  'ga': 'Galatians', 'gal': 'Galatians',
  'ep': 'Ephesians', 'eph': 'Ephesians',
  'php': 'Philippians',
  'col': 'Colossians',
  '1 th': '1 Thessalonians', '1 thes': '1 Thessalonians',
  '2 th': '2 Thessalonians', '2 thes': '2 Thessalonians',
  '1 ti': '1 Timothy', '1 tim': '1 Timothy',
  '2 ti': '2 Timothy', '2 tim': '2 Timothy',
  'tit': 'Titus',
  'phm': 'Philemon',
  'he': 'Hebrews', 'heb': 'Hebrews',
  'jas': 'James',
  '1 pe': '1 Peter', '1 pet': '1 Peter',
  '2 pe': '2 Peter', '2 pet': '2 Peter',
  '1 joh': '1 John', '1 jn': '1 John',
  '2 joh': '2 John', '2 jn': '2 John',
  '3 joh': '3 John', '3 jn': '3 John',
  'jude': 'Jude',
  're': 'Revelation', 'rev': 'Revelation',
};

function expandBookReference(ref: string): string {
  let expanded = ref;
  const lowerRef = ref.toLowerCase();
  for (const [abbr, full] of Object.entries(BOOK_ABBREVIATIONS)) {
    if (lowerRef.startsWith(abbr + ' ')) {
      expanded = full + ' ' + ref.substring(abbr.length + 1);
      break;
    }
  }
  return expanded;
}

function cleanScriptureReference(ref: string): string {
  let cleaned = ref;
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = expandBookReference(cleaned);
  cleaned = cleaned.replace(/Ch\./g, 'Chronicles');
  cleaned = cleaned.replace(/Cor\./g, 'Corinthians');
  cleaned = cleaned.replace(/Thes\./g, 'Thessalonians');
  cleaned = cleaned.replace(/Tim\./g, 'Timothy');
  cleaned = cleaned.replace(/Pet\./g, 'Peter');
  cleaned = cleaned.replace(/John\./g, 'John');
  cleaned = cleaned.replace(/Sam\./g, 'Samuel');
  cleaned = cleaned.replace(/Kings\./g, 'Kings');
  cleaned = cleaned.replace(/([A-Za-z]+)\./g, '$1');
  return cleaned.trim();
}

export default function ScriptureLink({ reference, children }: ScriptureLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [verseText, setVerseText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const linkRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Set mounted state for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const fetchScripture = async () => {
    if (verseText) return;
    setIsLoading(true);
    try {
      const cleanRef = cleanScriptureReference(reference);
      const formattedRef = cleanRef.replace(/\s+/g, '+');
      const response = await fetch(
        `https://dailybible.ca/api/${formattedRef}?translation=kjv`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.verses && data.verses.length > 0) {
          let text = "";
          data.verses.forEach((v: any) => {
            text += `${v.text} `;
          });
          setVerseText(text.trim());
        } else if (data.text) {
          setVerseText(data.text);
        } else {
          setVerseText("Scripture not found.");
        }
      } else {
        try {
          const fallbackRef = cleanRef.replace(/:/g, ' ');
          const fallbackFormatted = fallbackRef.replace(/\s+/g, '+');
          const fallbackResponse = await fetch(
            `https://dailybible.ca/api/${fallbackFormatted}?translation=kjv`
          );
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            if (data.verses && data.verses.length > 0) {
              let text = "";
              data.verses.forEach((v: any) => {
                text += `${v.text} `;
              });
              setVerseText(text.trim());
            } else if (data.text) {
              setVerseText(data.text);
            } else {
              setVerseText("Scripture not found.");
            }
          } else {
            setVerseText("Scripture not found.");
          }
        } catch {
          setVerseText("Unable to fetch scripture.");
        }
      }
    } catch (error) {
      console.error("Scripture fetch error:", error);
      setVerseText("Error fetching scripture.");
    }
    setIsLoading(false);
  };

  // Smart positioning - ensures popup stays within viewport
  const calculatePosition = (clickedElement: HTMLElement) => {
    const rect = clickedElement.getBoundingClientRect();
    const popupWidth = 320;
    const popupHeight = 300;
    const margin = 16;

    let top = rect.bottom + window.scrollY + margin;
    let left = rect.left + window.scrollX + (rect.width / 2) - (popupWidth / 2);

    // Check if popup goes below viewport
    if (top + popupHeight > window.innerHeight + window.scrollY) {
      // Place above the clicked element
      top = rect.top + window.scrollY - popupHeight - margin;
    }

    // Check if popup goes above viewport
    if (top < window.scrollY + margin) {
      top = window.scrollY + margin;
    }

    // Check if popup goes off right side
    if (left + popupWidth > window.innerWidth + window.scrollX - margin) {
      left = window.innerWidth + window.scrollX - popupWidth - margin;
    }

    // Check if popup goes off left side
    if (left < window.scrollX + margin) {
      left = window.scrollX + margin;
    }

    return { top, left };
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      fetchScripture();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const pos = calculatePosition(e.currentTarget as HTMLElement);
      setPosition(pos);
    }
    setIsOpen(!isOpen);
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    if (!popupRef.current) return;
    setIsDragging(true);
    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging || !popupRef.current) return;
      const newTop = e.clientY + window.scrollY - dragOffset.y;
      const newLeft = e.clientX + window.scrollX - dragOffset.x;
      setPosition({ top: newTop, left: newLeft });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, dragOffset]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && linkRef.current && !linkRef.current.contains(e.target as Node)) {
        if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopy = () => {
    const copyText = `${reference}\nKing James Version (KJV)\n"${verseText}"`;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Popup content to be rendered via portal
  const popupContent = mounted && isOpen ? createPortal(
    <div 
      ref={popupRef}
      className={`fixed z-[9999] w-80 max-w-[90vw] bg-[#0F1318] dark:bg-[#1A1F2E] border border-[#C9A84C]/30 rounded-lg shadow-2xl p-3 text-white ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
      style={{
        top: position.top,
        left: position.left,
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Draggable Header */}
      <div 
        className="flex justify-between items-start cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
      >
        <span className="font-semibold text-[#C9A84C] text-xs flex items-center gap-1">
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          {reference}
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition flex-shrink-0 ml-2 text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="text-[10px] text-gray-400 mt-0.5">
        King James Version (KJV)
      </div>
      
      <div className="mt-1.5 max-h-[200px] overflow-y-auto">
        {isLoading ? (
          <span className="text-xs text-gray-500">Loading...</span>
        ) : (
          <span className="text-xs text-gray-300 leading-relaxed italic">
            "{verseText || "Click to load scripture..."}"
          </span>
        )}
      </div>
      
      {!isLoading && verseText && (
        <div className="mt-2 pt-1.5 border-t border-[#C9A84C]/20 flex justify-end">
          <button
            onClick={handleCopy}
            className="text-[10px] text-[#C9A84C] hover:text-[#E8D5A3] transition flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <span ref={linkRef} className="inline-block relative">
      <span
        onClick={handleClick}
        className="text-[#C9A84C] hover:text-[#E8D5A3] cursor-pointer transition font-bold underline decoration-[#C9A84C]/30 hover:decoration-[#E8D5A3] underline-offset-2"
      >
        {children}
      </span>
      {popupContent}
    </span>
  );
}