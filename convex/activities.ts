import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByDay = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_dayId", (q) => q.eq("dayId", args.dayId))
      .collect();
  },
});

export const listByDayWithTotals = query({
  args: { dayId: v.id("days") },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_dayId", (q) => q.eq("dayId", args.dayId))
      .collect();

    return await Promise.all(
      activities.map(async (activity) => {
        const budgetItems = await ctx.db
          .query("budgetItems")
          .withIndex("by_activityId", (q) => q.eq("activityId", activity._id))
          .collect();

        let totalAUD = 0;
        let totalJPY = 0;
        for (const item of budgetItems) {
          if (item.amountAUD) totalAUD += item.amountAUD;
          if (item.amountJPY) totalJPY += item.amountJPY;
        }

        return {
          ...activity,
          totalAUD: totalAUD || undefined,
          totalJPY: totalJPY || undefined,
          budgetItemCount: budgetItems.length,
        };
      })
    );
  },
});

export const create = mutation({
  args: {
    dayId: v.id("days"),
    name: v.string(),
    type: v.union(
      v.literal("food"),
      v.literal("activity"),
      v.literal("logistics"),
      v.literal("ticket")
    ),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    googleMapsUrl: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    isBooked: v.optional(v.boolean()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const activityData = {
      ...args,
      isBooked: args.isBooked ?? false,
    };
    return await ctx.db.insert("activities", activityData);
  },
});

export const update = mutation({
  args: {
    id: v.id("activities"),
    dayId: v.optional(v.id("days")),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("food"),
        v.literal("activity"),
        v.literal("logistics"),
        v.literal("ticket")
      )
    ),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    googleMapsUrl: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    isBooked: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const reorder = mutation({
  args: {
    id: v.id("activities"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { order: args.order });
    return await ctx.db.get(args.id);
  },
});
