import { Routes } from '@angular/router';

// Update the path below if the actual location is different
import { LayoutBaseComponent } from './shared//layout-base/layout-base.component';

import { MembresiaListComponent } from './features/monetizacion/membresias/membresia-list.component';
import { MembresiaFormComponent } from './features/monetizacion/membresias/membresia-form.component';

import { PropinaListComponent } from './features/monetizacion/propinas/propina-list.component';
import { PropinaFormComponent } from './features/monetizacion/propinas/propina-form.component';

import { RecompensaListComponent } from './features/monetizacion/recompensas/recompensa-list.component';
import { RecompensaFormComponent } from './features/monetizacion/recompensas/recompensa-form.component';

import { TransaccionListComponent } from './features/monetizacion/transacciones/transaccion-list.component';
import { TransaccionFormComponent } from './features/monetizacion/transacciones/transaccion-form.component';

import { MonetizacionComponent } from './features/monetizacion/monetizacion.component';
import { ArtistaMonetizacionDashboardComponent } from './features/artista-dashboard/artista-monetizacion-dashboard.component';

export const routes: Routes = [
    {
        path: '',
        component: LayoutBaseComponent,
        children: [
            { path: '', redirectTo: 'fan/dashboard', pathMatch: 'full' },

            // Rutas para fans
            {
                path: 'fan/dashboard',
                loadComponent: () => import('./components/fan/fan-dashboard.component').then(m => m.FanDashboardComponent),
                title: 'Dashboard - Monetización'
            },
            {
                path: 'fan/explorar-artistas',
                loadComponent: () => import('./components/fan/explorar-artistas.component').then(m => m.ExplorarArtistasComponent),
                title: 'Explorar Artistas - Monetización'
            },
            {
                path: 'fan/suscripciones',
                loadComponent: () => import('./components/fan/gestionar-suscripciones.component').then(m => m.GestionarSuscripcionesComponent),
                title: 'Mis Suscripciones - Monetización'
            },
            {
                path: 'fan/propinas',
                loadComponent: () => import('./components/fan/enviar-propinas.component').then(m => m.EnviarPropinasComponent),
                title: 'Enviar Propinas - Monetización'
            },
            {
                path: 'fan/contenido-exclusivo',
                loadComponent: () => import('./components/fan/contenido-exclusivo-fan.component').then(m => m.ContenidoExclusivoFanComponent),
                title: 'Contenido Exclusivo - Monetización'
            },

            // Rutas existentes del sistema
            { path: 'monetizacion', component: MonetizacionComponent },
            { path: 'artista-dashboard', component: ArtistaMonetizacionDashboardComponent },
            { path: 'artista-dashboard/:artistaId', component: ArtistaMonetizacionDashboardComponent },
            { path: 'membresias', component: MembresiaListComponent },
            { path: 'membresias/nueva', component: MembresiaFormComponent },
            { path: 'propinas', component: PropinaListComponent },
            { path: 'propinas/nueva', component: PropinaFormComponent },
            { path: 'recompensas', component: RecompensaListComponent },
            { path: 'recompensas/nueva', component: RecompensaFormComponent },
            { path: 'transacciones', component: TransaccionListComponent },
            { path: 'transacciones/nueva', component: TransaccionFormComponent }
        ]
    }
];
