import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TransaccionService } from '../../../services/transaccion.service';
import { Transaccion } from '../../../models/transaccion.model';

@Component({
    selector: 'app-transaccion-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './transaccion-form.component.html'
})
export class TransaccionFormComponent {
    transaccion: Partial<Transaccion> = {
        descripcion: '',
        monto: 0,
        usuario: { id: 1, nombre: 'Demo User' },
        usuarioId: 1,
        tipo: undefined // ✅ Esto es lo correcto para evitar el error de tipo
    };

    tipoSeleccionado: string = '';

    constructor(private servicio: TransaccionService, private router: Router) { }

    guardar(): void {
        // Validación: asegura que tipo, monto y descripción existan
        if (!this.transaccion.tipo || !this.transaccion.descripcion || !this.transaccion.monto) {
            alert('Faltan campos obligatorios');
            return;
        }

        this.servicio.agregarTransaccion(this.transaccion as Transaccion);
        this.router.navigate(['/transacciones']);
    }

    setTipo(): void {
        switch (this.tipoSeleccionado) {
            case 'membresia':
                this.transaccion.tipo = {
                    id: 1,
                    nombre: 'Membresía Básica',
                    descripcion: 'Acceso limitado',
                    precio: 10,
                    duracionDias: 30,
                    beneficios: []
                };
                break;
            case 'propina':
                this.transaccion.tipo = {
                    id: 2,
                    usuarioId: 1,
                    monto: 5,
                    mensaje: '¡Buen trabajo!'
                };
                break;
            case 'recompensa':
                this.transaccion.tipo = {
                    id: 'r1',
                    nombre: 'Sticker',
                    descripcion: 'Paquete de stickers',
                    costoPuntos: 50
                };
                break;
            default:
                this.transaccion.tipo = undefined;
        }
    }
}
