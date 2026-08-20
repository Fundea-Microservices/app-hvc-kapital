/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import { UpsertPuestoComponent } from '../app/auth/components/upsert-puesto/upsert-puesto.component';
import { IPuesto } from '../interfaces/auth';

const mockPuesto: IPuesto = {
  puestoId: '1',
  nombre: 'Gerente General',
};

const meta: Meta<UpsertPuestoComponent> = {
  title: 'Auth Components/Upsert Puesto',
  component: UpsertPuestoComponent,
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
type Story = StoryObj<UpsertPuestoComponent>;

export const CrearNuevo: Story = {
  args: {
    puesto: mockPuesto,
    nuevo: true,
    isLoading: false,
    key: 0,
  },
};

export const EditarExistente: Story = {
  args: {
    puesto: mockPuesto,
    nuevo: false,
    isLoading: false,
    key: 0,
  },
};

export const Cargando: Story = {
  args: {
    puesto: mockPuesto,
    nuevo: false,
    isLoading: true,
    key: 0,
  },
};
