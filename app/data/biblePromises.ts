// app/data/biblePromises.ts
// Daily Bible Promises - Loops through all promises based on day of year

export interface BiblePromise {
  id: number;
  order: number;
  reference: string;
  verse: string;
}

export const biblePromises: BiblePromise[] = [
  { id: 1, order: 1, reference: "Jeremiah 29:11 (KJV)", verse: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end." },
  { id: 2, order: 2, reference: "Isaiah 41:10 (KJV)", verse: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness." },
  { id: 3, order: 3, reference: "Philippians 4:13 (KJV)", verse: "I can do all things through Christ which strengtheneth me." },
  { id: 4, order: 4, reference: "Romans 8:28 (KJV)", verse: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose." },
  { id: 5, order: 5, reference: "Psalm 23:4 (KJV)", verse: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me." },
  { id: 6, order: 6, reference: "Matthew 11:28 (KJV)", verse: "Come unto me, all ye that labour and are heavy laden, and I will give you rest." },
  { id: 7, order: 7, reference: "John 14:27 (KJV)", verse: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid." },
  { id: 8, order: 8, reference: "Proverbs 3:5-6 (KJV)", verse: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths." },
  { id: 9, order: 9, reference: "Joshua 1:9 (KJV)", verse: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
  { id: 10, order: 10, reference: "2 Corinthians 5:17 (KJV)", verse: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new." },
  { id: 11, order: 11, reference: "John 7:17 (KJV)", verse: "If any man will do his will, he shall know of the doctrine, whether it be of God, or whether I speak of myself." },
  { id: 12, order: 12, reference: "1 Thessalonians 5:24 (KJV)", verse: "Faithful is he that calleth you, who also will do it." },
  { id: 13, order: 13, reference: "Matthew 7:7 (KJV)", verse: "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you." },
  { id: 14, order: 14, reference: "Deuteronomy 7:9 (KJV)", verse: "Know therefore that the LORD thy God, he is God, the faithful God, which keepeth covenant and mercy with them that love him and keep his commandments to a thousand generations." },
  { id: 15, order: 15, reference: "John 3:16 (KJV)", verse: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { id: 16, order: 16, reference: "2 Thessalonians 3:3 (KJV)", verse: "But the Lord is faithful, who shall stablish you, and keep you from evil." },
  { id: 17, order: 17, reference: "Lamentations 3:22-23 (KJV)", verse: "It is of the LORD’S mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness." },
  { id: 18, order: 18, reference: "Psalm 27:1 (KJV)", verse: "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?" },
  { id: 19, order: 19, reference: "Isaiah 40:31 (KJV)", verse: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
  { id: 20, order: 20, reference: "Romans 8:38-39 (KJV)", verse: "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord." },
  { id: 21, order: 21, reference: "Psalm 46:1 (KJV)", verse: "God is our refuge and strength, a very present help in trouble." },
  { id: 22, order: 22, reference: "Proverbs 18:10 (KJV)", verse: "The name of the LORD is a strong tower: the righteous runneth into it, and is safe." },
  { id: 23, order: 23, reference: "John 8:31-32 (KJV)", verse: "If ye continue in my word, then are ye my disciples indeed; And ye shall know the truth, and the truth shall make you free." },
  { id: 24, order: 24, reference: "Psalm 121:1-2 (KJV)", verse: "I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth." },
  { id: 25, order: 25, reference: "Ephesians 2:8-9 (KJV)", verse: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast." },
  { id: 26, order: 26, reference: "Romans 8:1 (KJV)", verse: "There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit." },
  { id: 27, order: 27, reference: "Isaiah 43:2 (KJV)", verse: "When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee: when thou walkest through the fire, thou shalt not be burned; neither shall the flame kindle upon thee." },
  { id: 28, order: 28, reference: "Psalm 34:18 (KJV)", verse: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit." },
  { id: 29, order: 29, reference: "2 Corinthians 9:8 (KJV)", verse: "And God is able to make all grace abound toward you; that ye, always having all sufficiency in all things, may abound to every good work." },
  { id: 30, order: 30, reference: "Hebrews 13:5 (KJV)", verse: "I will never leave thee, nor forsake thee." },
  { id: 31, order: 31, reference: "Psalm 37:4 (KJV)", verse: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart." },
  { id: 32, order: 32, reference: "James 1:5 (KJV)", verse: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him." },
  { id: 33, order: 33, reference: "Psalm 16:8 (KJV)", verse: "I have set the LORD always before me: because he is at my right hand, I shall not be moved." },
  { id: 34, order: 34, reference: "Philippians 4:19 (KJV)", verse: "But my God shall supply all your need according to his riches in glory by Christ Jesus." },
  { id: 35, order: 35, reference: "Psalm 34:8 (KJV)", verse: "O taste and see that the LORD is good: blessed is the man that trusteth in him." },
  { id: 36, order: 36, reference: "1 John 1:9 (KJV)", verse: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness." },
  { id: 37, order: 37, reference: "Psalm 91:1-2 (KJV)", verse: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust." },
  { id: 38, order: 38, reference: "Isaiah 54:10 (KJV)", verse: "For the mountains shall depart, and the hills be removed; but my kindness shall not depart from thee, neither shall the covenant of my peace be removed, saith the LORD that hath mercy on thee." },
  { id: 39, order: 39, reference: "Psalm 119:105 (KJV)", verse: "Thy word is a lamp unto my feet, and a light unto my path." },
  { id: 40, order: 40, reference: "Romans 15:13 (KJV)", verse: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost." },
  { id: 41, order: 41, reference: "Psalm 56:3 (KJV)", verse: "What time I am afraid, I will trust in thee." },
  { id: 42, order: 42, reference: "John 10:27-28 (KJV)", verse: "My sheep hear my voice, and I know them, and they follow me: And I give unto them eternal life; and they shall never perish, neither shall any man pluck them out of my hand." },
  { id: 43, order: 43, reference: "Psalm 103:1-3 (KJV)", verse: "Bless the LORD, O my soul: and all that is within me, bless his holy name. Bless the LORD, O my soul, and forget not all his benefits: Who forgiveth all thine iniquities; who healeth all thy diseases." },
  { id: 44, order: 44, reference: "2 Timothy 1:7 (KJV)", verse: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind." },
  { id: 45, order: 45, reference: "Psalm 20:7 (KJV)", verse: "Some trust in chariots, and some in horses: but we will remember the name of the LORD our God." },
  { id: 46, order: 46, reference: "Romans 8:31 (KJV)", verse: "What shall we then say to these things? If God be for us, who can be against us?" },
  { id: 47, order: 47, reference: "Psalm 118:24 (KJV)", verse: "This is the day which the LORD hath made; we will rejoice and be glad in it." },
  { id: 48, order: 48, reference: "John 16:33 (KJV)", verse: "These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world." },
  { id: 49, order: 49, reference: "Psalm 136:1 (KJV)", verse: "O give thanks unto the LORD; for he is good: for his mercy endureth for ever." },
  { id: 50, order: 50, reference: "Ephesians 3:20 (KJV)", verse: "Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us." },
  { id: 51, order: 51, reference: "Psalm 23:6 (KJV)", verse: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever." },
  { id: 52, order: 52, reference: "Colossians 3:2 (KJV)", verse: "Set your affection on things above, not on things on the earth." },
  { id: 53, order: 53, reference: "Psalm 27:14 (KJV)", verse: "Wait on the LORD: be of good courage, and he shall strengthen thine heart: wait, I say, on the LORD." },
  { id: 54, order: 54, reference: "James 4:8 (KJV)", verse: "Draw nigh to God, and he will draw nigh to you. Cleanse your hands, ye sinners; and purify your hearts, ye double minded." },
  { id: 55, order: 55, reference: "Psalm 119:11 (KJV)", verse: "Thy word have I hid in mine heart, that I might not sin against thee." },
  { id: 56, order: 56, reference: "Isaiah 40:8 (KJV)", verse: "The grass withereth, the flower fadeth: but the word of our God shall stand for ever." },
  { id: 57, order: 57, reference: "Psalm 62:8 (KJV)", verse: "Trust in him at all times; ye people, pour out your heart before him: God is a refuge for us." },
  { id: 58, order: 58, reference: "Malachi 3:6 (KJV)", verse: "For I am the LORD, I change not; therefore ye sons of Jacob are not consumed." },
  { id: 59, order: 59, reference: "Psalm 100:3 (KJV)", verse: "Know ye that the LORD he is God: it is he that hath made us, and not we ourselves; we are his people, and the sheep of his pasture." },
  { id: 60, order: 60, reference: "Hebrews 11:6 (KJV)", verse: "But without faith it is impossible to please him: for he that cometh to God must believe that he is, and that he is a rewarder of them that diligently seek him." },
];

export function getDailyVerse() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86400000);
  const index = dayOfYear % biblePromises.length;
  return biblePromises[index];
}