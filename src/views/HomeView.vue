<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id } from 'convex/_generated/dataModel.js';
import PageHeader from '@/components/PageHeader.vue';
import ButtonComponent from '@/components/ButtonComponent.vue';
import { PlusCircle, PenBoxIcon } from 'lucide-vue-next';
import ProjectItem from '@/components/ProjectItem.vue';
import DrawerComponent from '@/components/DrawerComponent.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';

const projectName = ref<string | undefined>(undefined)
const projectDescription = ref<string | undefined>(undefined)
const searchInput = ref('')
const openDrawer = ref(false)
const showAlert = ref(false)
const errorMessage = ref('')
const isEditing = ref(false)

const deleteProject = useConvexMutation(api.projects.deleteProject)
const insertNewProject = useConvexMutation(api.projects.createProject)

const deleteProjectById = async (id: Id<'projects'>) => {

  try {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      isEditing.value = false
      return
    }
    await deleteProject.mutate({ id: id })
    if (deleteProject.error.value) {
      errorMessage.value = 'Error while deleting project'
      showAlert.value = true
    }
  } catch (error) {
    throw new Error('Error while deleting project')
  }



}

const createNewProject = async () => {
  try {
    if (!projectName.value) return
    await insertNewProject.mutate({ name: projectName.value, description: projectDescription.value })
    if (insertNewProject.error.value) {
      errorMessage.value = 'Error while creating project'
      showAlert.value = true
    }

  } catch (error) {
    throw new Error('Error while creating project')
  } finally {
    openDrawer.value = false
    projectName.value = undefined
    projectDescription.value = undefined
  }

}

watchEffect(() => {
  if (searchInput.value.trim() !== '') {
    searchInput.value
  }
})
</script>

<template>
  <div>

    <Teleport to="body">
      <ErrorAlert @dismiss="showAlert = false" :show="showAlert" :message="errorMessage"></ErrorAlert>
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

            </ButtonComponent>
          </form>
        </template>
      </DrawerComponent>
    </Teleport>



    <div class="flex flex-col h-full">


      <PageHeader label="Projects">
        <template #search>

          <input placeholder="search project" v-model="searchInput" class="outline outline-1 px-2 py-1 rounded w-full"
            type="search" name="" id="">
        </template>
        <template #action>

          <ButtonComponent @action="openDrawer = !openDrawer" :label="'New'">
            <template #prefix>
              <PlusCircle class="size-4">
              </PlusCircle>
            </template>
          </ButtonComponent>

          <ButtonComponent @action="isEditing = !isEditing" outlined :label="'Edit'">
            <template #prefix>
              <PenBoxIcon class="size-4">
              </PenBoxIcon>
            </template>
          </ButtonComponent>





        </template>
      </PageHeader>

      <div v-auto-animate class=" h-full overflow-auto w-full flex gap-4 flex-col items-start p-8">

        <ConvexQuery :query="api.projects.searchProjectByName" :args="{ name: searchInput }">
          <template #loading>Loading...</template>
          <template #error="{ error }">{{ error }}</template>
          <template #empty>
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
          </template>
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
