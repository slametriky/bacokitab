import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import './style.css'
import 'flowbite'
import App from './App.vue'
import router from './router'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

const app = createApp(App)
const head = createHead()

app.use(router)
app.use(head)
app.mount('#app')
