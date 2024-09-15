import './assets/main.css'
import '@vuepic/vue-datepicker/dist/main.css'

import { computed, createApp, ref, type Plugin, type Ref } from 'vue'
import App from './App.vue'
import router from './router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { createConvexVue } from '@convex-vue/core'
import VueDatePicker from '@vuepic/vue-datepicker'
import i18n from './i18n'
import { createPinia } from 'pinia'
import { clerkPlugin } from 'vue-clerk'
import type { Resources } from '@clerk/types'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const app = createApp(App)

app.use(clerkPlugin, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
})

const authState: { isLoading: Ref<boolean>; session: Ref<Resources['session']> } = {
  isLoading: ref(true),
  session: ref(undefined)
}

app.config.globalProperties.$clerk.addListener((arg) => {
  authState.isLoading.value = false
  authState.session.value = arg.session
})

const convexVue = createConvexVue({
  convexUrl: import.meta.env.VITE_CONVEX_URL,
  auth: {
    isAuthenticated: computed(() => {
      return !!authState.session.value
    }),
    isLoading: authState.isLoading,
    getToken: async ({ forceRefreshToken }) => {
      try {
        return await authState.session.value?.getToken({
          template: 'convex',
          skipCache: forceRefreshToken
        })
      } catch (error) {
        return null
      }
    }
  }
})

app.component('VueDatePicker', VueDatePicker)
app.use(convexVue as unknown as Plugin)
app.use(autoAnimatePlugin)
app.use(router)
app.use(i18n)
app.use(createPinia())

app.mount('#app')
