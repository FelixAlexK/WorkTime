<script setup lang="ts">
import type { Id } from 'convex/_generated/dataModel';
import { Play, StopCircle, Timer, Calendar, X, Check } from 'lucide-vue-next';
import { ref } from 'vue';
const { combine = false, id, date } = defineProps<{ start: string, stop: string, workingtime: string, date: string, combine: boolean, id: Id<'time_entries'> }>()
defineEmits(['delete'])

const checkbox = ref<boolean>(false)

defineExpose({ checkbox, id, date })
</script>

<template>
    <div class="w-full min-w-fit px-4 py-2 h-fit border border-gray-200 rounded shadow flex flex-row   ">
        <div class="flex flex-row items-center justify-start gap-2 w-full">
            <Calendar class="size-4"></Calendar>
            <time datetime="" class=" text-nowrap">
                {{ date }}
            </time>
        </div>
        <div class="flex flex-col md:flex-row md:gap-4 justify-center md:w-fit md:pr-8 w-full">
            <div class="flex flex-row items-center gap-2">
                <Play class="size-4"></Play>
                <time class="text-nowrap " datetime="">
                    {{ start }}
                </time>
            </div>
            <div class="flex flex-row items-center gap-2 w-full">

                <StopCircle class="size-4">
                </StopCircle>
                <time class="text-nowrap " datetime="">
                    {{ stop }}
                </time>
            </div>
        </div>
        <div class="sm:flex justify-start w-full  items-center hidden">
            <div class="flex flex-row items-center gap-2">

                <Timer class="size-4"></Timer>
                <time class="" datetime="">
                    {{ workingtime }}
                </time>
            </div>
        </div>
        <div class="flex items-center justify-end " id="printable-content">
            <div v-if="combine" class="inline-flex items-center">
                <label class="flex items-center cursor-pointer relative">
                    <input v-model="checkbox" type="checkbox"
                        class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded border border-black checked:bg-black checked:border-black"
                        id="check">
                    <span
                        class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <Check class="size-4"></Check>
                    </span>
                </label>

            </div>
            <button v-else @click="$emit('delete')">

                <X class="size-4"></X>
            </button>
        </div>
    </div>
</template>