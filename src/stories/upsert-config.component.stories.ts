/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import { UpsertConfigComponent } from '../app/auth/components/upsert-config/upsert-config';
import { IConfig, TipoConfiguracion } from '../interfaces/auth';

const mockConfigString: IConfig = {
  configId: '1',
  llave: 'APP_NAME',
  valor: 'HVC Kapital',
  tipo: TipoConfiguracion.STRING,
  descripcion: 'Nombre de la aplicación',
  activo: true,
  created_at: new Date('2026-01-15'),
};

const mockConfigNumber: IConfig = {
  configId: '2',
  llave: 'MAX_SESSION_MINUTES',
  valor: '30',
  tipo: TipoConfiguracion.NUMBER,
  descripcion: 'Tiempo máximo de sesión en minutos',
  activo: true,
  created_at: new Date('2026-01-15'),
};

const mockConfigBoolean: IConfig = {
  configId: '3',
  llave: 'ENABLE_NOTIFICATIONS',
  valor: 'true',
  tipo: TipoConfiguracion.BOOLEAN,
  descripcion: 'Habilitar notificaciones push',
  activo: true,
  created_at: new Date('2026-01-15'),
};

const mockConfigArray: IConfig = {
  configId: '4',
  llave: 'ALLOWED_ROLES',
  valor: '["admin","operator","viewer"]',
  tipo: TipoConfiguracion.ARRAY,
  descripcion: 'Roles permitidos en el sistema',
  activo: true,
  created_at: new Date('2026-01-15'),
};

const mockConfigObject: IConfig = {
  configId: '5',
  llave: 'EMAIL_SETTINGS',
  valor: '{"host":"smtp.hvc.com","port":587,"secure":true}',
  tipo: TipoConfiguracion.OBJECT,
  descripcion: 'Configuración del servidor de correo',
  activo: true,
  created_at: new Date('2026-01-15'),
};

const meta: Meta<UpsertConfigComponent> = {
  title: 'Auth Components/Upsert Config',
  component: UpsertConfigComponent,
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
type Story = StoryObj<UpsertConfigComponent>;

export const CrearString: Story = {
  args: {
    config: mockConfigString,
    nuevo: true,
    isLoading: false,
    key: 0,
  },
};

export const CrearNumber: Story = {
  args: {
    config: mockConfigNumber,
    nuevo: true,
    isLoading: false,
    key: 0,
  },
};

export const CrearBoolean: Story = {
  args: {
    config: mockConfigBoolean,
    nuevo: true,
    isLoading: false,
    key: 0,
  },
};

export const CrearArray: Story = {
  args: {
    config: mockConfigArray,
    nuevo: true,
    isLoading: false,
    key: 0,
  },
};

export const CrearObject: Story = {
  args: {
    config: mockConfigObject,
    nuevo: true,
    isLoading: false,
    key: 0,
  },
};

export const EditarExistente: Story = {
  args: {
    config: mockConfigString,
    nuevo: false,
    isLoading: false,
    key: 0,
  },
};

export const Cargando: Story = {
  args: {
    config: mockConfigString,
    nuevo: false,
    isLoading: true,
    key: 0,
  },
};
