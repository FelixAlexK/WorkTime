<script setup lang="ts">


import { ref, watch } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id } from 'convex/_generated/dataModel.js';
import PageHeader from '@/components/PageHeader.vue';
import ButtonComponent from '@/components/ButtonComponent.vue';
import { PlusCircle, PenBoxIcon } from 'lucide-vue-next';
import ProjectItem from '@/components/ProjectItem.vue';
import DrawerComponent from '@/components/DrawerComponent.vue';

const projectName = ref<string | undefined>(undefined)
const projectDescription = ref<string | undefined>(undefined)
const openDrawer = ref(false)

const { mutate } = useConvexMutation(api.projects.deleteProject)
const insertNewProject = useConvexMutation(api.projects.createProject)

const isEditing = ref(false)

const deleteProjectById = async (id: Id<'projects'>) => {

  if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    isEditing.value = false
    return
  }
  await mutate({ id: id })
}

const createNewProject = () => {
  if (!projectName.value) return
  insertNewProject.mutate({ name: projectName.value, description: projectDescription.value })
  openDrawer.value = false
  projectName.value = undefined
  projectDescription.value = undefined
}
</script>

<template>
  <div>

    <Teleport to="body">
      <DrawerComponent :label="'Set Project'" @close-drawer="openDrawer = false" :is-open="openDrawer">
        <template #content>
          <form @submit.prevent="createNewProject" class="gap-4 flex flex-col">
            <div class="flex flex-col gap-2 border border-gray-200 rounded shadow p-4">
              <div id="start" class="flex flex-col gap-2 items-start">
                <input placeholder="name" required v-model="projectName"
                  class="outline outline-1 px-2 py-1 rounded w-full" type="text">
                <input placeholder="description" v-model="projectDescription"
                  class="outline outline-1 px-2 py-1 rounded w-full" type="text">
              </div>
            </div>

            <ButtonComponent :type="'submit'" :label="'Submit'">
              <template #icon>
                <PlusCircle class="size-4">
                </PlusCircle>
              </template>
            </ButtonComponent>
          </form>
        </template>
      </DrawerComponent>
    </Teleport>



    <div class="flex flex-col h-full">


      <PageHeader label="Projects">
        <template #action>



          <ButtonComponent @action="openDrawer = !openDrawer" :label="'New'">
            <template #icon>
              <PlusCircle class="size-4">
              </PlusCircle>
            </template>
          </ButtonComponent>
          <ButtonComponent @action="isEditing = !isEditing" outlined :label="'Edit'">
            <template #icon>
              <PenBoxIcon class="size-4">
              </PenBoxIcon>
            </template>
          </ButtonComponent>




        </template>
      </PageHeader>

      <div v-auto-animate class=" h-full overflow-auto w-full flex gap-4 flex-col items-start p-8">

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
  </div>



</template>
