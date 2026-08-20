/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import { UpsertUsuarioComponent } from '../app/auth/components/upsert-usuario/upsert-usuario';
import { IUsuario, IRol, IPuesto, ISucursal } from '../interfaces/auth';

const mockRoles: IRol[] = [
  { rolId: '1', nombre: 'Administrador', invitado: false, activo: true, esAdmin: true, created_at: new Date('2026-01-15') },
  { rolId: '2', nombre: 'Operador', invitado: false, activo: true, esAdmin: false, created_at: new Date('2026-01-15') },
  { rolId: '3', nombre: 'Invitado', invitado: true, activo: true, esAdmin: false, created_at: new Date('2026-01-15') },
];

const mockPuestos: IPuesto[] = [
  { puestoId: '1', nombre: 'Gerente General' },
  { puestoId: '2', nombre: 'Asistente Administrativo' },
  { puestoId: '3', nombre: 'Analista de Sistemas' },
];

const mockSucursales: ISucursal[] = [
  { id: '1', nombre: 'Sucursal Central', municipio: 'Guatemala', departamento: 'Guatemala', central: true, created_at: new Date('2026-01-15') },
  { id: '2', nombre: 'Sucursal Santa Tecla', municipio: 'Santa Tecla', departamento: 'La Libertad', central: false, created_at: new Date('2026-01-15') },
];

const mockUsuario: IUsuario = {
  usuarioId: '1',
  nombreCompleto: 'Juan Carlos Pérez',
  nombre1: 'Juan',
  nombre2: 'Carlos',
  nombre3: null,
  apellido1: 'Pérez',
  apellido2: 'López',
  apellido3: null,
  userName: 'jcperez',
  clave: '',
  correo: 'jcperez@hvc.com',
  fotoUrl: null,
  lastPasswordUpdate: new Date('2026-01-15'),
  activo: true,
  rolId: '1',
  puestoId: '1',
  sucursal_id: '1',
  rol: mockRoles[0],
  created_at: new Date('2026-01-15'),
};

const meta: Meta<UpsertUsuarioComponent> = {
  title: 'Auth Components/Upsert Usuario',
  component: UpsertUsuarioComponent,
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
type Story = StoryObj<UpsertUsuarioComponent>;

export const CrearNuevo: Story = {
  args: {
    usuario: {
      nombreCompleto: '',
      nombre1: '',
      nombre2: null,
      nombre3: null,
      apellido1: '',
      apellido2: null,
      apellido3: null,
      userName: '',
      clave: '',
      correo: '',
      fotoUrl: null,
      lastPasswordUpdate: new Date(),
      activo: true,
      rolId: '',
      puestoId: null,
      sucursal_id: null,
      created_at: new Date(),
    } as IUsuario,
    roles: mockRoles,
    puestos: mockPuestos,
    sucursales: mockSucursales,
    nuevo: true,
    isLoading: false,
    key: 0,
    autoEdit: false,
  },
};

export const EditarExistente: Story = {
  args: {
    usuario: mockUsuario,
    roles: mockRoles,
    puestos: mockPuestos,
    sucursales: mockSucursales,
    nuevo: false,
    isLoading: false,
    key: 0,
    autoEdit: false,
  },
};

export const EditarPerfil: Story = {
  args: {
    usuario: mockUsuario,
    roles: mockRoles,
    puestos: mockPuestos,
    sucursales: mockSucursales,
    nuevo: false,
    isLoading: false,
    key: 0,
    autoEdit: true,
  },
};

export const Cargando: Story = {
  args: {
    usuario: mockUsuario,
    roles: mockRoles,
    puestos: mockPuestos,
    sucursales: mockSucursales,
    nuevo: false,
    isLoading: true,
    key: 0,
    autoEdit: false,
  },
};
