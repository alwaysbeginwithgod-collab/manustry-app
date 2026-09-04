import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get active suggestions
export const getActiveSuggestions = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("querySuggestions")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get all suggestions (admin)
export const getAllSuggestions = query({
  handler: async (ctx) => {
    return await ctx.db.query("querySuggestions").collect();
  },
});

// Admin: Add a suggestion
export const addSuggestion = mutation({
  args: {
    text: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("querySuggestions", args);
  },
});

// Admin: Update a suggestion
export const updateSuggestion = mutation({
  args: {
    id: v.id("querySuggestions"),
    text: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Admin: Delete a suggestion
export const deleteSuggestion = mutation({
  args: { id: v.id("querySuggestions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});