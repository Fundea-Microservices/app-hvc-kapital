/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import MenuPageComponent from '../app/auth/pages/menu-page/menu-page';
import { MenuService } from '../services/auth/menu.service';
import { IMenu } from '../interfaces/auth';

const mockMenusPrincipales: IMenu[] = [
  { menuId: '1', label: 'Configuración', descripcion: 'Menú de configuración', icono: 'settings', color: '#3b82f6', pathApp: '/config', pathWeb: '/dashboard/config', principal: true, activo: true, created_at: new Date() },
  { menuId: '2', label: 'Reportes', descripcion: 'Menú de reportes', icono: 'bar-chart-3', color: '#10b981', pathApp: '/reportes', pathWeb: '/dashboard/reportes', principal: true, activo: true, created_at: new Date() },
];

const mockSubmenus: IMenu[] = [
  { menuId: '3', label: 'Usuarios', descripcion: 'Gestión de usuarios', icono: 'users', color: '#8b5cf6', pathApp: '/config/usuarios', pathWeb: '/dashboard/config/usuarios', principal: false, activo: true, created_at: new Date() },
  { menuId: '4', label: 'Roles', descripcion: 'Gestión de roles', icono: 'shield', color: '#f59e0b', pathApp: '/config/roles', pathWeb: '/dashboard/config/roles', principal: false, activo: true, created_at: new Date() },
];

const menuServiceMock = {
  getMenus: async (params: any) => {
    if (params.principal === true) return { success: true, data: mockMenusPrincipales, metadata: { total: 2, page: 1, limit: 10 } };
    if (params.principal === false) return { success: true, data: mockSubmenus, metadata: { total: 2, page: 1, limit: 10 } };
    return { success: true, data: [...mockMenusPrincipales, ...mockSubmenus], metadata: { total: 4, page: 1, limit: 10 } };
  },
  createMenu: async (m: any) => ({ success: true, data: { ...m, menuId: 'new' } }),
  updateMenu: async (m: any) => ({ success: true, data: m }),
  deleteMenu: async () => ({ success: true }),
};

const meta: Meta<MenuPageComponent> = {
  title: 'Auth Pages/Menu Page',
  component: MenuPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: MenuService, useValue: menuServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<MenuPageComponent>;

export const Default: Story = {};
