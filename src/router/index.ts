import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { getCookie } from '../utils/api'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/reading/:id',
      name: 'reading',
      component: () => import('../views/reading/index.vue'),
    },
    {
      path: '/listening/:id',
      name: 'listening',
      component: () => import('../views/listening/index.vue'),
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = getCookie('access_token')
  if (to.path === '/login' && token) {
    next('/')
  } else if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
