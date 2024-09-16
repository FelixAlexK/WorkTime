<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue';
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
import { allDatesEqual, checkIfDateIsInFuture, convertToTimestamp, getWorktime, getLocalTimeString } from '@/utils/index.js';
import { useI18n } from 'vue-i18n'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createPDFExport } from '@/utils/export.js';

const { t } = useI18n()

const { id, project } = defineProps<{ id: string, project: string }>()

const isEditing = ref(false)
const isCombining = ref(false)
const timeEntry = ref<{ checkbox: boolean, id: Id<'time_entries'>, date: string }[]>([])
const runningWorkingTime = ref<DataModel['time_entries']['document']>()
const openDrawer = ref(false)

const startDateTime = ref<string | undefined>(undefined)

const endDateTime = ref<string | undefined>(undefined)
const showAlert = ref(false)
const errorMessage = ref('')
const locale = ref(navigator.language)

const deleteTimeEntry = useConvexMutation(api.time_entries.deleteTimeEntryById)
const insertWorkingTime = useConvexMutation(api.time_entries.createWorkingTime)
const combineWorkingTime = useConvexMutation(api.time_entries.combineTimeEntries)
const getRunningTimeEntry = useConvexQuery(api.time_entries.getRunningTimeEntryByProjectId, { project_id: id as Id<'projects'> })
const getTimeEntries = useConvexQuery(api.time_entries.getTimeEntriesByProjectId, { project_id: id as Id<'projects'> })


const exportToPdf = async () => {
    try {
        // Fetch data from backend

        const data = await getTimeEntries.suspense()

        createPDFExport(data, project)
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        alert('An error occurred while generating the PDF.');
    }
};

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



const print = async () => {
    isEditing.value = false
    await exportToPdf()
}

const createWorkingTime = async () => {

    try {
        if (!startDateTime.value || !endDateTime.value) return

        const start = new Date(startDateTime.value)
        const end = new Date(endDateTime.value)

        if (checkIfDateIsInFuture(start) || checkIfDateIsInFuture(end)) {
            alert('Start or End date cant be in the future')
            return
        }


        await insertWorkingTime.mutate({ project_id: id as Id<'projects'>, start_time: convertToTimestamp(start.toString()), end_time: convertToTimestamp(end.toString()) })
        if (insertWorkingTime.error.value) {
            errorMessage.value = 'Error while creating time entry'
            showAlert.value = true
        }
    } catch (error) {
        throw new Error('Error while creating time entry')
    } finally {
        openDrawer.value = false
        startDateTime.value = undefined
        endDateTime.value = undefined
    }


}


const combineEntries = (): void => {
    try {
        const checkedEntries = timeEntry.value.filter(item => item.checkbox)
        if (checkedEntries.length <= 1) {
            alert('No or not enough entries selected');
            timeEntry.value.map((f) => f.checkbox = false)
            isCombining.value = false;
            return;
        }

        if (!allDatesEqual(timeEntry.value.map(entry => entry.date))) {
            alert('Dates have not the same start date');
            timeEntry.value.map((f) => f.checkbox = false)
            isCombining.value = false;
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

watchEffect(() => isCombining)

onMounted(() => {
    console.log(locale.value)
    runningWorkingTime.value = getRunningTimeEntry.data.value ?? undefined
})

</script>

<template>
    <div>
        <Teleport defer :to="'body'">
            <ErrorAlert @dismiss="showAlert = false" :show="showAlert" :message="errorMessage"></ErrorAlert>
            <DrawerComponent :label="t('time.create.title')" @close-drawer="openDrawer = false" :is-open="openDrawer">
                <template #content>
                    <form @submit.prevent="createWorkingTime" class="gap-4 flex flex-col">
                        <div class="flex flex-col gap-2 border border-gray-200 rounded shadow p-4">
                            <label for="start" class="underline underline-offset-2 font-semibold">{{
                                t('time.create.start') }}</label>
                            <div id="start" class="flex flex-col gap-2 items-start">
                                <VueDatePicker v-model="startDateTime" :locale="locale">
                                </VueDatePicker>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2 border border-gray-200 rounded shadow p-4">
                            <label for="start" class="underline underline-offset-2 font-semibold">{{
                                t('time.create.stop') }}</label>
                            <div id="start" class="flex flex-col gap-2 items-start">
                                <VueDatePicker v-model="endDateTime" :locale="locale"></VueDatePicker>
                            </div>
                        </div>
                        <ButtonComponent :type="'submit'" :label="t('time.create.submit')">
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

            <PageHeader @return="$router.push('/')" :label="t('time.title', { title: project })">
                <template #action>
                    <ButtonComponent @action="exportToPdf" outlined :label="t('time.actions.print')">
                        <template #prefix>
                            <Printer class="size-4">
                            </Printer>
                        </template>
                    </ButtonComponent>


                </template>
            </PageHeader>


            <div class=" p-8 flex flex-col gap-4">
                <TimeCard :project-id="id as Id<'projects'>">

                </TimeCard>
                <div v-auto-animate
                    class="not-printable w-full h-fit border border-gray-200 rounded shadow p-4 flex flex-col gap-4">
                    <div class=" flex flex-row items-center justify-between  w-full gap-8">

                        <div class="flex flex-row gap-8">
                            <h1 class="font-semibold text-lg flex text-nowrap">{{ t('time.recent.title') }}</h1>

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

                            <ButtonComponent @action="openDrawer = !openDrawer" :label="t('time.actions.new')">
                                <template #prefix>
                                    <PlusCircle class="size-4">
                                    </PlusCircle>
                                </template>
                            </ButtonComponent>
                            <ButtonComponent v-if="isCombining" @action="combineEntries(); isCombining = false"
                                :label="t('time.actions.confirm')">
                                <template #prefix>
                                    <Check class="size-4">
                                    </Check>
                                </template>
                            </ButtonComponent>
                            <ButtonComponent v-else @action="isCombining = !isCombining" outlined
                                :label="t('time.actions.combine')">
                                <template #prefix>
                                    <Combine class="size-4">
                                    </Combine>
                                </template>
                            </ButtonComponent>
                        </div>

                    </div>
                    <div id="printable-content">
                        <ConvexQuery :query="api.time_entries.getTimeEntriesByProjectId"
                            :args="{ project_id: id as Id<'projects'> }">
                            <template #loading>loading...</template>
                            <template #empty>no recent tasks yet...</template>
                            <template #default="{ data: entries }">
                                <div v-for="entry in entries" :key="entry._id" class="print-entry">
                                    <TimeEntry :id="entry._id" ref="timeEntry" :combine="isCombining"
                                        @delete="deleteTimeEntryById(entry._id)"
                                        :start="getLocalTimeString(entry.start_time)" :stop="entry.end_time ?
                                            getLocalTimeString(entry.end_time ?? 0) :
                                            '--:--'" :workingtime="entry.end_time ?
                                                getWorktime(entry.end_time - entry.start_time) :
                                                '--:--'" :date="entry.start_time">
                                    </TimeEntry>
                                </div>
                            </template>
                        </ConvexQuery>
                    </div>
                </div>
            </div>


        </div>


    </div>




</template>

<style lang="css">
@media print {



    /* Ensure printable content is visible */
    #printable-content,
    #printable-content * {
        visibility: visible;

    }

    #printable-content .delete-btn {
        display: none;
    }

    /* Style for individual time entries */
    .print-entry {
        margin-bottom: 1em;
        padding-bottom: 0.5em;
        border-bottom: 1px solid #ccc;
    }

    .print-entry .delete-btn {
        display: none !important;
    }

    /* Prevent page breaks within time entries */
    .print-entry {
        page-break-inside: avoid;
    }

    /* Allow page breaks after time entries */
    .print-entry {
        page-break-after: auto;
    }
}

.dp__theme_light {
    --dp-primary-color: #000 !important;
}
</style>