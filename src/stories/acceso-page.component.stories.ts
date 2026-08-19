/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import AccesoPageComponent from '../app/auth/pages/acceso-page/acceso-page';
import { RolService } from '../services/auth/rol.service';
import { MenuService } from '../services/auth/menu.service';
import { AccesoService } from '../services/auth/acceso.service';
import { IRol, IMenu, IAcceso } from '../interfaces/auth';

const mockRoles: IRol[] = [
  { rolId: '1', nombre: 'Administrador', invitado: false, esAdmin: true, activo: true, created_at: new Date() },
  { rolId: '2', nombre: 'Operador', invitado: false, esAdmin: false, activo: true, created_at: new Date() },
];

const mockMenus: IMenu[] = [
  { menuId: 'm1', label: 'Configuración', descripcion: 'Menú de configuración', icono: 'settings', color: '#3b82f6', pathApp: '/config', pathWeb: '/dashboard/config', principal: true, activo: true, created_at: new Date() },
  { menuId: 'm2', label: 'Reportes', descripcion: 'Menú de reportes', icono: 'bar-chart-3', color: '#10b981', pathApp: '/reportes', pathWeb: '/dashboard/reportes', principal: true, activo: true, created_at: new Date() },
  { menuId: 's1', label: 'Usuarios', descripcion: 'Gestión de usuarios', icono: 'users', color: '#8b5cf6', pathApp: '/config/usuarios', pathWeb: '/dashboard/config/usuarios', principal: false, activo: true, created_at: new Date() },
  { menuId: 's2', label: 'Roles', descripcion: 'Gestión de roles', icono: 'shield', color: '#f59e0b', pathApp: '/config/roles', pathWeb: '/dashboard/config/roles', principal: false, activo: true, created_at: new Date() },
];

const mockAccesos: IAcceso[] = [
  {
    accesoId: 'a1', ordenMenu: 1, showApp: true, showWeb: true, activo: true,
    menuId: 'm1', rolId: '1', mainMenuId: null,
    menu: mockMenus[0],
    subMenus: [
      { accesoId: 'a2', ordenMenu: 1, showApp: true, showWeb: true, activo: true, menuId: 's1', rolId: '1', mainMenuId: 'm1', menu: mockMenus[2], created_at: new Date() }
    ],
    created_at: new Date(),
  },
];

const rolServiceMock = {
  getRoles: async () => ({ success: true, data: mockRoles }),
};

const menuServiceMock = {
  getMenus: async () => ({ success: true, data: mockMenus }),
};

const accesoServiceMock = {
  getAccesosByRol: async () => ({ success: true, data: mockAccesos }),
  createAcceso: async () => ({ success: true }),
  updateAcceso: async () => ({ success: true }),
  deleteAcceso: async () => ({ success: true }),
};

const meta: Meta<AccesoPageComponent> = {
  title: 'Auth Pages/Acceso Page',
  component: AccesoPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: RolService, useValue: rolServiceMock },
        { provide: MenuService, useValue: menuServiceMock },
        { provide: AccesoService, useValue: accesoServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<AccesoPageComponent>;

export const Default: Story = {};
