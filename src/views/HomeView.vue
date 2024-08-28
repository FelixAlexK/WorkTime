<script setup lang="ts">


import { ref, watch } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id } from 'convex/_generated/dataModel.js';

const { mutate } = useConvexMutation(api.projects.deleteProject)

const isEditing = ref(false)

const deleteProjectById = async (id: Id<'projects'>) => {

  if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return
  await mutate({ id: id })
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-row h-16 w-full border-b-2 border-black items-center px-8 justify-between ">
      <h1 class="font-bold text-xl">Projects</h1>

      <div class="flex gap-4">

        <button class="w-16 h-8  rounded-sm bg-blue-600 text-white shadow-lg hover:shadow hover:scale-95">New</button>
        <button @click="isEditing = !isEditing"
          class="w-16 h-8 disabled:border-gray-400 disabled:text-gray-400 disabled:hover:bg-white disabled:scale-100 disabled:shadow-none  rounded-sm  border-2 border-blue-600  text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow hover:scale-95">Edit</button>
      </div>
    </div>

    <div class=" h-full overflow-auto w-full flex gap-4 flex-col items-start p-8">

      <ConvexQuery :query="api.projects.getProjects" :args="{}">
        <template #loading>Loading...</template>
        <template #error="{ error }">{{ error }}</template>
        <template #empty>No Projects yet.</template>
        <template #default="{ data: projects }">
          <div
            class="max-w-xl w-full h-12 outline outline-2 shadow-lg rounded-sm flex flex-row items-center  justify-between "
            v-for="project in projects" :key="project._id">
            <p class="font-bold pl-4">{{ project.name }}</p>
            <time class="text-gray-400 font-light" :datetime="new Date(project._creationTime).toLocaleString()">{{ new
              Date(project._creationTime).toLocaleString() }}</time>
            <div v-if="isEditing" class="flex  items-center h-full flex-row overflow-hidden">
              <button class="bg-red-400 p-4 " @click="deleteProjectById(project._id)">delete</button>
            </div>
            <button v-else class="w-16 h-8 mr-4 rounded-sm bg-blue-600 text-white shadow-lg hover:shadow hover:scale-95"
              @click="$router.push({ name: 'times', params: { id: project._id, project: project.name } })">open</button>
          </div>
        </template>
      </ConvexQuery>
    </div>
  </div>


</template>
