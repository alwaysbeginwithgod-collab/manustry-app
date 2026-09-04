"use client";

import { useTheme } from "../context/ThemeContext";
import { useState, useRef, useMemo, useEffect } from "react";
import { BIBLE_BOOKS, KJV_BOOKS, APOCRYPHA_BOOKS, bookShortcodes } from "../data/bible";
import ScriptureLink from "./ScriptureLink";

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function expandBookName(input: string): string {
  const match = input.match(/^([a-zA-Z0-9]+)\s+(.+)$/);
  if (!match) return input;
  const bookPart = match[1].toLowerCase();
  const rest = match[2];
  const fullBook = bookShortcodes[bookPart];
  return fullBook ? `${fullBook} ${rest}` : input;
}

function formatBibleReference(input: string): string {
  const expanded = expandBookName(input);
  const match = expanded.match(/^(.+?)\s+(\d+)\s+(\d+)\s*-\s*(\d+)$/);
  if (match) {
    return `${match[1]} ${match[2]}:${match[3]}-${match[4]}`;
  }
  const match2 = expanded.match(/^(.+?)\s+(\d+)\s+(\d+)$/);
  if (match2) {
    return `${match2[1]} ${match2[2]}:${match2[3]}`;
  }
  return expanded;
}

function getCleanBookName(bookName: string): string | null {
  if (!bookName) return null;
  
  for (const apocrypha of APOCRYPHA_BOOKS) {
    if (bookName.includes(apocrypha) || apocrypha.includes(bookName)) {
      return null;
    }
  }
  
  for (const kjvBook of KJV_BOOKS) {
    if (bookName.includes(kjvBook) || kjvBook.includes(bookName)) {
      return kjvBook;
    }
  }
  
  const lowerBook = bookName.toLowerCase();
  for (const [shortcode, fullName] of Object.entries(bookShortcodes)) {
    if (lowerBook.includes(shortcode) || shortcode.includes(lowerBook)) {
      return fullName;
    }
  }
  
  const knownVariations: { [key: string]: string } = {
    'song of solomon': 'Song of Solomon',
    '1 sam': '1 Samuel', '2 sam': '2 Samuel',
    '1 kin': '1 Kings', '2 kin': '2 Kings',
    '1 chr': '1 Chronicles', '2 chr': '2 Chronicles',
    '1 cor': '1 Corinthians', '2 cor': '2 Corinthians',
    '1 thes': '1 Thessalonians', '2 thes': '2 Thessalonians',
    '1 tim': '1 Timothy', '2 tim': '2 Timothy',
    '1 pet': '1 Peter', '2 pet': '2 Peter',
    '1 john': '1 John', '2 john': '2 John', '3 john': '3 John'
  };
  
  const lower = bookName.toLowerCase();
  for (const [key, value] of Object.entries(knownVariations)) {
    if (lower.includes(key) || key.includes(lower)) {
      return value;
    }
  }
  
  return null;
}

function parseSearchQuery(query: string): { terms: string[], phrases: string[], operator: 'AND' | 'OR', nearDistance?: number } {
  let operator: 'AND' | 'OR' = 'AND';
  let nearDistance: number | undefined = undefined;
  let modifiedQuery = query;
  
  const normalized = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  
  const nearMatch = normalized.match(/\bNEAR\/(\d+)\b/i);
  if (nearMatch) {
    nearDistance = parseInt(nearMatch[1]);
    modifiedQuery = normalized.replace(/\bNEAR\/\d+\b/i, '');
    operator = 'AND';
  }
  
  if (modifiedQuery.includes(' or ')) {
    operator = 'OR';
    modifiedQuery = modifiedQuery.replace(/ or /g, ' ');
  }
  
  const phraseMatches = modifiedQuery.match(/"([^"]*)"/g);
  const phrases: string[] = phraseMatches ? phraseMatches.map(p => p.slice(1, -1).trim()) : [];
  
  let termsQuery = modifiedQuery.replace(/"([^"]*)"/g, '');
  
  const trimmedQuery = termsQuery.trim();
  if (trimmedQuery.length > 0) {
    const words = trimmedQuery.split(/\s+/);
    const hasAnd = trimmedQuery.includes(' and ');
    const hasOr = trimmedQuery.includes(' or ');
    
    if (words.length >= 3 && !hasAnd && !hasOr) {
      phrases.push(trimmedQuery);
      termsQuery = '';
    }
  }
  
  const terms = termsQuery.split(/\s+/).filter(t => t.length > 0);
  
  return { terms, phrases, operator, nearDistance };
}

function textMatchesSearch(text: string, searchQuery: string): boolean {
  const lowerText = text.toLowerCase();
  const { terms, phrases, operator } = parseSearchQuery(searchQuery);
  const lowerTerms = terms.map(t => t.toLowerCase());
  const lowerPhrases = phrases.map(p => p.toLowerCase());
  
  const phraseMatches = lowerPhrases.every(phrase => lowerText.includes(phrase));
  if (!phraseMatches) return false;
  
  if (terms.length === 0) return phraseMatches;
  
  if (operator === 'AND') {
    return lowerTerms.every(term => lowerText.includes(term));
  } else {
    return lowerTerms.some(term => lowerText.includes(term));
  }
}

// ============================================================
// COPY SVG ICON
// ============================================================
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

function highlightText(text: string, searchWord: string): string {
  if (!searchWord) return text;
  const { terms, phrases } = parseSearchQuery(searchWord);
  let highlighted = text;
  
  phrases.forEach(phrase => {
    const regex = new RegExp(`(${phrase})`, 'gi');
    highlighted = highlighted.replace(regex, '<span class="text-[#C9A84C] font-bold">$1</span>');
  });
  
  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<span class="text-[#C9A84C] font-bold">$1</span>');
  });
  
  return highlighted;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ToolsViewport() {
  const { darkMode } = useTheme();

  // State
  const [activeTool, setActiveTool] = useState("bible");
  const [bibleQuery, setBibleQuery] = useState("");
  const [bibleResult, setBibleResult] = useState("");
  const [bibleRef, setBibleRef] = useState("");
  const [wordQuery, setWordQuery] = useState("");
  const [wordResult, setWordResult] = useState("");
  const [wordVerses, setWordVerses] = useState<Array<{book: string, chapter: number, verse: number, text: string}>>([]);
  const [wordStats, setWordStats] = useState<{ot: number, nt: number, total: number} | null>(null);
  const [dictionaryResults, setDictionaryResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number | null>(null);
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
  const [dictResult, setDictResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [source, setSource] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Theme
  const cardBg = darkMode ? "bg-[#0F1318]" : "bg-white";
  const cardBorder = darkMode ? "border-[#C9A84C]/20" : "border-[#C9A84C]/30";
  const textColor = darkMode ? "text-gray-300" : "text-[#1A1F2E]";
  const subTextColor = darkMode ? "text-gray-400" : "text-gray-600";
  const inputBg = darkMode ? "bg-[#1A1F2E]" : "bg-gray-100";
  const toolBg = darkMode ? "bg-[#1A1F2E]" : "bg-gray-50";
  const activeToolBg = darkMode ? "bg-[#C9A84C]/20" : "bg-[#C9A84C]/10";
  const resultBg = darkMode ? "bg-[#0F1318]" : "bg-gray-50";
  const goldText = "text-[#C9A84C]";

  const tools = [
    { id: "bible", label: "🕮 Scripture Lookup", desc: "Cross-reference verses" },
    { id: "word", label: "🔍 Word Search", desc: "Count OT/NT occurrences" },
    { id: "dictionary", label: "📚 Dictionary", desc: "Define any word" },
    { id: "references", label: "📚 References", desc: "Study resources" },
  ];

  useEffect(() => {
    return () => {
      // Cleanup
    };
  }, []);

  // ============================================================
  // TOOL 1: SCRIPTURE LOOKUP
  // ============================================================
  const searchScripture = async () => {
    if (!bibleQuery.trim()) return;
    setIsLoading(true);
    setBibleResult("");
    setBibleRef("");

    try {
      const formattedQuery = formatBibleReference(bibleQuery.trim());
      const encodedQuery = encodeURIComponent(formattedQuery.replace(/ /g, '+'));
      const apiUrl = `https://dailybible.ca/api/${encodedQuery}?translation=kjv`;

      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.verses && data.verses.length > 0) {
          let formattedText = "";
          const ref = data.reference || formattedQuery;
          
          data.verses.forEach((v: any, index: number) => {
            const superscriptMap: { [key: string]: string } = {
              '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
              '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
            };
            const superscript = v.verse.toString().split('').map(d => superscriptMap[d] || d).join('');
            formattedText += `${superscript} ${v.text}`;
            if (index < data.verses.length - 1) formattedText += '\n';
          });
          
          setBibleRef(ref);
          setBibleResult(formattedText);
        } else if (data.text) {
          setBibleRef(data.reference || formattedQuery);
          setBibleResult(`"${data.text}"`);
        } else {
          setBibleResult(`"${formattedQuery}" — Not found.`);
        }
      } else {
        setBibleResult(`"${formattedQuery}" — Not found.`);
      }
    } catch (error) {
      console.error('Scripture API error:', error);
      setBibleResult(`Unable to fetch scripture. Please try again.`);
    }
    setIsLoading(false);
  };

// ============================================================
// TOOL 2: WORD SEARCH (Using Convex KJV)
// ============================================================
const searchWord = async () => {
  if (!wordQuery.trim()) return;
  setIsSearching(true);
  setWordResult("");
  setWordVerses([]);
  setWordStats(null);
  setSelectedVerseIndex(null);
  setExpandedBooks(new Set());

  try {
    let query = wordQuery.trim();
    let isPhrase = false;
    let searchTerms = query;
    
    // Check if it's a phrase search (enclosed in quotes)
    if (query.startsWith('"') && query.endsWith('"')) {
      searchTerms = query.slice(1, -1);
      isPhrase = true;
    }
    
    console.log(`🔍 Searching Convex for: "${searchTerms}" (Phrase: ${isPhrase})`);
    
    // Search in Convex
    const response = await fetch('/api/kjv-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: searchTerms,
        isPhrase: isPhrase,
        limit: 1000,
      }),
    });
    
    let results: any[] = [];
    
    if (response.ok) {
      const data = await response.json();
      results = data.results || [];
    }
    
    console.log(`📊 Found ${results.length} matching verses`);
    
    // Process results
    if (results.length > 0) {
      let otCount = 0, ntCount = 0;
      const otBooks = BIBLE_BOOKS.ot;
      const ntBooks = BIBLE_BOOKS.nt;
      
      const allVerses: Array<{book: string, chapter: number, verse: number, text: string}> = [];
      
      results.forEach((result: any) => {
        const cleanBook = result.book || '';
        if (!cleanBook) return;
        
        if (otBooks.includes(cleanBook)) {
          otCount++;
        } else if (ntBooks.includes(cleanBook)) {
          ntCount++;
        } else {
          ntCount++;
        }
        
        allVerses.push({
          book: cleanBook,
          chapter: result.chapter || 0,
          verse: result.verse || 0,
          text: result.text || ''
        });
      });
      
      // Sort verses: by book order, then chapter, then verse
      const getBookOrder = (bookName: string): number => {
        const allBooks = [...otBooks, ...ntBooks];
        const index = allBooks.indexOf(bookName);
        return index === -1 ? 999 : index;
      };
      
      allVerses.sort((a, b) => {
        const bookOrderA = getBookOrder(a.book);
        const bookOrderB = getBookOrder(b.book);
        if (bookOrderA !== bookOrderB) return bookOrderA - bookOrderB;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verse - b.verse;
      });
      
      const total = otCount + ntCount;
      setWordStats({ ot: otCount, nt: ntCount, total });
      
      // Group by book
      const groupedByBook: { [key: string]: typeof allVerses } = {};
      allVerses.forEach(v => {
        if (!groupedByBook[v.book]) {
          groupedByBook[v.book] = [];
        }
        groupedByBook[v.book].push(v);
      });
      
      const sortedBooks: { book: string, isOT: boolean, verses: typeof allVerses }[] = [];
      const otBooksList = BIBLE_BOOKS.ot;
      const ntBooksList = BIBLE_BOOKS.nt;
      
      otBooksList.forEach(book => {
        if (groupedByBook[book]) {
          sortedBooks.push({ book, isOT: true, verses: groupedByBook[book] });
        }
      });
      
      ntBooksList.forEach(book => {
        if (groupedByBook[book]) {
          sortedBooks.push({ book, isOT: false, verses: groupedByBook[book] });
        }
      });
      
      setWordVerses(allVerses);
      
      // Build result text
      let resultText = `🔍 Word Search: "${query}"\n\n`;
      resultText += `📊 Count:\n`;
      resultText += `  • Old Testament: ${otCount}\n`;
      resultText += `  • New Testament: ${ntCount}\n`;
      resultText += `  • Total: ${total} occurrences\n\n`;
      resultText += `📖 Verses (${allVerses.length} total)\n`;
      
      const bookNames = sortedBooks.map(b => `${b.book} (${b.verses.length})`).join(', ');
      resultText += `  • ${sortedBooks.length} books: ${bookNames}\n`;
      
      setWordResult(resultText);
      setWordVerses(allVerses);
      
    } else {
      // No results found
      let suggestions = 'Try:\n• Using a different word\n• Using " " for exact phrases\n• Checking spelling';
      
      setWordResult(`🔍 Word Search: "${query}"\n\nNo occurrences found.\n\n${suggestions}`);
      setWordVerses([]);
      setWordStats(null);
    }
  } catch (error) {
    console.error('Word search error:', error);
    setWordResult(`Unable to complete word search. Please try again.`);
    setWordVerses([]);
    setWordStats(null);
  }
  setIsSearching(false);
};

  // Group verses by book for rendering
  const groupedVerses = useMemo(() => {
    const groups: { book: string, isOT: boolean, verses: typeof wordVerses }[] = [];
    const otBooksList = BIBLE_BOOKS.ot;
    const ntBooksList = BIBLE_BOOKS.nt;
    
    const uniqueBooks: string[] = [];
    [...otBooksList, ...ntBooksList].forEach(book => {
      if (wordVerses.some(v => v.book === book) && !uniqueBooks.includes(book)) {
        uniqueBooks.push(book);
      }
    });
    
    uniqueBooks.forEach(book => {
      const verses = wordVerses.filter(v => v.book === book);
      if (verses.length > 0) {
        const isOT = otBooksList.includes(book);
        groups.push({ book, isOT, verses });
      }
    });
    
    return groups;
  }, [wordVerses]);

  const toggleBook = (book: string) => {
    const newExpanded = new Set(expandedBooks);
    if (newExpanded.has(book)) {
      newExpanded.delete(book);
    } else {
      newExpanded.add(book);
    }
    setExpandedBooks(newExpanded);
  };

  const expandAll = () => {
    const allBooks = new Set(groupedVerses.map(g => g.book));
    setExpandedBooks(allBooks);
  };

  const collapseAll = () => {
    setExpandedBooks(new Set());
  };

  // ============================================================
  // COPY SINGLE VERSE
  // ============================================================
  const copySingleVerse = (verse: {book: string, chapter: number, verse: number, text: string}) => {
    const cleanText = verse.text.replace(/"/g, '').trim();
    const copyText = `“${cleanText}”\n  — ${verse.book} ${verse.chapter}:${verse.verse} (KJV)`;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============================================================
  // TOOL 3: SIMPLE DICTIONARY (Links to External Sources)
  // ============================================================
const searchDictionary = async () => {
  if (!searchInput.trim()) return;
  setIsLoading(true);
  setDictResult("");
  setSearchTime(null);
  setSource("");

  const startTime = Date.now();
  const word = searchInput.trim();

  try {
    const response = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`);
    
    if (response.ok) {
      const data = await response.json();
      const elapsed = Date.now() - startTime;
      setSearchTime(elapsed);
      setSource(data.source || "Dictionary");
      
      // ✅ Check if definitions exist
      if (data.definitions && Object.keys(data.definitions).length > 0) {
        let formattedText = '';
        const entries = Object.entries(data.definitions);
        
        entries.forEach(([dictName, definition], index) => {
          const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);
          
          formattedText += `${dictName}\n`;
          formattedText += `${capitalizedWord}\n`;
          formattedText += `${definition}\n`;
          if (index < entries.length - 1) {
            formattedText += `__________________________________________________________\n\n`;
          }
        });
        
        setDictResult(formattedText);
      } else {
        // No definitions found
        setDictResult(`No definition found for "${word}". Please try a different word.`);
      }
      
      setSearchInput('');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      
    } else {
      setDictResult(`Unable to fetch definition. Please try again.`);
    }
  } catch (error) {
    console.error('Dictionary error:', error);
    setDictResult(`Unable to fetch definition. Please try again.`);
  }
  setIsLoading(false);
};

// ============================================================
  // RENDER DICTIONARY CONTENT WITH SCRIPTURE LINKS
  // ============================================================
const renderDictionaryContent = (text: string) => {
  if (!text) return <div className="text-gray-500">No definition found.</div>;
  
  // ============================================================
  // Helper: Process scripture references and make them clickable
  // ============================================================
  const processLineWithScriptures = (line: string) => {
    if (!line) return line;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let fixedLine = line;
    
    // Map of book abbreviations to full names
    const bookMap: { [key: string]: string } = {
      'Rom': 'Romans', '1 Cor': '1 Corinthians', '2 Cor': '2 Corinthians',
      '1 Thes': '1 Thessalonians', '2 Thes': '2 Thessalonians',
      '1 Tim': '1 Timothy', '2 Tim': '2 Timothy',
      '1 Pet': '1 Peter', '2 Pet': '2 Peter',
      '1 John': '1 John', '2 John': '2 John', '3 John': '3 John',
      'Matt': 'Matthew', 'Rev': 'Revelation', 'Exod': 'Exodus',
      'Lev': 'Leviticus', 'Num': 'Numbers', 'Deut': 'Deuteronomy',
      'Ps': 'Psalm', 'Prov': 'Proverbs', 'Eccl': 'Ecclesiastes',
      'Isa': 'Isaiah', 'Jer': 'Jeremiah', 'Ezek': 'Ezekiel',
      'Dan': 'Daniel', 'Hos': 'Hosea', 'Joel': 'Joel',
      'Amos': 'Amos', 'Obad': 'Obadiah', 'Jonah': 'Jonah',
      'Mic': 'Micah', 'Nah': 'Nahum', 'Hab': 'Habakkuk',
      'Zeph': 'Zephaniah', 'Hag': 'Haggai', 'Zech': 'Zechariah',
      'Mal': 'Malachi', 'Mark': 'Mark', 'Luke': 'Luke',
      'John': 'John', 'Acts': 'Acts', 'Gal': 'Galatians',
      'Eph': 'Ephesians', 'Phil': 'Philippians', 'Col': 'Colossians',
      'Titus': 'Titus', 'Philem': 'Philemon', 'Heb': 'Hebrews',
      'Jas': 'James', 'Jude': 'Jude'
    };
    
    // Replace abbreviations with full names
    for (const [short, full] of Object.entries(bookMap)) {
      const regex = new RegExp(`\\b${short}\\b`, 'g');
      fixedLine = fixedLine.replace(regex, full);
    }
    
    // Handle patterns like "Gen. 1:1" → "Genesis 1:1"
    fixedLine = fixedLine.replace(/([A-Za-z]+)\.\s+(\d+):(\d+)/g, '$1 $2:$3');
    // Handle "Gn. 1:1" → "Genesis 1:1"
    fixedLine = fixedLine.replace(/\bGn\.\s+(\d+):(\d+)/g, 'Genesis $1:$2');
    // Handle "Jn 1:10" → "John 1:10"
    fixedLine = fixedLine.replace(/\bJn\s+(\d+):(\d+)/g, 'John $1:$2');
    // Handle "Isa. 22, 24, 29" - multiple chapters
    fixedLine = fixedLine.replace(/\bIsa\.\s+(\d+),\s*(\d+),\s*(\d+)/g, 'Isaiah $1, $2, $3');
    
    // Fix "rn" artifacts
    fixedLine = fixedLine.replace(/rn/g, ' ');
    
    // Find scripture references
    const scriptureRegex = /\b([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?\b/g;
    let match;
    scriptureRegex.lastIndex = 0;
    
    while ((match = scriptureRegex.exec(fixedLine)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className={textColor}>
            {fixedLine.substring(lastIndex, match.index)}
          </span>
        );
      }
      
      const fullRef = match[0];
      let displayRef = fullRef;
      
      for (const [short, full] of Object.entries(bookMap)) {
        if (displayRef.startsWith(short + ' ')) {
          displayRef = displayRef.replace(short + ' ', full + ' ');
          break;
        }
      }
      
      parts.push(
        <ScriptureLink key={`ref-${match.index}`} reference={displayRef}>
          <span className="font-bold text-[#C9A84C] hover:text-[#E8D5A3] transition whitespace-nowrap cursor-pointer underline decoration-[#C9A84C]/30 hover:decoration-[#E8D5A3] underline-offset-2">
            {displayRef}
          </span>
        </ScriptureLink>
      );
      
      lastIndex = match.index + fullRef.length;
    }
    
    if (lastIndex < fixedLine.length) {
      parts.push(
        <span key={`text-end`} className={textColor}>
          {fixedLine.substring(lastIndex)}
        </span>
      );
    }
    
    return parts.length > 0 ? <>{parts}</> : <span className={textColor}>{fixedLine}</span>;
  };
  
  // ============================================================
  // Check if it's a "not found" message
  // ============================================================
  if (text.includes('No definition found') || text.includes('Word Not Found')) {
    const lines = text.split('\n');
    return (
      <div className={`text-sm ${textColor} text-center`}>
        {lines.map((line, i) => {
          if (line.includes('No definition')) {
            return <p key={i} className="mb-2 font-semibold">{line}</p>;
          }
          return <p key={i} className="mb-2">{line}</p>;
        })}
        <div className="flex flex-wrap gap-2 justify-center items-center mt-4 pt-4 border-t border-[#C9A84C]/20">
          <a
            href={`https://kingjamesbibledictionary.com/Dictionary/${encodeURIComponent(searchInput)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${goldText} hover:text-[#E8D5A3] transition underline`}
          >
            King James Bible Dictionary
          </a>
          <span className={`text-xs ${subTextColor}`}>|</span>
          <a
            href={`https://webstersdictionary1828.com/Dictionary/${encodeURIComponent(searchInput)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${goldText} hover:text-[#E8D5A3] transition underline`}
          >
            Webster's 1828
          </a>
          <span className={`text-xs ${subTextColor}`}>|</span>
          <a
            href={`https://www.blueletterbible.org/search/dictionary/viewTopic.cfm?topic=${encodeURIComponent(searchInput)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${goldText} hover:text-[#E8D5A3] transition underline`}
          >
            Blue Letter Bible
          </a>
        </div>
        <p className={`text-xs ${subTextColor} mt-3`}>
          Click any link to view the definition in a new tab.
        </p>
      </div>
    );
  }
  
  // ============================================================
  // Check if text has scene breaks
  // ============================================================
  if (text.includes('__________________________________________________________')) {
    const sections = text.split('__________________________________________________________');
    const elements: React.ReactNode[] = [];
    
    sections.forEach((section, idx) => {
      if (section.trim()) {
        const lines = section.split('\n').filter(line => line.trim());
        let dictName = '';
        let word = '';
        let definitionLines: string[] = [];
        
        lines.forEach((line, lineIdx) => {
          if (line.includes('📚') || line.includes('📖') || line.includes('📗')) {
            dictName = line.trim();
          } else if (lineIdx === 1 && !line.includes('📚') && !line.includes('📖') && !line.includes('📗')) {
            word = line.trim();
          } else {
            definitionLines.push(line.trim());
          }
        });
        
        if (dictName) {
          elements.push(
            <div key={`section-${idx}`} className="mb-4">
              <div className="font-semibold text-[#C9A84C] text-base">{dictName}</div>
              {word && <div className="text-sm font-medium text-[#E8D5A3] mt-1">{word}</div>}
              {definitionLines.map((def, di) => (
                <div key={`def-${idx}-${di}`} className={`text-sm leading-relaxed ${textColor} mt-1 text-justify`}>
                  {processLineWithScriptures(def)}
                </div>
              ))}
            </div>
          );
        }
        
        if (idx < sections.length - 1) {
          elements.push(
            <hr key={`hr-${idx}`} className="border-t border-[#C9A84C]/20 my-4" />
          );
        }
      }
    });
    
    return <>{elements}</>;
  }
  
  // ============================================================
  // Normal definition display - simple formatting
  // ============================================================
  const lines = text.split('\n').filter(line => line.trim());
  
  return (
    <div className={`text-sm ${textColor} text-justify`}>
      {lines.map((line, i) => {
        // Check if line starts with a number (e.g., "1.")
        if (line.match(/^\d+\./)) {
          return <div key={i} className="mb-2">{line}</div>;
        }
        // Check if line has a dictionary name
        if (line.includes('📚')) {
          return <div key={i} className="font-semibold text-[#C9A84C] text-base mb-2">{line}</div>;
        }
        // Check if line has the word (capitalized)
        if (i === 0 && line.length < 30) {
          return <div key={i} className="text-lg font-semibold text-[#E8D5A3] mt-1 mb-2">{line}</div>;
        }
        return <p key={i} className="mb-2">{line}</p>;
      })}
    </div>
  );
};

  return (
    <div className="h-full overflow-y-auto w-full max-w-4xl mx-auto px-4 py-4">
      {/* Sticky Header */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-[#1A1F2E]' : 'bg-[#F5F0EB]'} pb-4`}>
        <div className="text-center">
          <h2 className="font-playfair text-3xl text-[#C9A84C]">📚 Study Tools</h2>
          <p className={`text-[#E8D5A3] text-base ${darkMode ? "" : "text-[#B89A3A]"}`}>
            Scripture lookup · Word search · Dictionary · Reference library
          </p>
          <p className={`text-sm ${subTextColor} mt-1 italic`}>
            All Scriptures grounded in the King James Version (KJV)
          </p>
        </div>
      </div>

      <div className={`${cardBg} border ${cardBorder} rounded-lg p-6`}>
        {/* Tool Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`px-4 py-3 rounded-lg text-sm transition text-left ${
                activeTool === tool.id
                  ? `${activeToolBg} border border-[#C9A84C] text-[#C9A84C]`
                  : `${toolBg} ${textColor} hover:bg-[#C9A84C]/10`
              }`}
            >
              <div className="font-medium">{tool.label}</div>
              <div className={`text-xs ${subTextColor}`}>{tool.desc}</div>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className={`${toolBg} rounded-lg p-4 min-h-[200px]`}>
          
          {/* TOOL 1: SCRIPTURE LOOKUP */}
          {activeTool === "bible" && (
            <div>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  value={bibleQuery}
                  onChange={(e) => setBibleQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchScripture()}
                  placeholder="e.g., Gen 3:5, Jn 1:1-14, Ps 23, gen 3 15-16"
                  className={`flex-1 min-w-[200px] ${inputBg} border ${cardBorder} rounded-lg px-4 py-3 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition`}
                />
                <button
                  onClick={searchScripture}
                  disabled={isLoading}
                  className="bg-[#C9A84C] text-[#1A1F2E] px-6 py-3 rounded-lg hover:bg-[#E8D5A3] transition font-medium whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-[#1A1F2E] border-t-transparent rounded-full animate-spin"></span>
                      Loading...
                    </>
                  ) : (
                    'Lookup'
                  )}
                </button>
              </div>
              <p className={`text-xs ${subTextColor} mt-3`}>
                Search the Scripture/s with all readiness of mind. Enter a Bible verse reference
              </p>

              {bibleResult && (
                <div className={`${resultBg} rounded-lg p-4 mt-4`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className={`text-sm font-semibold ${textColor}`}>
                      {bibleRef || "Scripture"}
                      <span className={`text-xs ${subTextColor} ml-2 font-normal`}>(KJV)</span>
                    </div>
                    <button
                      onClick={() => {
                        const cleanText = bibleResult.replace(/"/g, '').trim();
                        const copyText = `“${cleanText}”\n  — ${bibleRef} (KJV)`;
                        navigator.clipboard.writeText(copyText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors rounded hover:bg-[#C9A84C]/10 flex-shrink-0"
                      title="Copy scripture"
                    >
                      <CopyIcon />
                      {copied && <span className="ml-1 text-[10px] text-green-500">✓</span>}
                    </button>
                  </div>
                  <div className={`text-sm ${textColor} whitespace-pre-wrap leading-relaxed`}>
                    {bibleResult}
                  </div>
                </div>
              )}
            </div>
          )}

{/* TOOL 2: WORD SEARCH */}
{activeTool === "word" && (
  <div>
    <div className="flex gap-3 flex-wrap">
      <input
        type="text"
        value={wordQuery}
        onChange={(e) => setWordQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && searchWord()}
        placeholder='e.g., "study to shew" · faith · "vanity of vanities" · grace'
        className={`flex-1 min-w-[200px] ${inputBg} border ${cardBorder} rounded-lg px-4 py-3 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition`}
      />
      <button
        onClick={searchWord}
        disabled={isSearching}
        className="bg-[#C9A84C] text-[#1A1F2E] px-6 py-3 rounded-lg hover:bg-[#E8D5A3] transition font-medium whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
      >
        {isSearching ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-[#1A1F2E] border-t-transparent rounded-full animate-spin"></span>
            Searching...
          </>
        ) : (
          'Search'
        )}
      </button>
    </div>
    <div className={`text-sm ${subTextColor} mt-3 flex flex-wrap items-center gap-2`}>
      <span>🔍 Enter a word or phrase</span>
      <span className="mx-1 text-[#C9A84C]">·</span>
      <span className="font-mono text-[#C9A84C] bg-[#C9A84C]/10 px-1.5 py-0.5 rounded">" "</span>
      <span>for exact phrases</span>
    </div>

    {isSearching && (
      <div className={`${resultBg} rounded-lg p-4 mt-4 text-center`}>
        <div className="inline-block w-6 h-6 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin"></div>
        <p className={`text-sm ${textColor} mt-2`}>Searching the Scriptures...</p>
      </div>
    )}

    {wordResult && !isSearching && (
      <div className={`${resultBg} rounded-lg p-4 mt-4`}>
        <div className={`text-sm ${textColor} whitespace-pre-wrap leading-relaxed`}>
          {wordResult.split('\n').map((line, idx) => {
            if (line.startsWith('🔍')) {
              return <div key={idx} className="font-semibold text-[#C9A84C] text-base">{line}</div>;
            } else if (line.startsWith('📊')) {
              return <div key={idx} className="font-medium mt-2 text-base">{line}</div>;
            } else if (line.startsWith('  •')) {
              return <div key={idx} className="ml-2 text-base">{line}</div>;
            } else if (line.startsWith('📖')) {
              return <div key={idx} className="font-medium text-base mt-3">{line}</div>;
            } else if (line.trim() === '') {
              return <div key={idx} className="h-1"></div>;
            } else {
              return <div key={idx} className="text-base">{line}</div>;
            }
          })}
        </div>

        {groupedVerses.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#C9A84C]/20">
            <div className="flex justify-between items-center mb-3">
              <div className={`text-sm font-medium ${goldText}`}>📖 Verses ({wordVerses.length} total)</div>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="text-xs text-[#C9A84C] hover:text-[#E8D5A3] transition px-2 py-1 rounded border border-[#C9A84C]/30 hover:bg-[#C9A84C]/10"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="text-xs text-[#C9A84C] hover:text-[#E8D5A3] transition px-2 py-1 rounded border border-[#C9A84C]/30 hover:bg-[#C9A84C]/10"
                >
                  Collapse All
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
              {groupedVerses.map((group) => {
                const isExpanded = expandedBooks.has(group.book);
                const icon = isExpanded ? '−' : '+';
                
                return (
                  <div key={group.book} className="border border-[#C9A84C]/10 rounded-lg overflow-hidden">
                    <div
                      className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-[#1A1F2E]' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleBook(group.book)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#C9A84C]">
                          {group.isOT ? '📜' : '✝️'} {group.book}
                        </span>
                        <span className={`text-xs ${subTextColor}`}>
                          ({group.verses.length} {group.verses.length === 1 ? 'verse' : 'verses'})
                        </span>
                      </div>
                      <span className={`text-[#C9A84C] font-bold text-lg w-6 text-center`}>
                        {icon}
                      </span>
                    </div>
                    
                    {isExpanded && (
                      <div className={`p-2 space-y-1.5 ${darkMode ? 'bg-[#0F1318]/50' : 'bg-gray-50/50'}`}>
                        {group.verses.map((v, idx) => {
                          const globalIndex = wordVerses.indexOf(v);
                          return (
                            <div
                              key={`${v.book}-${v.chapter}-${v.verse}-${idx}`}
                              className={`text-sm ${textColor} leading-relaxed p-1.5 rounded cursor-pointer transition-all duration-200 ${
                                selectedVerseIndex === globalIndex
                                  ? darkMode ? 'bg-[#C9A84C]/20 border border-[#C9A84C]/40' : 'bg-[#C9A84C]/10 border border-[#C9A84C]/30'
                                  : 'hover:bg-[#C9A84C]/5'
                              }`}
                              onClick={() => setSelectedVerseIndex(selectedVerseIndex === globalIndex ? null : globalIndex)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-semibold text-[#C9A84C]">{v.chapter}:{v.verse}</span>
                                  <span> </span>
                                  <span dangerouslySetInnerHTML={{
                                    __html: highlightText(v.text || '', wordQuery)
                                  }} />
                                </div>
                                {selectedVerseIndex === globalIndex && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copySingleVerse(v);
                                    }}
                                    className="ml-2 p-1 text-gray-400 hover:text-[#C9A84C] transition-colors rounded hover:bg-[#C9A84C]/10 flex-shrink-0"
                                    title="Copy verse"
                                  >
                                    <CopyIcon />
                                    {copied && <span className="ml-1 text-[10px] text-green-500">✓</span>}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
)}

{/* TOOL 3: DICTIONARY */}
{activeTool === "dictionary" && (
  <div>
    <div className="flex gap-3 flex-wrap">
      <input
        ref={inputRef}
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && searchDictionary()}
        placeholder="Enter a word to define..."
        className={`flex-1 min-w-[200px] ${inputBg} border ${cardBorder} rounded-lg px-4 py-3 text-sm ${textColor} placeholder:${subTextColor} focus:outline-none focus:border-[#C9A84C] transition`}
      />
      <button
        onClick={searchDictionary}
        disabled={isLoading}
        className="bg-[#C9A84C] text-[#1A1F2E] px-6 py-3 rounded-lg hover:bg-[#E8D5A3] transition font-medium whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-[#1A1F2E] border-t-transparent rounded-full animate-spin"></span>
            Loading...
          </>
        ) : (
          'Define'
        )}
      </button>
    </div>
    <p className={`text-sm ${subTextColor} mt-3 italic`}>
      Search a word for its definition. For Bible-specific meanings, click the links below.
    </p>

    {dictResult && (
      <div className={`${resultBg} rounded-lg p-4 mt-4`}>
        <div className="flex justify-between items-start">
          <div className={`text-sm ${textColor} text-justify leading-relaxed flex-1 whitespace-pre-wrap`}>
            {renderDictionaryContent(dictResult)}
          </div>
          <button
            onClick={() => {
              const fullText = dictResult;
              navigator.clipboard.writeText(fullText);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 text-gray-400 hover:text-[#C9A84C] transition-colors rounded hover:bg-[#C9A84C]/10 flex-shrink-0 ml-2"
            title="Copy definition"
          >
            <CopyIcon />
            {copied && <span className="ml-1 text-[10px] text-green-500">✓</span>}
          </button>
        </div>
        {searchTime && (
          <div className={`mt-3 text-xs ${subTextColor} border-t ${cardBorder} pt-2 text-center`}>
            ⚡ Found in {searchTime}ms via {source}
          </div>
        )}
      </div>
    )}

    {/* Bible Dictionary Links - Only shown if no definition found */}
    {dictResult && !source?.includes("Dictionary API") && (
      <div className={`mt-6 p-4 ${resultBg} rounded-lg border ${cardBorder}`}>
        <h4 className={`text-sm font-semibold ${textColor} mb-2 text-center`}>
          📖 Bible Dictionary Resources
        </h4>
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <a
            href={`https://kingjamesbibledictionary.com/Dictionary/${encodeURIComponent(searchInput || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${goldText} hover:text-[#E8D5A3] transition underline`}
          >
            King James Bible Dictionary
          </a>
          <span className={`text-xs ${subTextColor}`}>|</span>
          <a
            href={`https://webstersdictionary1828.com/Dictionary/${encodeURIComponent(searchInput || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${goldText} hover:text-[#E8D5A3] transition underline`}
          >
            Webster's 1828
          </a>
        </div>
        <p className={`text-xs ${subTextColor} mt-3 text-center`}>
          These resources provide definitions specific to the King James Version of the Bible.
        </p>
      </div>
    )}
  </div>
)}

          {/* TOOL 4: REFERENCES */}
          {activeTool === "references" && (
            <div>
              <p className={`text-sm ${subTextColor} mb-4`}>Resources for more study and research.</p>

              <div className="mb-5">
                <h4 className={`text-sm font-semibold ${textColor} mb-2 border-l-2 border-[#C9A84C] pl-3`}>📖 Doctrinal Defense</h4>
                <div className="ml-2 space-y-1.5">
                  <a href="https://www.wayoflife.org" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>Way of Life Literature →</a>
                  <a href="https://openthoumineeyes.com/" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>Doctrine Portal →</a>
                </div>
              </div>

              <div className="mb-5">
                <h4 className={`text-sm font-semibold ${textColor} mb-2 border-l-2 border-[#C9A84C] pl-3`}>🔍 Word Studies</h4>
                <div className="ml-2 space-y-1.5">
                  <a href="https://www.theword.net" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>The Word →</a>
                  <a href="https://blueletterbible.org" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>Blue Letter Bible →</a>
                  <a href="https://kingjamesbibledictionary.com/Dictionary/" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>King James Bible Dictionary →</a>
                  <a href="https://webstersdictionary1828.com/" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>Webster's 1828 Dictionary →</a>
                </div>
              </div>

              <div className="mb-3">
                <h4 className={`text-sm font-semibold ${textColor} mb-2 border-l-2 border-[#C9A84C] pl-3`}>✝️ Commentaries &amp; Sermons</h4>
                <div className="ml-2 space-y-1.5">
                  <a href="https://spurgeongems.org" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>Spurgeon Gems →</a>
                  <a href="https://www.sermonnotebook.org/ntsermons.htm" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>Sermon Notebook →</a>
                  <a href="https://www.sermonindex.net" target="_blank" rel="noopener noreferrer" className={`block text-sm ${textColor} hover:text-[#C9A84C] transition`}>Sermon Index Library →</a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`mt-6 pt-4 border-t ${cardBorder} text-center`}>
          <p className={`text-sm italic ${subTextColor}`}>
            "A dose of God's Word a day, will keep you going all day."
          </p>
          <a
            href="https://www.facebook.com/BeginWithGod/"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm ${goldText} hover:text-[#E8D5A3] transition inline-block mt-1`}
          >
            — ALWAYS BEGIN WITH GOD —
          </a>
        </div>
      </div>
    </div>
  );
}