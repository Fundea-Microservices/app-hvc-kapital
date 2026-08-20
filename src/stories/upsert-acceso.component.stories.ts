/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import UpsertAccesoComponent from '../app/auth/components/upsert-acceso/upsert-acceso';
import { IMenu, IRol, IAcceso } from '../interfaces/auth';

const mockRol: IRol = {
  rolId: '1',
  nombre: 'Administrador',
  invitado: false,
  activo: true,
  esAdmin: true,
  created_at: new Date('2026-01-15'),
};

const mockMenuPrincipal: IMenu = {
  menuId: '1',
  label: 'Usuarios',
  descripcion: 'Gestión de usuarios del sistema',
  pathApp: '/app/usuarios',
  pathWeb: '/dashboard/usuarios',
  icono: 'users',
  color: '#1E335E',
  principal: true,
  activo: true,
  created_at: new Date('2026-01-15'),
};

const mockSubMenu: IMenu = {
  menuId: '2',
  label: 'Crear Usuario',
  descripcion: 'Formulario para crear un nuevo usuario',
  pathApp: '/app/usuarios/create',
  pathWeb: '/dashboard/usuarios/create',
  icono: 'user-plus',
  color: '#FA9A37',
  principal: false,
  activo: true,
  created_at: new Date('2026-01-15'),
};

const mockAccesos: IAcceso[] = [
  {
    accesoId: '1',
    ordenMenu: 10,
    showApp: true,
    showWeb: true,
    activo: true,
    menuId: '1',
    rolId: '1',
    menu: mockMenuPrincipal,
    created_at: new Date('2026-01-15'),
  },
];

const meta: Meta<UpsertAccesoComponent> = {
  title: 'Auth Components/Upsert Acceso',
  component: UpsertAccesoComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<UpsertAccesoComponent>;

export const AsignarMenuPrincipal: Story = {
  args: {
    menu: mockMenuPrincipal,
    rol: mockRol,
    accesos: mockAccesos,
    isLoading: false,
  },
};

export const AsignarSubMenu: Story = {
  args: {
    menu: mockSubMenu,
    rol: mockRol,
    accesos: mockAccesos,
    isLoading: false,
  },
};

export const Cargando: Story = {
  args: {
    menu: mockMenuPrincipal,
    rol: mockRol,
    accesos: mockAccesos,
    isLoading: true,
  },
};
