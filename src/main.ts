import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'
import { createConvexVue } from '@convex-vue/core'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import i18n from './i18n'
import type { Plugin } from 'vue'
import { createPinia } from 'pinia'

const convexVue = createConvexVue({
  convexUrl: import.meta.env.VITE_CONVEX_URL
}) as unknown as Plugin

const pinia = createPinia()

const app = createApp(App)
app.component('VueDatePicker', VueDatePicker)
app.use(convexVue)
app.use(autoAnimatePlugin)
app.use(router)
app.use(i18n)
app.use(pinia)

app.mount('#app')
