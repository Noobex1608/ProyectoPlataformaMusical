// src/stores/user.ts
import { defineStore } from 'pinia';

interface User {
  id: string;
  name: string;
  email?: string;
  // Agrega más propiedades según necesites
}

export const useUserStore = defineStore('user', {
  state: (): { user: User } => ({
    user: {
      id: '123', // Valor temporal para pruebas
      name: 'Usuario Ejemplo'
    }
  }),
  getters: {
    isAuthenticated: (state) => !!state.user.id
  },
  actions: {
    setUser(userData: User) {
      this.user = userData;
    }
  }
});