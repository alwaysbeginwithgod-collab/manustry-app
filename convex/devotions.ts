import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all devotions
export const getAllDevotions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("devotions")
      .withIndex("by_indexOrder")
      .collect();
  },
});

// Get today's devotion
export const getDevotionByIndex = query({
  args: { index: v.number() },
  handler: async (ctx, args) => {
    const devotions = await ctx.db
      .query("devotions")
      .withIndex("by_indexOrder")
      .collect();

    const total = devotions.length;
    if (total === 0) return null;
    
    const actualIndex = args.index % total;
    return devotions[actualIndex] || null;
  },
});

// Admin: Add a devotion
export const addDevotion = mutation({
  args: {
    title: v.string(),
    scriptureRef: v.string(),
    reflection: v.string(),
    rhymingQuote: v.string(),
    imageUrl: v.optional(v.string()),
    indexOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("devotions", args);
  },
});

// Admin: Update a devotion
export const updateDevotion = mutation({
  args: {
    id: v.id("devotions"),
    title: v.optional(v.string()),
    scriptureRef: v.optional(v.string()),
    reflection: v.optional(v.string()),
    rhymingQuote: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    indexOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Admin: Delete a devotion
export const deleteDevotion = mutation({
  args: { id: v.id("devotions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});