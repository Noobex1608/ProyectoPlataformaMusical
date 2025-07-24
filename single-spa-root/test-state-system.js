// test-state-system.js
/**
 * Script simple para probar el nuevo sistema de estado
 * Ejecutar en la consola del navegador cuando el shell esté cargado
 */

function testStateSystem() {
  console.log('🧪 Probando el nuevo sistema de estado...');
  
  try {
    // Verificar que los servicios estén disponibles
    if (!window.shellServices) {
      throw new Error('shellServices no está disponible');
    }
    
    if (!window.shellServices.stateManager) {
      throw new Error('stateManager no está disponible');
    }
    
    const stateManager = window.shellServices.stateManager;
    
    // Test 1: Obtener estado inicial
    console.log('📊 Estado inicial:', stateManager.getState());
    
    // Test 2: Actualizar tema
    console.log('🎨 Cambiando tema a dark...');
    stateManager.setTheme('dark');
    
    // Test 3: Agregar notificación
    console.log('🔔 Agregando notificación de prueba...');
    stateManager.addNotification({
      type: 'success',
      title: 'Test completado',
      message: 'El sistema de estado funciona correctamente!'
    });
    
    // Test 4: Suscribirse a cambios
    console.log('👂 Suscribiéndose a cambios de UI...');
    const unsubscribe = stateManager.subscribe('ui', (newUI, oldUI) => {
      console.log('UI cambió:', { old: oldUI, new: newUI });
    });
    
    // Test 5: Probar login de prueba
    console.log('🔐 Probando login...');
    stateManager.login(
      { name: 'Usuario Test', type: 'artist' }, 
      'test-token-123'
    );
    
    // Test 6: Verificar persistencia
    console.log('💾 Verificando persistencia...');
    const persistedAuth = localStorage.getItem('plataforma_v2_auth_state');
    console.log('Auth persistido:', persistedAuth);
    
    // Limpiar suscripción
    setTimeout(() => {
      unsubscribe();
      console.log('✅ Test completado exitosamente!');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Exportar función para uso en consola
window.testStateSystem = testStateSystem;

console.log('🧪 Test del sistema de estado cargado. Ejecuta testStateSystem() en la consola.');
