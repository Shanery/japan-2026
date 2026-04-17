import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("days")
      .withIndex("by_dayNumber")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("days") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByNumber = query({
  args: { dayNumber: v.number() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("days")
      .withIndex("by_dayNumber", (q) => q.eq("dayNumber", args.dayNumber))
      .collect();
    return results[0] || null;
  },
});

export const create = mutation({
  args: {
    dayNumber: v.number(),
    date: v.string(),
    city: v.string(),
    summary: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("days", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("days"),
    dayNumber: v.optional(v.number()),
    date: v.optional(v.string()),
    city: v.optional(v.string()),
    summary: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});
