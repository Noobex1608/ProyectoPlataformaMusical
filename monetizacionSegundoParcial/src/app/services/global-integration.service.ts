// src/app/services/global-integration.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ArtistaIntegrationService } from './artista-integration.service';
import { PropinaService } from './propina.service';
import { SuscripcionService } from './suscripcion.service';
import { MembresiaService } from './membresia.service';

export interface MonetizacionAPI {
    // Para ArtistaSegundoParcial
    artista: {
        marcarContenidoExclusivo: (contenido: any) => Promise<any>;
        obtenerDashboardIngresos: (artistaId: string) => Promise<any>;
        obtenerContenidoExclusivo: (artistaId: string) => Promise<any>;
        actualizarNivelAcceso: (contenidoId: number, nivel: number) => Promise<any>;
        crearTipoContenidoPremium: (artistaId: string, tipo: any) => Promise<any>;
        obtenerEstadisticasEngagement: (artistaId: string) => Promise<any>;
        redirigirADashboard: (artistaId: string) => void;
    };
    
    // Para ComunidadSegundoParcial
    comunidad: {
        verificarMembresia: (usuarioId: string, artistaId: string) => Promise<any>;
        verificarAccesoContenido: (usuarioId: string, contenidoId: number) => Promise<boolean>;
        obtenerBadgeUsuario: (usuarioId: string) => Promise<string>;
        mostrarBotonPropina: (artistaId: string, artistaNombre: string) => void;
    };
    
    // Utilidades generales
    utils: {
        abrirMonetizacion: (ruta?: string) => void;
        verificarSuscripcionActiva: (usuarioId: string, artistaId: string) => Promise<any>;
    };
}

@Injectable({ providedIn: 'root' })
export class GlobalIntegrationService {

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private artistaService: ArtistaIntegrationService,
        private propinaService: PropinaService,
        private suscripcionService: SuscripcionService,
        private membresiaService: MembresiaService
    ) {
        this.initializeGlobalAPI();
    }

    private initializeGlobalAPI(): void {
        if (isPlatformBrowser(this.platformId)) {
            // Crear API global para monetización
            (window as any).monetizacionAPI = this.createMonetizacionAPI();
            
            // Event listener para comunicación entre microfrontends
            window.addEventListener('monetizacion:request', this.handleMonetizacionRequest.bind(this) as EventListener);
            
            console.log('🎵 MonetizacionAPI inicializada y disponible globalmente');
        }
    }

    private createMonetizacionAPI(): MonetizacionAPI {
        return {
            artista: {
                marcarContenidoExclusivo: async (contenido: any) => {
                    return this.artistaService.marcarContenidoExclusivo(contenido).toPromise();
                },
                
                obtenerDashboardIngresos: async (artistaId: string) => {
                    return this.artistaService.obtenerDashboardIngresos(artistaId).toPromise();
                },
                
                obtenerContenidoExclusivo: async (artistaId: string) => {
                    return this.artistaService.obtenerContenidoExclusivoArtista(artistaId).toPromise();
                },
                
                actualizarNivelAcceso: async (contenidoId: number, nivel: number) => {
                    return this.artistaService.actualizarNivelAcceso(contenidoId, nivel).toPromise();
                },
                
                crearTipoContenidoPremium: async (artistaId: string, tipo: any) => {
                    return this.artistaService.crearTipoContenidoPremium(artistaId, tipo).toPromise();
                },
                
                obtenerEstadisticasEngagement: async (artistaId: string) => {
                    return this.artistaService.obtenerEstadisticasEngagement(artistaId).toPromise();
                },
                
                redirigirADashboard: (artistaId: string) => {
                    const baseUrl = window.location.origin;
                    const monetizacionUrl = `${baseUrl}/monetizacionSegundoParcial/artista-dashboard/${artistaId}`;
                    window.open(monetizacionUrl, '_blank');
                }
            },
            
            comunidad: {
                verificarMembresia: async (usuarioId: string, artistaId: string) => {
                    return this.suscripcionService.verificarSuscripcionActiva(usuarioId, artistaId).toPromise();
                },
                
                verificarAccesoContenido: async (usuarioId: string, contenidoId: number): Promise<boolean> => {
                    // Implementar verificación de acceso a contenido específico
                    const suscripciones = await this.suscripcionService.obtenerSuscripcionesUsuario(usuarioId).toPromise();
                    return !!(suscripciones && suscripciones.length > 0);
                },
                
                obtenerBadgeUsuario: async (usuarioId: string) => {
                    const suscripciones = await this.suscripcionService.obtenerSuscripcionesUsuario(usuarioId).toPromise();
                    if (suscripciones && suscripciones.length >= 3) return '🌟 VIP';
                    if (suscripciones && suscripciones.length >= 2) return '💎 Premium';
                    if (suscripciones && suscripciones.length >= 1) return '⭐ Fan';
                    return '';
                },
                
                mostrarBotonPropina: (artistaId: string, artistaNombre: string) => {
                    this.crearWidgetPropina(artistaId, artistaNombre);
                }
            },
            
            utils: {
                abrirMonetizacion: (ruta: string = 'monetizacion') => {
                    const baseUrl = window.location.origin;
                    const monetizacionUrl = `${baseUrl}/monetizacionSegundoParcial/${ruta}`;
                    window.location.href = monetizacionUrl;
                },
                
                verificarSuscripcionActiva: async (usuarioId: string, artistaId: string) => {
                    return this.suscripcionService.verificarSuscripcionActiva(usuarioId, artistaId).toPromise();
                }
            }
        };
    }

    private handleMonetizacionRequest(event: Event): void {
        const customEvent = event as CustomEvent;
        const { type, data, callback } = customEvent.detail;
        
        switch (type) {
            case 'verificar-membresia':
                this.suscripcionService.verificarSuscripcionActiva(data.usuarioId, data.artistaId)
                    .subscribe(result => callback(result));
                break;
                
            case 'obtener-dashboard':
                this.artistaService.obtenerDashboardIngresos(data.artistaId)
                    .subscribe(result => callback(result));
                break;
                
            case 'marcar-contenido-exclusivo':
                this.artistaService.marcarContenidoExclusivo(data.contenido)
                    .subscribe(result => callback(result));
                break;
        }
    }

    private crearWidgetPropina(artistaId: string, artistaNombre: string): void {
        // Crear widget dinámico de propinas para insertar en otros microfrontends
        const widget = document.createElement('div');
        widget.innerHTML = `
            <div id="tip-widget-${artistaId}" style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                font-family: Arial, sans-serif;
                font-weight: 600;
            ">
                💸 Enviar Propina a ${artistaNombre}
            </div>
        `;
        
        widget.addEventListener('click', () => {
            this.abrirModalPropina(artistaId, artistaNombre);
        });
        
        document.body.appendChild(widget);
    }

    private abrirModalPropina(artistaId: string, artistaNombre: string): void {
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    min-width: 400px;
                    max-width: 500px;
                ">
                    <h3 style="margin-bottom: 20px; color: #333;">Enviar propina a ${artistaNombre}</h3>
                    <input type="number" id="monto-propina" placeholder="Monto en USD" min="1" style="
                        width: 100%;
                        padding: 10px;
                        margin-bottom: 15px;
                        border: 2px solid #e1e5e9;
                        border-radius: 6px;
                    ">
                    <textarea id="mensaje-propina" placeholder="Mensaje opcional" style="
                        width: 100%;
                        padding: 10px;
                        margin-bottom: 20px;
                        border: 2px solid #e1e5e9;
                        border-radius: 6px;
                        min-height: 80px;
                    "></textarea>
                    <div style="display: flex; gap: 10px;">
                        <button id="enviar-propina" style="
                            flex: 1;
                            padding: 12px;
                            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">Enviar Propina</button>
                        <button id="cancelar-propina" style="
                            flex: 1;
                            padding: 12px;
                            background: #ccc;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                        ">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#enviar-propina')?.addEventListener('click', () => {
            const monto = (modal.querySelector('#monto-propina') as HTMLInputElement).value;
            const mensaje = (modal.querySelector('#mensaje-propina') as HTMLTextAreaElement).value;
            
            if (monto && parseFloat(monto) > 0) {
                this.enviarPropina(artistaId, parseFloat(monto), mensaje);
                document.body.removeChild(modal);
            }
        });
        
        modal.querySelector('#cancelar-propina')?.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    private enviarPropina(artistaId: string, monto: number, mensaje: string): void {
        const propina = {
            artista_id: artistaId,
            fan_id: 'usuario-actual', // Se obtendría del contexto de autenticación
            nombre_fan: 'Usuario', // Se obtendría del contexto
            cantidad: monto,
            monto: monto,
            mensaje: mensaje,
            metodo_pago: 'tarjeta',
            publico_en_feed: true
        };

        this.propinaService.enviarPropina(propina).subscribe({
            next: () => {
                alert('¡Propina enviada exitosamente! 🎉');
                // Disparar evento para notificar a otros microfrontends
                window.dispatchEvent(new CustomEvent('propina:enviada', {
                    detail: { artistaId, monto, mensaje }
                }));
            },
            error: (error) => {
                console.error('Error al enviar propina:', error);
                alert('Error al enviar la propina. Inténtalo de nuevo.');
            }
        });
    }

    // Método para que ArtistaSegundoParcial obtenga la URL del dashboard
    obtenerUrlDashboardArtista(artistaId: string): string {
        const baseUrl = window.location.origin;
        return `${baseUrl}/monetizacionSegundoParcial/artista-dashboard/${artistaId}`;
    }

    // Método para verificar si el usuario tiene permisos de artista
    verificarPermisosArtista(usuarioId: string): Promise<boolean> {
        // Implementar verificación de permisos
        // Por ahora retorna true para desarrollo
        return Promise.resolve(true);
    }
}
