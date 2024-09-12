<script setup lang="ts">
import { SquareArrowOutUpRight, X } from 'lucide-vue-next';
import ButtonComponent from './ButtonComponent.vue';
import { useI18n } from 'vue-i18n'

const { t, d } = useI18n()
defineProps<{ name: string, date: number, edit: boolean }>()
defineEmits(['open', 'delete'])
</script>

<template>
    <div
        class="w-full min-w-fit px-4 py-2 h-fit border border-gray-200 rounded shadow flex flex-row  items-center justify-between ">
        <div>
            <time datetime="">{{ d(new Date(date), 'short') }}</time>
        </div>
        <div>
            <h1 class="font-bold">{{ name }}</h1>
        </div>
        <div class="flex items-center justify-end  not-printable">
            <button v-if="edit" @click="$emit('delete')">

                <X class="size-4"></X>
            </button>
            <ButtonComponent v-else @action="$emit('open')" :label="t('project.actions.open')">
                <template #prefix>
                    <SquareArrowOutUpRight class="size-4"></SquareArrowOutUpRight>
                </template>
            </ButtonComponent>
        </div>
    </div>
</template>