// src/app/features/monetizacion/monetizacion.component.ts

import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Servicios
import { MembresiaService } from '../../services/membresia.service';
import { PropinaService } from '../../services/propina.service';
import { TransaccionService } from '../../services/transaccion.service';
import { RecompensaService } from '../../services/recompensa.service';
import { SuscripcionService } from '../../services/suscripcion.service'; // <--- IMPORTANTE

// Modelos
import { Membresia } from '../../models/membresia.model';
import { Propina } from '../../models/propina.model';
import { Transaccion } from '../../models/transaccion.model';
import { Recompensa } from '../../models/recompensa.model';
// import { SistemaPuntos } from '../../models/sistemapuntos.model'; // ELIMINADO - funcionalidad integrada
import { Suscripcion } from '../../models/suscripcion.model';

@Component({
    selector: 'app-monetizacion',
    standalone: true,
    imports: [CommonModule],
    providers: [
        MembresiaService,
        PropinaService,
        TransaccionService,
        RecompensaService,
        SuscripcionService
    ],
    templateUrl: './monetizacion.component.html',
    styleUrls: ['./monetizacion.component.scss']
})
export class MonetizacionComponent implements OnInit {
    @Input() vistaActual: 'resumen' | 'membresias' | 'propinas' | 'transacciones' | 'recompensas' | 'puntos' | 'suscripciones' = 'resumen';

    membresias: Membresia[] = [];
    propinas: Propina[] = [];
    transacciones: Transaccion[] = [];
    recompensas: Recompensa[] = [];
    // puntos: SistemaPuntos[] = []; // ELIMINADO - funcionalidad integrada en configuración
    suscripciones: Suscripcion[] = [];

    promedioPropinas = 0;
    promedioDuracion = 0;
    totalBeneficios = 0;

    constructor(
        private membresiaService: MembresiaService,
        private propinaService: PropinaService,
        private transaccionService: TransaccionService,
        private recompensaService: RecompensaService,
        private suscripcionService: SuscripcionService // <--- Ahora sí INYECTADO bien
    ) { }

    ngOnInit(): void {
        this.cargarDatos();

        this.suscripcionService.obtenerSuscripciones().subscribe((s: Suscripcion[]) => {
            this.suscripciones = s;
        });
    }

    cargarDatos(): void {
        this.membresiaService.obtenerMembresias().subscribe((m: Membresia[]) => {
            this.membresias = m;
            this.calcularPromedioDuracion();
            this.calcularTotalBeneficios();
        });

        this.propinaService.obtenerPropinas().subscribe((p: Propina[]) => {
            this.propinas = p;
            this.calcularPromedioPropinas();
        });

        this.transaccionService.obtenerTransacciones().subscribe((t: Transaccion[]) => {
            this.transacciones = t;
        });

        this.recompensaService.obtenerRecompensas().subscribe((r: Recompensa[]) => {
            this.recompensas = r;
        });

        // this.puntosService.obtenerPuntos().subscribe((p: SistemaPuntos[]) => {
        //     this.puntos = p;
        // }); // ELIMINADO - funcionalidad integrada en configuración
    }

    eliminarMembresia(id: number): void {
        this.membresiaService.eliminarMembresia(id);
        this.membresias = this.membresias.filter(m => m.id !== id);
    }

    calcularPromedioPropinas(): void {
        if (this.propinas.length > 0) {
            const suma = this.propinas.reduce((acc, p) => acc + p.cantidad, 0);
            this.promedioPropinas = suma / this.propinas.length;
        }
    }

    calcularPromedioDuracion(): void {
        if (this.membresias.length > 0) {
            const suma = this.membresias.reduce((acc, m) => acc + m.duracion_dias, 0);
            this.promedioDuracion = suma / this.membresias.length;
        }
    }

    calcularTotalBeneficios(): void {
        this.totalBeneficios = this.membresias.reduce((acc, m) => acc + m.precio, 0);
    }

    suscribirse(membresiaId: number): void {
        const membresia = this.membresias.find(m => m.id === membresiaId);
        if (!membresia) return;

        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30); // 30 días de suscripción

        const nuevaSuscripcion: Suscripcion = {
            id: 0,
            usuarioId: 201, // ID fijo de fan simulado
            membresiaId,
            artistaId: membresia.artista_id,
            fechaInicio,
            fechaFin,
            activa: true,
            renovacionAutomatica: false,
            estadoPago: 'pagado',
            metodoPago: 'tarjeta',
            montoTotal: membresia.precio,
            montoComision: membresia.precio * 0.1, // 10% de comisión
            montoNeto: membresia.precio * 0.9,
            beneficiosUsados: {
                fotosExclusivas: 0,
                avancesCanciones: 0,
                mensajesPrivados: 0
            }
        };

        this.suscripcionService.crearSuscripcion(nuevaSuscripcion).subscribe(() => {
            alert('¡Te has suscrito con éxito!');
            this.suscripcionService.obtenerSuscripciones().subscribe((s) => {
                this.suscripciones = s;
            });
        });
    }
}
