<script setup lang="ts">
import { X } from 'lucide-vue-next';
const { label = 'Drawer' } = defineProps<{ isOpen: boolean, label?: string }>()
defineEmits(['closeDrawer'])
</script>

<template>
    <div v-if="isOpen">
        <!-- Backdrop -->
        <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            @click="$emit('closeDrawer')"></div>

        <!-- Drawer -->
        <div :class="[
            'fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : '-translate-x-full'
        ]">
            <div class="p-4">
                <button @click="$emit('closeDrawer')" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X class="size-4"></X>
                </button>
                <h2 class="text-lg font-semibold mb-4">{{ label }}</h2>
                <slot name="content"></slot>
            </div>
        </div>
    </div>
</template>