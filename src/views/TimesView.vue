<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id } from 'convex/_generated/dataModel.js';
defineProps<{ id: string, project: string }>()

const searchInput = ref('')
const isEditing = ref(false)
const startTime = ref('')
const endTime = ref('')
const endWorkTime = useConvexMutation(api.time_entries.endWorkTime)
const startWorkTime = useConvexMutation(api.time_entries.startWorkTime)
const deleteTimeEntry = useConvexMutation(api.time_entries.deleteTimeEntryById)
const patchTimeEntry = useConvexMutation(api.time_entries.patchTimeEntryById)

const endWork = async (id: Id<'time_entries'>) => {
    await endWorkTime.mutate({ id: id })
}

const startWork = async (id: Id<'projects'>) => {
    isEditing.value = false
    await startWorkTime.mutate({ project_id: id })
}

const deleteTimeEntryById = async (id: Id<'time_entries'>) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return
    await deleteTimeEntry.mutate({ id: id })
}

const updateTimeEntryById = async (id: Id<'time_entries'>, currentStartTime: number, currentEndTime: number) => {

    console.log(currentStartTime, currentEndTime)

    currentStartTime !== convertToTimeStamp(startTime.value) ? await patchTimeEntry.mutate({ id: id, start_time: convertToTimeStamp(startTime.value) }) : undefined


    currentEndTime !== convertToTimeStamp(endTime.value) ? await patchTimeEntry.mutate({ id: id, end_time: convertToTimeStamp(endTime.value) }) : undefined



}

const getDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
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

const convertToTimeStamp = (time: string) => {
    // Get the value from the time input
    const timeValue = time;

    // Split the time value into hours and minutes
    const [hours, minutes] = timeValue.split(':').map(Number);

    // Create a Date object with the current date and the input time
    const currentDate = new Date();
    const dateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes);

    // Convert the Date object to a timestamp
    const timestamp = dateTime.getTime();

    return timestamp;
}

const print = () => {
    isEditing.value = false
    window.print()
}
</script>

<template>
    <div>
        <div
            class="not-printable flex flex-col sm:flex-row h-fit gap-4 p-4 sm:h-16 w-full border-b-2 border-black items-center px-8 justify-between ">
            <h1 @click="$router.push({ name: 'home' })" class="font-bold text-xl cursor-pointer text-nowrap">{{ project
                }}</h1>

            <div class="flex gap-4">
                <button @click="startWork(id as Id<'projects'>)"
                    class="w-16 h-8  rounded-sm bg-blue-600  text-white shadow-lg hover:shadow hover:scale-95">Start</button>
                <button @click="isEditing = !isEditing"
                    class="w-16 h-8 disabled:border-gray-400 disabled:text-gray-400 disabled:hover:bg-white disabled:scale-100 disabled:shadow-none  rounded-sm  border-2 border-blue-600  text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow hover:scale-95">Edit</button>
                <button @click="print"
                    class="w-16 h-8   rounded-sm  border-2 border-blue-600  text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow hover:scale-95">Print</button>
            </div>

        </div>
        <div class=" h-full overflow-auto w-full flex gap-4 flex-col items-start p-8">

            <ConvexQuery :query="api.time_entries.getTimeEntriesByProjectId"
                :args="{ project_id: id as Id<'projects'> }">
                <template #loading>Loading...</template>
                <template #error="{ error }">{{ error }}</template>
                <template #empty>No Entries yet.</template>
                <template #default="{ data: entries }">
                    <div id="printable-content"
                        class="max-w-xl  w-full py-4 sm:py-0 gap-4 sm:gap-0  sm:h-12 outline outline-2 shadow-lg rounded-sm flex flex-col sm:flex-row items-center justify-center  sm:justify-between "
                        v-for="entry in entries" :key="entry._id">
                        <div class="sm:bg-gray-200 h-full  flex items-center sm:pl-4"><time
                                class="sm:pr-4 font-semibold "
                                :datetime="new Date(entry._creationTime).toLocaleDateString()">{{ new
                                    Date(entry.start_time).toLocaleDateString() }}</time> </div>
                        <div class="flex flex-row gap-2">
                            <h2>start:</h2>

                            <time class="font-semibold" :datetime="getDate(entry.start_time)">{{
                                getDate(entry.start_time)
                                }}</time>
                        </div>

                        <div class="flex flex-row gap-2 items-center">
                            <h2>stop:</h2>

                            <time v-if="entry.end_time" class="font-semibold" :datetime="getDate(entry.end_time)">{{
                                getDate(entry.end_time)
                                }}</time>
                            <button v-else
                                class="w-16 h-10 mr-4  rounded-sm bg-red-600 text-white shadow-lg hover:shadow hover:scale-95 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none flex items-center justify-center"
                                @click="endWork(entry._id)">stop</button>
                        </div>

                        <div v-if="entry.end_time" class="flex flex-row gap-2 pr-4">
                            <h2 class="text-nowrap">working time:</h2>
                            <ConvexQuery :query="api.time_entries.getWorktimeById" :args="{ id: entry._id }">
                                <template #default="{ data: worktime }"><time class="font-semibold"
                                        :datetime="getWorktime(worktime)">{{
                                            getWorktime(worktime) }}</time></template>
                            </ConvexQuery>
                        </div>

                        <div v-if="isEditing" class="flex  items-center h-full flex-row overflow-hidden">
                            <button v-show="false" class="bg-yellow-400 p-4"
                                @click="updateTimeEntryById(entry._id, entry.start_time, entry.end_time ?? 0)">edit</button>
                            <button class="bg-red-400 p-4 " @click="deleteTimeEntryById(entry._id)">delete</button>
                        </div>


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