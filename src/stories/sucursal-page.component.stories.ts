/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import SucursalPageComponent from '../app/auth/pages/sucursal-page/sucursal-page';
import { SucursalService } from '../services/auth/sucursal.service';
import { ISucursal } from '../interfaces/auth';

const mockSucursales: ISucursal[] = [
  { id: '1', nombre: 'Sucursal Central', municipio: 'San Salvador', departamento: 'San Salvador', telefono: '2222-1234', direccion: 'Av. Principal #100' },
  { id: '2', nombre: 'Sucursal Santa Tecla', municipio: 'Santa Tecla', departamento: 'La Libertad', telefono: '2279-5678', direccion: 'Boulevard Los Héroes' },
  { id: '3', nombre: 'Sucursal San Miguel', municipio: 'San Miguel', departamento: 'San Miguel', telefono: '2661-9012', direccion: 'Calle Principal #50' },
];

const sucursalServiceMock = {
  getSucursales: async () => ({ success: true, data: mockSucursales, metadata: { total: 3, page: 1, limit: 10 } }),
  createSucursal: async (s: any) => ({ success: true, data: { ...s, id: 'new' } }),
  updateSucursal: async (id: string, s: any) => ({ success: true, data: s }),
  deleteSucursal: async () => ({ success: true }),
};

const meta: Meta<SucursalPageComponent> = {
  title: 'Auth Pages/Sucursal Page',
  component: SucursalPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: SucursalService, useValue: sucursalServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<SucursalPageComponent>;

export const Default: Story = {};
