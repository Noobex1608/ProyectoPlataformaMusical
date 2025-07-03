import { createApp, h } from 'vue'
import type { App as VueApp } from 'vue'
import singleSpaVue from 'single-spa-vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const vueLifecycles = singleSpaVue({
  createApp,
  appOptions: {
    render() {
      return h(App)
    }
  },
  handleInstance(app: VueApp) {
    app.use(router)
    app.use(pinia)
  }
})

// Exportar los lifecycle hooks de Single SPA
export const { bootstrap, mount, unmount } = vueLifecycles

// Para desarrollo standalone (cuando no está dentro de Single SPA)
if (typeof window !== 'undefined' && !window.singleSpaNavigate) {
  const rootElement = document.getElementById('app')
  if (rootElement) {
    console.log('🚀 Ejecutando en modo standalone')
    createApp(App).use(router).use(pinia).mount('#app')
  }
} else if (typeof window !== 'undefined') {
  console.log('🎵 Configurado para Single SPA')
}
