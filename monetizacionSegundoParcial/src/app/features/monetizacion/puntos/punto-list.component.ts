import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { PuntoService } from "@app/services/punto.service";

@Component({
    selector: 'app-punto-list',
    standalone: true,
    templateUrl: './punto-list.component.html',
    styleUrls: ['./punto-list.component.scss'],
    imports: [CommonModule]
})
export class PuntoListComponent implements OnInit {
    usuarioId = 1; // Simulación
    formas = [
        { nombre: 'Inicio de sesión diario', puntos: 25, tipo: 'diario' },
        { nombre: 'Enviar propina ($1)', puntos: 10, tipo: 'propina' },
        { nombre: 'Comprar membresía', puntos: 100, tipo: 'membresia' },
        { nombre: 'Compartir contenido', puntos: 15, tipo: 'compartir' }
    ];

    estadisticas = { total: 0, canjeados: 0, disponibles: 0 };

    constructor(private puntoService: PuntoService) { }

    ngOnInit(): void {
        this.actualizarEstadisticas();
    }

    reclamar(tipo: string, cantidad: number) {
        this.puntoService.agregarPunto({
            id: 0,
            usuarioId: this.usuarioId,
            tipo: tipo as any,
            cantidad,
            fecha: new Date().toISOString()
        });
        this.actualizarEstadisticas();
    }

    actualizarEstadisticas() {
        this.estadisticas = this.puntoService.calcularEstadisticas(this.usuarioId);
    }
}
    