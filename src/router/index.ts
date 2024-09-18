import { useAuth } from 'vue-clerk'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/times/:project/:id',
      name: 'times',
      component: () => import('@/views/TimesView.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const { isSignedIn } = useAuth()

  if (to.meta.requiresAuth && !isSignedIn.value) {
    next('/')
  } else {
    next()
  }
})

export default router
