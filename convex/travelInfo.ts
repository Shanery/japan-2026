import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("travelInfo").collect();
    // Sort by dayNumber then order
    return items.sort((a, b) => {
      const dayDiff = (a.dayNumber ?? 0) - (b.dayNumber ?? 0);
      if (dayDiff !== 0) return dayDiff;
      return a.order - b.order;
    });
  },
});

export const create = mutation({
  args: {
    type: v.union(
      v.literal("flight"),
      v.literal("train"),
      v.literal("hotel"),
      v.literal("car")
    ),
    title: v.string(),
    details: v.string(),
    bookingReference: v.optional(v.string()),
    confirmationNumber: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    dayNumber: v.optional(v.number()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("travelInfo", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("travelInfo"),
    type: v.optional(
      v.union(
        v.literal("flight"),
        v.literal("train"),
        v.literal("hotel"),
        v.literal("car")
      )
    ),
    title: v.optional(v.string()),
    details: v.optional(v.string()),
    bookingReference: v.optional(v.string()),
    confirmationNumber: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    dayNumber: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("travelInfo") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
