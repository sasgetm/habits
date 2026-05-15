import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../pages/main.vue'
import HabitFormPage from '../pages/habit-form.vue'
import InitPage from '../pages/init.vue'
import TrackerCreatePage from '../pages/tracker-create.vue'

const routes = [
  {
    path: '/init',
    name: 'init',
    component: InitPage,
  },
  {
    path: '/tracker-create',
    name: 'tracker-create',
    component: TrackerCreatePage,
  },
  {
    path: '/',
    name: 'main',
    component: MainPage,
  },
  {
    path: '/habit/new',
    name: 'habit-new',
    component: HabitFormPage,
  },
  {
    path: '/habit/:id/edit',
    name: 'habit-edit',
    component: HabitFormPage,
    props: true,
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../pages/settings.vue'),
  },
]

const router = createRouter({
  history: createWebHistory('/habits/'),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.name === 'init' || to.name === 'tracker-create') {
    next()
    return
  }

  const deploymentId = localStorage.getItem('habits-settings-deploymentId')
  if (!deploymentId) {
    next({ name: 'init' })
    return
  }

  next()
})

export default router
