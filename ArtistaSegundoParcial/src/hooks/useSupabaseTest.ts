// Hook de testing de Supabase - DESACTIVADO
// Este archivo se mantiene para referencia histórica pero no se usa en producción

// Exportación vacía para mantener compatibilidad y evitar warnings
export const useSupabaseTest = () => {
  return {
    testState: {
      connecting: false,
      connected: false,
      uploading: false,
      uploadResult: null,
      error: null
    },
    testConnection: async () => false,
    testImageUpload: async (): Promise<string> => '',
    testDataInsert: async () => false
  };
};
