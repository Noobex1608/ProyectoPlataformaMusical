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

export const routes: Routes = [
    {
        path: '',
        component: LayoutBaseComponent,
        children: [
            { path: '', redirectTo: 'monetizacion', pathMatch: 'full' },

            { path: 'monetizacion', component: MonetizacionComponent },
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
