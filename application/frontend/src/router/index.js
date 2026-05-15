import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import SearchView from '../views/SearchView.vue'
import DashboardView from '../views/DashboardView.vue'
import CreateListingView from '../views/CreateListingView.vue'
import ListingDetailView from '../views/ListingDetailView.vue'
import MessagingView from '../views/MessagingView.vue'
import TradesView from '../views/TradesView.vue'
import TeamView from '../views/TeamView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/home', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/search', component: SearchView },
  { path: '/dashboard', component: DashboardView },
  { path: '/create-listing', component: CreateListingView },
  { path: '/listing/:id', component: ListingDetailView },
  { path: '/messages', component: MessagingView },
  { path: '/trades', component: TradesView },
  { path: '/team', component: TeamView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router