import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  projects: defineTable({
    description: v.optional(v.string()),
    name: v.string(),
    user_id: v.id('users')
  }).searchIndex('search_name', { searchField: 'name' }),
  time_entries: defineTable({
    end_time: v.optional(v.float64()),
    project_id: v.id('projects'),
    start_time: v.float64(),
    running: v.optional(v.boolean())
  })
    .index('by_start_end', ['start_time', 'end_time'])
    .index('by_running', ['running']),
  users: defineTable({
    name: v.string(),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string()
  }).index('byExternalId', ['externalId'])
})
