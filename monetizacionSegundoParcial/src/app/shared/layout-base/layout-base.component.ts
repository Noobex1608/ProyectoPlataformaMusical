import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-layout-base',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './layout-base.component.html',
  styleUrls: ['./layout-base.component.css']
})
export class LayoutBaseComponent { }
