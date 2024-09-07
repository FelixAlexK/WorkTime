<script setup lang="ts">
defineProps<{ label: string }>()
defineEmits(['return'])
</script>

<template>
    <header class="not-printable">
        <div class="border-b h-12 flex items-center p-4 w-full justify-between ">
            <h1 @click="$emit('return')" class="font-bold text-lg cursor-pointer">{{ label
                }}</h1>
            <div v-if="$slots.search">
                <slot name="search"></slot>
            </div>
            <div v-if="$slots.action" class="flex flex-row gap-2">


                <slot name="action"></slot>

            </div>
        </div>
    </header>
</template>