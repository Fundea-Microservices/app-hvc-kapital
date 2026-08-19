/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import ConfiguracionesPageComponent from '../app/auth/pages/configuraciones-page/configuraciones-page';
import { ConfigService } from '../services/auth/config.service';
import { IConfig, TipoConfiguracion } from '../interfaces/auth';

const mockConfigs: IConfig[] = [
  { configId: '1', llave: 'APP_NAME', valor: 'HVC Kapital', tipo: TipoConfiguracion.STRING, descripcion: 'Nombre de la aplicación', activo: true, created_at: new Date() },
  { configId: '2', llave: 'MAX_SESSION_MINUTES', valor: '60', tipo: TipoConfiguracion.NUMBER, descripcion: 'Duración máxima de sesión en minutos', activo: true, created_at: new Date() },
  { configId: '3', llave: 'ENABLE_NOTIFICATIONS', valor: 'true', tipo: TipoConfiguracion.BOOLEAN, descripcion: 'Habilitar notificaciones push', activo: true, created_at: new Date() },
];

const configServiceMock = {
  getConfigs: async () => ({ success: true, data: mockConfigs, metadata: { total: 3, page: 1, limit: 10 } }),
  createConfig: async (c: any) => ({ success: true, data: { ...c, configId: 'new' } }),
  updateConfig: async (id: string, c: any) => ({ success: true, data: c }),
  deleteConfig: async () => ({ success: true }),
};

const meta: Meta<ConfiguracionesPageComponent> = {
  title: 'Auth Pages/Configuraciones Page',
  component: ConfiguracionesPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<ConfiguracionesPageComponent>;

export const Default: Story = {};
