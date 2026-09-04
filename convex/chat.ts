import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// SAVE CONVERSATION
// ============================================================
export const saveConversation = mutation({
  args: {
    userId: v.string(),
    chatId: v.optional(v.string()),
    title: v.string(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
      timestamp: v.number(),
    })),
    category: v.optional(v.string()),
    pinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    console.log("📝 Convex: saveConversation called with:", {
      userId: args.userId,
      chatId: args.chatId,
      title: args.title,
      messagesCount: args.messages.length,
    });

    if (args.chatId) {
      const existing = await ctx.db
        .query("chatHistory")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("conversationId"), args.chatId))
        .first();

      if (existing) {
        console.log("📝 Convex: Updating existing conversation:", existing._id);
        await ctx.db.patch(existing._id, {
          title: args.title,
          messages: args.messages,
          category: args.category || existing.category,
          pinned: args.pinned !== undefined ? args.pinned : existing.pinned,
          lastUpdated: now,
        });
        return existing._id;
      }
    }

    console.log("📝 Convex: Creating new conversation");
    const newId = await ctx.db.insert("chatHistory", {
      userId: args.userId,
      conversationId: args.chatId || "",
      title: args.title,
      messages: args.messages,
      category: args.category || "general",
      pinned: args.pinned || false,
      lastUpdated: now,
    });
    console.log("📝 Convex: Created new conversation with ID:", newId);
    return newId;
  },
});

// ============================================================
// LOAD ALL CONVERSATIONS FOR USER
// ============================================================
export const loadConversations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    console.log("📊 Convex: Loading conversations for user:", args.userId);
    const results = await ctx.db
      .query("chatHistory")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    console.log("📊 Convex: Found", results.length, "conversations");
    return results;
  },
});

// ============================================================
// LOAD SINGLE CONVERSATION
// ============================================================
export const loadConversation = query({
  args: { chatId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatHistory")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("conversationId"), args.chatId))
      .first();
  },
});

// ============================================================
// ✅ DELETE CONVERSATION - FIXED: Use _id directly with type assertion
// ============================================================
export const deleteConversation = mutation({
  args: { 
    chatId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("🗑️ Convex: Deleting conversation with _id:", args.chatId);
    
    // ✅ Get the conversation by _id directly with type assertion
    const conversation = await ctx.db.get(args.chatId as any);

    if (!conversation) {
      console.log("❌ Convex: Conversation not found with _id:", args.chatId);
      return;
    }

    // ✅ Check if it's a chatHistory document (has userId field)
    if (!('userId' in conversation)) {
      console.log("❌ Convex: Document is not a chatHistory entry");
      return;
    }

    // ✅ Verify the conversation belongs to this user
    if (conversation.userId !== args.userId) {
      console.log("❌ Convex: Conversation does not belong to this user");
      return;
    }

    console.log("🗑️ Convex: Found conversation to delete:", conversation._id);
    await ctx.db.delete(conversation._id);
    console.log("✅ Convex: Conversation deleted");
  },
});

// ============================================================
// ✅ UPDATE CONVERSATION TITLE - FIXED: Use _id directly with type assertion
// ============================================================
export const updateTitle = mutation({
  args: {
    chatId: v.string(),
    userId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("✏️ Convex: Updating title for _id:", args.chatId);
    
    // ✅ Get the conversation by _id directly with type assertion
    const conversation = await ctx.db.get(args.chatId as any);

    if (!conversation) {
      console.log("❌ Convex: Conversation not found with _id:", args.chatId);
      return;
    }

    // ✅ Check if it's a chatHistory document (has userId field)
    if (!('userId' in conversation)) {
      console.log("❌ Convex: Document is not a chatHistory entry");
      return;
    }

    // ✅ Verify the conversation belongs to this user
    if (conversation.userId !== args.userId) {
      console.log("❌ Convex: Conversation does not belong to this user");
      return;
    }

    console.log("✏️ Convex: Found conversation:", conversation._id);
    await ctx.db.patch(conversation._id, {
      title: args.title,
      lastUpdated: Date.now(),
    });
    console.log("✅ Convex: Title updated");
  },
});

// ============================================================
// ✅ TOGGLE PIN - FIXED: Use _id directly with type assertion
// ============================================================
export const togglePin = mutation({
  args: {
    chatId: v.string(),
    userId: v.string(),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    console.log("📌 Convex: Toggling pin for _id:", args.chatId, args.pinned);
    
    // ✅ Get the conversation by _id directly with type assertion
    const conversation = await ctx.db.get(args.chatId as any);

    if (!conversation) {
      console.log("❌ Convex: Conversation not found with _id:", args.chatId);
      return;
    }

    // ✅ Check if it's a chatHistory document (has userId field)
    if (!('userId' in conversation)) {
      console.log("❌ Convex: Document is not a chatHistory entry");
      return;
    }

    // ✅ Verify the conversation belongs to this user
    if (conversation.userId !== args.userId) {
      console.log("❌ Convex: Conversation does not belong to this user");
      return;
    }

    console.log("📌 Convex: Found conversation:", conversation._id);
    await ctx.db.patch(conversation._id, {
      pinned: args.pinned,
      lastUpdated: Date.now(),
    });
    console.log("✅ Convex: Pin toggled");
  },
});

// ============================================================
// SEARCH CONVERSATIONS
// ============================================================
export const searchConversations = query({
  args: {
    userId: v.string(),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("chatHistory")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    return conversations.filter(conv =>
      conv.title.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});

// ============================================================
// DELETE ALL CONVERSATIONS FOR USER (Admin)
// ============================================================
export const deleteAllConversations = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("chatHistory")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const conv of conversations) {
      await ctx.db.delete(conv._id);
    }
  },
});