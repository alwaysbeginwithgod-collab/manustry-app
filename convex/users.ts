import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Create or update user
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
    role: v.optional(v.union(v.literal("guest"), v.literal("registered"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = new Date().toISOString();
    const role = args.role || "registered";

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        fullName: args.fullName,
        role: role,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        fullName: args.fullName,
        role: role,
        isPremium: false,
        dailyQueryCount: 0,
        lastQueryDate: now,
        createdAt: now,
      });
    }
  },
});

// Check and increment query count
export const checkAndIncrementQueries = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    const today = new Date().toISOString().split("T")[0];
    const lastQueryDate = user.lastQueryDate?.split("T")[0] || "";

    let dailyQueryCount = user.dailyQueryCount || 0;
    if (lastQueryDate !== today) {
      dailyQueryCount = 0;
    }

    const isPremium = user.isPremium || false;
    const canQuery = isPremium || dailyQueryCount < 7;

    if (!canQuery) {
      return { canQuery: false, remaining: 0, isPremium: false };
    }

    await ctx.db.patch(user._id, {
      dailyQueryCount: dailyQueryCount + 1,
      lastQueryDate: new Date().toISOString(),
    });

    return {
      canQuery: true,
      remaining: 6 - dailyQueryCount,
      isPremium: isPremium,
    };
  },
});

// Update premium status
export const setPremium = mutation({
  args: {
    clerkId: v.string(),
    isPremium: v.boolean(),
    premiumType: v.optional(v.union(v.literal("monthly"), v.literal("lifetime"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      isPremium: args.isPremium,
      premiumType: args.premiumType,
    });
  },
});

// Get all users (admin)
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});