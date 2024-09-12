<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
type SelectOption = {
    value: string;
    label: string;
};

const { options, modelValue } = defineProps<{
    options: SelectOption[];
    modelValue: SelectOption | null;
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', value: SelectOption | null): void;

}>();

const selectedOption = computed({
    get() {
        return modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    },
});
</script>

<template>
    <select class="px-2 py-1 border border-black rounded bg-white text-black w-full" v-model="selectedOption">
        <option :value="null" disabled>{{ t('settings.options.placeholder') }}</option>
        <option class="" v-for="(option, index) in options" :key="index" :value="option">
            {{ option.label }}
        </option>
    </select>
</template>
