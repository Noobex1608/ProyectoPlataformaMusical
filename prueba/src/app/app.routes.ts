import { Routes } from '@angular/router';
import { USUARIOS_ROUTES } from './features/usuarios/usuarios.routes';
import { MembresiaListComponent } from './features/monetizacion/membresias/membresia-list.component';
import { MembresiaFormComponent } from './features/monetizacion/membresias/membresia-form.component';
import { PropinaListComponent } from './features/monetizacion/propinas/propina-list.component';
import { PropinaFormComponent } from './features/monetizacion/propinas/propina-form.component';
import { ContratoFormComponent } from './features/monetizacion/contratos/contrato-form.component';
import { ContratoListComponent } from './features/monetizacion/contratos/contrato-list.component';
import { RecompensaListComponent } from './features/monetizacion/recompensas/recompensa-list.component';
import { RecompensaFormComponent } from './features/monetizacion/recompensas/recompensa-form.component';
import { TransaccionListComponent } from './features/monetizacion/transacciones/transaccion-list.component';
import { TransaccionFormComponent } from './features/monetizacion/transacciones/transaccion-form.component';
import { MonetizacionComponent } from './features/monetizacion/monetizacion.component';
import { LayoutBaseComponent } from './shared/layout-base/layout-base.component';

export const routes: Routes = [
    ...USUARIOS_ROUTES,
    {
        path: '',
        component: LayoutBaseComponent,
        children: [
            { path: '', redirectTo: 'monetizacion', pathMatch: 'full' },  // ✅ redirección aquí
            { path: 'monetizacion', loadComponent: () => import('./features/monetizacion/monetizacion.component').then(m => m.MonetizacionComponent) },
            { path: 'membresias', component: MembresiaListComponent },
            { path: 'membresias/nueva', component: MembresiaFormComponent },
            { path: 'propinas', component: PropinaListComponent },
            { path: 'propinas/nueva', component: PropinaFormComponent },
            { path: 'contratos', component: ContratoListComponent },
            { path: 'contratos/nuevo', component: ContratoFormComponent },
            { path: 'recompensas', component: RecompensaListComponent },
            { path: 'recompensas/nueva', component: RecompensaFormComponent },
            { path: 'transacciones', component: TransaccionListComponent },
            { path: 'transacciones/nueva', component: TransaccionFormComponent },
            { path: 'nuevo-contrato', loadComponent: () => import('./features/monetizacion/contratos/contrato-form.component').then(m => m.ContratoFormComponent) },
            { path: 'monetizacion/membresias', loadComponent: () => import('./features/monetizacion/membresias/membresia-list.component').then(m => m.MembresiaListComponent) }
        ]
    }
    ];