<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '../../convex/_generated/api.js';
import { useConvexQuery, ConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id, DataModel } from 'convex/_generated/dataModel.js';
import TimeCard from '@/components/TimeCard.vue';
import TimeEntry from '@/components/TimeEntry.vue';
import PageHeader from '@/components/PageHeader.vue';
import { Printer, PlusCircle, Combine, Check, Timer, SendHorizonal } from 'lucide-vue-next';
import ButtonComponent from '../components/ButtonComponent.vue';
import DrawerComponent from '@/components/DrawerComponent.vue';
import ErrorAlert from '@/components/ErrorAlert.vue';
import { allDatesEqual, checkIfDateIsInFuture, convertToTimestamp, getWorktime, getLocalDateString, getLocalTimeString } from '@/utils/index.js';

const props = defineProps<{ id: string, project: string }>()

const isEditing = ref(false)
const isCombining = ref(false)
const timeEntry = ref<{ checkbox: boolean, id: Id<'time_entries'>, date: string }[]>([])
const runningWorkingTime = ref<DataModel['time_entries']['document']>()
const openDrawer = ref(false)
const startTime = ref<string | undefined>(undefined)
const startDate = ref<string | undefined>(undefined)
const endTime = ref<string | undefined>(undefined)
const endDate = ref<string | undefined>(undefined)
const showAlert = ref(false)
const errorMessage = ref('')

const deleteTimeEntry = useConvexMutation(api.time_entries.deleteTimeEntryById)
const insertWorkingTime = useConvexMutation(api.time_entries.createWorkingTime)
const combineWorkingTime = useConvexMutation(api.time_entries.combineTimeEntries)
const getRunningTimeEntry = useConvexQuery(api.time_entries.getRunningTimeEntryByProjectId, { project_id: props.id as Id<'projects'> })



const deleteTimeEntryById = async (id: Id<'time_entries'>) => {
    try {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return
        await deleteTimeEntry.mutate({ id: id })
        if (deleteTimeEntry.error.value) {
            errorMessage.value = 'Error while deleting time entry'
            showAlert.value = true
        }
    } catch (error) {
        throw new Error('Error while deleting time entry')
    }

}



const print = () => {
    isEditing.value = false
    window.print()
}

const createWorkingTime = async () => {

    try {
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

        await insertWorkingTime.mutate({ project_id: props.id as Id<'projects'>, start_time: convertToTimestamp(startString), end_time: convertToTimestamp(endString) })
        if (insertWorkingTime.error.value) {
            errorMessage.value = 'Error while creating time entry'
            showAlert.value = true
        }
    } catch (error) {
        throw new Error('Error while creating time entry')
    } finally {
        openDrawer.value = false
        startDate.value = undefined
        endDate.value = undefined
        startTime.value = undefined
        endTime.value = undefined
    }


}


const combineEntries = (): void => {
    try {
        const checkedEntries = timeEntry.value.filter(item => item.checkbox)
        if (checkedEntries.length <= 1) {
            alert('No or not enough entries selected');
            timeEntry.value.map((f) => f.checkbox = false)
            isCombining.value = !isCombining.value;
            return;
        }

        if (!allDatesEqual(timeEntry.value.map(entry => entry.date))) {
            alert('Dates have not the same start date');
            timeEntry.value.map((f) => f.checkbox = false)
            isCombining.value = !isCombining.value;
            return;
        }

        const checkedIds = checkedEntries.map(item => item.id);
        combineWorkingTime.mutate({ ids: checkedIds });
        if (combineWorkingTime.error.value) {
            errorMessage.value = 'Error while combining time entries'
            showAlert.value = true
        }

    } catch (error) {
        throw new Error('Error while combining time entries')
    } finally {
        isCombining.value = !isCombining.value;
        timeEntry.value.map((f) => f.checkbox = false)
    }

};



onMounted(() => {
    runningWorkingTime.value = getRunningTimeEntry.data.value ?? undefined
})

</script>

<template>
    <div>
        <Teleport defer :to="'body'">
            <ErrorAlert @dismiss="showAlert = false" :show="showAlert" :message="errorMessage"></ErrorAlert>
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
                            <template #suffix>
                                <SendHorizonal class="size-4">
                                </SendHorizonal>
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
                        <template #prefix>
                            <Printer class="size-4">
                            </Printer>
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

                        <div class="flex flex-row gap-4">

                            <ButtonComponent @action="openDrawer = !openDrawer" label="New">
                                <template #prefix>
                                    <PlusCircle class="size-4">
                                    </PlusCircle>
                                </template>
                            </ButtonComponent>
                            <ButtonComponent v-if="isCombining" @action="combineEntries()" :label="'Confirm'">
                                <template #prefix>
                                    <Check class="size-4">
                                    </Check>
                                </template>
                            </ButtonComponent>
                            <ButtonComponent v-else @action="isCombining = !isCombining" outlined :label="'Combine'">
                                <template #prefix>
                                    <Combine class="size-4">
                                    </Combine>
                                </template>
                            </ButtonComponent>
                        </div>

                    </div>
                    <ConvexQuery :query="api.time_entries.getTimeEntriesByProjectId"
                        :args="{ project_id: id as Id<'projects'> }">

                        <template #loading>loading...</template>
                        <template #empty>no recent tasks yet...</template>

                        <template #default="{ data: entries }">



                            <div v-for="entry in entries" :key="entry._id" id="printable-content">
                                <TimeEntry :id="entry._id" ref="timeEntry" :combine="isCombining"
                                    @delete="deleteTimeEntryById(entry._id)"
                                    :start="getLocalTimeString(entry.start_time)" :stop="entry.end_time ?
                                        getLocalTimeString(entry.end_time ?? 0) :
                                        '--:--'" :workingtime="entry.end_time ?
                                            getWorktime(entry.end_time - entry.start_time) :
                                            '--:--'" :date="getLocalDateString(entry.start_time)">

                                </TimeEntry>
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