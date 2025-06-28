import { defineStore } from 'pinia';
import type { Usuario } from '../entities/usuario';

export const useUsuarioStore = defineStore('usuario', {
  state: () => ({
    usuario: null as Usuario | null,
    isAuthenticated: false,
  }),
  actions: {
    setUsuario(usuario: Usuario) {
      this.usuario = usuario;
      this.isAuthenticated = true;
    },
    clearUsuario() {
      this.usuario = null;
      this.isAuthenticated = false;
    },
    updateUsuario(updatedUsuario: Partial<Usuario>) {
        if (this.usuario) {
            this.usuario.description = updatedUsuario.description || this.usuario.description;
        }
    },
  },
    getters: {
        getUsuario: (state) => state.usuario,
        isLoggedIn: (state) => state.isAuthenticated,
    },
    persist: true, 
    
});
