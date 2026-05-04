import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../pages/main.vue'
import HabitFormPage from '../pages/habit-form.vue'

const routes = [
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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
