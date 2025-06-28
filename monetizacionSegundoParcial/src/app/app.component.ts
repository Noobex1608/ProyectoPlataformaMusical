import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonetizacionComponent } from './features/monetizacion/monetizacion.component'; // Asegúrate que esta ruta sea correcta

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, MonetizacionComponent],
    template: '<app-monetizacion></app-monetizacion>',
})
export class AppComponent { }
