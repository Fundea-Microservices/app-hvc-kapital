/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import LoginComponent from '../app/auth/pages/login/login';
import { AuthService } from '../services/auth/auth.service';
import { AccesoService } from '../services/auth/acceso.service';
import { Router } from '@angular/router';

const authServiceMock = {
  getUserStorage: () => ({
    nombre: 'Usuario de Prueba',
    userName: 'testuser',
    rol: { esAdmin: true }
  }),
  login: async () => ({ success: true, data: { token: 'mock-token', user: {} } }),
  isAuthenticated: () => false,
};

const accesoServiceMock = {
  getAccesosByRol: async () => ({ success: true, data: [] }),
};

const meta: Meta<LoginComponent> = {
  title: 'Auth Pages/Login Page',
  component: LoginComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: AccesoService, useValue: accesoServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<LoginComponent>;

export const Default: Story = {};
