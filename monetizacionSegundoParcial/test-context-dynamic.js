// Script de prueba para contexto dinámico
// Ejecutar en la consola del navegador

console.log('🧪 Iniciando pruebas de contexto dinámico...');

// Función para simular navegación desde diferentes secciones
function testSectionDetection() {
  console.log('\n=== PRUEBAS DE DETECCIÓN DINÁMICA ===');
  
  // Test 1: Simular URL con sección
  const originalUrl = window.location.href;
  console.log('🔗 URL original:', originalUrl);
  
  // Test 2: Simular mensaje del padre
  window.postMessage({
    type: 'MONETIZACION_SECTION_CHANGE',
    section: 'gestion-fanaticos'
  }, '*');
  
  setTimeout(() => {
    // Verificar contexto actual
    const contextService = window.monetizacionContext;
    if (contextService && contextService.getCurrentContext) {
      const context = contextService.getCurrentContext();
      console.log('📊 Contexto actual:', context);
      console.log('🎯 Sección detectada:', context.section);
    } else {
      console.error('❌ Servicio de contexto no disponible');
    }
  }, 1000);
}

// Test 3: Simular diferentes secciones
function testDifferentSections() {
  const sections = ['dashboard', 'contenido-exclusivo', 'gestion-fanaticos', 'reportes', 'configuracion'];
  
  sections.forEach((section, index) => {
    setTimeout(() => {
      console.log(`🧪 Probando sección: ${section}`);
      
      // Crear URL de prueba con sección
      const testUrl = new URL(window.location);
      testUrl.searchParams.set('section', section);
      
      console.log(`🔗 URL de prueba: ${testUrl.toString()}`);
      
      // Simular mensaje del padre
      window.postMessage({
        type: 'MONETIZACION_SECTION_CHANGE',
        section: section
      }, '*');
      
    }, index * 2000);
  });
}

// Ejecutar pruebas
testSectionDetection();

// Ejecutar después de 3 segundos
setTimeout(testDifferentSections, 3000);

console.log('✅ Script de prueba cargado. Las pruebas se ejecutarán automáticamente.');
console.log('📋 Funciones disponibles: testSectionDetection(), testDifferentSections()');
