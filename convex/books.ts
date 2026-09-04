import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all books
export const getAllBooks = query({
  handler: async (ctx) => {
    return await ctx.db.query("books").collect();
  },
});

// Get books by series
export const getBooksBySeries = query({
  args: { series: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("books")
      .withIndex("by_series", (q) => q.eq("series", args.series))
      .collect();
  },
});

// Get standalone books
export const getStandaloneBooks = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("books")
      .filter((q) => q.eq(q.field("isStandalone"), true))
      .collect();
  },
});

// Admin: Add a book
export const addBook = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    amazonUrl: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    series: v.optional(v.string()),
    isStandalone: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("books", args);
  },
});

// Admin: Update a book
export const updateBook = mutation({
  args: {
    id: v.id("books"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    amazonUrl: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    series: v.optional(v.string()),
    isStandalone: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Admin: Delete a book
export const deleteBook = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});