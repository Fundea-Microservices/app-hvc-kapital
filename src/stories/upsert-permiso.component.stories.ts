/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import { UpsertPermisoComponent } from '../app/auth/components/upsert-permiso/upsert-permiso';
import { IPermiso } from '../interfaces/auth';

const mockPermiso: IPermiso = {
  permisoId: '1',
  codigo: 'USR_CREAR',
  modulo: 'usuarios',
  accion: 'crear',
  descripcion: 'Permite crear nuevos usuarios en el sistema',
  activo: true,
  created_at: new Date('2026-01-15'),
};

const meta: Meta<UpsertPermisoComponent> = {
  title: 'Auth Components/Upsert Permiso',
  component: UpsertPermisoComponent,
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
type Story = StoryObj<UpsertPermisoComponent>;

export const CrearNuevo: Story = {
  args: {
    permiso: mockPermiso,
    nuevo: true,
    isLoading: false,
    key: 0,
  },
};

export const EditarExistente: Story = {
  args: {
    permiso: mockPermiso,
    nuevo: false,
    isLoading: false,
    key: 0,
  },
};

export const Cargando: Story = {
  args: {
    permiso: mockPermiso,
    nuevo: false,
    isLoading: true,
    key: 0,
  },
};
