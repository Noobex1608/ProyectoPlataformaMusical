import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Declarar tipos para window
declare global {
  interface Window {
    navigateToHome?: () => void;
    singleSpaNavigate?: any;
  }
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="logo" (click)="navigateToHome()">
        <span>RawBeats</span>
        <img src="assets/logoBeats.svg" alt="Logo" />
      </div>

      <nav class="nav">
        <button class="link" (click)="navigateToSection('resumen')" [class.active]="activeSection === 'resumen'">
          📊 Resumen
        </button>
        <button class="link" (click)="navigateToSection('membresias')" [class.active]="activeSection === 'membresias'">
          💎 Membresías
        </button>
        <button class="link" (click)="navigateToSection('propinas')" [class.active]="activeSection === 'propinas'">
          💸 Propinas
        </button>
        <button class="link" (click)="navigateToSection('transacciones')" [class.active]="activeSection === 'transacciones'">
          📈 Transacciones
        </button>
        <button class="link" (click)="navigateToSection('recompensas')" [class.active]="activeSection === 'recompensas'">
          🎁 Recompensas
        </button>
        <button class="link" (click)="navigateToSection('puntos')" [class.active]="activeSection === 'puntos'">
          ⭐ Puntos
        </button>
        <button class="btn-back" (click)="navigateToHome()">
          <strong>← Volver a Comunidad</strong>
        </button>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 1.5rem;
      background-color: #348e91;
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      box-sizing: border-box;
      width: 100%;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.1rem;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .logo:hover {
      transform: scale(1.05);
    }

    .logo img {
      height: 50px;
      width: auto;
      margin-right: 0.5rem;
      filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
      transition: transform 0.3s ease;
    }

    .logo span {
      font-size: 1.8rem;
      font-weight: bold;
      line-height: 1;
      color: white;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .link {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .link:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .link.active {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
      border-bottom: 2px solid white;
    }

    .btn-back {
      background-color: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.3s ease;
      margin-left: 1rem;
    }

    .btn-back:hover {
      background-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    /* Responsividad */
    @media (max-width: 768px) {
      .header {
        padding: 0.5rem 1rem;
        flex-direction: column;
        gap: 1rem;
      }

      .nav {
        flex-wrap: wrap;
        justify-content: center;
      }

      .logo span {
        font-size: 1.5rem;
      }

      .logo img {
        height: 40px;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() activeSection: string = 'resumen';
  @Output() sectionChange = new EventEmitter<string>();
  
  navigateToHome() {
    console.log('🏠 Navegando de vuelta a ComunidadSegundoParcial...');
    if (typeof window.navigateToHome === 'function') {
      window.navigateToHome();
    } else {
      // Fallback
      window.location.href = 'http://localhost:9000/';
    }
  }

  navigateToSection(section: string) {
    console.log(`📍 Navegando a sección: ${section}`);
    this.activeSection = section;
    this.sectionChange.emit(section);
  }
}
