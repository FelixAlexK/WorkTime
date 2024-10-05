<script setup lang="ts">
const { outlined = false, label, type = 'button', appearance = 'standard' } = defineProps<{
    outlined?: boolean,
    label?: string,
    type?: "submit" | "reset" | "button",
    appearance?: "error" | "standard"

}>()
defineEmits(['action'])
</script>

<template>
    <button @click="$emit('action')" :type="type" :class="[
        'inline-flex px-4 py-2 items-center justify-center rounded-md shadow-sm transition-colors duration-200 ease-in-out',
        appearance === 'error'
            ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:cursor-not-allowed'
            : outlined
                ? 'bg-transparent border border-black text-black hover:bg-black hover:text-white focus:ring-2 focus:ring-offset-1 focus:ring-black disabled:cursor-not-allowed'
                : 'bg-black text-white hover:bg-transparent hover:text-black hover:border-black hover:border focus:ring-2 focus:ring-offset-1 focus:ring-black disabled:cursor-not-allowed'

    ]">

        <div class="flex flex-row justify-center items-center ">
            <span v-if="$slots.prefix" :class="[label === undefined ? '' : 'md:mr-2']">
                <slot name="prefix"></slot>
            </span>
            <span v-if="label" class="text-sm font-medium md:block"
                :class="{ 'hidden': $slots.prefix || $slots.suffix }">
                {{ label }}
            </span>
            <span v-if="$slots.suffix" :class="[label === undefined ? '' : 'md:ml-2']">
                <slot name="suffix"></slot>
            </span>
        </div>

    </button>
</template>