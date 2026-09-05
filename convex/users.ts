import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create user
export const getOrCreateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId, email, fullName } = args;

    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: email,
        fullName: fullName,
        lastQueryDate: new Date().toISOString().split('T')[0],
      });
      return existingUser;
    }

    // Create new user
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    
    const userId = await ctx.db.insert("users", {
      clerkId: clerkId,
      email: email,
      fullName: fullName,
      isPremium: false,
      premiumType: undefined,
      dailyQueryCount: 0,
      lastQueryDate: today,
      createdAt: now,
    });

    const newUser = await ctx.db.get(userId);
    return newUser;
  },
});

// Get user by clerkId
export const getUser = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return user;
  },
});

// Update user premium status
export const updatePremiumStatus = mutation({
  args: {
    clerkId: v.string(),
    isPremium: v.boolean(),
    premiumType: v.optional(v.union(v.literal("monthly"), v.literal("lifetime"))),
  },
  handler: async (ctx, args) => {
    const { clerkId, isPremium, premiumType } = args;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      isPremium: isPremium,
      premiumType: premiumType || undefined,
    });

    return { success: true };
  },
});

// Update daily query count
export const updateDailyQueryCount = mutation({
  args: {
    clerkId: v.string(),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const { clerkId, count } = args;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split('T')[0];
    
    await ctx.db.patch(user._id, {
      dailyQueryCount: count,
      lastQueryDate: today,
    });

    return { success: true };
  },
});