/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import RolPageComponent from '../app/auth/pages/rol-page/rol-page';
import { RolService } from '../services/auth/rol.service';
import { IRol } from '../interfaces/auth';

const mockRoles: IRol[] = [
  { rolId: '1', nombre: 'Administrador', invitado: false, esAdmin: true, activo: true, created_at: new Date() },
  { rolId: '2', nombre: 'Operador', invitado: false, esAdmin: false, activo: true, created_at: new Date() },
  { rolId: '3', nombre: 'Invitado', invitado: true, esAdmin: false, activo: true, created_at: new Date() },
];

const rolServiceMock = {
  getRoles: async () => ({ success: true, data: mockRoles, metadata: { total: 3, page: 1, limit: 10 } }),
  createRol: async (r: any) => ({ success: true, data: { ...r, rolId: 'new' } }),
  updateRol: async (r: any) => ({ success: true, data: r }),
  deleteRol: async () => ({ success: true }),
};

const meta: Meta<RolPageComponent> = {
  title: 'Auth Pages/Rol Page',
  component: RolPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: RolService, useValue: rolServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<RolPageComponent>;

export const Default: Story = {};
