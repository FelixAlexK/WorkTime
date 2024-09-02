<script setup lang="ts">

import { Play, Pause, StopCircle, LoaderCircle } from 'lucide-vue-next';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id, DataModel } from 'convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, watchEffect } from 'vue';

const props = defineProps<{ projectId: Id<'projects'> }>()

const startWorkingTime = useConvexMutation(api.time_entries.startWorkTime)
const endWorkingTime = useConvexMutation(api.time_entries.endWorkTime)
const getRunningTimeEntry = useConvexQuery(api.time_entries.getRunningTimeEntryByProjectId, { project_id: props.projectId })

const currentWorkingTime = ref<string | undefined>('00:00')
const updateCurrentWorkingTimeId = ref<number | undefined>(undefined)
const currentWorkingTimeId = ref<Id<'time_entries'>>()
const runningTimeEntry = ref<Partial<DataModel['time_entries']['document']>>()
const isRunning = ref(false)



const startWork = async () => {

    const result = await startWorkingTime.mutate({ project_id: props.projectId })
    if (!result) {
        throw new Error('Something went wrong while starting work')
    }
    currentWorkingTimeId.value = result
    startUpdateInterval()
    isRunning.value = true
}

const endWork = async () => {
    if (!currentWorkingTimeId.value) {
        currentWorkingTimeId.value = getRunningTimeEntry.data.value?._id

    }
    await endWorkingTime.mutate({ id: currentWorkingTimeId.value! })
    clearUpdateInterval()
    currentWorkingTime.value = '00:00'
    isRunning.value = false

}

const updateCurrentWorkingTime = () => {
    isRunning.value = true
    if (!runningTimeEntry.value) {
        runningTimeEntry.value = getRunningTimeEntry.data.value ?? {}
    }
    if (!runningTimeEntry.value?.start_time) return
    isRunning.value = true

    const elapsedTime = Date.now() - runningTimeEntry.value.start_time;
    currentWorkingTime.value = getWorktime(elapsedTime)
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

const startUpdateInterval = () => {
    updateCurrentWorkingTimeId.value = setInterval(updateCurrentWorkingTime, 60000); // 1min
}

const clearUpdateInterval = () => {

    clearInterval(updateCurrentWorkingTimeId.value);


}







</script>

<template>
    <div class="w-full h-fit border border-gray-200 rounded shadow p-4">
        <div class="flex flex-row w-full justify-between items-center">
            <h1 class="font-semibold text-xl">Time Tracker</h1>
            <LoaderCircle v-if="isRunning" class="size-4 animate-spin">
            </LoaderCircle>
        </div>
        <div class="flex justify-center flex-col items-center">
            <time class="text-3xl font-semibold pt-8" datetime="">{{ currentWorkingTime }}</time>
            <div class="flex gap-4 pt-4">
                <button @click="startWork"
                    class="bg-black rounded px-4 py-1 text-white flex flex-row gap-2 items-center">
                    <Play class="size-4"></Play>
                    Start
                </button>
                <button class="bg-gray-500 rounded px-4 py-1 text-white flex flex-row gap-2 items-center">
                    <Pause class="size-4"></Pause>
                    Pause
                </button>
                <button @click="endWork"
                    class="bg-gray-500 rounded px-4 py-1 text-white flex flex-row gap-2 items-center">
                    <StopCircle class="size-4"></StopCircle>
                    Stop
                </button>
            </div>
        </div>
    </div>
</template>