import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interfaces locales
interface Usuario {
    id: string;
    nombre: string;
}

interface TransaccionConUsuario {
    id: number;
    usuario_id: string;
    artista_id: string;
    tipo: string;
    subtipo?: string;
    referencia_id: number;
    descripcion: string;
    concepto: string;
    monto: number;
    monto_comision: number;
    monto_neto: number;
    moneda: string;
    fecha: string;
    fecha_procesamiento?: string;
    estado: string;
    metodo_pago: string;
    transaccion_externa_id?: string;
    metadata?: any;
    created_at: string;
    updated_at?: string;
    usuario?: Usuario; // Propiedad adicional para el template
}

@Component({
    selector: 'app-transaccion-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './transaccion-list.component.html'
})
export class TransaccionListComponent implements OnInit {
    transacciones: TransaccionConUsuario[] = [
        {
            id: 1,
            usuario_id: 'user-123',
            artista_id: 'artista-456',
            tipo: 'propina',
            referencia_id: 1,
            descripcion: 'Propina por contenido excelente',
            concepto: 'Propina',
            monto: 10.00,
            monto_comision: 1.00,
            monto_neto: 9.00,
            moneda: 'USD',
            fecha: new Date().toISOString(),
            estado: 'procesada',
            metodo_pago: 'tarjeta',
            created_at: new Date().toISOString(),
            usuario: { id: 'user-123', nombre: 'Juan Pérez' }
        },
        {
            id: 2,
            usuario_id: 'user-789',
            artista_id: 'artista-456',
            tipo: 'membresia',
            referencia_id: 2,
            descripcion: 'Suscripción mensual premium',
            concepto: 'Membresía Premium',
            monto: 25.00,
            monto_comision: 2.50,
            monto_neto: 22.50,
            moneda: 'USD',
            fecha: new Date().toISOString(),
            estado: 'procesada',
            metodo_pago: 'paypal',
            created_at: new Date().toISOString(),
            usuario: { id: 'user-789', nombre: 'María González' }
        }
    ];

    constructor() { }

    ngOnInit(): void {
        // Datos simulados ya están inicializados
    }

    tipoDesconocido(tipo: any): string {
        if (!tipo) return 'Sin tipo';
        if ('nombre' in tipo) return tipo.nombre;
        if ('mensaje' in tipo) return 'Propina';
        return 'Tipo desconocido';
    }
}
