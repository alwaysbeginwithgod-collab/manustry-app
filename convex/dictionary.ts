// convex/dictionary.ts
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Insert a dictionary entry (for importing)
export const insert = mutation({
  args: {
    table: v.string(),
    word: v.string(),
    definition: v.string(),
  },
  handler: async (ctx, args) => {
    const { table, word, definition } = args;

    let existing;
    if (table === 'webster1828') {
      existing = await ctx.db
        .query('webster1828')
        .withIndex('by_word', (q) => q.eq('word', word))
        .first();
    } else if (table === 'eastonsDictionary') {
      existing = await ctx.db
        .query('eastonsDictionary')
        .withIndex('by_word', (q) => q.eq('word', word))
        .first();
    } else if (table === 'smithsDictionary') {
      existing = await ctx.db
        .query('smithsDictionary')
        .withIndex('by_word', (q) => q.eq('word', word))
        .first();
    } else {
      throw new Error(`Unknown table: ${table}`);
    }

    if (existing) {
      if (existing.definition !== definition) {
        await ctx.db.patch(existing._id, { definition });
      }
      return existing;
    }

    if (table === 'webster1828') {
      return await ctx.db.insert('webster1828', { word, definition });
    } else if (table === 'eastonsDictionary') {
      return await ctx.db.insert('eastonsDictionary', { word, definition });
    } else if (table === 'smithsDictionary') {
      return await ctx.db.insert('smithsDictionary', { word, definition });
    } else {
      throw new Error(`Unknown table: ${table}`);
    }
  },
});

// Search a specific dictionary (exact match)
export const search = query({
  args: {
    table: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { table, query, limit = 5 } = args;
    const searchTerm = query.toLowerCase().trim();

    let results;
    if (table === 'webster1828') {
      results = await ctx.db
        .query('webster1828')
        .withIndex('by_word', (q) => q.eq('word', searchTerm))
        .take(limit);
    } else if (table === 'eastonsDictionary') {
      results = await ctx.db
        .query('eastonsDictionary')
        .withIndex('by_word', (q) => q.eq('word', searchTerm))
        .take(limit);
    } else if (table === 'smithsDictionary') {
      results = await ctx.db
        .query('smithsDictionary')
        .withIndex('by_word', (q) => q.eq('word', searchTerm))
        .take(limit);
    } else {
      throw new Error(`Unknown table: ${table}`);
    }

    return results || [];
  },
});

// Search by word OR inside definition (for the API)
export const searchInDefinitions = query({
  args: {
    table: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { table, query, limit = 5 } = args;
    const searchTerm = query.toLowerCase().trim();
    
    console.log(`🔍 searchInDefinitions: ${table} for "${searchTerm}"`);
    
    // Get all entries from the table
    let allEntries;
    if (table === 'webster1828') {
      allEntries = await ctx.db.query('webster1828').collect();
    } else if (table === 'eastonsDictionary') {
      allEntries = await ctx.db.query('eastonsDictionary').collect();
    } else if (table === 'smithsDictionary') {
      allEntries = await ctx.db.query('smithsDictionary').collect();
    } else {
      throw new Error(`Unknown table: ${table}`);
    }
    
    console.log(`   Total entries in ${table}: ${allEntries.length}`);
    
    // EXACT match first - this is the most important!
    const exactMatches = [];
    const partialMatches = [];
    
    for (const entry of allEntries) {
      const wordLower = (entry.word || '').toLowerCase();
      const defLower = (entry.definition || '').toLowerCase();
      
      // Check if the WORD matches exactly
      if (wordLower === searchTerm) {
        exactMatches.push(entry);
        continue;
      }
      
      // Check if the word contains the search term
      if (wordLower.includes(searchTerm)) {
        partialMatches.push(entry);
        continue;
      }
      
      // Check if the definition contains the search term
      if (defLower.includes(searchTerm)) {
        partialMatches.push(entry);
      }
    }
    
    // Combine results: exact matches first, then partial
    const results = [...exactMatches];
    
    // Add partial matches until we reach the limit
    if (results.length < limit) {
      const remaining = limit - results.length;
      results.push(...partialMatches.slice(0, remaining));
    }
    
    console.log(`   Found ${exactMatches.length} exact matches, ${partialMatches.length} partial matches`);
    if (results.length > 0) {
      console.log(`   First match: "${results[0].word}" (${results[0].word === searchTerm ? 'EXACT' : 'PARTIAL'})`);
    }
    
    return results;
  },
});

// Search across all dictionaries
export const searchAll = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, limit = 3 } = args;
    const searchTerm = query.toLowerCase().trim();
    const results: any[] = [];

    // Search in Webster - EXACT match only
    const webster = await ctx.db
      .query('webster1828')
      .withIndex('by_word', (q) => q.eq('word', searchTerm))
      .take(limit);
    results.push(...webster.map((r: any) => ({ ...r, source: 'webster1828' })));

    // Search in Easton's - EXACT match only
    const easton = await ctx.db
      .query('eastonsDictionary')
      .withIndex('by_word', (q) => q.eq('word', searchTerm))
      .take(limit);
    results.push(...easton.map((r: any) => ({ ...r, source: 'eastonsDictionary' })));

    // Search in Smith's - EXACT match only
    const smith = await ctx.db
      .query('smithsDictionary')
      .withIndex('by_word', (q) => q.eq('word', searchTerm))
      .take(limit);
    results.push(...smith.map((r: any) => ({ ...r, source: 'smithsDictionary' })));

    // If no exact matches, try prefix search
    if (results.length === 0) {
      const websterPrefix = await ctx.db
        .query('webster1828')
        .withIndex('by_word', (q) =>
          q.gte('word', searchTerm).lt('word', searchTerm + '\uffff')
        )
        .take(limit);
      results.push(...websterPrefix.map((r: any) => ({ ...r, source: 'webster1828' })));

      const eastonPrefix = await ctx.db
        .query('eastonsDictionary')
        .withIndex('by_word', (q) =>
          q.gte('word', searchTerm).lt('word', searchTerm + '\uffff')
        )
        .take(limit);
      results.push(...eastonPrefix.map((r: any) => ({ ...r, source: 'eastonsDictionary' })));

      const smithPrefix = await ctx.db
        .query('smithsDictionary')
        .withIndex('by_word', (q) =>
          q.gte('word', searchTerm).lt('word', searchTerm + '\uffff')
        )
        .take(limit);
      results.push(...smithPrefix.map((r: any) => ({ ...r, source: 'smithsDictionary' })));
    }

    return results.slice(0, limit * 3);
  },
});

// Count entries in a dictionary (simplified to avoid 32k limit)
export const count = query({
  args: {
    table: v.string(),
  },
  handler: async (ctx, args) => {
    let entries;
    if (args.table === 'webster1828') {
      entries = await ctx.db.query('webster1828').collect();
    } else if (args.table === 'eastonsDictionary') {
      entries = await ctx.db.query('eastonsDictionary').collect();
    } else if (args.table === 'smithsDictionary') {
      entries = await ctx.db.query('smithsDictionary').collect();
    } else {
      throw new Error(`Unknown table: ${args.table}`);
    }
    return entries.length;
  },
});

// Fuzzy search - finds words that contain the search term
export const fuzzySearch = query({
  args: {
    table: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { table, query, limit = 5 } = args;
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }
    
    let allEntries;
    if (table === 'webster1828') {
      allEntries = await ctx.db.query('webster1828').collect();
    } else if (table === 'eastonsDictionary') {
      allEntries = await ctx.db.query('eastonsDictionary').collect();
    } else if (table === 'smithsDictionary') {
      allEntries = await ctx.db.query('smithsDictionary').collect();
    } else {
      throw new Error(`Unknown table: ${table}`);
    }
    
    // Try exact match first
    const exactResults = allEntries.filter((entry: any) => entry.word === searchTerm).slice(0, limit);
    if (exactResults.length > 0) {
      return exactResults;
    }
    
    // Try contains match
    const containsResults = allEntries
      .filter((entry: any) => 
        entry.word.includes(searchTerm) || 
        entry.definition.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit);
    
    return containsResults;
  },
});