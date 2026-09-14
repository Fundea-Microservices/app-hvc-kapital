import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { UsuariosService } from '../../../../services/auth/usuarios.service';
import { AutorizacionService } from '../../../../services/auth/autorizacion.service';
import { IUsuario, IRol, IPuesto } from '../../../../interfaces/auth';
import { IPagination } from '../../../../interfaces/shared';
import { UpsertUsuarioComponent } from '../../components/upsert-usuario/upsert-usuario';
import { ModalAutorizacionComponent } from '../../components/modal-autorizacion/modal-autorizacion';
import { RolService } from '../../../../services/auth/rol.service';
import { PuestoService } from '../../../../services/auth/puesto.service';
import { SucursalService } from '../../../../services/auth/sucursal.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ISucursal } from '../../../../interfaces/auth';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';

const emptyUsuario: IUsuario = {
  id: '',
  nombreCompleto: '',
  nombre1: '',
  apellido1: '',
  userName: '',
  clave: '',
  correo: '',
  lastPasswordUpdate: new Date(),
  activo: true,
  rolId: '',
  puestoId: '',
  sucursalId: '',
  created_at: new Date(),
};

@Component({
  selector: 'app-usuarios-page',
  imports: [RouterLink, FormsModule, PaginationComponent, UpsertUsuarioComponent, CustomIconComponent, ModalAutorizacionComponent],
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsuariosPageComponent {
  usuariosService = inject(UsuariosService);
  rolService = inject(RolService);
  puestoService = inject(PuestoService);
  sucursalService = inject(SucursalService);
  private authService = inject(AuthService);
  autorizacionService = inject(AutorizacionService);

  esAdmin = computed(() => this.authService.user()?.rol?.esAdmin ?? false);

  usuariosList = signal<IUsuario[]>([]);
  rolesList = signal<IRol[]>([]);
  puestosList = signal<IPuesto[]>([]);
  sucursalesList = signal<ISucursal[]>([]);

  pagination = signal<IPagination>({ page: 1, pageSize: 10, totalItems: 0 });
  isLoading = signal(false);
  buscador = signal('');

  nuevoUsuario = signal(true);
  usuarioEdit = signal<IUsuario>({ ...emptyUsuario });
  guardando = signal(false);

  formKey = signal(Date.now());
  modal = signal({ titulo: 'Crear Usuario', visible: false });

  modalResetClave = signal(false);
  resetClaveUsuario = signal<IUsuario | null>(null);
  resetClaveValor = signal('');
  guardandoReset = signal(false);

  @ViewChild('upsertModal', { static: true }) upsertModal!: ElementRef<HTMLDivElement>;
  @ViewChild('deleteModal', { static: true }) deleteModal!: ElementRef<HTMLDivElement>;

  async ngOnInit() {
    await this.fetchRolesYPuestos();
    this.fetchData();
  }

  ngAfterViewInit() {
    this.initializePreline();
  }

  private initializePreline() {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      setTimeout(() => (window as any).HSStaticMethods.autoInit(), 100);
    }
  }

  async fetchRolesYPuestos() {
    const [rolesResp, puestosResp, sucursalesResp] = await Promise.all([
      this.rolService.getRoles({ all: true }),
      this.puestoService.getPuestos({ all: true }),
      this.sucursalService.getSucursales({ limit: 200 })
    ]);
    if (rolesResp?.success) this.rolesList.set(rolesResp.data || []);
    if (puestosResp?.success) this.puestosList.set(puestosResp.data || []);
    if (sucursalesResp?.success) this.sucursalesList.set(sucursalesResp.data || []);
  }

  async fetchData() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    const resp = await this.usuariosService.getUsuarios({
      page: this.pagination().page,
      limit: this.pagination().pageSize,
      busqueda: this.buscador()
    });
    if (resp?.success) {
      this.usuariosList.set(resp.data || []);
      if (resp.metadata) {
        this.pagination.update(p => ({ ...p, totalItems: resp.metadata?.total || 0 }));
      }
      setTimeout(() => (window as any).HSStaticMethods?.autoInit(), 100);
    }
    this.isLoading.set(false);
  }

  onSearch(term: string) {
    this.buscador.set(term);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.fetchData();
  }

  onChangePage(newPagination: IPagination) {
    this.usuariosList.set([]);
    this.pagination.set(newPagination);
    this.fetchData();
  }

  openUpsertModal(nuevo: boolean, usuario: IUsuario = emptyUsuario) {
    this.formKey.set(Date.now());
    this.nuevoUsuario.set(nuevo);
    this.usuarioEdit.set({ ...usuario });
    this.modal.update(m => ({ ...m, titulo: nuevo ? 'Crear Usuario' : 'Editar Usuario', visible: true }));

    const modalEl = this.upsertModal.nativeElement;
    if ((window as any).HSOverlay) new (window as any).HSOverlay(modalEl).open();
    else {
      modalEl.classList.remove('hidden');
      modalEl.classList.add('pointer-events-auto');
    }
  }

  openDeleteModal(usuario: IUsuario) {
    this.usuarioEdit.set({ ...usuario });
    const modalEl = this.deleteModal.nativeElement;
    if ((window as any).HSOverlay) new (window as any).HSOverlay(modalEl).open();
    else {
      modalEl.classList.remove('hidden');
      modalEl.classList.add('pointer-events-auto');
    }
  }

  closeModal() {
    const modalEl = this.upsertModal.nativeElement;
    const modalDEl = this.deleteModal.nativeElement;
    if ((window as any).HSOverlay) {
      (window as any).HSOverlay.close(modalEl);
      (window as any).HSOverlay.close(modalDEl);
    } else {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('open', 'pointer-events-auto');
      modalDEl.classList.add('hidden');
      modalDEl.classList.remove('open', 'pointer-events-auto');
    }
  }

  async upsertUsuario(usuario: IUsuario) {
    this.guardando.set(true);
    try {
      if (!usuario.id) await this.createUsuario(usuario);
      else await this.updateUsuario(usuario);
    } finally {
      this.guardando.set(false);
    }
  }

  async createUsuario(usuario: IUsuario) {
    const { id, created_at, updated_at, deleted_at, ...payload } = usuario;
    try {
      const resp = await this.usuariosService.createUsuario(payload as any);
      if (resp?.success) {
        const nuevoUsuario = resp.data;
        this.usuariosList.update(usuarios => [nuevoUsuario, ...usuarios]);
        this.pagination.update(p => ({ ...p, totalItems: p.totalItems + 1 }));
        this.closeModal();
        this.usuarioEdit.set({ ...emptyUsuario });
        this.nuevoUsuario.set(true);
      }
    } catch (error: any) {      
      if (error.status === 428) {        
        this.closeModal();
        // El backend puede no enviar requiresAuth/permisoId/permisoCodigo
        // Detectamos 428 solo por status code
        const datos428 = error.error?.requiresAuth
          ? error.error
          : { requiresAuth: true, permisoId: error.error?.permisoId || '', permisoCodigo: error.error?.permisoCodigo || '' };        
        this.autorizacionService.ejecutarConCallbacks(
          { endpoint: 'auth/usuarios', metodoHttp: 'POST', body: payload },
          {
            onSuccess: () => {
              this.fetchData();
              this.usuarioEdit.set({ ...emptyUsuario });
              this.nuevoUsuario.set(true);
            }
          },
          datos428
        );        
      }
    }
  }

  async updateUsuario(usuario: IUsuario) {
    try {
      const resp = await this.usuariosService.updateUsuario(usuario);
      if (resp?.success) {
        const usuarioActualizado = resp.data;
        this.usuariosList.update(usuarios =>
          usuarios.map(u => u.id === usuarioActualizado.id ? usuarioActualizado : u)
        );
        this.closeModal();
      }
    } catch (error: any) {
      if (error.status === 428) {
        this.closeModal();
        const datos428 = error.error?.requiresAuth
          ? error.error
          : { requiresAuth: true, permisoId: error.error?.permisoId || '', permisoCodigo: error.error?.permisoCodigo || '' };
        this.autorizacionService.ejecutarConCallbacks(
          { endpoint: 'auth/usuarios', metodoHttp: 'PUT', body: usuario, params: { id: usuario.id! } },
          {
            onSuccess: () => {
              this.fetchData();
            }
          },
          datos428
        );
      }
    }
  }

  async deleteUsuario(usuario: IUsuario) {
    try {
      const resp = await this.usuariosService.deleteUsuario(usuario.id || '');
      if (resp?.success) {
        this.fetchData();
        this.closeModal();
        this.usuarioEdit.set({ ...emptyUsuario });
        this.nuevoUsuario.set(true);
      }
    } catch (error: any) {
      if (error.status === 428) {
        this.closeModal();
        const datos428 = error.error?.requiresAuth
          ? error.error
          : { requiresAuth: true, permisoId: error.error?.permisoId || '', permisoCodigo: error.error?.permisoCodigo || '' };
        this.autorizacionService.ejecutarConCallbacks(
          { endpoint: 'auth/usuarios', metodoHttp: 'DELETE', params: { id: usuario.id! } },
          {
            onSuccess: () => {
              this.fetchData();
              this.usuarioEdit.set({ ...emptyUsuario });
              this.nuevoUsuario.set(true);
            }
          },
          datos428
        );
      }
    }
  }

  // Helpers para el template (evitar arrow functions en expresiones)
  getRolName(rolId: string): string {
    const r = (this.rolesList() || []).find(r => r.id === rolId);
    return r?.nombre ?? '-';
  }

  getPuestoName(puestoId?: string | null): string {
    if (!puestoId) return '-';
    const p = (this.puestosList() || []).find(p => p.id === puestoId);
    return p?.nombre ?? '-';
  }

  openResetClaveModal(u: IUsuario) {
    this.resetClaveUsuario.set(u);
    this.resetClaveValor.set('');
    this.modalResetClave.set(true);
  }

  async confirmarResetClave() {
    const u = this.resetClaveUsuario();
    const clave = this.resetClaveValor();
    if (!u?.id || clave.length < 4 || this.guardandoReset()) return;
    this.guardandoReset.set(true);
    const resp = await this.usuariosService.resetClave(u.id, clave);
    if (resp?.success) {
      this.modalResetClave.set(false);
      this.resetClaveUsuario.set(null);
      this.resetClaveValor.set('');
    }
    this.guardandoReset.set(false);
  }

  async toggleStatus(usuario: IUsuario, status: boolean) {
    const updatedUsuario: IUsuario = {
      ...usuario,
      activo: status
    };
    this.updateUsuario(updatedUsuario);
  }
}
