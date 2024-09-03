import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const startWorkTime = mutation({
  args: { project_id: v.id('projects') },
  handler: async (ctx, args) => {
    const running = await ctx.db
      .query('time_entries')
      .withIndex('by_running', (q) => q.eq('running', true))
      .first()

    if (running) return undefined
    return await ctx.db.insert('time_entries', {
      project_id: args.project_id,
      start_time: Date.now(),
      running: true
    })
  }
})

export const endWorkTime = mutation({
  args: { id: v.id('time_entries') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      end_time: Date.now(),
      running: false
    })
  }
})

export const deleteTimeEntryById = mutation({
  args: { id: v.id('time_entries') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  }
})

export const patchTimeEntryById = mutation({
  args: {
    id: v.id('time_entries'),
    end_time: v.optional(v.float64()),
    start_time: v.optional(v.float64())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { start_time: args.start_time, end_time: args.end_time })
  }
})

export const getTimeEntriesByProjectId = query({
  args: { project_id: v.id('projects') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('time_entries')
      .filter((q) => q.eq(q.field('project_id'), args.project_id))
      .order('desc')
      .collect()
  }
})

export const getTotalWorkingTimeByProjectId = query({
  args: { project_id: v.id('projects') },
  handler: async (ctx, args) => {
    const entries = await getTimeEntriesByProjectId(ctx, { project_id: args.project_id })

    const total = entries.reduce((totalWorkingTime, entry) => {
      if (!entry.end_time) return totalWorkingTime
      return totalWorkingTime + (entry.end_time - entry.start_time)
    }, 0)

    return total
  }
})

export const getRunningTimeEntryByProjectId = query({
  args: { project_id: v.id('projects') },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query('time_entries')
      .filter((q) =>
        q.and(
          q.eq(q.field('project_id'), args.project_id),
          q.eq(q.field('running'), true),
          q.eq(q.field('end_time'), undefined)
        )
      )
      .first()

    return entry
  }
})

export const getWorktimeById = query({
  args: {
    id: v.id('time_entries')
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query('time_entries')
      .filter((q) => q.eq(q.field('_id'), args.id))
      .first()

    const start = entry?.start_time ?? 0
    const end = entry?.end_time ?? 0

    return end - start
  }
})

export const getTimeEntryById = query({
  args: {
    id: v.id('time_entries')
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('time_entries')
      .filter((q) => q.eq(q.field('_id'), args.id))
      .first()
  }
})
