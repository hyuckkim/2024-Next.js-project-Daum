import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const create = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const guestbook = await ctx.db.insert("guestbooks", {
      userId,
      comments: [],
    });

    return guestbook;
  },
});

export const addComment = mutation({
  args: {
    id: v.id("guestbooks"),
    name: v.string(),
    password: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const existingBook = await ctx.db.get(args.id);

    if (!existingBook) {
      throw new Error("Not found");
    }

    const book = ctx.db.patch(args.id, {
      comments: [...existingBook.comments, {
        name: args.name,
        password: args.password,
        content: args.content,

        time: new Date().toString(),
        id: uuidv4(),
      }],
    });

    return book;
  },
});

export const removeComment = mutation({
  args: {
    id: v.id("guestbooks"),
    commentId: v.string(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingBook = await ctx.db.get(args.id);

    if (!existingBook) {
      throw new Error("Not found");
    }
    
    const existingComment = existingBook.comments.filter(c => c.id === args.commentId)[0];

    if (!existingComment) {
      throw new Error("Not found");
    }

    if (!!args.password) {
      if (existingComment.password !== args.password) {
        throw new Error("incorrect password");
      }

      const book = ctx.db.patch(args.id, {
        comments: existingBook.comments
          .filter(c => c.id !== args.commentId),
      });

      return book;
    } else {
      const identity = await ctx.auth.getUserIdentity();
  
      if (!identity) {
        throw new Error("Not authenticated");
      }
  
      const userId = identity.subject;

      if (existingBook.userId !== userId) {
        throw new Error("Unauthorized");
      }

      const book = ctx.db.patch(args.id, {
        comments: existingBook.comments
          .filter(c => c.id !== args.commentId),
      });

      return book;
    }
  },
});

export const get = query({
  args: {
    id: v.id("guestbooks"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id);

    if (!document) {
      throw new Error("Not found");
    }

    return {...document,
      comments: document.comments.map(v => {
        return {
          ...v,
          password: undefined,
        }
      })
    };
  }
})

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, 
          v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}