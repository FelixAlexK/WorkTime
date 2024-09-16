<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from './stores/i18n'
import { ref, watch } from 'vue';


const { getLocale, setLocale } = useLocaleStore();
const { locale, availableLocales } = useI18n();

const selectedOption = ref<string | null>(null);

// Apply the stored locale immediately
const storedLocale = getLocale;
if (storedLocale && availableLocales.includes(storedLocale)) {
  locale.value = storedLocale;
  selectedOption.value = storedLocale;
} else {
  // Fallback to browser language or default language
  const fallbackLocale = navigator.language.split('-')[0];
  locale.value = availableLocales.includes(fallbackLocale) ? fallbackLocale : availableLocales[0];
  selectedOption.value = locale.value;
}

watch(locale, (newLocale) => {
  if (newLocale && availableLocales.includes(newLocale)) {
    locale.value = newLocale;
    setLocale(newLocale);
  }
});
</script>

<template>
  <div class="h-screen ">

    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <Transition mode="out-in">
          <KeepAlive>
            <Suspense>

              <component :is="Component">
              </component>

              <template #fallback>
                Loading...
              </template>
            </Suspense>
          </KeepAlive>
        </Transition>
      </template>
    </RouterView>
  </div>
</template>
