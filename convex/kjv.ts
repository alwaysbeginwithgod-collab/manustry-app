// convex/kjv.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Insert a verse (for importing)
export const insert = mutation({
  args: {
    book: v.string(),
    chapter: v.number(),
    verse: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const { book, chapter, verse, text } = args;
    
    // Check if verse already exists
    const existing = await ctx.db
      .query('kjv')
      .withIndex('by_book_chapter_verse', (q) =>
        q.eq('book', book).eq('chapter', chapter).eq('verse', verse)
      )
      .first();
    
    if (existing) {
      if (existing.text !== text) {
        await ctx.db.patch(existing._id, { text });
      }
      return existing;
    }
    
    return await ctx.db.insert('kjv', { book, chapter, verse, text });
  },
});

// Search for word or phrase in KJV
export const search = query({
  args: {
    query: v.string(),
    isPhrase: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, isPhrase = false, limit = 100 } = args;
    const searchTerm = query.toLowerCase().trim();
    
    console.log(`🔍 Searching KJV for: "${searchTerm}" (Phrase: ${isPhrase})`);
    
    const allVerses = await ctx.db.query('kjv').collect();
    
    let results: any[] = [];
    
    if (isPhrase) {
      results = allVerses.filter(verse => 
        verse.text.toLowerCase().includes(searchTerm)
      );
    } else {
      const words = searchTerm.split(/\s+/).filter(w => w.length > 0);
      
      if (words.length === 1) {
        results = allVerses.filter(verse => 
          verse.text.toLowerCase().includes(words[0])
        );
      } else {
        results = allVerses.filter(verse => {
          const text = verse.text.toLowerCase();
          return words.every(word => text.includes(word));
        });
      }
    }
    
    console.log(`   Found ${results.length} matching verses`);
    return results.slice(0, limit);
  },
});