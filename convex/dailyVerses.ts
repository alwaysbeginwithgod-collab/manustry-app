import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get today's verse
export const getTodaysVerse = query({
  handler: async (ctx) => {
    const verses = await ctx.db.query("dailyVerses").collect();
    
    if (verses.length === 0) {
      return {
        verse: "I can do all things through Christ which strengtheneth me.",
        reference: "Philippians 4:13"
      };
    }

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % verses.length;
    return verses[index];
  },
});

// Admin: Add a verse
export const addVerse = mutation({
  args: {
    verse: v.string(),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dailyVerses", args);
  },
});

// Admin: Delete a verse
export const deleteVerse = mutation({
  args: { id: v.id("dailyVerses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});