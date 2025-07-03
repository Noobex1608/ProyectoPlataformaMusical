declare global {
  interface Window {
    singleSpaNavigate?: (url: string) => void;
    singleSpaUnmount?: boolean;
  }
}

// Declaraciones para Single SPA
declare module 'single-spa' {
  export interface AppProps {
    name: string;
    singleSpa: any;
    mountParcel: any;
  }
}

export {};
