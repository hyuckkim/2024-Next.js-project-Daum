import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

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
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const calendar = await ctx.db.get(args.calendarId);

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
