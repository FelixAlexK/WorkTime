<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import SelectComponent from '@/components/SelectComponent.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '../stores/i18n'

const { getLocale, setLocale } = useLocaleStore()
const { t, locale, availableLocales } = useI18n()

const selectedOption = ref<{ value: string, label: string } | null>(null);


const formattedOptions = computed(() => {
    return availableLocales.map(locale => ({ value: locale, label: locale }))
})

onMounted(() => {
    locale.value = getLocale
    selectedOption.value = formattedOptions.value.find(option => option.value === locale.value) ?? null
})

watch(() => selectedOption.value, (newLocale) => {
    locale.value = newLocale?.value ?? navigator.language
    setLocale(locale.value)
})
</script>

<template>
    <div>
        <div>
            <PageHeader @return="$router.back()" :label="t('settings.title')">
            </PageHeader>
        </div>
        <div class="p-8 flex flex-col gap-4">
            <div class="w-full h-fit border border-gray-200 rounded shadow p-4">
                <div class="w-1/2">
                    <h1 class="font-semibold text-lg mb-4">{{ t('settings.language') }}</h1>
                    <SelectComponent v-model="selectedOption" :options="formattedOptions" />
                </div>

            </div>
        </div>
    </div>
</template>
