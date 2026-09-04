import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Save writer content
export const saveWriterContent = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    category: v.string(),
    content: v.string(),
    plainText: v.string(),
    lastUpdated: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, title, category, content, plainText, lastUpdated } = args;

    // Check if a writer document already exists for this user
    const existing = await ctx.db
      .query("writerContent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        title,
        category,
        content,
        plainText,
        lastUpdated,
        updatedAt: Date.now(),
      });
      return { success: true, id: existing._id, action: "updated" };
    } else {
      // Create new
      const id = await ctx.db.insert("writerContent", {
        userId,
        title,
        category,
        content,
        plainText,
        lastUpdated,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return { success: true, id, action: "created" };
    }
  },
});

// Load writer content for a user
export const loadWriterContent = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId } = args;
    const content = await ctx.db
      .query("writerContent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return content || null;
  },
});

// Delete writer content
export const deleteWriterContent = mutation({
  args: {
    id: v.id("writerContent"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});