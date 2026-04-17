import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("budgetItems").collect();
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgetItems")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const create = mutation({
  args: {
    category: v.string(),
    description: v.string(),
    amountAUD: v.optional(v.number()),
    amountJPY: v.optional(v.number()),
    isPaid: v.boolean(),
    dayNumber: v.optional(v.number()),
    notes: v.optional(v.string()),
    activityId: v.optional(v.id("activities")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("budgetItems", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("budgetItems"),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    amountAUD: v.optional(v.number()),
    amountJPY: v.optional(v.number()),
    isPaid: v.optional(v.boolean()),
    dayNumber: v.optional(v.number()),
    notes: v.optional(v.string()),
    activityId: v.optional(v.id("activities")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const listByActivity = query({
  args: { activityId: v.id("activities") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgetItems")
      .withIndex("by_activityId", (q) => q.eq("activityId", args.activityId))
      .collect();
  },
});

export const remove = mutation({
  args: { id: v.id("budgetItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getTotals = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("budgetItems").collect();

    let totalAUD = 0;
    let totalJPY = 0;
    let paidAUD = 0;
    let paidJPY = 0;

    for (const item of items) {
      if (item.amountAUD) {
        totalAUD += item.amountAUD;
        if (item.isPaid) {
          paidAUD += item.amountAUD;
        }
      }
      if (item.amountJPY) {
        totalJPY += item.amountJPY;
        if (item.isPaid) {
          paidJPY += item.amountJPY;
        }
      }
    }

    return {
      totalAUD,
      totalJPY,
      paidAUD,
      paidJPY,
      remainingAUD: totalAUD - paidAUD,
      remainingJPY: totalJPY - paidJPY,
    };
  },
});
