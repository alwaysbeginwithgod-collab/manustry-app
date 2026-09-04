// ============================================================
// COMPLETE KJV BIBLE BOOKS (66 Books - No Apocrypha)
// ============================================================
export const BIBLE_BOOKS = {
  ot: [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms',
    'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah',
    'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah',
    'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
    'Haggai', 'Zechariah', 'Malachi'
  ],
  nt: [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians',
    'Galatians', 'Ephesians', 'Philippians',
    'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
    'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ]
};

// ✅ All KJV books (for validation)
export const KJV_BOOKS = [
  ...BIBLE_BOOKS.ot,
  ...BIBLE_BOOKS.nt
];

// ============================================================
// BOOK SHORTCODES
// ============================================================
export const bookShortcodes: { [key: string]: string } = {
  // Old Testament
  'gen': 'Genesis', 'exo': 'Exodus', 'lev': 'Leviticus', 'num': 'Numbers',
  'deu': 'Deuteronomy', 'jos': 'Joshua', 'josh': 'Joshua', 'jgs': 'Judges',
  'judg': 'Judges', 'rut': 'Ruth', 'rth': 'Ruth', '1sa': '1 Samuel',
  '1sam': '1 Samuel', '2sa': '2 Samuel', '2sam': '2 Samuel', '1ki': '1 Kings',
  '1kgs': '1 Kings', '2ki': '2 Kings', '2kgs': '2 Kings', '1ch': '1 Chronicles',
  '1chr': '1 Chronicles', '2ch': '2 Chronicles', '2chr': '2 Chronicles',
  'ezr': 'Ezra', 'neh': 'Nehemiah', 'est': 'Esther', 'job': 'Job',
  'psa': 'Psalms', 'ps': 'Psalms', 'pss': 'Psalms', 'pro': 'Proverbs',
  'prov': 'Proverbs', 'ecc': 'Ecclesiastes', 'eccl': 'Ecclesiastes',
  'sol': 'Song of Solomon', 'song': 'Song of Solomon', 'isa': 'Isaiah',
  'jer': 'Jeremiah', 'lam': 'Lamentations', 'ezk': 'Ezekiel', 'dan': 'Daniel',
  'hos': 'Hosea', 'joe': 'Joel', 'amo': 'Amos', 'oba': 'Obadiah',
  'jon': 'Jonah', 'mic': 'Micah', 'nah': 'Nahum', 'hab': 'Habakkuk',
  'zep': 'Zephaniah', 'hag': 'Haggai', 'zac': 'Zechariah', 'mal': 'Malachi',
  // New Testament
  'mat': 'Matthew', 'matt': 'Matthew', 'mar': 'Mark', 'mrk': 'Mark',
  'luk': 'Luke', 'joh': 'John', 'jn': 'John', 'acts': 'Acts',
  'rom': 'Romans', '1co': '1 Corinthians', '1cor': '1 Corinthians',
  '2co': '2 Corinthians', '2cor': '2 Corinthians', 'gal': 'Galatians',
  'eph': 'Ephesians', 'phi': 'Philippians', 'phil': 'Philippians',
  'col': 'Colossians', '1th': '1 Thessalonians', '1thess': '1 Thessalonians',
  '2th': '2 Thessalonians', '2thess': '2 Thessalonians', '1ti': '1 Timothy',
  '1tim': '1 Timothy', '2ti': '2 Timothy', '2tim': '2 Timothy',
  'tit': 'Titus', 'phm': 'Philemon', 'heb': 'Hebrews', 'jam': 'James',
  '1pe': '1 Peter', '1pet': '1 Peter', '2pe': '2 Peter', '2pet': '2 Peter',
  '1jo': '1 John', '1jn': '1 John', '2jo': '2 John', '2jn': '2 John',
  '3jo': '3 John', '3jn': '3 John', 'jud': 'Jude', 'rev': 'Revelation'
};

// ✅ Apocrypha books (should be filtered out)
export const APOCRYPHA_BOOKS = [
  'Tobit', 'Judith', 'Wisdom', 'Sirach', 'Baruch',
  '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees',
  '1 Esdras', '2 Esdras', 'Prayer of Manasseh', 'Psalm 151',
  'Wisdom of Solomon', 'Ecclesiasticus', 'Susanna', 'Bel and the Dragon',
  'Song of the Three Children', 'Additions to Esther'
];