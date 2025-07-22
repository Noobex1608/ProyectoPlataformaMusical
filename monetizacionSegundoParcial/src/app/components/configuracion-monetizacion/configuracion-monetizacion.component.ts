import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfiguracionMonetizacionSupabaseService } from '../../services/configuracion-monetizacion-supabase.service';
import { ContextService, MonetizacionContext } from '../../services/context.service';
import { 
  ConfiguracionMonetizacion, 
  MetodoPago, 
  PlantillaConfiguracion,
  ValidacionConfiguracion 
} from '../../models/configuracion-monetizacion.model';

@Component({
  selector: 'app-configuracion-monetizacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="configuracion-monetizacion">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1>Configuración de Monetización</h1>
          <p>Personaliza tu estrategia de monetización y métodos de pago</p>
          
          <div class="header-actions">
            <button class="btn-secondary" (click)="mostrarPlantillas = !mostrarPlantillas">
              📋 Plantillas
            </button>
            <button class="btn-secondary" (click)="exportarConfiguracion()">
              📤 Exportar
            </button>
            <input type="file" #fileInput (change)="importarConfiguracion($event)" 
                   accept=".json" style="display: none;">
            <button class="btn-secondary" (click)="fileInput.click()">
              📥 Importar
            </button>
            <button class="btn-primary" (click)="guardarConfiguracion()" 
                    [disabled]="guardando">
              {{ guardando ? '💾 Guardando...' : '💾 Guardar' }}
            </button>
          </div>
        </div>

        <!-- Barra de completitud -->
        <div class="completitud-bar" *ngIf="validacion">
          <div class="completitud-info">
            <span>Configuración completa: {{ validacion.completitud }}%</span>
            <span class="errores" *ngIf="validacion.errores.length > 0">
              {{ validacion.errores.length }} errores
            </span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="validacion.completitud"></div>
          </div>
        </div>
      </div>

      <!-- Plantillas Modal -->
      <div class="modal-overlay" *ngIf="mostrarPlantillas" (click)="mostrarPlantillas = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Plantillas de Configuración</h3>
            <button class="btn-close" (click)="mostrarPlantillas = false">✕</button>
          </div>
          <div class="plantillas-grid">
            <div *ngFor="let plantilla of plantillas" 
                 class="plantilla-card" 
                 [class.popular]="plantilla.popular"
                 (click)="aplicarPlantilla(plantilla.id)">
              <div class="plantilla-header">
                <h4>{{ plantilla.nombre }}</h4>
                <span class="badge" *ngIf="plantilla.popular">Popular</span>
              </div>
              <p>{{ plantilla.descripcion }}</p>
              <span class="plantilla-tipo">{{ plantilla.tipo | uppercase }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button *ngFor="let tab of tabs" 
                class="tab-btn" 
                [class.active]="tabActivo === tab.id"
                (click)="cambiarTab(tab.id)">
          {{ tab.icon }} {{ tab.nombre }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Precios Tab -->
        <div *ngIf="tabActivo === 'precios'" class="tab-panel">
          <form [formGroup]="formPrecios">
            <div class="section">
              <h3>💳 Membresías</h3>
              
              <div class="membresias-grid">
                <!-- Membresía Básica -->
                <div class="membresia-card">
                  <div class="membresia-header">
                    <h4>Seguidor Básico</h4>
                    <label class="switch">
                      <input type="checkbox" formControlName="basica_activa">
                      <span class="slider"></span>
                    </label>
                  </div>
                  
                  <div class="precio-inputs">
                    <div class="input-group">
                      <label>Precio Mensual ($)</label>
                      <input type="number" formControlName="basica_mensual" 
                             min="0" step="0.01" placeholder="4.99">
                    </div>
                    <div class="input-group">
                      <label>Precio Anual ($)</label>
                      <input type="number" formControlName="basica_anual" 
                             min="0" step="0.01" placeholder="49.99">
                    </div>
                  </div>

                  <div class="beneficios">
                    <label>Beneficios incluidos:</label>
                    <div class="beneficios-list">
                      <label *ngFor="let beneficio of beneficiosDisponibles" class="checkbox-label">
                        <input type="checkbox" [value]="beneficio.id">
                        {{ beneficio.nombre }}
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Membresía Premium -->
                <div class="membresia-card premium">
                  <div class="membresia-header">
                    <h4>Fan Premium</h4>
                    <label class="switch">
                      <input type="checkbox" formControlName="premium_activa">
                      <span class="slider"></span>
                    </label>
                  </div>
                  
                  <div class="precio-inputs">
                    <div class="input-group">
                      <label>Precio Mensual ($)</label>
                      <input type="number" formControlName="premium_mensual" 
                             min="0" step="0.01" placeholder="9.99">
                    </div>
                    <div class="input-group">
                      <label>Precio Anual ($)</label>
                      <input type="number" formControlName="premium_anual" 
                             min="0" step="0.01" placeholder="99.99">
                    </div>
                  </div>
                </div>

                <!-- Membresía VIP -->
                <div class="membresia-card vip">
                  <div class="membresia-header">
                    <h4>VIP Exclusivo</h4>
                    <label class="switch">
                      <input type="checkbox" formControlName="vip_activa">
                      <span class="slider"></span>
                    </label>
                  </div>
                  
                  <div class="precio-inputs">
                    <div class="input-group">
                      <label>Precio Mensual ($)</label>
                      <input type="number" formControlName="vip_mensual" 
                             min="0" step="0.01" placeholder="19.99">
                    </div>
                    <div class="input-group">
                      <label>Precio Anual ($)</label>
                      <input type="number" formControlName="vip_anual" 
                             min="0" step="0.01" placeholder="199.99">
                    </div>
                    <div class="input-group">
                      <label>Límite de Suscriptores</label>
                      <input type="number" formControlName="vip_limite" 
                             min="1" placeholder="100">
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <h4>🎁 Propinas</h4>
                <div class="propinas-config">
                  <div class="input-group">
                    <label>Cantidades Sugeridas ($)</label>
                    <input type="text" formControlName="propinas_sugeridas" 
                           placeholder="1, 5, 10, 25, 50, 100">
                    <small>Separar con comas</small>
                  </div>
                  <div class="input-row">
                    <div class="input-group">
                      <label>Mínima ($)</label>
                      <input type="number" formControlName="propinas_minima" 
                             min="0" step="0.01" placeholder="1">
                    </div>
                    <div class="input-group">
                      <label>Máxima ($)</label>
                      <input type="number" formControlName="propinas_maxima" 
                             min="0" step="0.01" placeholder="500">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Métodos de Pago Tab -->
        <div *ngIf="tabActivo === 'pagos'" class="tab-panel">
          <div class="section">
            <h3>💳 Métodos de Pago</h3>
            
            <div class="metodos-pago-grid">
              <div *ngFor="let metodo of metodosPago" class="metodo-card" [class.activo]="metodo.activo">
                <div class="metodo-header">
                  <div class="metodo-info">
                    <img [src]="getMetodoIcon(metodo.tipo)" [alt]="metodo.nombre" class="metodo-icon">
                    <div>
                      <h4>{{ metodo.nombre }}</h4>
                      <small>{{ metodo.proveedor }}</small>
                    </div>
                  </div>
                  
                  <div class="metodo-actions">
                    <span class="status" [class]="metodo.configurado ? 'configurado' : 'pendiente'">
                      {{ metodo.configurado ? '✅ Configurado' : '⚠️ Pendiente' }}
                    </span>
                    <label class="switch">
                      <input type="checkbox" [(ngModel)]="metodo.activo">
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>

                <div class="metodo-details">
                  <div class="comisiones">
                    <span>{{ metodo.comision_porcentaje }}% + {{ metodo.comision_fija | currency:'USD':'symbol':'1.2-2' }}</span>
                    <small>por transacción</small>
                  </div>
                  
                  <div class="monedas">
                    <small>Monedas: {{ metodo.monedas_soportadas.join(', ') }}</small>
                  </div>

                  <button class="btn-config" (click)="configurarMetodoPago(metodo)" 
                          [disabled]="configurandoMetodo === metodo.id">
                    {{ configurandoMetodo === metodo.id ? 'Configurando...' : 'Configurar' }}
                  </button>
                </div>
              </div>
            </div>

            <div class="agregar-metodo">
              <button class="btn-secondary">➕ Agregar Método de Pago</button>
            </div>
          </div>
        </div>

        <!-- Políticas Tab -->
        <div *ngIf="tabActivo === 'politicas'" class="tab-panel">
          <form [formGroup]="formPoliticas">
            <div class="section">
              <h3>🔄 Política de Reembolsos</h3>
              
              <div class="input-row">
                <div class="input-group">
                  <label>Período de Reembolso (días)</label>
                  <input type="number" formControlName="reembolso_dias" min="0" max="365">
                </div>
                <div class="input-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="proceso_automatico">
                    Proceso Automático
                  </label>
                </div>
              </div>

              <div class="input-group">
                <label>Política de Reembolsos (Texto)</label>
                <textarea formControlName="politica_reembolsos" rows="3" 
                          placeholder="Describe tu política de reembolsos..."></textarea>
              </div>
            </div>

            <div class="section">
              <h3>🔄 Suscripciones</h3>
              
              <div class="input-row">
                <div class="input-group">
                  <label>Período de Gracia (días)</label>
                  <input type="number" formControlName="periodo_gracia" min="0" max="30">
                </div>
                <div class="checkboxes-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="cancelacion_inmediata">
                    Cancelación Inmediata
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="renovacion_automatica">
                    Renovación Automática
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="notificar_vencimiento">
                    Notificar Vencimientos
                  </label>
                </div>
              </div>
            </div>

            <div class="section">
              <h3>📄 Contenido</h3>
              
              <div class="checkboxes-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="acceso_perpetuo">
                  Acceso Perpetuo al Contenido
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="descarga_permitida">
                  Permitir Descargas
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="drm_habilitado">
                  Protección DRM
                </label>
              </div>

              <div class="input-group">
                <label>Límite de Dispositivos</label>
                <input type="number" formControlName="limite_dispositivos" min="1" max="10">
              </div>
            </div>
          </form>
        </div>

        <!-- Configuración Avanzada Tab -->
        <div *ngIf="tabActivo === 'avanzada'" class="tab-panel">
          <form [formGroup]="formAvanzada">
            <div class="section">
              <h3>🔔 Notificaciones</h3>
              
              <div class="input-group">
                <label>Email de Notificaciones</label>
                <input type="email" formControlName="email_notificaciones" 
                       placeholder="artista@example.com">
              </div>

              <div class="checkboxes-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="notif_suscripciones">
                  Nuevas Suscripciones
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="notif_pagos">
                  Pagos Recibidos
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="notif_cancelaciones">
                  Cancelaciones
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="notif_problemas">
                  Problemas de Pago
                </label>
              </div>
            </div>

            <div class="section">
              <h3>📊 Analytics</h3>
              
              <div class="checkboxes-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="tracking_habilitado">
                  Habilitar Tracking
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="metricas_publicas">
                  Métricas Públicas
                </label>
              </div>
            </div>

            <div class="section">
              <h3>🔗 Integraciones</h3>
              
              <div class="integraciones-grid">
                <div class="integracion-card">
                  <div class="integracion-header">
                    <h4>📧 Mailchimp</h4>
                    <span class="status">No configurado</span>
                  </div>
                  <p>Sincroniza tus suscriptores con Mailchimp</p>
                  <button class="btn-config" (click)="probarIntegracion('mailchimp')">
                    Configurar
                  </button>
                </div>

                <div class="integracion-card">
                  <div class="integracion-header">
                    <h4>💬 Discord</h4>
                    <span class="status">No configurado</span>
                  </div>
                  <p>Gestiona roles automáticamente en Discord</p>
                  <button class="btn-config" (click)="probarIntegracion('discord')">
                    Configurar
                  </button>
                </div>

                <div class="integracion-card">
                  <div class="integracion-header">
                    <h4>🎵 Spotify</h4>
                    <span class="status">No configurado</span>
                  </div>
                  <p>Conecta con tu perfil de artista en Spotify</p>
                  <button class="btn-config" (click)="probarIntegracion('spotify')">
                    Configurar
                  </button>
                </div>
              </div>
            </div>

            <div class="section">
              <h3>🔒 Seguridad</h3>
              
              <div class="checkboxes-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="autenticacion_2fa">
                  Autenticación de Dos Factores
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="cifrado_datos">
                  Cifrado de Datos
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="backup_automatico">
                  Backup Automático
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="auditoria_accesos">
                  Auditoría de Accesos
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Estado de guardado -->
      <div class="estado-guardado" *ngIf="estadoGuardado" [class]="estadoGuardado.tipo">
        {{ estadoGuardado.mensaje }}
      </div>
    </div>
  `,
  styles: [`
    .configuracion-monetizacion {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f8f9fa;
      min-height: 100vh;
    }

    .header {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .header h1 {
      font-size: 28px;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }

    .header p {
      color: #666;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
    }

    .btn-secondary:hover {
      background: #e9ecef;
    }

    .completitud-bar {
      margin-top: 20px;
    }

    .completitud-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .errores {
      color: #dc3545;
      font-weight: 500;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #20c997);
      transition: width 0.3s;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 800px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }

    .plantillas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .plantilla-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .plantilla-card:hover {
      border-color: #007bff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,123,255,0.15);
    }

    .plantilla-card.popular {
      border-color: #28a745;
    }

    .plantilla-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .badge {
      background: #28a745;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .plantilla-tipo {
      background: #f8f9fa;
      color: #495057;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      display: inline-block;
      margin-top: 8px;
    }

    .tabs-nav {
      display: flex;
      background: white;
      border-radius: 12px 12px 0 0;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-btn {
      flex: 1;
      padding: 16px 20px;
      border: none;
      background: white;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
      border-bottom: 3px solid transparent;
    }

    .tab-btn:hover {
      background: #f8f9fa;
    }

    .tab-btn.active {
      background: #007bff;
      color: white;
      border-bottom-color: #0056b3;
    }

    .tab-content {
      background: white;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .tab-panel {
      padding: 24px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section h3, .section h4 {
      color: #1a1a1a;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .membresias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .membresia-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      background: white;
    }

    .membresia-card.premium {
      border-color: #007bff;
      background: linear-gradient(135deg, #f8f9ff, #ffffff);
    }

    .membresia-card.vip {
      border-color: #ffc107;
      background: linear-gradient(135deg, #fffdf0, #ffffff);
    }

    .membresia-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .membresia-header h4 {
      margin: 0;
      color: #1a1a1a;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #007bff;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    .precio-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }

    .input-group {
      margin-bottom: 16px;
    }

    .input-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: #495057;
    }

    .input-group input, .input-group textarea, .input-group select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-size: 14px;
    }

    .input-group input:focus, .input-group textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
    }

    .input-group small {
      color: #6c757d;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }

    .input-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: end;
    }

    .beneficios-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
      margin-top: 8px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    .checkboxes-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .propinas-config {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }

    .metodos-pago-grid {
      display: grid;
      gap: 16px;
      margin-bottom: 20px;
    }

    .metodo-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 16px;
      background: white;
      transition: all 0.3s;
    }

    .metodo-card.activo {
      border-color: #28a745;
      background: linear-gradient(135deg, #f0fff4, #ffffff);
    }

    .metodo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .metodo-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .metodo-icon {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .metodo-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status.configurado {
      background: #d4edda;
      color: #155724;
    }

    .status.pendiente {
      background: #fff3cd;
      color: #856404;
    }

    .metodo-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .comisiones {
      font-weight: 500;
      color: #495057;
    }

    .comisiones small {
      display: block;
      color: #6c757d;
      font-weight: normal;
    }

    .btn-config {
      background: #007bff;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .btn-config:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-config:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .agregar-metodo {
      text-align: center;
      padding: 20px;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
    }

    .integraciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .integracion-card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 16px;
      background: white;
    }

    .integracion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .integracion-header h4 {
      margin: 0;
      font-size: 16px;
    }

    .estado-guardado {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
      z-index: 1000;
    }

    .estado-guardado.exito {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .estado-guardado.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @media (max-width: 768px) {
      .configuracion-monetizacion {
        padding: 12px;
      }
      
      .header-content {
        flex-direction: column;
        gap: 16px;
      }
      
      .header-actions {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .tabs-nav {
        flex-direction: column;
      }
      
      .membresias-grid {
        grid-template-columns: 1fr;
      }
      
      .input-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ConfiguracionMonetizacionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  configuracion: ConfiguracionMonetizacion | null = null;
  plantillas: PlantillaConfiguracion[] = [];
  validacion: ValidacionConfiguracion | null = null;
  
  // UI State
  tabActivo = 'precios';
  mostrarPlantillas = false;
  guardando = false;
  configurandoMetodo: string | null = null;
  estadoGuardado: { tipo: string; mensaje: string } | null = null;
  
  // Formularios
  formPrecios!: FormGroup;
  formPoliticas!: FormGroup;
  formAvanzada!: FormGroup;
  
  // Datos auxiliares
  tabs = [
    { id: 'precios', nombre: 'Precios', icon: '💰' },
    { id: 'pagos', nombre: 'Métodos de Pago', icon: '💳' },
    { id: 'politicas', nombre: 'Políticas', icon: '📋' },
    { id: 'avanzada', nombre: 'Avanzada', icon: '⚙️' }
  ];
  
  beneficiosDisponibles = [
    { id: 'contenido_exclusivo', nombre: 'Contenido Exclusivo' },
    { id: 'sin_anuncios', nombre: 'Sin Anuncios' },
    { id: 'chat_directo', nombre: 'Chat Directo' },
    { id: 'acceso_anticipado', nombre: 'Acceso Anticipado' },
    { id: 'descargas', nombre: 'Descargas' },
    { id: 'video_llamadas', nombre: 'Video Llamadas' }
  ];
  
  metodosPago: MetodoPago[] = [];
  context: MonetizacionContext | null = null;

  constructor(
    private fb: FormBuilder,
    private configuracionService: ConfiguracionMonetizacionSupabaseService,
    private contextService: ContextService
  ) {
    this.initForms();
  }

  ngOnInit() {
    // Suscribirse al contexto
    this.contextService.context$.subscribe({
      next: (context: MonetizacionContext | null) => {
        this.context = context;
        console.log('✅ Contexto cargado en configuración:', context);
        if (context?.artistaId) {
          this.cargarConfiguracion();
          this.cargarPlantillas();
        }
      },
      error: (error: any) => {
        console.error('❌ Error obteniendo contexto:', error);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms() {
    this.formPrecios = this.fb.group({
      basica_activa: [true],
      basica_mensual: [4.99, [Validators.required, Validators.min(0)]],
      basica_anual: [49.99, [Validators.required, Validators.min(0)]],
      premium_activa: [true],
      premium_mensual: [9.99, [Validators.required, Validators.min(0)]],
      premium_anual: [99.99, [Validators.required, Validators.min(0)]],
      vip_activa: [true],
      vip_mensual: [19.99, [Validators.required, Validators.min(0)]],
      vip_anual: [199.99, [Validators.required, Validators.min(0)]],
      vip_limite: [100, [Validators.min(1)]],
      propinas_sugeridas: ['1, 5, 10, 25, 50, 100'],
      propinas_minima: [1, [Validators.min(0)]],
      propinas_maxima: [500, [Validators.min(0)]]
    });

    this.formPoliticas = this.fb.group({
      reembolso_dias: [14, [Validators.required, Validators.min(0)]],
      proceso_automatico: [false],
      politica_reembolsos: [''],
      periodo_gracia: [3, [Validators.min(0)]],
      cancelacion_inmediata: [true],
      renovacion_automatica: [true],
      notificar_vencimiento: [true],
      acceso_perpetuo: [true],
      descarga_permitida: [true],
      limite_dispositivos: [3, [Validators.min(1)]],
      drm_habilitado: [false]
    });

    this.formAvanzada = this.fb.group({
      email_notificaciones: ['', [Validators.email]],
      notif_suscripciones: [true],
      notif_pagos: [true],
      notif_cancelaciones: [true],
      notif_problemas: [true],
      tracking_habilitado: [true],
      metricas_publicas: [false],
      autenticacion_2fa: [false],
      cifrado_datos: [true],
      backup_automatico: [true],
      auditoria_accesos: [false]
    });
  }

  private cargarConfiguracion() {
    if (!this.context?.artistaId) {
      console.error('❌ No hay artistaId disponible para cargar configuración');
      return;
    }

    this.configuracionService.obtenerConfiguracion(this.context.artistaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (configuracion: ConfiguracionMonetizacion) => {
          this.configuracion = configuracion;
          this.metodosPago = configuracion.metodos_pago;
          this.poblarFormularios(configuracion);
          this.validarConfiguracion();
        },
        error: (error: any) => {
          console.error('Error cargando configuración:', error);
          this.mostrarEstado('error', 'Error cargando la configuración');
        }
      });
  }

  private cargarPlantillas() {
    this.configuracionService.obtenerPlantillas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (plantillas: PlantillaConfiguracion[]) => {
          this.plantillas = plantillas;
        },
        error: (error: any) => {
          console.error('Error cargando plantillas:', error);
        }
      });
  }

  private poblarFormularios(configuracion: ConfiguracionMonetizacion) {
    // Poblar formulario de precios
    const precios = configuracion.configuracion_precios;
    this.formPrecios.patchValue({
      basica_activa: precios.membresias.basica.activa,
      basica_mensual: precios.membresias.basica.precio_mensual,
      basica_anual: precios.membresias.basica.precio_anual,
      premium_activa: precios.membresias.premium.activa,
      premium_mensual: precios.membresias.premium.precio_mensual,
      premium_anual: precios.membresias.premium.precio_anual,
      vip_activa: precios.membresias.vip.activa,
      vip_mensual: precios.membresias.vip.precio_mensual,
      vip_anual: precios.membresias.vip.precio_anual,
      vip_limite: precios.membresias.vip.limite_suscriptores,
      propinas_sugeridas: precios.propinas.sugeridas.join(', '),
      propinas_minima: precios.propinas.minima,
      propinas_maxima: precios.propinas.maxima
    });

    // Poblar formulario de políticas
    this.formPoliticas.patchValue({
      reembolso_dias: configuracion.politicas.reembolsos.periodo_dias,
      proceso_automatico: configuracion.politicas.reembolsos.proceso_automatico,
      politica_reembolsos: configuracion.politicas.reembolsos.politica_texto,
      periodo_gracia: configuracion.politicas.suscripciones.periodo_gracia_dias,
      cancelacion_inmediata: configuracion.politicas.suscripciones.cancelacion_inmediata,
      renovacion_automatica: configuracion.politicas.suscripciones.renovacion_automatica,
      notificar_vencimiento: configuracion.politicas.suscripciones.notificaciones_vencimiento,
      acceso_perpetuo: configuracion.politicas.contenido.acceso_perpetuo,
      descarga_permitida: configuracion.politicas.contenido.descarga_permitida,
      limite_dispositivos: configuracion.politicas.contenido.limite_dispositivos,
      drm_habilitado: configuracion.politicas.contenido.drm_habilitado
    });

    // Poblar formulario avanzado
    this.formAvanzada.patchValue({
      email_notificaciones: configuracion.configuracion_avanzada.notificaciones.email_notificaciones,
      notif_suscripciones: configuracion.configuracion_avanzada.notificaciones.nuevas_suscripciones,
      notif_pagos: configuracion.configuracion_avanzada.notificaciones.pagos_recibidos,
      notif_cancelaciones: configuracion.configuracion_avanzada.notificaciones.cancelaciones,
      notif_problemas: configuracion.configuracion_avanzada.notificaciones.problemas_pago,
      tracking_habilitado: configuracion.configuracion_avanzada.analytics.tracking_habilitado,
      metricas_publicas: configuracion.configuracion_avanzada.analytics.metricas_publicas,
      autenticacion_2fa: configuracion.configuracion_avanzada.seguridad.autenticacion_dos_factores,
      cifrado_datos: configuracion.configuracion_avanzada.seguridad.cifrado_datos,
      backup_automatico: configuracion.configuracion_avanzada.seguridad.backup_automatico,
      auditoria_accesos: configuracion.configuracion_avanzada.seguridad.auditoria_accesos
    });
  }

  cambiarTab(tabId: string) {
    this.tabActivo = tabId;
  }

  aplicarPlantilla(plantillaId: string) {
    if (!this.context?.artistaId) {
      console.error('❌ No hay artistaId disponible para aplicar plantilla');
      return;
    }

    this.configuracionService.aplicarPlantilla(this.context.artistaId, plantillaId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (configuracion: ConfiguracionMonetizacion) => {
          this.configuracion = configuracion;
          this.poblarFormularios(configuracion);
          this.mostrarPlantillas = false;
          this.mostrarEstado('exito', 'Plantilla aplicada correctamente');
          this.validarConfiguracion();
        },
        error: (error: any) => {
          console.error('Error aplicando plantilla:', error);
          this.mostrarEstado('error', 'Error aplicando la plantilla');
        }
      });
  }

  guardarConfiguracion() {
    if (!this.configuracion) return;

    this.guardando = true;
    
    // Actualizar configuración con datos de los formularios
    this.actualizarConfiguracionConFormularios();

    this.configuracionService.guardarConfiguracion(this.configuracion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (configuracion: ConfiguracionMonetizacion) => {
          this.configuracion = configuracion;
          this.guardando = false;
          this.mostrarEstado('exito', 'Configuración guardada correctamente');
          this.validarConfiguracion();
        },
        error: (error: any) => {
          console.error('Error guardando configuración:', error);
          this.guardando = false;
          this.mostrarEstado('error', 'Error guardando la configuración');
        }
      });
  }

  private actualizarConfiguracionConFormularios() {
    if (!this.configuracion) return;

    // Actualizar precios
    const preciosValues = this.formPrecios.value;
    this.configuracion.configuracion_precios.membresias.basica = {
      ...this.configuracion.configuracion_precios.membresias.basica,
      activa: preciosValues.basica_activa,
      precio_mensual: preciosValues.basica_mensual,
      precio_anual: preciosValues.basica_anual
    };

    this.configuracion.configuracion_precios.membresias.premium = {
      ...this.configuracion.configuracion_precios.membresias.premium,
      activa: preciosValues.premium_activa,
      precio_mensual: preciosValues.premium_mensual,
      precio_anual: preciosValues.premium_anual
    };

    this.configuracion.configuracion_precios.membresias.vip = {
      ...this.configuracion.configuracion_precios.membresias.vip,
      activa: preciosValues.vip_activa,
      precio_mensual: preciosValues.vip_mensual,
      precio_anual: preciosValues.vip_anual,
      limite_suscriptores: preciosValues.vip_limite
    };

    this.configuracion.configuracion_precios.propinas = {
      ...this.configuracion.configuracion_precios.propinas,
      sugeridas: preciosValues.propinas_sugeridas.split(',').map((p: string) => parseFloat(p.trim())),
      minima: preciosValues.propinas_minima,
      maxima: preciosValues.propinas_maxima
    };

    // Actualizar políticas
    const politicasValues = this.formPoliticas.value;
    this.configuracion.politicas.reembolsos = {
      ...this.configuracion.politicas.reembolsos,
      periodo_dias: politicasValues.reembolso_dias,
      proceso_automatico: politicasValues.proceso_automatico,
      politica_texto: politicasValues.politica_reembolsos
    };

    // Actualizar configuración avanzada
    const avanzadaValues = this.formAvanzada.value;
    this.configuracion.configuracion_avanzada.notificaciones = {
      ...this.configuracion.configuracion_avanzada.notificaciones,
      email_notificaciones: avanzadaValues.email_notificaciones,
      nuevas_suscripciones: avanzadaValues.notif_suscripciones,
      pagos_recibidos: avanzadaValues.notif_pagos,
      cancelaciones: avanzadaValues.notif_cancelaciones,
      problemas_pago: avanzadaValues.notif_problemas
    };
  }

  configurarMetodoPago(metodo: MetodoPago) {
    this.configurandoMetodo = metodo.id;
    
    this.configuracionService.configurarMetodoPago(metodo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (exito: boolean) => {
          if (exito) {
            metodo.configurado = true;
            metodo.fecha_configuracion = new Date().toISOString();
            this.mostrarEstado('exito', `${metodo.nombre} configurado correctamente`);
          }
          this.configurandoMetodo = null;
        },
        error: (error: any) => {
          console.error('Error configurando método de pago:', error);
          this.configurandoMetodo = null;
          this.mostrarEstado('error', `Error configurando ${metodo.nombre}`);
        }
      });
  }

  probarIntegracion(tipo: string) {
    this.configuracionService.probarIntegracion(tipo, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: { exito: boolean; mensaje: string }) => {
          this.mostrarEstado(
            resultado.exito ? 'exito' : 'error', 
            resultado.mensaje
          );
        },
        error: (error: any) => {
          console.error('Error probando integración:', error);
          this.mostrarEstado('error', 'Error probando la integración');
        }
      });
  }

  exportarConfiguracion() {
    if (this.configuracion) {
      // TODO: Implementar exportación en servicio Supabase
      console.log('Exportar configuración:', this.configuracion);
      // this.configuracionService.exportarConfiguracion(this.configuracion);
      this.mostrarEstado('exito', 'Configuración exportada correctamente');
    }
  }

  importarConfiguracion(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    // TODO: Implementar importación en servicio Supabase
    console.log('Importar configuración desde archivo:', archivo);
    /*
    this.configuracionService.importarConfiguracion(archivo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (configuracion: ConfiguracionMonetizacion) => {
          this.configuracion = configuracion;
          this.poblarFormularios(configuracion);
          this.mostrarEstado('exito', 'Configuración importada correctamente');
          this.validarConfiguracion();
        },
        error: (error: any) => {
          console.error('Error importando configuración:', error);
          this.mostrarEstado('error', 'Error importando la configuración');
        }
      });
    */

    // Limpiar el input
    event.target.value = '';
  }

  private validarConfiguracion() {
    if (this.configuracion) {
      this.configuracionService.validarConfiguracion(this.configuracion)
        .pipe(takeUntil(this.destroy$))
        .subscribe(validacion => {
          this.validacion = validacion;
        });
    }
  }

  private mostrarEstado(tipo: string, mensaje: string) {
    this.estadoGuardado = { tipo, mensaje };
    setTimeout(() => {
      this.estadoGuardado = null;
    }, 3000);
  }

  getFormControl(form: FormGroup, controlName: string): FormControl {
    return form.get(controlName) as FormControl;
  }

  getMetodoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'tarjeta_credito': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwN2JmZiIvPgo8L3N2Zz4K',
      'paypal': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwMzA4NyIvPgo8L3N2Zz4K',
      'criptomoneda': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI0YzODQxOSIvPgo8L3N2Zz4K'
    };
    return iconos[tipo] || iconos['tarjeta_credito'];
  }
}
