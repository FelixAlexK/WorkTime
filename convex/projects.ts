import { mutation, query } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { deleteTimeEntryById, getTimeEntriesByProjectId } from './time_entries'
import { getCurrentUserOrThrow } from './users'

export const createProject = mutation({
  args: { description: v.optional(v.string()), name: v.string() },
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUserOrThrow(ctx)
      await ctx.db.insert('projects', {
        description: args.description,
        name: args.name,
        user_id: user._id
      })
    } catch (error) {
      throw new ConvexError(`Error while creating project: ${error}`)
    }
  }
})

export const deleteProject = mutation({
  args: { id: v.id('projects') },
  handler: async (ctx, args) => {
    try {
      const entries = await getTimeEntriesByProjectId(ctx, { project_id: args.id })

      if (entries.length > 0) {
        for (const entry of entries) {
          await deleteTimeEntryById(ctx, { id: entry._id })
        }
      }

      await ctx.db.delete(args.id)
    } catch (error) {
      throw new ConvexError(`Error while deleting project: ${error}`)
    }
  }
})

export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await ctx.db.query('projects').order('desc').collect()
    } catch (error) {
      throw new ConvexError(`Error while retrieving projects: ${error}`)
    }
  }
})

export const searchProjectByName = query({
  args: { name: v.string() },
  async handler(ctx, args) {
    try {
      const user = await getCurrentUserOrThrow(ctx)
      const searchedProjects = await ctx.db
        .query('projects')
        .withSearchIndex('search_name', (q) => q.search('name', args.name))
        .filter((q) => q.eq(q.field('user_id'), user._id))
        .take(5)

      if (searchedProjects.length === 0) {
        return await ctx.db
          .query('projects')
          .filter((q) => q.eq(q.field('user_id'), user._id))
          .order('desc')
          .collect()
      }

      return searchedProjects
    } catch (error) {
      throw new ConvexError(`Error while searching project: ${error}`)
    }
  }
})
