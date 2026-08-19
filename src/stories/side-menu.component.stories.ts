/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../../src/app/app.routes';
import SideMenuComponent from '../app/dashboard/components/side-menu/side-menu';
import { AuthService } from '../services/auth/auth.service'; // Ajusta la ruta si es necesario

// Creamos la simulación del servicio con datos ficticios
const authServiceMock = {
  getUserStorage: () => ({
    nombre: 'Usuario de Prueba',
    rol: { esAdmin: true }
  }),
  // Definimos los mismos signals que tu lista espera leer
  accesos: signal([
    { nombre: 'Transacciones', url: '/dashboard/tesoreria/transacciones', icono: 'cash' },
    { nombre: 'Cuentas', url: '/dashboard/tesoreria/cuentas', icono: 'credit-card' },
    { nombre: 'Bancos', url: '/dashboard/tesoreria/bancos', icono: 'bank' }
  ]),
  accesosLoading: signal(false)
};

const meta: Meta<SideMenuComponent> = {
  title: 'Side Menu',
  component: SideMenuComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        // Inyectamos el mock en lugar del servicio real
        { provide: AuthService, useValue: authServiceMock }
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<SideMenuComponent>;

export const Default: Story = {};