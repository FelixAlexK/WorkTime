<script setup lang="ts">


import { ref, watch } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id } from 'convex/_generated/dataModel.js';
import PageHeader from '@/components/PageHeader.vue';
import ButtonComponent from '@/components/ButtonComponent.vue';
import { PlusCircle, PenBoxIcon } from 'lucide-vue-next';
import ProjectItem from '@/components/ProjectItem.vue';

const { mutate } = useConvexMutation(api.projects.deleteProject)

const isEditing = ref(false)

const deleteProjectById = async (id: Id<'projects'>) => {

  if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    isEditing.value = false
    return
  }
  await mutate({ id: id })
}
</script>

<template>
  <div class="flex flex-col h-full">

    <PageHeader label="Projects">
      <template #action>



        <ButtonComponent :outlined="false" :label="'New'">
          <template #icon>
            <PlusCircle class="size-4">
            </PlusCircle>
          </template>
        </ButtonComponent>
        <ButtonComponent @action="isEditing = !isEditing" :outlined="true" :label="'Edit'">
          <template #icon>
            <PenBoxIcon class="size-4">
            </PenBoxIcon>
          </template>
        </ButtonComponent>




      </template>
    </PageHeader>

    <div class=" h-full overflow-auto w-full flex gap-4 flex-col items-start p-8">

      <ConvexQuery :query="api.projects.getProjects" :args="{}">
        <template #loading>Loading...</template>
        <template #error="{ error }">{{ error }}</template>
        <template #empty>No Projects yet.</template>
        <template #default="{ data: projects }">
          <div class="w-full" v-for="project in projects" :key="project._id">
            <ProjectItem :edit="isEditing" :name="project.name" :date="new
              Date(project._creationTime).toLocaleDateString()"
              @open="$router.push({ name: 'times', params: { id: project._id, project: project.name } })"
              @delete="deleteProjectById(project._id)"></ProjectItem>
          </div>
        </template>
      </ConvexQuery>
    </div>
  </div>


</template>
