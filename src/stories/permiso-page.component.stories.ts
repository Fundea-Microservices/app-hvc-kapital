/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import PermisoPageComponent from '../app/auth/pages/permiso-page/permiso-page';
import { PermisoService } from '../services/auth/permiso.service';
import { IPermiso } from '../interfaces/auth';

const mockPermisos: IPermiso[] = [
  { permisoId: '1', codigo: 'USR_CREAR', modulo: 'usuarios', accion: 'crear', descripcion: 'Crear usuarios', activo: true, created_at: new Date() },
  { permisoId: '2', codigo: 'USR_EDITAR', modulo: 'usuarios', accion: 'editar', descripcion: 'Editar usuarios', activo: true, created_at: new Date() },
  { permisoId: '3', codigo: 'ROL_CREAR', modulo: 'roles', accion: 'crear', descripcion: 'Crear roles', activo: false, created_at: new Date() },
];

const permisoServiceMock = {
  getPermisos: async () => ({ success: true, data: mockPermisos, metadata: { total: 3, page: 1, limit: 10 } }),
  createPermiso: async (p: any) => ({ success: true, data: { ...p, permisoId: 'new' } }),
  updatePermiso: async (p: any) => ({ success: true, data: p }),
  deletePermiso: async () => ({ success: true }),
};

const meta: Meta<PermisoPageComponent> = {
  title: 'Auth Pages/Permiso Page',
  component: PermisoPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: PermisoService, useValue: permisoServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<PermisoPageComponent>;

export const Default: Story = {};
