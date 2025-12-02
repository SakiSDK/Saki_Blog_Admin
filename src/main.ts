import { createApp } from 'vue'
import App from './App.vue'
import 'normalize.css'
import './styles/main.scss'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia);
app.use(ElementPlus);
app.mount('#app')

