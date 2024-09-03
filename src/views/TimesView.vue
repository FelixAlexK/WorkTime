<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id, DataModel } from 'convex/_generated/dataModel.js';
import TimeCard from '@/components/TimeCard.vue';
import TimeEntry from '@/components/TimeEntry.vue';
import { Timer } from 'lucide-vue-next';
import PageHeader from '@/components/PageHeader.vue';
import { Printer, Edit } from 'lucide-vue-next';
import ButtonComponent from '../components/ButtonComponent.vue';

const props = defineProps<{ id: string, project: string }>()

const isEditing = ref(false)
const runningWorkingTime = ref<DataModel['time_entries']['document']>()


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



onMounted(() => {
    runningWorkingTime.value = getRunningTimeEntry.data.value ?? undefined
})

</script>

<template>
    <div>
        <PageHeader @return="$router.push('/')" :label="project">
            <template #action>
                <ButtonComponent @action="print" :outlined="true" :label="'Print'">
                    <template #icon>
                        <Printer class="size-4">
                        </Printer>
                    </template>
                </ButtonComponent>

                <ButtonComponent :outlined="true" :label="'Edit'">
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

                    <template #loading>loading...</template>
                    <template #empty>no recent tasks yet...</template>

                    <template #default="{ data: entries }">


                        <div v-for="entry in entries" :key="entry._id" id="printable-content">
                            <TimeEntry @delete="deleteTimeEntryById(entry._id)"
                                :start="getLocalTimeString(entry.start_time)" :stop="entry.end_time ?
                                    getLocalTimeString(entry.end_time ?? 0) :
                                    '--:--:--'" :workingtime="entry.end_time ?
                                        getWorktime(entry.end_time - entry.start_time) :
                                        '--:--'" :date="getLocalDateString(entry.start_time)"></TimeEntry>
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