import { defineStore } from 'pinia'
import { computed, ref, useId } from 'vue'

export const useLocaleStore = defineStore('locale', () => {
  const KEY = `locale:${useId()}`
  const currentLocale = ref('')
  const systemLocale = ref(navigator.language || '')

  const getSystemLocale = computed(() => systemLocale.value)
  const getLocale = computed(() => {
    const item = localStorage.getItem(KEY)
    return item ? JSON.parse(item).locale : getSystemLocale.value
  })

  const setLocale = (localeString: string) => {
    currentLocale.value = localeString
    localStorage.setItem(KEY, JSON.stringify({ locale: currentLocale.value }))
  }

  return {
    getSystemLocale,
    getLocale,
    setLocale,
    currentLocale
  }
})
