/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import { UpsertSucursalComponent } from '../app/auth/components/upsert-sucursal/upsert-sucursal';
import { ISucursal } from '../interfaces/auth';

const mockSucursal: ISucursal = {
  id: '1',
  nombre: 'Sucursal Central',
  municipio: 'Guatemala',
  departamento: 'Guatemala',
  telefono: '2222-3333',
  direccion: '6a Av. 12-34, Zona 1',
  central: true,
  created_at: new Date('2026-01-15'),
};

const meta: Meta<UpsertSucursalComponent> = {
  title: 'Auth Components/Upsert Sucursal',
  component: UpsertSucursalComponent,
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
type Story = StoryObj<UpsertSucursalComponent>;

export const CrearNueva: Story = {
  args: {
    sucursal: {
      nombre: '',
      municipio: '',
      departamento: '',
      telefono: '',
      direccion: '',
    } as ISucursal,
    nuevo: true,
    isLoading: false,
  },
};

export const EditarExistente: Story = {
  args: {
    sucursal: mockSucursal,
    nuevo: false,
    isLoading: false,
  },
};

export const Cargando: Story = {
  args: {
    sucursal: mockSucursal,
    nuevo: false,
    isLoading: true,
  },
};
