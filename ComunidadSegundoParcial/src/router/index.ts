import {createRouter, createWebHistory} from 'vue-router';
import login from '../views/login.vue'
import perfil from '../views/perfil.vue'
import registro from '../views/registro.vue';
import dashboard from '../views/dashboard.vue';
import clubes from '../views/clubes.vue';
import playlist from '../views/playlist.vue';
import playlistDetail from '../views/playlistDetail.vue';
import radio from '../views/radio.vue';
import home from '../views/Home.vue';
import UserTypeSelection from '../views/UserTypeSelection.vue';
import LoginTypeSelection from '../views/LoginTypeSelection.vue';
import RegisterTypeSelection from '../views/RegisterTypeSelection.vue';
import MonetizacionPage from '../views/MonetizacionPage.vue';

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
            path: '/login-tipo',
            name: 'login-tipo',
            component: LoginTypeSelection
        },
        {
            path: '/user-type-selection',
            name: 'user-type-selection',
            component: UserTypeSelection
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
            path: '/registro-tipo',
            name: 'registro-tipo',
            component: RegisterTypeSelection
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
            path: '/playlist/:id',
            name: 'playlistDetail',
            component: playlistDetail
        },
        {
            path: '/radio',
            name: 'radio',
            component: radio
        },
        {
            path: '/monetizacion-selector',
            name: 'monetizacion-selector',
            component: MonetizacionPage
        }
    ]
})

export default router;