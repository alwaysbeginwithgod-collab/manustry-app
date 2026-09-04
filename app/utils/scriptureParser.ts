/**
 * Parse Bible references from text
 * Returns array of { book, chapter, verse, fullReference, startIndex, endIndex }
 */

// Book name mappings (abbreviations to full names)
const BOOK_MAP: { [key: string]: string } = {
  // Old Testament
  'gen': 'Genesis',
  'ex': 'Exodus',
  'exo': 'Exodus',
  'lev': 'Leviticus',
  'num': 'Numbers',
  'deut': 'Deuteronomy',
  'dt': 'Deuteronomy',
  'josh': 'Joshua',
  'jos': 'Joshua',
  'judg': 'Judges',
  'jdg': 'Judges',
  'ruth': 'Ruth',
  '1 sam': '1 Samuel',
  '1 samuel': '1 Samuel',
  '2 sam': '2 Samuel',
  '2 samuel': '2 Samuel',
  '1 kgs': '1 Kings',
  '1 kin': '1 Kings',
  '1 kings': '1 Kings',
  '2 kgs': '2 Kings',
  '2 kin': '2 Kings',
  '2 kings': '2 Kings',
  '1 chr': '1 Chronicles',
  '1 chron': '1 Chronicles',
  '1 chronicles': '1 Chronicles',
  '2 chr': '2 Chronicles',
  '2 chron': '2 Chronicles',
  '2 chronicles': '2 Chronicles',
  'ezra': 'Ezra',
  'neh': 'Nehemiah',
  'est': 'Esther',
  'job': 'Job',
  'ps': 'Psalms',
  'psa': 'Psalms',
  'psalm': 'Psalms',
  'pro': 'Proverbs',
  'prov': 'Proverbs',
  'eccl': 'Ecclesiastes',
  'song': 'Song of Solomon',
  'isa': 'Isaiah',
  'jer': 'Jeremiah',
  'lam': 'Lamentations',
  'ezek': 'Ezekiel',
  'dan': 'Daniel',
  'hos': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'obad': 'Obadiah',
  'jon': 'Jonah',
  'jonah': 'Jonah',
  'mic': 'Micah',
  'nah': 'Nahum',
  'hab': 'Habakkuk',
  'zeph': 'Zephaniah',
  'hag': 'Haggai',
  'zech': 'Zechariah',
  'mal': 'Malachi',
  // New Testament
  'mt': 'Matthew',
  'matt': 'Matthew',
  'matthew': 'Matthew',
  'mk': 'Mark',
  'mark': 'Mark',
  'lk': 'Luke',
  'luke': 'Luke',
  'jn': 'John',
  'john': 'John',
  'acts': 'Acts',
  'rom': 'Romans',
  'romans': 'Romans',
  '1 cor': '1 Corinthians',
  '1 corinthians': '1 Corinthians',
  '2 cor': '2 Corinthians',
  '2 corinthians': '2 Corinthians',
  'gal': 'Galatians',
  'ephes': 'Ephesians',
  'eph': 'Ephesians',
  'phil': 'Philippians',
  'col': 'Colossians',
  '1 thess': '1 Thessalonians',
  '1 thes': '1 Thessalonians',
  '2 thess': '2 Thessalonians',
  '2 thes': '2 Thessalonians',
  '1 tim': '1 Timothy',
  '2 tim': '2 Timothy',
  'titus': 'Titus',
  'phlm': 'Philemon',
  'heb': 'Hebrews',
  'james': 'James',
  'jas': 'James',
  '1 pet': '1 Peter',
  '2 pet': '2 Peter',
  '1 jn': '1 John',
  '1 john': '1 John',
  '2 jn': '2 John',
  '2 john': '2 John',
  '3 jn': '3 John',
  '3 john': '3 John',
  'jude': 'Jude',
  'rev': 'Revelation',
};

/**
 * Find all Bible references in text
 */
export function findScriptureReferences(text: string): Array<{
  book: string;
  chapter: number;
  verse: number;
  endVerse?: number;
  fullReference: string;
  startIndex: number;
  endIndex: number;
}> {
  const references: any[] = [];
  
  // Pattern: Book name followed by chapter:verse (e.g., John 3:16, Gen 1:1, 1 Cor 13:4)
  const pattern = /\b([1-3]?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?\b/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const bookKey = match[1].toLowerCase().trim();
    const chapter = parseInt(match[2]);
    const verse = parseInt(match[3]);
    const endVerse = match[4] ? parseInt(match[4]) : undefined;
    
    // Find the full book name
    let book = BOOK_MAP[bookKey];
    if (!book) {
      // Try partial match
      for (const [key, value] of Object.entries(BOOK_MAP)) {
        if (key.includes(bookKey) || bookKey.includes(key)) {
          book = value;
          break;
        }
      }
    }
    
    if (book) {
      references.push({
        book,
        chapter,
        verse,
        endVerse,
        fullReference: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  return references;
}

/**
 * Get Bible verse text from API
 * Handles multiple verses (e.g., John 3:16-18)
 */
export async function getBibleVerse(reference: string): Promise<string | null> {
  try {
    // If reference contains a dash (multiple verses), fetch the range
    const response = await fetch(
      `https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.text || null;
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    return null;
  }
}

/**
 * Format a scripture reference for display
 */
export function formatScriptureReference(book: string, chapter: number, verse: number, endVerse?: number): string {
  return endVerse ? `${book} ${chapter}:${verse}-${endVerse}` : `${book} ${chapter}:${verse}`;
}