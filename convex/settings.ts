import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();
    return results[0] || null;
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if key already exists
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();

    if (existing.length > 0) {
      // Update existing
      await ctx.db.patch(existing[0]._id, { value: args.value });
      return await ctx.db.get(existing[0]._id);
    } else {
      // Create new
      return await ctx.db.insert("settings", args);
    }
  },
});

export const getExchangeRate = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "exchangeRate"))
      .collect();

    if (setting.length > 0) {
      return parseFloat(setting[0].value);
    }
    return 100; // Default: AUD 1 = JPY 100
  },
});
