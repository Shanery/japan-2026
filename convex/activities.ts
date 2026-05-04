import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const attachmentValidator = v.object({
  storageId: v.id("_storage"),
  name: v.string(),
  contentType: v.optional(v.string()),
});

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

        const attachments = await Promise.all(
          (activity.attachments ?? []).map(async (a) => ({
            ...a,
            url: await ctx.storage.getUrl(a.storageId),
          }))
        );

        return {
          ...activity,
          totalAUD: totalAUD || undefined,
          totalJPY: totalJPY || undefined,
          budgetItemCount: budgetItems.length,
          attachments,
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
    attachments: v.optional(v.array(attachmentValidator)),
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
    attachments: v.optional(v.array(attachmentValidator)),
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
    const activity = await ctx.db.get(args.id);
    if (activity?.attachments) {
      for (const attachment of activity.attachments) {
        await ctx.storage.delete(attachment.storageId);
      }
    }
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

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const addAttachment = mutation({
  args: {
    id: v.id("activities"),
    attachment: attachmentValidator,
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.id);
    if (!activity) throw new Error("Activity not found");
    const attachments = [...(activity.attachments ?? []), args.attachment];
    await ctx.db.patch(args.id, { attachments });
  },
});

export const removeAttachment = mutation({
  args: {
    id: v.id("activities"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.id);
    if (!activity) throw new Error("Activity not found");
    const attachments = (activity.attachments ?? []).filter(
      (a) => a.storageId !== args.storageId
    );
    await ctx.db.patch(args.id, { attachments });
    await ctx.storage.delete(args.storageId);
  },
});
