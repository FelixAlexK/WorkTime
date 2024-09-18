<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id } from 'convex/_generated/dataModel.js';
import PageHeader from '@/components/PageHeader.vue';
import ButtonComponent from '@/components/ButtonComponent.vue';
import { PlusCircle, PenBoxIcon, Settings } from 'lucide-vue-next';
import ProjectItem from '@/components/ProjectItem.vue';
import DrawerComponent from '@/components/DrawerComponent.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import { useI18n } from 'vue-i18n'
import { SignedIn, ClerkLoaded } from 'vue-clerk'

const { t } = useI18n()

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
      <DrawerComponent :label="t('project.create.label')" @close-drawer="openDrawer = false" :is-open="openDrawer">
        <template #content>
          <form @submit.prevent="createNewProject" class="gap-4 flex flex-col">
            <div class="flex flex-col gap-2 border border-gray-200 rounded shadow p-4">
              <div id="start" class="flex flex-col gap-2 items-start">
                <input :placeholder="t('project.create.input.name')" required v-model="projectName"
                  class="outline outline-1 px-2 py-1 rounded w-full" type="text">
                <input :placeholder="t('project.create.input.description')" v-model="projectDescription"
                  class="outline outline-1 px-2 py-1 rounded w-full" type="text">
              </div>
            </div>

            <ButtonComponent :type="'submit'" :label="t('project.create.submit')">

            </ButtonComponent>
          </form>
        </template>
      </DrawerComponent>
    </Teleport>



    <div class="flex flex-col h-full">


      <PageHeader :label="t('project.title')">
        <template #search>

          <input :placeholder="t('project.search.placeholder')" v-model="searchInput"
            class="outline outline-1 px-4 py-2 rounded w-full focus:ring-2 focus:ring-offset-1 focus:ring-black"
            type="search" name="" id="">
        </template>
        <template #action>

          <ButtonComponent @action="openDrawer = !openDrawer" :label="t('project.actions.new')">
            <template #prefix>
              <PlusCircle class="size-4">
              </PlusCircle>
            </template>
          </ButtonComponent>

          <ButtonComponent @action="isEditing = !isEditing" outlined :label="t('project.actions.edit')">
            <template #prefix>
              <PenBoxIcon class="size-4">
              </PenBoxIcon>
            </template>
          </ButtonComponent>

          <ButtonComponent @action="$router.push({ name: 'settings' })" outlined :label="t('project.actions.settings')">
            <template #prefix>
              <Settings class="size-4">
              </Settings>
            </template>
          </ButtonComponent>





        </template>
      </PageHeader>

      <div v-auto-animate class=" h-full overflow-auto w-full flex gap-4 flex-col items-start p-8">
        <SignedIn>
          <ConvexQuery :query="api.projects.searchProjectByName" :args="{ name: searchInput }">
            <template #loading>Loading...</template>
            <template #error="{ error }">

              {{ error }}

            </template>
            <template #empty>

              {{ t('project.empty') }}

            </template>
            <template #default="{ data: projects }">
              <ClerkLoaded>
                <div class="w-full" v-for="project in projects" :key="project._id">
                  <ProjectItem :edit="isEditing" :name="project.name" :date="project._creationTime"
                    @open="$router.push({ name: 'times', params: { id: project._id, project: project.name } })"
                    @delete="deleteProjectById(project._id)"></ProjectItem>
                </div>
              </ClerkLoaded>

            </template>
          </ConvexQuery>
        </SignedIn>
      </div>
    </div>
  </div>



</template>
