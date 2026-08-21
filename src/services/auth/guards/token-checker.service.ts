// src/app/services/token-checker.service.ts
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TokenCheckerService {
  private readonly CHECK_INTERVAL = environment.tokenCheckInterval * 60 * 1000; // 5 minutos

  private authService = inject(AuthService);

  constructor() {
    // Verificación inmediata al arrancar/recargar la aplicación
    this.checkToken();
    this.startChecking();
  }

  private startChecking() {
    setInterval(() => this.checkToken(), this.CHECK_INTERVAL);
  }

  private checkToken() {
    const token = this.authService.token;
    if (!token) return;

    if (this.authService.isTokenExpired(token)) {
      this.authService.sesionExpirada('Cierre de sesión por expiración del token');
    }
  }
}
