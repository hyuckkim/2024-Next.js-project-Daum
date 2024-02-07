import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  calendars: defineTable({
    title: v.string(),
    userId: v.string(),
    newCalendar: v.optional(v.id("calendars")),
    icon: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    content: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  boards: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    content: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    connectedCalendar: v.optional(v.id("calendars")),
  }).index("by_user", ["userId"]),
});
