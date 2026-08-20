/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import { UpsertRolComponent } from '../app/auth/components/upsert-rol/upsert-rol';
import { IRol } from '../interfaces/auth';

const mockRol: IRol = {
  rolId: '1',
  nombre: 'Administrador',
  invitado: false,
  activo: true,
  esAdmin: true,
  created_at: new Date('2026-01-15'),
};

const meta: Meta<UpsertRolComponent> = {
  title: 'Auth Components/Upsert Rol',
  component: UpsertRolComponent,
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
type Story = StoryObj<UpsertRolComponent>;

export const CrearNuevo: Story = {
  args: {
    rol: mockRol,
    nuevo: true,
    isLoading: false,
    key: 0,
  },
};

export const EditarExistente: Story = {
  args: {
    rol: mockRol,
    nuevo: false,
    isLoading: false,
    key: 0,
  },
};

export const Cargando: Story = {
  args: {
    rol: mockRol,
    nuevo: false,
    isLoading: true,
    key: 0,
  },
};
