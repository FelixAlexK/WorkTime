<script setup lang="ts">
import { Play, StopCircle } from 'lucide-vue-next';
import { useConvexQuery, useConvexMutation } from "@convex-vue/core";
import type { Id } from 'convex/_generated/dataModel';
import { api } from '../../convex/_generated/api';
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import ButtonComponent from './ButtonComponent.vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ projectId: Id<'projects'> }>();

const startWorkingTime = useConvexMutation(api.time_entries.startWorkTime);
const endWorkingTime = useConvexMutation(api.time_entries.endWorkTime);
const getRunningTimeEntry = useConvexQuery(api.time_entries.getRunningTimeEntryByProjectId, { project_id: props.projectId });

const currentWorkingTime = ref<string>('00:00:00');
const currentWorkingTimeId = ref<Id<'time_entries'>>();
const isRunning = ref(false);
const startTime = ref<number>();
const timerInterval = ref<number>();

// Load state from local storage
const loadState = () => {
    const savedState = localStorage.getItem(`timeTracker_${props.projectId}`);
    if (savedState) {
        const state = JSON.parse(savedState);
        startTime.value = state.startTime;
        isRunning.value = state.isRunning;
        currentWorkingTimeId.value = state.currentWorkingTimeId;
    }
};

// Save state to local storage
const saveState = () => {
    const state = {
        startTime: startTime.value,
        isRunning: isRunning.value,
        currentWorkingTimeId: currentWorkingTimeId.value,
    };
    localStorage.setItem(`timeTracker_${props.projectId}`, JSON.stringify(state));
};

const startWork = async () => {
    const result = await startWorkingTime.mutate({ project_id: props.projectId });
    if (!result) {
        throw new Error('Something went wrong while starting work');
    }
    currentWorkingTimeId.value = result;
    isRunning.value = true;
    startTime.value = Date.now();
    startTimer();
    saveState();
};

const endWork = async () => {
    if (!currentWorkingTimeId.value) {
        currentWorkingTimeId.value = getRunningTimeEntry.data.value?._id;
    }
    await endWorkingTime.mutate({ id: currentWorkingTimeId.value! });
    currentWorkingTime.value = '00:00:00';
    isRunning.value = false;
    stopTimer();
    localStorage.removeItem(`timeTracker_${props.projectId}`);
};


function startTimer() {
    stopTimer(); // Clear any existing interval
    timerInterval.value = setInterval(updateDisplay, 1000);
}

function stopTimer() {
    if (timerInterval.value) {
        clearInterval(timerInterval.value);
    }
}

function updateDisplay() {
    if (!startTime.value) return;

    const elapsedTime = Date.now() - startTime.value;
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));

    currentWorkingTime.value = `${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}`;
}

function padNumber(number: number): string {
    return number.toString().padStart(2, '0');
}

// Initialize timer state
watchEffect(() => {
    if (getRunningTimeEntry.data.value) {
        const entry = getRunningTimeEntry.data.value;
        currentWorkingTimeId.value = entry._id;
        startTime.value = new Date(entry.start_time).getTime();
        isRunning.value = true;
        startTimer();
    }
});

// Load saved state on component mount
onMounted(() => {
    loadState();
    if (isRunning.value) {
        startTimer();
    }
});

// Save state and clear interval on component unmount
onBeforeUnmount(() => {
    saveState();
    stopTimer();
});
</script>

<template>
    <div class="w-full h-fit border border-gray-200 rounded shadow p-4">
        <div class="flex flex-row w-full justify-between items-center">
            <h1 class="font-semibold text-xl">{{ t('time.tracker.title') }}</h1>

        </div>
        <div class="flex justify-center flex-col items-center">
            <time class="text-3xl font-semibold pt-8" datetime="">{{ currentWorkingTime }}</time>
            <div class="flex gap-4 pt-4">
                <ButtonComponent @action="startWork" :label="t('time.tracker.actions.start')" :disabled="isRunning">
                    <template #prefix>
                        <Play class="size-4"></Play>
                    </template>
                </ButtonComponent>

                <ButtonComponent @action="endWork" outlined :label="t('time.tracker.actions.stop')"
                    :disabled="!isRunning">
                    <template #prefix>
                        <StopCircle class="size-4">
                        </StopCircle>
                    </template>
                </ButtonComponent>
            </div>
        </div>
    </div>
</template>