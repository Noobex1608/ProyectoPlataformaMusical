// Declaraciones globales para funciones de navegación entre microfrontends
declare global {
  interface Window {
    navigateToArtista?: () => void;
    navigateToArtistaV2?: () => void;
    navigateToMonetizacion?: () => void;
    navigateToMonetizacionV2?: () => void;
    navigateToComunidad?: () => void;
    navigateToHome?: () => void;
    navigateToSPA?: (path: string) => void;
  }
}

export {};
