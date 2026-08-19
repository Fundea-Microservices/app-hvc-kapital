/// <reference types="@storybook/angular" />
import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from '../app/app.routes';
import MiPerfilPageComponent from '../app/auth/pages/mi-perfil-page/mi-perfil-page';
import { AuthService } from '../services/auth/auth.service';
import { UsuariosService } from '../services/auth/usuarios.service';
import { RolService } from '../services/auth/rol.service';
import { PuestoService } from '../services/auth/puesto.service';
import { IUsuario, IRol, IPuesto } from '../interfaces/auth';

const mockUser: IUsuario = {
  usuarioId: '1', nombreCompleto: 'Juan Pérez', nombre1: 'Juan', nombre2: '', nombre3: '',
  apellido1: 'Pérez', apellido2: '', apellido3: '',
  userName: 'jperez', clave: '', correo: 'juan@hvc.com',
  fotoUrl: 'images/user-default.png', lastPasswordUpdate: new Date(), activo: true,
  rolId: '1', puestoId: '1', created_at: new Date(),
  rol: { rolId: '1', nombre: 'Admin', invitado: false, esAdmin: true, activo: true, created_at: new Date() },
  puesto: { puestoId: '1', nombre: 'Gerente' },
};

const mockRoles: IRol[] = [
  { rolId: '1', nombre: 'Admin', invitado: false, esAdmin: true, activo: true, created_at: new Date() },
];

const mockPuestos: IPuesto[] = [
  { puestoId: '1', nombre: 'Gerente' },
];

const authServiceMock = {
  user: signal<IUsuario>(mockUser),
  updateUser: (u: IUsuario) => {},
  fetchAndApplyUserPhoto: async (u: any) => u,
};

const usuariosServiceMock = {
  updateUsuario: async (u: any) => ({ success: true, data: u }),
  uploadPerfil: async () => ({ success: true, data: { fileName: 'test.jpg' } }),
  cambiarClave: async () => ({ success: true }),
};

const rolServiceMock = {
  getRoles: async () => ({ success: true, data: mockRoles }),
};

const puestoServiceMock = {
  getPuestos: async () => ({ success: true, data: mockPuestos }),
};

const meta: Meta<MiPerfilPageComponent> = {
  title: 'Auth Pages/Mi Perfil Page',
  component: MiPerfilPageComponent,
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
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<MiPerfilPageComponent>;

export const Default: Story = {};
