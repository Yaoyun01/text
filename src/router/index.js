import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TimelineView from '../views/TimelineView.vue'
import MapView from '../views/MapView.vue'
import CompareView from '../views/CompareView.vue'
import DetailView from '../views/DetailView.vue'
import SummaryView from '../views/SummaryView.vue'
import View3D from '../views/View3D.vue'
import Fullscreen3D from '../views/Fullscreen3D.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/timeline', name: 'timeline', component: TimelineView },
  { path: '/map', name: 'map', component: MapView },
  { path: '/compare', name: 'compare', component: CompareView },
  { path: '/detail/:id', name: 'detail', component: DetailView, props: true },
  { path: '/summary', name: 'summary', component: SummaryView },
  { path: '/3d', name: '3d', component: View3D },
  { path: '/fullscreen-3d', name: 'fullscreen3d', component: Fullscreen3D }
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
