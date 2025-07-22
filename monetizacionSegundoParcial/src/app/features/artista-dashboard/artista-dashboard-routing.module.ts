// src/app/features/artista-dashboard/artista-dashboard-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistaMonetizacionDashboardComponent } from './artista-monetizacion-dashboard.component';

const routes: Routes = [
    {
        path: '',
        component: ArtistaMonetizacionDashboardComponent
    },
    {
        path: 'dashboard/:artistaId',
        component: ArtistaMonetizacionDashboardComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ArtistaDashboardRoutingModule { }
