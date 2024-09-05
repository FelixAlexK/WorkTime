<script setup lang="ts">
import { onMounted, ref, Teleport } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id, DataModel } from 'convex/_generated/dataModel.js';
import TimeCard from '@/components/TimeCard.vue';
import TimeEntry from '@/components/TimeEntry.vue';
import { Timer } from 'lucide-vue-next';
import PageHeader from '@/components/PageHeader.vue';
import { Printer, Edit, PlusCircle } from 'lucide-vue-next';
import ButtonComponent from '../components/ButtonComponent.vue';
import DrawerComponent from '@/components/DrawerComponent.vue';

const props = defineProps<{ id: string, project: string }>()

const isEditing = ref(false)
const runningWorkingTime = ref<DataModel['time_entries']['document']>()
const openDrawer = ref(false)
const startTime = ref<string | undefined>(undefined)
const startDate = ref<string | undefined>(undefined)
const endTime = ref<string | undefined>(undefined)
const endDate = ref<string | undefined>(undefined)

const deleteTimeEntry = useConvexMutation(api.time_entries.deleteTimeEntryById)
const insertWorkingTime = useConvexMutation(api.time_entries.createWorkingTime)
const getRunningTimeEntry = useConvexQuery(api.time_entries.getRunningTimeEntryByProjectId, { project_id: props.id as Id<'projects'> })

const getLocalTimeString = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString(undefined, { minute: '2-digit', hour: '2-digit' })
}

const getLocalDateString = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
}

const deleteTimeEntryById = async (id: Id<'time_entries'>) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return
    await deleteTimeEntry.mutate({ id: id })
}



const getWorktime = (timeInMs: number) => {
    // Convert milliseconds to seconds
    const totalSeconds = Math.floor(timeInMs / 1000);

    // Extract hours, minutes, and seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    // Format components to two digits
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    // Return formatted string
    return `${formattedHours}:${formattedMinutes}`;
}


const print = () => {
    isEditing.value = false
    window.print()
}

const convertToTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    return date.getTime()
}

const checkIfDateIsInFuture = (date: Date) => {
    const currentDate = new Date()
    if (date > currentDate) return true
    return false
}

const createWorkingTime = () => {

    if (!startDate.value || !endDate.value) return

    startTime.value ? startTime.value : startTime.value = new Date().toLocaleTimeString()
    endTime.value ? endTime.value : endTime.value = new Date().toLocaleTimeString()

    const dateStart = new Date(startDate.value)
    const dateEnd = new Date(endDate.value)
    if (checkIfDateIsInFuture(dateStart) || checkIfDateIsInFuture(dateEnd)) {
        alert('Start or End date cant be in the future')
        return
    }
    const startString = `${startDate.value} ${startTime.value}`
    const endString = `${endDate.value} ${endTime.value}`
    insertWorkingTime.mutate({ project_id: props.id as Id<'projects'>, start_time: convertToTimestamp(startString), end_time: convertToTimestamp(endString) })
    openDrawer.value = false
    startDate.value = undefined
    endDate.value = undefined
    startTime.value = undefined
    endTime.value = undefined
}

onMounted(() => {
    runningWorkingTime.value = getRunningTimeEntry.data.value ?? undefined
})

</script>

<template>
    <div>
        <Teleport :to="'body'">
            <DrawerComponent :label="'Set Working Time'" @close-drawer="openDrawer = false" :is-open="openDrawer">
                <template #content>
                    <form @submit.prevent="createWorkingTime" class="gap-4 flex flex-col">
                        <div class="flex flex-col gap-2 border border-gray-200 rounded shadow p-4">
                            <label for="start" class="underline underline-offset-2 font-semibold">Start</label>
                            <div id="start" class="flex flex-col gap-2 items-start">
                                <input required v-model="startDate" class="outline outline-1 px-2 py-1 rounded w-full"
                                    type="date">
                                <input v-model="startTime" class="outline outline-1 px-2 py-1 rounded w-full"
                                    type="time">
                            </div>
                        </div>
                        <div class="flex flex-col gap-2 border border-gray-200 rounded shadow p-4">
                            <label for="start" class="underline underline-offset-2 font-semibold">Stop</label>
                            <div id="start" class="flex flex-col gap-2 items-start">
                                <input required v-model="endDate" class="outline outline-1 px-2 py-1 rounded w-full"
                                    type="date">
                                <input v-model="endTime" class="outline outline-1 px-2 py-1 rounded w-full" type="time">
                            </div>
                        </div>
                        <ButtonComponent :type="'submit'" :label="'Submit'">
                            <template #icon>
                                <Plus></Plus>
                            </template>
                        </ButtonComponent>
                    </form>
                </template>
            </DrawerComponent>

        </Teleport>


        <div>
            <PageHeader @return="$router.push('/')" :label="project">
                <template #action>
                    <ButtonComponent @action="print" outlined :label="'Print'">
                        <template #icon>
                            <Printer class="size-4">
                            </Printer>
                        </template>
                    </ButtonComponent>

                    <ButtonComponent outlined :label="'Edit'">
                        <template #icon>
                            <Edit class="size-4">
                            </Edit>
                        </template>
                    </ButtonComponent>
                </template>
            </PageHeader>

            <div class=" p-8 flex flex-col gap-4">
                <TimeCard class="not-printable" :project-id="id as Id<'projects'>">

                </TimeCard>
                <div v-auto-animate
                    class="not-printable w-full h-fit border border-gray-200 rounded shadow p-4 flex flex-col gap-4">
                    <div class=" flex flex-row items-center justify-between  w-full gap-8">

                        <div class="flex flex-row gap-8">
                            <h1 class="font-semibold text-lg flex text-nowrap">Recent Tasks</h1>

                            <ConvexQuery :query="api.time_entries.getTotalWorkingTimeByProjectId"
                                :args="{ project_id: id as Id<'projects'> }">

                                <template #default="{ data: workingTime }">
                                    <div class="flex flex-row items-center gap-2  ">
                                        <Timer class="size-4"></Timer>
                                        <time class="underline" :datetime="getWorktime(workingTime)">{{
                                            getWorktime(workingTime)
                                            }}</time>

                                    </div>

                                </template>
                            </ConvexQuery>
                        </div>

                        <ButtonComponent @action="openDrawer = !openDrawer" label="New">
                            <template #icon>
                                <PlusCircle class="size-4">
                                </PlusCircle>
                            </template>
                        </ButtonComponent>

                    </div>
                    <ConvexQuery :query="api.time_entries.getTimeEntriesByProjectId"
                        :args="{ project_id: id as Id<'projects'> }">

                        <template #loading>loading...</template>
                        <template #empty>no recent tasks yet...</template>

                        <template #default="{ data: entries }">



                            <div v-for="entry in entries" :key="entry._id" id="printable-content">
                                <TimeEntry @delete="deleteTimeEntryById(entry._id)"
                                    :start="getLocalTimeString(entry.start_time)" :stop="entry.end_time ?
                                        getLocalTimeString(entry.end_time ?? 0) :
                                        '--:--'" :workingtime="entry.end_time ?
                                            getWorktime(entry.end_time - entry.start_time) :
                                            '--:--'" :date="getLocalDateString(entry.start_time)"></TimeEntry>
                            </div>


                        </template>
                    </ConvexQuery>
                </div>

            </div>
        </div>
    </div>



</template>

<style scoped lang="css">
@media print {
    body * {
        visibility: hidden;

    }

    .not-printable {
        visibility: hidden;
    }

    #printable-content,
    #printable-content * {
        visibility: visible;

    }


}
</style>