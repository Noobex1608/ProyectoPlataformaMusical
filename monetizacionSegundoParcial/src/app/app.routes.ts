import { Routes } from '@angular/router';
import { LayoutBaseComponent } from './shared/layout-base/layout-base.component';
import { Router } from '@angular/router';
 
// Propinas
import { PropinaListComponent } from './features/monetizacion/propinas/propina-list.component';
import { PropinaFormComponent } from './features/monetizacion/propinas/propina-form.component';

// Membresías
import { MembresiaListComponent } from './features/monetizacion/membresias/membresia-list.component';
import { MembresiaFormComponent } from './features/monetizacion/membresias/membresia-form.component';

// Puntos
import { PuntoListComponent } from './features/monetizacion/puntos/punto-list.component';
import { PuntoFormComponent } from './features/monetizacion/puntos/punto-form.component';

// Recompensas
import { RecompensaListComponent } from './features/monetizacion/recompensas/recompensa-list.component';
import { RecompensaFormComponent } from './features/monetizacion/recompensas/recompensa-form.component';

// Transacciones
import { TransaccionListComponent } from './features/monetizacion/transacciones/transaccion-list.component';
import { TransaccionFormComponent } from './features/monetizacion/transacciones/transaccion-form.component';

 
export const routes: Routes = [
    {
        path: '',
        component: LayoutBaseComponent,
        children: [
            { path: '', redirectTo: 'propinas', pathMatch: 'full' }, 
            { path: 'propinas', component: PropinaListComponent },
            { path: 'propinas/nueva', component: PropinaFormComponent },

            { path: 'membresias', component: MembresiaListComponent },
            { path: 'membresias/nueva', component: MembresiaFormComponent },

            { path: 'puntos', component: PuntoListComponent },
            { path: 'puntos/nueva', component: PuntoFormComponent },

            { path: 'recompensas', component: RecompensaListComponent },
            { path: 'recompensas/nueva', component: RecompensaFormComponent },

            { path: 'transacciones', component: TransaccionListComponent },
            { path: 'transacciones/nueva', component: TransaccionFormComponent },
            { path: 'puntos/nueva', component: PuntoFormComponent },

            { path: 'recompensas', component: RecompensaListComponent },
            { path: 'recompensas/nueva', component: RecompensaFormComponent },
            // app.routes.ts o donde declares tus rutas
{
  path: 'recompensas',
  loadComponent: () => import('./features/monetizacion/recompensas/recompensa-list.component').then(m => m.RecompensaListComponent)
            },


        


        ]
    },

    // ✅ Opcional: ruta 404 si quieres
    { path: '**', redirectTo: 'propinas' }
];
