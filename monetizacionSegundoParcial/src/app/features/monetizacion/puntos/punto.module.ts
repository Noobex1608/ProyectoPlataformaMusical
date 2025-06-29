import { NgModule } from '@angular/core';
import { PuntoFormComponent } from './punto-form.component';
import { PuntoListComponent } from './punto-list.component';

@NgModule({
    imports: [PuntoFormComponent, PuntoListComponent], // ✅ IMPORTA ambos porque son standalone
})
export class PuntoModule { }
  