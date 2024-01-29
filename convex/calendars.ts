import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
  args: { id: v.id("calendars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingCalendar = await ctx.db.get(args.id);

    if (!existingCalendar) {
      throw new Error("Not found");
    }

    if (existingCalendar.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const calendar = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    return calendar;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const calendar = await ctx.db.insert("calendars", {
      title: args.title,
      userId,
      isArchived: false,
      isPublished: false,
    });
    return calendar;
  },
});

export const getById = query({
  args: { newCalendar: v.id("calendars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const calendar = await ctx.db.get(args.newCalendar);
    if (!calendar) {
      throw new Error("Not found");
    }
    if (calendar.isPublished && !calendar.isArchived) {
      return calendar;
    }
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    if (calendar.userId !== userId) {
      throw new Error("Unauthorized");
    }
    return calendar;
  },
});

export const getSidebar = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const calendars = await ctx.db
      .query("calendars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return calendars;
  },
});

export const update = mutation({
  args: {
    id: v.id("calendars"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const userId = identity.subject;

    const { id, ...rest } = args;

    const existingCalendar = await ctx.db.get(args.id);

    if (!existingCalendar) {
      throw new Error("Not found");
    }

    if (existingCalendar.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const calendar = await ctx.db.patch(args.id, {
      ...rest,
    });

    return calendar;
  },
});
