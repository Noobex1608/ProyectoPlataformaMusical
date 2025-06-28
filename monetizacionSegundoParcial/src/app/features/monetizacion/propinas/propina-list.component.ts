import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Propina } from '../../../models/propina.model';
import { PropinaService } from '../../../services/propina.service';
@Component({
    selector: 'app-propina-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './propina-list.component.html',
    styleUrls: ['./propina-list.component.scss']
})
export class PropinaListComponent implements OnInit {
    propinas: Propina[] = [];

    constructor(private propinaService: PropinaService) { }

    ngOnInit(): void {
        this.propinaService.obtenerPropinas().subscribe((propinas: Propina[]) => {
            this.propinas = propinas;
        });
    }
}
