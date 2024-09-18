<template>
    <div class="relative inline-block group">
        <slot name="trigger"></slot>
        <div :class="[
            'absolute invisible z-50 w-auto min-w-max max-w-xs whitespace-nowrap rounded-lg bg-gray-900 p-2 text-sm font-medium text-white opacity-0 shadow-md transition-all duration-300 ease-out group-hover:visible group-hover:opacity-100',
            placementClasses[placement]
        ]">
            <span>{{ text }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
type Placement = 'top' | 'bottom' | 'left' | 'right';

interface Props {
    placement?: Placement;
    text?: string
}

const { placement = 'top' } = defineProps<Props>();

const placementClasses: Record<Placement, string> = {
    top: 'bottom-full left-1/2 ml-[-50%] mb-1',
    bottom: 'top-full left-1/2 ml-[-50%] mt-1',
    left: 'right-full top-1/2 mr-1 -translate-y-1/2',
    right: 'left-full top-1/2 ml-1 -translate-y-1/2',
};
</script>
