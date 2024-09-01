<script setup lang="ts">

import { CircleStop, CirclePlay, Timer, SquarePen, Trash } from 'lucide-vue-next';

defineEmits(['endWork', 'deleteEntry', 'updateEntry'])
const props = defineProps<{ creationTime: number, startTime: number, endTime: number | undefined, isEditing: boolean }>()

const getLocalTimeString = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
}

const getLocalDateString = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
}

</script>

<template>
    <div class="flex flex-row min-w-fit h-20 items-center w-full outline outline-2 rounded-sm ">
        <div class="h-full bg-gray-200 flex items-center px-4">
            <time class=" font-semibold " :datetime="getLocalDateString(creationTime)">{{
                getLocalDateString(creationTime) }}</time>
        </div>
        <div class="flex flex-row items-center w-full justify-evenly">
            <div class="flex flex-col gap-y-2">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="hidden">start:</h2>
                    <CirclePlay class="size-4"></CirclePlay>
                    <time class="font-semibold" :datetime="getLocalTimeString(startTime)">{{
                        getLocalTimeString(startTime)
                        }}</time>
                    <div v-show="false" v-if="isEditing && endTime !== undefined"
                        class="flex  flex-row items-center gap-2 pl-4">
                        <SquarePen class="size-4"></SquarePen>
                        <input type="time" name="" id="">
                    </div>
                </div>
                <div class="flex flex-row  items-center gap-2">
                    <h2 class="hidden">stop:</h2>
                    <CircleStop class="size-4"></CircleStop>
                    <time v-if="endTime" class="font-semibold" :datetime="getLocalTimeString(endTime)">{{
                        getLocalTimeString(endTime)
                        }}</time>
                    <button v-else
                        class="w-16 h-10 mr-4  rounded-sm bg-red-600 text-white shadow-lg hover:shadow hover:scale-95 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none flex items-center justify-center"
                        @click="$emit('endWork')">stop</button>
                    <div v-show="false" v-if="isEditing && endTime !== undefined"
                        class="flex flex-row items-center gap-2 pl-4 ">
                        <SquarePen class="size-4"></SquarePen>
                        <input type="time" name="" id="">
                    </div>
                </div>
            </div>

            <div v-if="endTime" class="flex flex-row gap-2 items-center">
                <h2 class="text-nowrap hidden">working time:</h2>
                <Timer class="size-4 "></Timer>
                <slot name="working-time"></slot>
            </div>
        </div>

    </div>
    <div v-if="isEditing && endTime !== undefined" class="flex items-center justify-center pt-2 pb-4 gap-4">
        <button class="hover:text-yellow-600 hidden">
            <SquarePen class="size-6"></SquarePen>
        </button>
        <button class=" hover:text-red-600 " @click="$emit('deleteEntry')">
            <Trash class="size-6"></Trash>
        </button>
    </div>
</template>