import { createApp } from 'vue'
import App from './App.vue'
import VuePapaParse from 'vue-papa-parse'
import '@/assets/style.scss'

const app = createApp(App)
app.use(VuePapaParse)
app.mount('#app')
