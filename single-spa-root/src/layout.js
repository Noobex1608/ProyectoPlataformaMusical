// === LAYOUT PRINCIPAL DEL SHELL ===
import authService from './auth.js';
import globalState from './globalState.js';

export class ShellLayout {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.currentTheme = 'default';
    
    this.initialize();
  }

  initialize() {
    if (this.isInitialized) return;
    
    console.log('🏗️ Inicializando Shell Layout...');
    
    // Crear estructura de layout
    this.createLayoutStructure();
    
    // Configurar listeners
    this.setupEventListeners();
    
    // Suscribirse a cambios de estado
    this.subscribeToStateChanges();
    
    this.isInitialized = true;
    console.log('✅ Shell Layout inicializado');
  }

  createLayoutStructure() {
    const body = document.body;
    
    // Limpiar contenido existente del navbar (mantener solo el contenedor principal)
    const existingNavbar = document.getElementById('global-navbar');
    if (existingNavbar) {
      existingNavbar.style.display = 'none'; // Mantener oculto como estaba
    }

    // Crear header dinámico (solo visible cuando sea necesario)
    this.createDynamicHeader();
    
    // Footer removido por solicitud del usuario
    // this.createFooter();
    
    // Crear loading overlay
    this.createLoadingOverlay();
    
    // Aplicar estilos de layout
    this.applyLayoutStyles();
  }

  createDynamicHeader() {
    // Crear header que se puede mostrar/ocultar dinámicamente
    const header = document.createElement('header');
    header.id = 'shell-header';
    header.style.display = 'none'; // Inicialmente oculto
    header.innerHTML = `
      <div class="shell-header-content">
        <div class="shell-logo">
          <h1>🎵 Plataforma Musical</h1>
        </div>
        <nav class="shell-navigation">
          <a href="/" data-route="/">Dashboard</a>
          <a href="/artista-v2" data-route="/artista-v2">Artista</a>
          <a href="/monetizacion-v2" data-route="/monetizacion-v2">Monetización</a>
        </nav>
        <div class="shell-user-menu">
          <div class="user-info" id="shell-user-info" style="display: none;">
            <img id="shell-user-avatar" src="" alt="Avatar" class="user-avatar">
            <span id="shell-user-name">Usuario</span>
            <button id="shell-logout-btn" class="logout-btn">Cerrar Sesión</button>
          </div>
          <div class="auth-buttons" id="shell-auth-buttons">
            <button id="shell-login-btn" class="login-btn">Iniciar Sesión</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertBefore(header, document.body.firstChild);
  }

  /* === FUNCIÓN createFooter() REMOVIDA ===
  createFooter() {
    const footer = document.createElement('footer');
    footer.id = 'shell-footer';
    footer.innerHTML = `
      <div class="shell-footer-content">
        <div class="footer-section">
          <h4>Plataforma Musical</h4>
          <p>La plataforma completa para artistas y fans de música</p>
        </div>
        <div class="footer-section">
          <h4>Módulos</h4>
          <ul>
            <li><a href="/">Comunidad</a></li>
            <li><a href="/artista-v2">Gestión de Artista</a></li>
            <li><a href="/monetizacion-v2">Monetización</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Estado</h4>
          <div id="footer-status">
            <div class="status-item">
              <span class="status-label">Usuario:</span>
              <span id="footer-user-status" class="status-value">No autenticado</span>
            </div>
            <div class="status-item">
              <span class="status-label">Módulo activo:</span>
              <span id="footer-module-status" class="status-value">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Plataforma Musical - Proyecto Single-SPA</p>
      </div>
    `;
    
    document.body.appendChild(footer);
  }
  === FIN createFooter() REMOVIDA === */

  createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'shell-loading-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h2>Cargando módulo...</h2>
        <p id="loading-message">Preparando la aplicación</p>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  applyLayoutStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* === SHELL LAYOUT STYLES CON PALETA DEL PROYECTO === */
      #shell-header {
        background: linear-gradient(135deg, #348e91, #4facfe);
        color: white;
        padding: 1rem 2rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
      }
      
      .shell-header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .shell-logo h1 {
        margin: 0;
        font-size: 1.5rem;
      }
      
      .shell-navigation {
        display: flex;
        gap: 2rem;
      }
      
      .shell-navigation a {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }
      
      .shell-navigation a:hover,
      .shell-navigation a.active {
        background-color: rgba(255,255,255,0.2);
      }
      
      .shell-user-menu {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid white;
      }
      
      .logout-btn, .login-btn {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      
      .logout-btn:hover, .login-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      
      /* === FOOTER STYLES REMOVIDOS ===
      #shell-footer {
        background: linear-gradient(135deg, #348e91 0%, #2a7175 100%);
        color: white;
        margin-top: auto;
        box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .shell-footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
      }
      
      .footer-section h4 {
        margin: 0 0 1rem 0;
        color: #4facfe;
        font-weight: 600;
        font-size: 1.1rem;
      }
      
      .footer-section p {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9rem;
        line-height: 1.5;
      }
      
      .footer-section ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      .footer-section li {
        margin: 0.5rem 0;
      }
      
      .footer-section a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: color 0.3s ease;
      }
      
      .footer-section a:hover {
        color: white;
        text-decoration: underline;
      }
      
      .status-item {
        display: flex;
        justify-content: space-between;
        margin: 0.5rem 0;
        font-size: 0.9rem;
      }
      
      .status-label {
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
      }
      
      .status-value {
        color: #4facfe;
        font-weight: 600;
      }
      === FIN FOOTER REMOVIDO === */
      
      .footer-bottom {
        background: #1a202c;
        text-align: center;
        padding: 1rem;
        border-top: 1px solid #4a5568;
      }
      
      /* === LOADING OVERLAY CON PALETA DEL PROYECTO === */
      #shell-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(52, 142, 145, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      
      .loading-content {
        background: white;
        padding: 3rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        max-width: 300px;
      }
      
      .loading-content h2 {
        color: #348e91;
        margin: 1rem 0 0.5rem 0;
        font-size: 1.3rem;
        font-weight: 600;
      }
      
      .loading-content p {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
      }
      
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(52, 142, 145, 0.2);
        border-top: 4px solid #348e91;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* === RESPONSIVE SIN FOOTER === */
      @media (max-width: 768px) {
        .shell-header-content {
          flex-direction: column;
          gap: 1rem;
        }
        
        .shell-navigation {
          flex-wrap: wrap;
          justify-content: center;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Logout button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'shell-logout-btn') {
        this.handleLogout();
      }
      
      if (e.target.id === 'shell-login-btn') {
        this.handleLoginRedirect();
      }
    });

    // Navigation links
    document.addEventListener('click', (e) => {
      if (e.target.matches('.shell-navigation a')) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        this.navigate(route);
      }
    });
  }

  subscribeToStateChanges() {
    // Suscribirse a cambios de autenticación
    authService.subscribe((authState) => {
      this.updateAuthUI(authState);
    });

    // Suscribirse a cambios de estado global
    globalState.subscribe((state) => {
      this.updateGlobalUI(state);
    });
  }

  updateAuthUI(authState) {
    const userInfo = document.getElementById('shell-user-info');
    const authButtons = document.getElementById('shell-auth-buttons');
    // Footer removido - comentamos la referencia
    // const footerUserStatus = document.getElementById('footer-user-status');
    
    if (authState.isAuthenticated && authState.user) {
      // Mostrar info del usuario
      userInfo.style.display = 'flex';
      authButtons.style.display = 'none';
      
      const avatar = document.getElementById('shell-user-avatar');
      const name = document.getElementById('shell-user-name');
      
      avatar.src = authState.user.image_url || '/default-avatar.png';
      name.textContent = authState.user.name || authState.user.email;
      
      // Footer removido - comentamos la actualización
      // footerUserStatus.textContent = `${authState.user.name} (${authState.user.type})`;
    } else {
      // Mostrar botones de auth
      userInfo.style.display = 'none';
      authButtons.style.display = 'flex';
      
      // Footer removido - comentamos la actualización
      // footerUserStatus.textContent = 'No autenticado';
    }
  }

  updateGlobalUI(state) {
    // Footer removido - comentamos la referencia
    // const footerModuleStatus = document.getElementById('footer-module-status');
    
    // Footer removido - comentamos las actualizaciones
    // if (state.activeModule) {
    //   footerModuleStatus.textContent = state.activeModule;
    // } else {
    //   footerModuleStatus.textContent = 'Cargando...';
    // }

    // Actualizar navigation active state
    const navLinks = document.querySelectorAll('.shell-navigation a');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-route') === state.currentRoute) {
        link.classList.add('active');
      }
    });
  }

  // Mostrar/ocultar header
  showHeader() {
    const header = document.getElementById('shell-header');
    if (header) header.style.display = 'block';
  }

  hideHeader() {
    const header = document.getElementById('shell-header');
    if (header) header.style.display = 'none';
  }

  // Mostrar/ocultar loading
  showLoading(message = 'Cargando...') {
    const overlay = document.getElementById('shell-loading-overlay');
    const messageEl = document.getElementById('loading-message');
    
    if (overlay) {
      overlay.style.display = 'flex';
      if (messageEl) messageEl.textContent = message;
    }
  }

  hideLoading() {
    const overlay = document.getElementById('shell-loading-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  // Navegación
  navigate(route) {
    console.log(`🧭 Navegando a: ${route}`);
    window.history.pushState({}, '', route);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  // Handlers
  handleLogout() {
    authService.logout();
    this.navigate('/');
  }

  handleLoginRedirect() {
    this.navigate('/login');
  }
}

// === SINGLETON PARA EXPORTAR ===
const shellLayout = new ShellLayout();
export default shellLayout;
