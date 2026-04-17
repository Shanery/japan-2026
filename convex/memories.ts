import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByDay = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_dayId", (q) => q.eq("dayId", args.dayId))
      .collect();
  },
});

export const create = mutation({
  args: {
    dayId: v.id("days"),
    note: v.string(),
    photoIds: v.array(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memories", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("memories"),
    dayId: v.optional(v.id("days")),
    note: v.optional(v.string()),
    photoIds: v.optional(v.array(v.string())),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("memories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getPhotoUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as any);
  },
});
