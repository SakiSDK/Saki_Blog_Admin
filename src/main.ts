import { createApp } from 'vue'
import App from './App.vue'
import 'normalize.css'
import './styles/main.scss'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/icon/iconfont.css'
import router from './router';


window.addEventListener('beforeunload', () => {
  sessionStorage.setItem('reloaded', '1')
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(ElementPlus);
app.use(router);
app.use(pinia);
app.mount('#app')

