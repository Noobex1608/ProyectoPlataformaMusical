// src/app/features/artista-dashboard/artista-dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistaDashboardRoutingModule } from './artista-dashboard-routing.module';
import { ArtistaMonetizacionDashboardComponent } from './artista-monetizacion-dashboard.component';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        ArtistaDashboardRoutingModule,
        ArtistaMonetizacionDashboardComponent
    ],
    exports: [
        ArtistaMonetizacionDashboardComponent
    ]
})
export class ArtistaDashboardModule { }
