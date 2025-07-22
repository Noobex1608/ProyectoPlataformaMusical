import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropinaService } from '../../../services/propina.service';
import { Propina } from '../../../models/propina.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-propina-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './propina-list.component.html',
    styleUrls: ['./propina-list.component.scss']
})
export class PropinaListComponent implements OnInit {
    propinas: Propina[] = [];
    nuevaPropina: Partial<Propina> = {
        id: 0,
        fan_id: '', // UUID
        nombre_fan: 'Usuario Simulado',
        artista_id: '',
        cantidad: 0,
        monto: 0,
        mensaje: '',
        estado: 'pendiente',
        publico_en_feed: true,
        comision: 0,
        monto_neto: 0
    };

    constructor(private propinaService: PropinaService) { }

    ngOnInit(): void {
        this.propinaService.obtenerPropinas().subscribe(data => {
            this.propinas = data;
        });
    }

    enviar() {
        if (this.nuevaPropina.monto && this.nuevaPropina.monto > 0 && this.nuevaPropina.mensaje?.trim()) {
            // Crear propina con todos los campos requeridos
            const propinaCompleta: Omit<Propina, 'id' | 'fecha' | 'estado' | 'comision' | 'monto_neto' | 'created_at'> = {
                fan_id: this.nuevaPropina.fan_id || 'fan-simulado-001',
                nombre_fan: this.nuevaPropina.nombre_fan || 'Usuario Simulado',
                artista_id: this.nuevaPropina.artista_id || 'artista-simulado-001',
                cantidad: this.nuevaPropina.cantidad || this.nuevaPropina.monto || 0,
                monto: this.nuevaPropina.monto,
                mensaje: this.nuevaPropina.mensaje,
                metodo_pago: 'tarjeta',
                publico_en_feed: this.nuevaPropina.publico_en_feed || true
            };

            this.propinaService.enviarPropina(propinaCompleta).subscribe(() => {
                this.nuevaPropina = {
                    id: 0,
                    fan_id: '',
                    nombre_fan: 'Usuario Simulado',
                    artista_id: '',
                    cantidad: 0,
                    monto: 0,
                    mensaje: '',
                    estado: 'pendiente',
                    publico_en_feed: true,
                    comision: 0,
                    monto_neto: 0
                };
            });
        }
    }
}
