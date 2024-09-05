import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { createConvexVue } from '@convex-vue/core'

const convexVue = createConvexVue({
  convexUrl: import.meta.env.VITE_CONVEX_URL
})

const app = createApp(App)
app.use(convexVue)

app.use(router)

app.mount('#app')
