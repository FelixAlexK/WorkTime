<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id, DataModel } from 'convex/_generated/dataModel.js';
import TimeEntry from '@/components/TimeEntry.vue';
import { RefreshCcw } from 'lucide-vue-next';

const props = defineProps<{ id: string, project: string }>()

const isEditing = ref(false)
const showCurrentWorkingTime = ref(false)
const isLoadingCurrentWorkingTime = ref(false)
const currentWorkingTime = ref('00:00')
const runningWorkingTime = ref<DataModel['time_entries']['document']>()


const endWorkTime = useConvexMutation(api.time_entries.endWorkTime)
const startWorkTime = useConvexMutation(api.time_entries.startWorkTime)
const deleteTimeEntry = useConvexMutation(api.time_entries.deleteTimeEntryById)
const getRunningTimeEntry = useConvexQuery(api.time_entries.getRunningTimeEntryByProjectId, { project_id: props.id as Id<'projects'> })

const endWorkMutation = async (id: Id<'time_entries'>) => {
    await endWorkTime.mutate({ id: id })
    showCurrentWorkingTime.value = false
}

const startWork = async (id: Id<'projects'>) => {
    isEditing.value = false
    const result = await startWorkTime.mutate({ project_id: id })
    if (!result) {
        alert('First stop the current working time to start a new one')
    }

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

const getCurrentWorkingTime = () => {
    isLoadingCurrentWorkingTime.value = true
    if (!runningWorkingTime.value?.start_time) return
    currentWorkingTime.value = getWorktime(Date.now() - runningWorkingTime.value?.start_time)
    isLoadingCurrentWorkingTime.value = false

}

const toggleCurrentWorkingTime = () => {
    runningWorkingTime.value = getRunningTimeEntry.data.value ?? undefined
    if (!runningWorkingTime.value) {
        alert('no running working time')
        return
    }
    showCurrentWorkingTime.value = !showCurrentWorkingTime.value
}

onMounted(() => {
    runningWorkingTime.value = getRunningTimeEntry.data.value ?? undefined
})

</script>

<template>
    <div>
        <div
            class="not-printable flex flex-col sm:flex-row h-fit gap-4 p-4 sm:h-16 w-full border-b-2 border-black items-center px-8 justify-between ">
            <h1 @click="$router.push({ name: 'home' })" class="font-bold text-xl cursor-pointer text-nowrap">{{ project
                }}</h1>
            <div class="flex flex-row gap-2">
                <ConvexQuery :query="api.time_entries.getTotalWorkingTimeByProjectId"
                    :args="{ project_id: id as Id<'projects'> }">

                    <template #default="{ data: workingTime }">
                        <h2>total working time:</h2>
                        <time class="font-semibold" :datetime="getWorktime(workingTime)">{{ getWorktime(workingTime)
                            }}</time>
                    </template>
                </ConvexQuery>
            </div>

            <div class="flex gap-4">
                <button @click="startWork(id as Id<'projects'>)"
                    class="w-16 h-8  rounded-sm bg-blue-600  text-white shadow-lg hover:shadow hover:scale-95">Start</button>
                <button @click="isEditing = !isEditing"
                    class="w-16 h-8 disabled:border-gray-400 disabled:text-gray-400 disabled:hover:bg-white disabled:scale-100 disabled:shadow-none  rounded-sm  border-2 border-blue-600  text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow hover:scale-95">Edit</button>
                <button @click="print"
                    class="w-16 h-8   rounded-sm  border-2 border-blue-600  text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow hover:scale-95">Print</button>
                <button @click="toggleCurrentWorkingTime"
                    class="w-16 h-8    rounded-sm  border-2 border-blue-600  text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow hover:scale-95">Current</button>

            </div>

            <div v-if="showCurrentWorkingTime" class="flex flex-row gap-2 items-center">

                <h2>{{ currentWorkingTime }}</h2>
                <RefreshCcw v-if="isLoadingCurrentWorkingTime" class="cursor-pointer size-4 animate-spin"></RefreshCcw>
                <RefreshCcw v-else @click="getCurrentWorkingTime" class="cursor-pointer size-4"></RefreshCcw>

            </div>

        </div>
        <div class=" h-full overflow-auto w-full flex gap-4 flex-col items-start p-8">

            <ConvexQuery :query="api.time_entries.getTimeEntriesByProjectId"
                :args="{ project_id: id as Id<'projects'> }">
                <template #loading>Loading...</template>
                <template #error="{ error }">{{ error }}</template>
                <template #empty>No Entries yet.</template>
                <template #default="{ data: entries }">
                    <div id="printable-content" class="w-full" v-for="entry in entries" :key="entry._id">


                        <TimeEntry @end-work="endWorkMutation(entry._id)" @delete-entry="deleteTimeEntryById(entry._id)"
                            :creation-time="entry._creationTime" :end-time="entry.end_time" :is-editing="isEditing"
                            :start-time="entry.start_time">
                            <template #working-time>
                                <ConvexQuery :query="api.time_entries.getWorktimeById" :args="{ id: entry._id }">
                                    <template #default="{ data: worktime }"><time class="font-semibold"
                                            :datetime="getWorktime(worktime)">{{
                                                getWorktime(worktime) }}</time></template>
                                </ConvexQuery>
                            </template>
                        </TimeEntry>

                    </div>
                </template>
            </ConvexQuery>
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