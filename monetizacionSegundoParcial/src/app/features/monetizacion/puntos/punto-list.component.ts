import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'app-punto-list',
    standalone: true,
    templateUrl: './punto-list.component.html',
    styleUrls: ['./punto-list.component.scss'],
    imports: [CommonModule]
})
export class PuntoListComponent implements OnInit {
    usuarioId = 1; // Simulación
    puntos: any[] = []; // Array para almacenar puntos
    formas = [
        { nombre: 'Inicio de sesión diario', puntos: 25, tipo: 'diario' },
        { nombre: 'Enviar propina ($1)', puntos: 10, tipo: 'propina' },
        { nombre: 'Comprar membresía', puntos: 100, tipo: 'membresia' },
        { nombre: 'Compartir contenido', puntos: 15, tipo: 'compartir' }
    ];

    estadisticas = { total: 0, canjeados: 0, disponibles: 0 };

    constructor() { }

    ngOnInit(): void {
        this.actualizarEstadisticas();
    }

    reclamar(tipo: string, cantidad: number) {
        console.log('Reclamando puntos:', tipo, cantidad);
        // Simulamos agregar puntos
        this.puntos.push({
            id: this.puntos.length + 1,
            usuarioId: this.usuarioId,
            tipo: tipo as any,
            cantidad,
            fecha: new Date().toISOString()
        });
        this.actualizarEstadisticas();
    }

    actualizarEstadisticas() {
        // Calcular estadísticas basadas en el array de puntos
        const totalPuntos = this.puntos.reduce((sum, punto) => sum + punto.cantidad, 0);
        this.estadisticas = {
            total: totalPuntos,
            canjeados: 0,
            disponibles: totalPuntos
        };
    }
}
    