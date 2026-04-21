import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import SearchView from '../views/SearchView.vue'
import TeamView from '../views/TeamView.vue'
import DashboardView from '../views/DashboardView.vue'
import MessagingView from '../views/MessagingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  { path: '/',          component: HomeView },
  { path: '/about',     component: AboutView },
  { path: '/search',    component: SearchView },
  { path: '/team',      component: TeamView },
  { path: '/dashboard', component: DashboardView },
  { path: '/messages',  component: MessagingView },
  { path: '/login',     component: LoginView },
  { path: '/register',  component: RegisterView },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router