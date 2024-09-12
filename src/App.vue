<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { onMounted, watchEffect } from 'vue';
import { useLocaleStore } from './stores/i18n'

const { locale } = useI18n()
const { getLocale, currentLocale } = useLocaleStore()

watchEffect(() => currentLocale)

onMounted(() => {
  locale.value = getLocale
})
</script>

<template>
  <div class="h-screen ">

    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <Transition mode="out-in">
          <KeepAlive>
            <Suspense>
              <component :is="Component"></component>
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
