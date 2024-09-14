<script setup lang="ts">
const { outlined = false, label, type = 'button' } = defineProps<{ outlined?: boolean, label?: string, type?: "submit" | "reset" | "button" }>()
defineEmits(['action'])
</script>

<template>
    <button @click="$emit('action')" :type="type"
        :class="{ 'border-black border-2 hover:bg-black hover:text-white text-black ': outlined, 'border-black border-2 hover:bg-white hover:text-black text-white bg-black': !outlined }"
        class=" rounded px-4 py-1 flex flex-row gap-2 items-center justify-center">
        <div v-if="$slots.prefix" class="">

            <slot name="prefix"></slot>
        </div>
        <p v-if="label" class="hidden md:block">
            {{ label }}
        </p>
        <div v-if="$slots.suffix" class="">

            <slot name="suffix"></slot>
        </div>
    </button>
</template>