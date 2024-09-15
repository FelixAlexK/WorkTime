<script setup lang="ts">
const { outlined = false, label, type = 'button' } = defineProps<{
    outlined?: boolean,
    label?: string,
    type?: "submit" | "reset" | "button"
}>()
defineEmits(['action'])
</script>

<template>
    <button @click="$emit('action')" :type="type" :class="[
        'rounded px-4 py-2 h-full flex flex-row gap-2 items-center justify-center',
        outlined
            ? 'bg-transparent border border-black text-black hover:bg-black hover:text-white focus:ring-2 focus:ring-offset-1 focus:ring-black disabled:cursor-not-allowed'
            : 'bg-black text-white hover:bg-white hover:text-black hover:border-black hover:border focus:ring-2 focus:ring-offset-1 focus:ring-black disabled:cursor-not-allowed'
    ]">

        <div v-if="$slots.prefix" class="mr-2">
            <slot name="prefix"></slot>
        </div>
        <p v-if="label" class="hidden md:block">
            {{ label }}
        </p>
        <div v-if="$slots.suffix" class="ml-2">
            <slot name="suffix"></slot>
        </div>
    </button>
</template>