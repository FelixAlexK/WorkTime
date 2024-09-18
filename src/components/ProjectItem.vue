<script setup lang="ts">
import { SquareArrowOutUpRight, Trash, Info } from 'lucide-vue-next';
import ButtonComponent from './ButtonComponent.vue';
import { useI18n } from 'vue-i18n'
import TooltipComponent from './ToolTipComponent.vue';

const { t, d } = useI18n()
defineProps<{ name: string, date: number, edit: boolean, description?: string }>()
defineEmits(['open', 'delete'])
</script>

<template>
    <div
        class="w-full min-w-fit p-4 h-fit border border-gray-200 rounded shadow flex flex-col md:flex-row gap-y-4 items-center justify-between ">
        <div>
            <time datetime="">{{ d(new Date(date), 'short') }}</time>
        </div>
        <div class="flex flex-row gap-2 items-center">
            <h1 class="font-bold">{{ name }}</h1>

            <TooltipComponent v-if="description" :text="description" :placement="'right'">
                <template #trigger>
                    <Info class="size-4 cursor-pointer"></Info>
                </template>

            </TooltipComponent>


        </div>
        <div class="flex items-center justify-end  not-printable">
            <ButtonComponent v-if="edit" :label="t('project.actions.delete')" @action="$emit('delete')"
                appearance="error">
                <template #prefix>

                    <Trash class="size-4">
                    </Trash>
                </template>
            </ButtonComponent>
            <ButtonComponent v-else @action="$emit('open')" :label="t('project.actions.open')">
                <template #prefix>
                    <SquareArrowOutUpRight class="size-4"></SquareArrowOutUpRight>
                </template>
            </ButtonComponent>
        </div>
    </div>
</template>