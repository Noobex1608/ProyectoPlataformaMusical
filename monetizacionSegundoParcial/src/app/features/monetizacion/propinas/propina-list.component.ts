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
    nuevaPropina: Propina = {
        id: 0,
        usuarioId: 201, // simulando que el usuario con ID 201 está enviando la propina
        monto: 0,
        mensaje: ''
    };

    constructor(private propinaService: PropinaService) { }

    ngOnInit(): void {
        this.propinaService.obtenerPropinas().subscribe(data => {
            this.propinas = data;
        });
    }

    enviar() {
        if (this.nuevaPropina.monto > 0 && this.nuevaPropina.mensaje.trim()) {
            this.propinaService.enviarPropina(this.nuevaPropina).subscribe(() => {
                this.nuevaPropina = { id: 0, usuarioId: 201, monto: 0, mensaje: '' };
            });
        }
    }
}
