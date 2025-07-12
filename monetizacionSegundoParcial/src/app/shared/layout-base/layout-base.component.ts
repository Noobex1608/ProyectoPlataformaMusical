import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-layout-base',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './layout-base.component.html',
    styleUrls: ['./layout-base.component.css']
})
export class LayoutBaseComponent { }
