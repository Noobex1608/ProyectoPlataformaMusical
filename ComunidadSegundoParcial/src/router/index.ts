import {createRouter, createWebHistory} from 'vue-router';
import login from '../views/login.vue'
import perfil from '../views/perfil.vue'
import registro from '../views/registro.vue';
import dashboard from '../views/dashboard.vue';
import clubes from '../views/clubes.vue';
import playlist from '../views/playlist.vue';
import radio from '../views/radio.vue';
import home from '../views/Home.vue';

// Función para obtener la base path según el entorno
const getBasePath = () => {
  // Siempre usar ruta raíz ya que ahora ComunidadSegundoParcial es el home
  return '/';
};

const router = createRouter({
    history: createWebHistory(getBasePath()),
    routes: [
        {
            path: '/',
            name: 'home',
            component: home
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: dashboard
        },

        {
            path: '/login',
            name: 'login',
            component: login
        },
        {
            path: '/perfil',
            name: 'perfil',
            component: perfil
        },
        {
            path: '/registro',
            name: 'registro',
            component: registro
        },
        {
            path: '/clubes',
            name: 'clubes',
            component: clubes
        },
        {
            path: '/playlist',
            name: 'playlist',
            component: playlist
        },
        {
            path: '/radio',
            name: 'radio',
            component: radio
        }
    ]
})

export default router;