/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import { UpsertMenuComponent } from '../app/auth/components/upsert-menu/upsert-menu';
import { IMenu } from '../interfaces/auth';
import { CustomIconComponent } from '../app/shared/components/custom-icon/custom-icon.component';

const mockMenu: IMenu = {
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

const meta: Meta<UpsertMenuComponent> = {
  title: 'Auth Components/Upsert Menu',
  component: UpsertMenuComponent,
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
type Story = StoryObj<UpsertMenuComponent>;

export const CrearMenuPrincipal: Story = {
  args: {
    menu: mockMenu,
    nuevo: true,
    isLoading: false,
    esMenuPrincipal: true,
    key: 0,
  },
};

export const CrearSubMenu: Story = {
  args: {
    menu: mockSubMenu,
    nuevo: true,
    isLoading: false,
    esMenuPrincipal: false,
    key: 0,
  },
};

export const EditarExistente: Story = {
  args: {
    menu: mockMenu,
    nuevo: false,
    isLoading: false,
    esMenuPrincipal: true,
    key: 0,
  },
};

export const Cargando: Story = {
  args: {
    menu: mockMenu,
    nuevo: false,
    isLoading: true,
    esMenuPrincipal: true,
    key: 0,
  },
};
