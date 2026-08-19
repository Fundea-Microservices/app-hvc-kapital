/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import PuestoPageComponent from '../app/auth/pages/puesto-page/puesto-page';
import { PuestoService } from '../services/auth/puesto.service';
import { IPuesto } from '../interfaces/auth';

const mockPuestos: IPuesto[] = [
  { puestoId: '1', nombre: 'Gerente General' },
  { puestoId: '2', nombre: 'Asistente Administrativo' },
  { puestoId: '3', nombre: 'Analista de Sistemas' },
];

const puestoServiceMock = {
  getPuestos: async () => ({ success: true, data: mockPuestos, metadata: { total: 3, page: 1, limit: 10 } }),
  createPuesto: async (p: any) => ({ success: true, data: { ...p, puestoId: 'new' } }),
  updatePuesto: async (p: any) => ({ success: true, data: p }),
  deletePuesto: async () => ({ success: true }),
};

const meta: Meta<PuestoPageComponent> = {
  title: 'Auth Pages/Puesto Page',
  component: PuestoPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: PuestoService, useValue: puestoServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<PuestoPageComponent>;

export const Default: Story = {};
