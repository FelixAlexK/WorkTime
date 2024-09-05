import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { deleteTimeEntryById, getTimeEntriesByProjectId } from './time_entries'

export const createProject = mutation({
  args: { description: v.optional(v.string()), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert('projects', {
      description: args.description,
      name: args.name
    })
  }
})

export const deleteProject = mutation({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    const entries = await getTimeEntriesByProjectId(ctx, { project_id: args.id })

    if (entries.length > 0) {
      for (const entry of entries) {
        await deleteTimeEntryById(ctx, { id: entry._id })
      }
    }

    await ctx.db.delete(args.id)
  }
})

export const getProjects = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query('projects').order('desc').collect()
  }
})

export const searchProjectByName = query({
  args: { name: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query('projects')
      .withSearchIndex('search_name', (q) => q.search('name', args.name))
      .take(5)
  }
})
