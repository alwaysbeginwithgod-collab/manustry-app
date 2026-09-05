import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get today's date as string
const getToday = () => new Date().toISOString().split('T')[0];

// Check remaining queries for a user
export const getRemainingQueries = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const today = getToday();
    
    // Check if user is premium
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();
    
    // Premium users get unlimited queries
    if (user?.isPremium) {
      return { 
        remaining: Infinity, 
        isPremium: true, 
        used: 0,
        maxFree: 10,
        message: "✨ Premium user - Unlimited queries!" 
      };
    }
    
    // Get today's query count
    const queryLimit = await ctx.db
      .query("queryLimits")
      .withIndex("by_userId_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .first();
    
    const used = queryLimit?.count || 0;
    const maxFree = 10;
    const remaining = Math.max(0, maxFree - used);
    
    let message = `📊 ${used} of ${maxFree} free queries used today.`;
    if (remaining === 0) {
      message = "⚠️ You've used all 10 free queries today! Upgrade to premium for unlimited access.";
    }
    
    return { 
      remaining, 
      isPremium: false, 
      used, 
      maxFree,
      message 
    };
  },
});

// Increment query count
export const incrementQueryCount = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const today = getToday();
    
    // Check if user is premium - skip counting if premium
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();
    
    if (user?.isPremium) {
      return { success: true, isPremium: true, message: "✨ Premium user - no limit" };
    }
    
    const existing = await ctx.db
      .query("queryLimits")
      .withIndex("by_userId_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
      });
    } else {
      await ctx.db.insert("queryLimits", {
        userId: args.userId,
        date: today,
        count: 1,
      });
    }
    
    return { success: true, isPremium: false };
  },
});

// Check if user can make a query
export const canMakeQuery = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const today = getToday();
    
    // Check if user is premium
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .first();
    
    if (user?.isPremium) {
      return { 
        canQuery: true, 
        isPremium: true, 
        remaining: Infinity,
        message: "✨ Premium user - Unlimited queries!"
      };
    }
    
    // Get today's query count
    const queryLimit = await ctx.db
      .query("queryLimits")
      .withIndex("by_userId_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .first();
    
    const used = queryLimit?.count || 0;
    const remaining = Math.max(0, 10 - used);
    
    return {
      canQuery: remaining > 0,
      isPremium: false,
      remaining,
      used,
      maxFree: 10,
      message: remaining > 0 ? `${remaining} free queries remaining today` : "⚠️ Free queries used up! Upgrade to premium."
    };
  },
});

// Reset query counts for all users (run daily via cron)
export const resetDailyQueries = mutation({
  args: {},
  handler: async (ctx) => {
    const today = getToday();
    
    // Delete all query limits for today (they'll be recreated as needed)
    const allLimits = await ctx.db.query("queryLimits").collect();
    
    for (const limit of allLimits) {
      if (limit.date !== today) {
        // Keep only today's records, delete old ones
        await ctx.db.delete(limit._id);
      }
    }
    
    return { success: true, message: "Daily query limits reset" };
  },
});