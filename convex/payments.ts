import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Record a payment
export const recordPayment = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    currency: v.string(),
    method: v.union(v.literal("paypal"), v.literal("gcash"), v.literal("maya")),
    premiumType: v.union(v.literal("monthly"), v.literal("lifetime")),
    paymentId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("payments", {
      userId: args.userId,
      amount: args.amount,
      currency: args.currency,
      method: args.method,
      premiumType: args.premiumType,
      paymentId: args.paymentId,
      status: args.status || "pending",
      createdAt: now,
    });
  },
});

// Get user's payment history
export const getUserPayments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.paymentId, {
      status: args.status,
      paymentId: args.externalId,
    });
  },
});