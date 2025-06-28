// src/app/features/usuarios/usuarios.routes.ts
import { Routes } from '@angular/router';
import { ExplorarArtistasComponent } from './explorar-artistas/explorar-artistas.component';
import { VerRecompensasComponent } from './ver-recompensas/ver-recompensas.component';
import { ComprarMembresiaComponent } from './comprar-membresia/comprar-membresia.component';
import { EnviarPropinaComponent } from './enviar-propina/enviar-propina.component';
import { MisTransaccionesComponent } from './mis-transacciones/mis-transacciones.component';

export const USUARIOS_ROUTES: Routes = [
    { path: 'usuarios/artistas', component: ExplorarArtistasComponent },
    { path: 'usuarios/recompensas', component: VerRecompensasComponent },
    { path: 'usuarios/membresias', component: ComprarMembresiaComponent },
    { path: 'usuarios/propina', component: EnviarPropinaComponent },
    { path: 'usuarios/transacciones', component: MisTransaccionesComponent },
];
