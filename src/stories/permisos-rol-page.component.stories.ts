/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import PermisosRolPageComponent from '../app/auth/pages/permisos-rol-page/permisos-rol-page';
import { RolService } from '../services/auth/rol.service';
import { PermisoRolService } from '../services/auth/permiso-rol.service';
import { IRol, IPermisoMatriz } from '../interfaces/auth';

const mockRoles: IRol[] = [
  { rolId: '1', nombre: 'Administrador', invitado: false, esAdmin: true, activo: true, created_at: new Date() },
  { rolId: '2', nombre: 'Operador', invitado: false, esAdmin: false, activo: true, created_at: new Date() },
];

const mockMatriz: IPermisoMatriz[] = [
  { permisoId: '1', codigo: 'USR_CREAR', modulo: 'usuarios', accion: 'crear', descripcion: 'Crear usuarios', activo: true, created_at: new Date(), asignado: true },
  { permisoId: '2', codigo: 'USR_EDITAR', modulo: 'usuarios', accion: 'editar', descripcion: 'Editar usuarios', activo: true, created_at: new Date(), asignado: false },
  { permisoId: '3', codigo: 'ROL_CREAR', modulo: 'roles', accion: 'crear', descripcion: 'Crear roles', activo: true, created_at: new Date(), asignado: true },
];

const rolServiceMock = {
  getRoles: async () => ({ success: true, data: mockRoles }),
};

const permisoRolServiceMock = {
  getMatriz: async () => ({ success: true, data: mockMatriz, metadata: { total: 3, page: 1, limit: 10 } }),
  asignar: async () => ({ success: true }),
  retirar: async () => ({ success: true }),
};

const meta: Meta<PermisosRolPageComponent> = {
  title: 'Auth Pages/Permisos Rol Page',
  component: PermisosRolPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: RolService, useValue: rolServiceMock },
        { provide: PermisoRolService, useValue: permisoRolServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<PermisosRolPageComponent>;

export const Default: Story = {};
