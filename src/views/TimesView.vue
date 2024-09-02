<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id, DataModel } from 'convex/_generated/dataModel.js';
import TimeEntry from '@/components/TimeCard.vue';
import { RefreshCcw } from 'lucide-vue-next';
import { Play, Pause, StopCircle, LoaderCircle, Timer, Calendar, X } from 'lucide-vue-next';

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

const getLocalTimeString = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
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
                <button @click="isEditing = !isEditing"
                    class="w-16 h-8 disabled:border-gray-400 disabled:text-gray-400 disabled:hover:bg-white disabled:scale-100 disabled:shadow-none  rounded-sm  border-2 border-blue-600  text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow hover:scale-95">Edit</button>
                <button @click="print"
                    class="w-16 h-8   rounded-sm  border-2 border-blue-600  text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow hover:scale-95">Print</button>


            </div>

        </div>
        <div class=" p-8 flex flex-col gap-4">
            <TimeEntry class="not-printable" :project-id="id as Id<'projects'>">

            </TimeEntry>
            <div class="not-printable w-full h-fit border border-gray-200 rounded shadow p-4 flex flex-col gap-4">
                <div class=" flex flex-row  w-full gap-8">


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
                <ConvexQuery :query="api.time_entries.getTimeEntriesByProjectId"
                    :args="{ project_id: id as Id<'projects'> }">

                    <template #default="{ data: entries }">

                        <div v-for="entry in entries" :key="entry._id" id="printable-content"
                            class="w-full px-4 py-2 h-fit border border-gray-200 rounded shadow flex flex-row  ">
                            <time datetime="" class="flex flex-row gap-2 items-center text-gray-600">
                                <Calendar class="size-4"></Calendar>{{ getLocalDateString(entry.start_time)
                                }}
                            </time>
                            <div class="flex justify-center w-full gap-8">
                                <div class="flex flex-col gap-2 items-center">

                                    <time class="flex flex-row gap-2 items-center justify-start w-full" datetime="">
                                        <Play class="size-4"></Play>{{ getLocalTimeString(entry.start_time)
                                        }}
                                    </time>
                                    <time class="flex flex-row gap-2 items-center justify-start w-full" datetime="">
                                        <StopCircle class="size-4"></StopCircle>{{ entry.end_time ?
                                            getLocalTimeString(entry.end_time ?? 0) :
                                            '--:--:--'
                                        }}
                                    </time>
                                </div>
                                <time class="flex flex-row gap-2 items-center" :class="{ 'underline': entry.end_time }"
                                    datetime="">
                                    <Timer class="size-4"></Timer>{{ entry.end_time ?
                                        getWorktime(entry.end_time - entry.start_time) :
                                        '--:--'
                                    }}
                                </time>
                            </div>

                            <div class="flex items-center justify-end ">
                                <button @click="deleteTimeEntryById(entry._id)">

                                    <X class="size-4"></X>
                                </button>
                            </div>
                        </div>

                    </template>
                </ConvexQuery>
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