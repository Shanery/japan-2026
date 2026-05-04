import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  days: defineTable({
    dayNumber: v.number(),
    date: v.string(),
    city: v.string(),
    summary: v.string(),
    region: v.string(),
  }).index("by_dayNumber", ["dayNumber"]),

  activities: defineTable({
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
    isBooked: v.boolean(),
    order: v.number(),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          name: v.string(),
          contentType: v.optional(v.string()),
        })
      )
    ),
  }).index("by_dayId", ["dayId"]),

  budgetItems: defineTable({
    category: v.string(),
    description: v.string(),
    amountAUD: v.optional(v.number()),
    amountJPY: v.optional(v.number()),
    isPaid: v.boolean(),
    dayNumber: v.optional(v.number()),
    notes: v.optional(v.string()),
    activityId: v.optional(v.id("activities")),
  })
    .index("by_category", ["category"])
    .index("by_activityId", ["activityId"]),

  memories: defineTable({
    dayId: v.id("days"),
    note: v.string(),
    photoIds: v.array(v.string()),
    timestamp: v.number(),
  }).index("by_dayId", ["dayId"]),

  travelInfo: defineTable({
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
  }).index("by_dayNumber", ["dayNumber"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
