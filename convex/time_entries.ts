import { mutation, query } from './_generated/server'
import type { DataModel } from './_generated/dataModel'
import { ConvexError, v } from 'convex/values'

export const startWorkTime = mutation({
  args: { project_id: v.id('projects') },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throw new ConvexError(`Error while starting work: ${error}`)
    }
  }
})

export const createWorkingTime = mutation({
  args: { project_id: v.id('projects'), start_time: v.number(), end_time: v.number() },
  handler: async (ctx, args) => {
    try {
      await ctx.db.insert('time_entries', {
        project_id: args.project_id,
        start_time: args.start_time,
        end_time: args.end_time
      })
    } catch (error) {
      throw new ConvexError(`Error while creating time entry: ${error}`)
    }
  }
})

export const endWorkTime = mutation({
  args: { id: v.id('time_entries') },
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.id, {
        end_time: Date.now(),
        running: false
      })
    } catch (error) {
      throw new ConvexError(`Error while ending work: ${error}`)
    }
  }
})

export const deleteTimeEntryById = mutation({
  args: { id: v.id('time_entries') },
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.id)
    } catch (error) {
      throw new ConvexError(`Error while deleting time entry: ${error}`)
    }
  }
})

export const patchTimeEntryById = mutation({
  args: {
    id: v.id('time_entries'),
    end_time: v.optional(v.float64()),
    start_time: v.optional(v.float64())
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.id, { start_time: args.start_time, end_time: args.end_time })
    } catch (error) {
      throw new ConvexError(`Error while updating time entry: ${error}`)
    }
  }
})

export const getTimeEntriesByProjectId = query({
  args: { project_id: v.id('projects') },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query('time_entries')
        .filter((q) => q.eq(q.field('project_id'), args.project_id))
        .order('desc')
        .collect()
    } catch (error) {
      throw new ConvexError(`Error while retrieving time entry by project id: ${error}`)
    }
  }
})

export const getTotalWorkingTimeByProjectId = query({
  args: { project_id: v.id('projects') },
  handler: async (ctx, args) => {
    try {
      const entries = await getTimeEntriesByProjectId(ctx, { project_id: args.project_id })

      const total = entries.reduce((totalWorkingTime, entry) => {
        if (!entry.end_time) return totalWorkingTime
        return totalWorkingTime + (entry.end_time - entry.start_time)
      }, 0)

      return total
    } catch (error) {
      throw new ConvexError(`Error while retrieving total working time: ${error}`)
    }
  }
})

export const getRunningTimeEntryByProjectId = query({
  args: { project_id: v.id('projects') },
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throw new ConvexError(`Error while retrieving running time entry: ${error}`)
    }
  }
})

export const getWorktimeById = query({
  args: {
    id: v.id('time_entries')
  },
  handler: async (ctx, args) => {
    try {
      const entry = await ctx.db
        .query('time_entries')
        .filter((q) => q.eq(q.field('_id'), args.id))
        .first()

      const start = entry?.start_time ?? 0
      const end = entry?.end_time ?? 0

      return end - start
    } catch (error) {
      throw new ConvexError(`Error while retrieving working time: ${error}`)
    }
  }
})

export const getTimeEntryById = query({
  args: {
    id: v.id('time_entries')
  },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query('time_entries')
        .filter((q) => q.eq(q.field('_id'), args.id))
        .first()
    } catch (error) {
      throw new ConvexError(`Error while retrieving time entry: ${error}`)
    }
  }
})

export const combineTimeEntries = mutation({
  args: { ids: v.array(v.id('time_entries')) },
  handler: async (ctx, args) => {
    try {
      const entries: DataModel['time_entries']['document'][] = []

      for (const id of args.ids) {
        const entry = await getTimeEntryById(ctx, { id: id })
        if (!entry) continue
        entries.push(entry)
      }

      const startTime = entries.reduce(
        (min, current) => Math.min(min, new Date(current.start_time).getTime()),
        Number.MAX_SAFE_INTEGER
      ) // get min start value
      const endTime = entries.reduce(
        (max, current) => Math.max(max, new Date(current.end_time ?? 0).getTime() ?? 0),
        Number.MIN_SAFE_INTEGER
      ) // get max end value

      await ctx.db.patch(entries[0]._id, { start_time: startTime, end_time: endTime })

      entries.splice(0, 1) // remove 1 element

      for (const entry of entries) {
        await deleteTimeEntryById(ctx, { id: entry._id })
      }
    } catch (error) {
      throw new ConvexError(`Error while combining time entries: ${error}`)
    }
  }
})
