/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import UsuariosPageComponent from '../app/auth/pages/usuarios-page/usuarios-page';
import { AuthService } from '../services/auth/auth.service';
import { UsuariosService } from '../services/auth/usuarios.service';
import { RolService } from '../services/auth/rol.service';
import { PuestoService } from '../services/auth/puesto.service';
import { SucursalService } from '../services/auth/sucursal.service';
import { StorageService } from '../services/storage.service';
import { IUsuario, IRol, IPuesto, ISucursal } from '../interfaces/auth';

const mockUsuarios: IUsuario[] = [
  {
    usuarioId: '1', nombreCompleto: 'Juan Pérez', nombre1: 'Juan', apellido1: 'Pérez',
    userName: 'jperez', clave: '', correo: 'juan@test.com', activo: true,
    rolId: '1', puestoId: '1', lastPasswordUpdate: new Date(), created_at: new Date(),
    rol: { rolId: '1', nombre: 'Admin', invitado: false, esAdmin: true, activo: true, created_at: new Date() }
  },
  {
    usuarioId: '2', nombreCompleto: 'María López', nombre1: 'María', apellido1: 'López',
    userName: 'mlopez', clave: '', correo: 'maria@test.com', activo: true,
    rolId: '2', lastPasswordUpdate: new Date(), created_at: new Date(),
    rol: { rolId: '2', nombre: 'Operador', invitado: false, esAdmin: false, activo: true, created_at: new Date() }
  },
];

const mockRoles: IRol[] = [
  { rolId: '1', nombre: 'Admin', invitado: false, esAdmin: true, activo: true, created_at: new Date() },
  { rolId: '2', nombre: 'Operador', invitado: false, esAdmin: false, activo: true, created_at: new Date() },
];

const mockPuestos: IPuesto[] = [
  { puestoId: '1', nombre: 'Gerente' },
  { puestoId: '2', nombre: 'Asistente' },
];

const mockSucursales: ISucursal[] = [
  { id: '1', nombre: 'Sucursal Central', municipio: 'San Salvador', departamento: 'San Salvador' },
];

const authServiceMock = {
  user: signal<IUsuario>(mockUsuarios[0]),
  getUserStorage: () => mockUsuarios[0],
  accesos: signal([]),
  accesosLoading: signal(false),
};

const usuariosServiceMock = {
  getUsuarios: async () => ({ success: true, data: mockUsuarios, metadata: { total: 2, page: 1, limit: 10 } }),
  createUsuario: async (u: any) => ({ success: true, data: { ...u, usuarioId: 'new' } }),
  updateUsuario: async (u: any) => ({ success: true, data: u }),
  deleteUsuario: async () => ({ success: true }),
  resetClave: async () => ({ success: true }),
  uploadPerfil: async () => ({ success: true, data: { fileName: 'test.jpg' } }),
  cambiarClave: async () => ({ success: true }),
};

const rolServiceMock = {
  getRoles: async () => ({ success: true, data: mockRoles }),
};

const puestoServiceMock = {
  getPuestos: async () => ({ success: true, data: mockPuestos }),
};

const sucursalServiceMock = {
  getSucursales: async () => ({ success: true, data: mockSucursales, metadata: { total: 1, page: 1, limit: 10 } }),
};

const storageServiceMock = {
  uploadPerfil: async () => ({ success: true, data: { fileName: 'test.jpg' } }),
};

const meta: Meta<UsuariosPageComponent> = {
  title: 'Auth Pages/Usuarios Page',
  component: UsuariosPageComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations(),
        provideToastr(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsuariosService, useValue: usuariosServiceMock },
        { provide: RolService, useValue: rolServiceMock },
        { provide: PuestoService, useValue: puestoServiceMock },
        { provide: SucursalService, useValue: sucursalServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<UsuariosPageComponent>;

export const Default: Story = {};
