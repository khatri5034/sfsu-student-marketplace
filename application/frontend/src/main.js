import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import VueGtag from 'vue-gtag'

const app = createApp(App)

app.use(router)
app.use(VueGtag, {
    config: { id: 'G-YXY4E1KB28'}
}, router)

app.mount('#app')