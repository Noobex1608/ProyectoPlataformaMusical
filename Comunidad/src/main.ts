import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Estilos globales
import './style.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faPlay, faPause, faForwardStep, faBackwardStep,
  faHeart, faSun, faMoon, faDesktop, faVolumeUp,
  faVolumeMute, faShuffle, faRepeat, faSliders,
  faMusic, faMicrophone, faFaceSmile
} from '@fortawesome/free-solid-svg-icons'

// Agregar iconos a la biblioteca
library.add(
  faPlay, faPause, faForwardStep, faBackwardStep,
  faHeart, faSun, faMoon, faDesktop, faVolumeUp,
  faVolumeMute, faShuffle, faRepeat, faSliders,
  faMusic, faMicrophone, faFaceSmile
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')