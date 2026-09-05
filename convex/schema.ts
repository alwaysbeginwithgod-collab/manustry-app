import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users Table
users: defineTable({
  clerkId: v.string(),
  email: v.string(),
  fullName: v.string(),
  isPremium: v.boolean(),
  premiumType: v.optional(v.union(v.literal("monthly"), v.literal("lifetime"))),
  dailyQueryCount: v.number(),
  lastQueryDate: v.string(),
  createdAt: v.string(),
})
.index("by_clerkId", ["clerkId"])
.index("by_email", ["email"]),

  // Premium Users Table
  premiumUsers: defineTable({
    userId: v.string(),
    email: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("lifetime")),
    startDate: v.number(),
    endDate: v.union(v.number(), v.null()),
    paymentId: v.string(),
    paymentMethod: v.union(v.literal("paypal"), v.literal("gcash"), v.literal("maya")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("active"), v.literal("expired"), v.literal("cancelled")),
  })
  .index("by_userId", ["userId"])
  .index("by_status", ["status"]),

  // Query Limits Table
  queryLimits: defineTable({
    userId: v.string(),
    date: v.string(),
    count: v.number(),
  })
  .index("by_userId_date", ["userId", "date"]),

  // Chat History Table
  chatHistory: defineTable({
    userId: v.string(),
    conversationId: v.string(),
    title: v.string(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.number(),
    })),
    category: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
    lastUpdated: v.number(),
  })
  .index("by_userId", ["userId"])
  .index("by_userId_lastUpdated", ["userId", "lastUpdated"]),

  // Devotions Table
  devotions: defineTable({
    title: v.string(),
    scriptureRef: v.string(),
    reflection: v.string(),
    rhymingQuote: v.string(),
    imageUrl: v.optional(v.string()),
    indexOrder: v.number(),
  })
  .index("by_indexOrder", ["indexOrder"]),

  // Books Table
  books: defineTable({
    title: v.string(),
    description: v.string(),
    coverImage: v.optional(v.string()),
    amazonUrl: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    series: v.optional(v.string()),
    isStandalone: v.boolean(),
  })
  .index("by_series", ["series"]),

  // Daily Bible Verses Table
  dailyVerses: defineTable({
    verse: v.string(),
    reference: v.string(),
  })
  .index("by_reference", ["reference"]),

  // Query Suggestions Table
  querySuggestions: defineTable({
    text: v.string(),
    isActive: v.boolean(),
  })
  .index("by_active", ["isActive"]),

  // Payments Table
  payments: defineTable({
    userId: v.string(),
    amount: v.number(),
    currency: v.string(),
    method: v.union(
      v.literal("paypal"),
      v.literal("gcash"),
      v.literal("maya")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    premiumType: v.union(v.literal("monthly"), v.literal("lifetime")),
    paymentId: v.optional(v.string()),
    createdAt: v.string(),
  })
  .index("by_userId", ["userId"])
  .index("by_status", ["status"]),

  // Webster 1828 Dictionary Table
  webster1828: defineTable({
    word: v.string(),
    definition: v.string(),
  })
  .index("by_word", ["word"]),

  // Easton's Bible Dictionary Table
  eastonsDictionary: defineTable({
    word: v.string(),
    definition: v.string(),
  })
  .index("by_word", ["word"]),

  // Smith's Bible Dictionary Table
  smithsDictionary: defineTable({
    word: v.string(),
    definition: v.string(),
  })
  .index("by_word", ["word"]),

  // KJV Bible Verses Table
  kjv: defineTable({
    book: v.string(),
    chapter: v.number(),
    verse: v.number(),
    text: v.string(),
  })
  .index("by_book_chapter_verse", ["book", "chapter", "verse"]),

  // Writer Content Table
  writerContent: defineTable({
    userId: v.string(),
    title: v.string(),
    category: v.string(),
    content: v.string(),
    plainText: v.string(),
    lastUpdated: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"]),
});