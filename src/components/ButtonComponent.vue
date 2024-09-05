<script setup lang="ts">
const { outlined = false, label, type = 'button' } = defineProps<{ outlined?: boolean, label?: string, type?: "submit" | "reset" | "button" }>()
defineEmits(['action'])
</script>

<template>
    <button @click="$emit('action')" :type="type"
        :class="{ 'border-gray-500 border-2 hover:bg-gray-500 hover:text-white text-gray-500 ': outlined, 'bg-black text-white hover:bg-gray-700': !outlined }"
        class=" rounded px-4 py-1 flex flex-row gap-2 items-center justify-center">
        <div v-if="$slots.icon" class="">

            <slot name="icon"></slot>
        </div>
        <p v-if="label" class="hidden md:block">
            {{ label }}
        </p>
    </button>
</template>