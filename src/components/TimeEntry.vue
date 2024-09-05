<script setup lang="ts">

import { CircleStop, CirclePlay, Timer, SquarePen, Trash } from 'lucide-vue-next';

defineEmits(['endWork', 'deleteEntry', 'updateEntry'])
const props = defineProps<{ creationTime: number, startTime: number, endTime: number | undefined, isEditing: boolean }>()

const getDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
}



</script>

<template>
    <div class="flex flex-row min-w-fit h-20 items-center w-full outline outline-2 rounded-sm ">
        <div class="h-full bg-gray-200 flex items-center px-4">
            <time class=" font-semibold " :datetime="new Date(creationTime).toLocaleDateString()">{{ new
                Date(startTime).toLocaleDateString() }}</time>
        </div>
        <div class="flex flex-row items-center w-full justify-evenly">
            <div class="flex flex-col gap-y-2">
                <div class="flex flex-row items-center gap-2">
                    <h2 class="hidden">start:</h2>
                    <CirclePlay class="size-4"></CirclePlay> <time class="font-semibold"
                        :datetime="getDate(startTime)">{{
                            getDate(startTime)
                        }}</time>
                </div>
                <div class="flex flex-row  items-center gap-2">
                    <h2 class="hidden">stop:</h2>
                    <CircleStop class="size-4"></CircleStop>
                    <time v-if="endTime" class="font-semibold" :datetime="getDate(endTime)">{{
                        getDate(endTime)
                    }}</time>
                    <button v-else
                        class="w-16 h-10 mr-4  rounded-sm bg-red-600 text-white shadow-lg hover:shadow hover:scale-95 disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none flex items-center justify-center"
                        @click="$emit('endWork')">stop</button>
                </div>
            </div>

            <div v-if="endTime" class="flex flex-row gap-2 items-center">
                <h2 class="text-nowrap hidden">working time:</h2>
                <Timer class="size-4 "></Timer>
                <slot name="working-time"></slot>
            </div>
        </div>

    </div>
    <div v-if="!isEditing" class="flex items-center justify-center pt-2 pb-4 gap-4">
        <button class="hover:text-yellow-600" @click="$emit('updateEntry')">
            <SquarePen class="size-6"></SquarePen>
        </button>
        <button class=" hover:text-red-600 " @click="$emit('deleteEntry')">
            <Trash class="size-6"></Trash>
        </button>
    </div>
</template>