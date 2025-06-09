import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, type FormBuilder, type FormGroup, Validators } from "@angular/forms"
import type { ActivatedRoute, Router } from "@angular/router"
import type { PlanSuscripcion } from "../../models/user.model"

@Component({
  selector: "app-subscription",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Suscribirse a {{ artistaNombre }}</h1>
          <p class="text-gray-600">Elige el plan que mejor se adapte a ti</p>
        </div>

        <!-- Planes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div *ngFor="let plan of planes" 
               (click)="selectPlan(plan)"
               [class]="'bg-white rounded-lg shadow cursor-pointer transition-all ' + 
                       (selectedPlan?.id === plan.id ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:shadow-md') +
                       (plan.popular ? ' border-purple-500' : '')">
            <div class="p-6 text-center">
              <div *ngIf="plan.popular" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-4">
                Más Popular
              </div>
              <i [class]="'fas text-2xl text-purple-600 mb-4 ' + getIconClass(plan.id)"></i>
              <h3 class="text-xl font-bold text-gray-900">{{ plan.nombre }}</h3>
              <div class="text-3xl font-bold text-gray-900 my-2">
                \${{ plan.precio }}
                <span class="text-sm font-normal text-gray-500">/mes</span>
              </div>
              <ul class="text-left space-y-2 mt-4">
                <li *ngFor="let beneficio of plan.beneficios" class="flex items-center text-sm">
                  <i class="fas fa-check text-green-500 mr-2"></i>
                  {{ beneficio }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Formulario de pago -->
        <div *ngIf="selectedPlan" class="bg-white rounded-lg shadow p-6">
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 flex items-center">
              <i class="fas fa-credit-card mr-2"></i>
              Información de Pago
            </h3>
            <p class="text-gray-600">Plan seleccionado: {{ selectedPlan.nombre }} - \${{ selectedPlan.precio }}/mes</p>
          </div>

          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
                <input 
                  type="text" 
                  formControlName="cardName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Juan Pérez"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                <input 
                  type="text" 
                  formControlName="cardNumber"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="1234 5678 9012 3456"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
                <input 
                  type="text" 
                  formControlName="expiryDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="MM/AA"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input 
                  type="text" 
                  formControlName="cvv"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123"
                >
              </div>
            </div>

            <div class="pt-4 border-t">
              <div class="flex justify-between items-center mb-4">
                <span class="text-lg">Total mensual:</span>
                <span class="text-2xl font-bold">\${{ selectedPlan.precio }}</span>
              </div>
              <button 
                type="submit" 
                [disabled]="loading || paymentForm.invalid"
                class="w-full bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 disabled:opacity-50 text-lg font-medium"
              >
                {{ loading ? 'Procesando pago...' : 'Suscribirse por $' + selectedPlan.precio + '/mes' }}
              </button>
            </div>
          </form>
        </div>

        <div class="mt-6 text-center">
          <button (click)="goBack()" class="text-purple-600 hover:text-purple-700">
            <i class="fas fa-arrow-left mr-2"></i>
            Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  `,
})
export class SubscriptionComponent implements OnInit {
  artistaNombre = "Luna Melodía"
  selectedPlan: PlanSuscripcion | null = null
  loading = false
  paymentForm: FormGroup

  planes: PlanSuscripcion[] = [
    {
      id: "basica",
      nombre: "Básica",
      precio: 4.99,
      beneficios: ["Acceso a contenido exclusivo", "Comentarios prioritarios", "Badge de seguidor"],
    },
    {
      id: "premium",
      nombre: "Premium",
      precio: 9.99,
      popular: true,
      beneficios: [
        "Todo lo de Básica",
        "Chat directo con el artista",
        "Acceso anticipado a nuevas canciones",
        "Descuentos en merchandise",
      ],
    },
    {
      id: "vip",
      nombre: "VIP",
      precio: 19.99,
      beneficios: [
        "Todo lo de Premium",
        "Videollamadas mensuales grupales",
        "Contenido detrás de cámaras",
        "Invitaciones a eventos privados",
        "Merchandise exclusivo gratis",
      ],
    },
  ]

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.paymentForm = this.fb.group({
      cardName: ["", [Validators.required]],
      cardNumber: ["", [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ["", [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ["", [Validators.required, Validators.pattern(/^\d{3}$/)]],
    })
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const artistaId = params["artistaId"]
      // Aquí cargarías los datos del artista desde el servicio
    })
  }

  selectPlan(plan: PlanSuscripcion) {
    this.selectedPlan = plan
  }

  getIconClass(planId: string): string {
    switch (planId) {
      case "basica":
        return "fa-check"
      case "premium":
        return "fa-star"
      case "vip":
        return "fa-crown"
      default:
        return "fa-check"
    }
  }

  onSubmit() {
    if (this.paymentForm.valid && this.selectedPlan) {
      this.loading = true

      // Simular procesamiento de pago
      setTimeout(() => {
        alert(`¡Suscripción ${this.selectedPlan!.nombre} activada exitosamente! 🎉`)
        this.router.navigate(["/dashboard"])
        this.loading = false
      }, 2000)
    }
  }

  goBack() {
    this.router.navigate(["/dashboard"])
  }
}
