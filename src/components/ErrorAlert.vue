<script setup lang="ts">
import { X, AlertCircle } from 'lucide-vue-next'
defineEmits(['dismiss'])
const { show, message } = defineProps<{ show: boolean, message: string, }>()

</script>

<template>
    <transition enter-active-class="transition ease-out duration-300" enter-from-class="transform -translate-y-full"
        enter-to-class="transform translate-y-0" leave-active-class="transition ease-in duration-300"
        leave-from-class="transform translate-y-0" leave-to-class="transform -translate-y-full">
        <div v-if="show"
            class="fixed top-0 left-0 right-0 z-50 bg-red-100 border-b border-red-400 text-red-700 px-4 py-3 h-12 shadow-md"
            role="alert">
            <div class="container mx-auto items-center flex justify-between h-full">
                <div class="flex flex-row items-center">
                    <AlertCircle class="size-4"></AlertCircle>
                    <span class="ml-2">{{ message }}</span>
                </div>
                <button @click="$emit('dismiss')" class="text-red-500 hover:text-red-700 focus:outline-none">
                    <X class="size-4"></X>
                </button>
            </div>
        </div>
    </transition>
</template>