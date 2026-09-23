import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ModalAutorizacionComponent } from '../../components/modal-autorizacion/modal-autorizacion';
import { UsuariosService } from '../../../../services/auth/usuarios.service';
import { PermisoService } from '../../../../services/auth/permiso.service';
import { PermisoRolService } from '../../../../services/auth/permiso-rol.service';
import { PermisoUsuarioService } from '../../../../services/auth/permiso-usuario.service';
import { AutorizacionService } from '../../../../services/auth/autorizacion.service';
import {
  EstadoPermisoUsuario,
  IPermiso,
  IPermisoMatrizUsuario,
  IUsuario,
} from '../../../../interfaces/auth';
import { IPagination } from '../../../../interfaces/shared';

/** Contexto HTTP que se reintenta vía POST /auth/usuarios/ejecutar-con-autorizacion. */
interface Contexto428 {
  metodoHttp: 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string>;
}

/**
 * PermisosUsuarioPage — Asignación de permisos a usuarios (excepciones).
 *
 * Mismo UX que permisos-rol-page, pero orientado a usuarios:
 *  - Autocomplete de usuario.
 *  - Matriz de permisos (catálogo) con 3 estados por fila:
 *      heredado  → sin excepción, manda el rol
 *      permitido → excepción que CONCEDE el permiso
 *      denegado  → excepción que NIEGA el permiso
 *  - Escritura vía POST/PUT/DELETE /auth/permisos/usuario con flujo 428
 *    (modal de auth_code del supervisor) para creación/edición/eliminación.
 */
@Component({
  selector: 'app-permisos-usuario-page',
  imports: [RouterLink, CustomIconComponent, PaginationComponent, ModalAutorizacionComponent],
  templateUrl: './permisos-usuario-page.html',
  styleUrl: './permisos-usuario-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PermisosUsuarioPageComponent {
  private usuariosService = inject(UsuariosService);
  private permisoService = inject(PermisoService);
  private permisoRolService = inject(PermisoRolService);
  private permisoUsuarioService = inject(PermisoUsuarioService);
  /** Público: el template del modal de autorización lee sus signals. */
  autorizacionService = inject(AutorizacionService);

  // --- Usuarios / autocomplete ---
  usuariosList = signal<IUsuario[]>([]);
  usuarioQuery = signal('');
  showUsuarioDropdown = signal(false);
  selectedUsuario = signal<IUsuario | null>(null);

  filteredUsuarios = computed(() => {
    const q = this.usuarioQuery().trim().toLowerCase();
    const usuarios = this.usuariosList();
    if (!q) return usuarios;
    return usuarios.filter(u =>
      (u.nombreCompleto || '').toLowerCase().includes(q) ||
      (u.userName || '').toLowerCase().includes(q)
    );
  });

  // --- Catálogo y matriz de permisos ---
  catalogo = signal<IPermiso[]>([]);
  matriz = signal<IPermisoMatrizUsuario[]>([]);
  isLoading = signal(false);
  // permisoIds que están guardando un cambio (para deshabilitar su control)
  saving = signal<Set<string>>(new Set());

  // --- Filtros (client-side sobre la matriz completa) ---
  fCodigo = signal('');
  fModulo = signal('');
  fAccion = signal('');

  pagination = signal<IPagination>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });

  /** Filtrado local por código / módulo / acción. */
  matrizFiltrada = computed(() => {
    const codigo = this.fCodigo().trim().toLowerCase();
    const modulo = this.fModulo().trim().toLowerCase();
    const accion = this.fAccion().trim().toLowerCase();
    return this.matriz().filter(p =>
      (!codigo || (p.codigo || '').toLowerCase().includes(codigo)) &&
      (!modulo || (p.modulo || '').toLowerCase().includes(modulo)) &&
      (!accion || (p.accion || '').toLowerCase().includes(accion))
    );
  });

  /** Paginación local (totalItems derivado del filtrado). */
  paginationVista = computed<IPagination>(() => {
    const p = this.pagination();
    const total = this.matrizFiltrada().length;
    const totalPages = Math.max(1, Math.ceil(total / p.pageSize));
    const page = Math.min(p.page, totalPages);
    return { ...p, page, totalItems: total, totalPages };
  });

  /** Registros de la página actual. */
  matrizPaginada = computed(() => {
    const p = this.paginationVista();
    const start = (p.page - 1) * p.pageSize;
    return this.matrizFiltrada().slice(start, start + p.pageSize);
  });

  async ngOnInit() {
    const [usuariosResp, catalogoResp] = await Promise.all([
      this.usuariosService.getUsuarios({ all: true, limit: 1000 }),
      this.permisoService.getPermisos({ all: true }),
    ]);

    if (usuariosResp?.success) {
      this.usuariosList.set(usuariosResp.data || []);
    }
    if (catalogoResp?.success) {
      this.catalogo.set(catalogoResp.data || []);
    }
  }

  // ---------- Autocomplete de usuario ----------
  onUsuarioFocus() {
    this.showUsuarioDropdown.set(true);
  }

  onUsuarioBlur() {
    // Pequeño retraso para permitir el click sobre una opción antes de ocultar
    setTimeout(() => this.showUsuarioDropdown.set(false), 150);
  }

  onUsuarioInput(value: string) {
    this.usuarioQuery.set(value);
    this.showUsuarioDropdown.set(true);
    // Si el texto deja de coincidir con el usuario seleccionado, limpiamos la matriz
    const sel = this.selectedUsuario();
    if (sel && this.nombreUsuario(sel) !== value) {
      this.limpiarSeleccion();
    }
  }

  selectUsuario(usuario: IUsuario) {
    this.selectedUsuario.set(usuario);
    this.usuarioQuery.set(this.nombreUsuario(usuario));
    this.showUsuarioDropdown.set(false);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.fetchMatriz();
  }

  clearUsuario() {
    this.limpiarSeleccion();
  }

  private limpiarSeleccion() {
    this.selectedUsuario.set(null);
    this.usuarioQuery.set('');
    this.matriz.set([]);
    this.saving.set(new Set());
    this.pagination.update(p => ({ ...p, page: 1, totalItems: 0 }));
  }

  /** Nombre completo del usuario para el input del autocomplete. */
  nombreUsuario(usuario: IUsuario | null): string {
    if (!usuario) return '';
    return (
      usuario.nombreCompleto ||
      [usuario.nombre1, usuario.apellido1].filter(Boolean).join(' ') ||
      usuario.userName ||
      ''
    );
  }

  // ---------- Matriz de permisos del usuario ----------
  /**
   * Construye la matriz cruzando:
   *  1. Catálogo de permisos (GET /auth/permisos)
   *  2. Excepciones directas del usuario (GET /auth/permisos/usuario?usuarioId=)
   *  3. Matriz del rol del usuario (GET /auth/permisos/rol/matriz?rolId=)
   */
  async fetchMatriz() {
    const usuario = this.selectedUsuario();
    if (!usuario?.id || this.isLoading()) return;

    this.isLoading.set(true);

    // El catálogo se carga una sola vez; si aún no está, lo trae ahora.
    if (this.catalogo().length === 0) {
      const catResp = await this.permisoService.getPermisos({ all: true });
      if (catResp?.success) {
        this.catalogo.set(catResp.data || []);
      }
    }

    const [asigResp, rolResp] = await Promise.all([
      this.permisoUsuarioService.getPermisosUsuario({ usuarioId: usuario.id, all: true }),
      usuario.rolId
        ? this.permisoRolService.getMatriz({ rolId: usuario.rolId, all: true })
        : Promise.resolve(null),
    ]);

    const excepciones = new Map(
      (asigResp?.data || []).filter(a => a.permisoId).map(a => [a.permisoId, a])
    );
    const delRol = new Map(
      (rolResp?.data || []).filter(p => p.id).map(p => [p.id!, p.asignado])
    );

    this.matriz.set(
      this.catalogo().map(p => {
        const excepcion = p.id ? excepciones.get(p.id) : undefined;
        const estado: EstadoPermisoUsuario = !excepcion
          ? 'heredado'
          : excepcion.permitido === false
            ? 'denegado'
            : 'permitido';
        const heredadoRol = (p.id ? delRol.get(p.id) : undefined) ?? false;

        return {
          ...p,
          estado,
          heredadoRol,
          efectivo: estado === 'heredado' ? heredadoRol : estado === 'permitido',
        };
      })
    );

    this.isLoading.set(false);
  }

  onSearch() {
    this.pagination.update(p => ({ ...p, page: 1 }));
  }

  onChangePage(newPagination: IPagination) {
    // La paginación es local: solo cambia el slice mostrado, sin volver a llamar al API.
    this.pagination.set({ ...newPagination });
  }

  isSaving(permisoId: string): boolean {
    return this.saving().has(permisoId);
  }

  private setSaving(permisoId: string, value: boolean) {
    this.saving.update(set => {
      const next = new Set(set);
      if (value) next.add(permisoId);
      else next.delete(permisoId);
      return next;
    });
  }

  /**
   * Cambia el estado de excepción de un permiso para el usuario seleccionado:
   *  - heredado → permitido/denegado : POST  (crear excepción)
   *  - permitido/denegado → heredado : DELETE (revocar, vuelve a heredar del rol)
   *  - permitido ↔ denegado          : PUT   (actualizar excepción)
   *
   * Actualización optimista con revert; si el backend responde 428 se abre el
   * modal de autorización (PIN del supervisor) y, al confirmar, se resincroniza.
   */
  async onEstadoChange(
    permiso: IPermisoMatrizUsuario,
    nuevoEstado: EstadoPermisoUsuario
  ) {
    const usuario = this.selectedUsuario();
    const permisoId = permiso.id;
    if (!usuario?.id || !permisoId) return;
    if (permiso.estado === nuevoEstado || this.isSaving(permisoId)) return;

    const anterior = permiso.estado;
    const usuarioId = usuario.id;
    const permitido = nuevoEstado === 'permitido';

    const esCreacion = anterior === 'heredado' && nuevoEstado !== 'heredado';
    const esRevocacion = anterior !== 'heredado' && nuevoEstado === 'heredado';

    const contexto: Contexto428 = esCreacion
      ? { metodoHttp: 'POST', body: { usuarioId, permisoId, permitido, autoriza: false } }
      : esRevocacion
        ? { metodoHttp: 'DELETE', params: { usuarioId, permisoId } }
        : {
            metodoHttp: 'PUT',
            body: { permitido, autoriza: false },
            params: { usuarioId, permisoId },
          };

    // Actualización optimista
    this.updateRow(permisoId, nuevoEstado);
    this.setSaving(permisoId, true);

    try {
      const resp = esCreacion
        ? await this.permisoUsuarioService.asignar(usuarioId, permisoId, permitido)
        : esRevocacion
          ? await this.permisoUsuarioService.revocar(usuarioId, permisoId)
          : await this.permisoUsuarioService.actualizar(usuarioId, permisoId, permitido);

      if (!resp?.success) {
        // Error no-428 (el service ya lo notificó por toastr): revertir.
        this.updateRow(permisoId, anterior);
      }
    } catch (error: any) {
      // La acción NO se ejecutó (428 u otro error lanzado): revertir siempre.
      this.updateRow(permisoId, anterior);

      // FLUJO 428: abrir modal de autorización para pedir el PIN del supervisor.
      if (this.autorizacionService.esError428(error)) {
        this.abrirModalAutorizacion(error, permisoId, contexto);
      }
    } finally {
      this.setSaving(permisoId, false);
    }
  }

  // ============================================================================
  // FLUJO 428 — AUTORIZACIÓN DINÁMICA (auth_code del supervisor)
  // ============================================================================

  /**
   * Toma el error 428 lanzado por PermisoUsuarioService (POST/PUT/DELETE) y
   * delega en AutorizacionService: guarda la petición pendiente y abre el
   * modal de auth_code. Al confirmar, el backend ejecuta la acción original
   * (vía /auth/usuarios/ejecutar-con-autorizacion) y se resincroniza la matriz.
   */
  private abrirModalAutorizacion(
    error: any,
    permisoId: string,
    contexto: Contexto428
  ): void {
    const datos428 = error.error?.requiresAuth
      ? error.error
      : {
          requiresAuth: true,
          permisoId: error.error?.permisoId || permisoId,
          permisoCodigo: error.error?.permisoCodigo || '',
        };

    this.autorizacionService.ejecutarConCallbacks(
      {
        endpoint: 'auth/permisos/usuario',
        metodoHttp: contexto.metodoHttp,
        body: contexto.body,
        params: contexto.params,
      },
      {
        // La autorización ejecutó la acción en backend: resincronizar la matriz.
        onSuccess: () => this.fetchMatriz(),
      },
      datos428
    );
  }

  /** Revierte/aplica el estado de la fila y su resultado efectivo. */
  private updateRow(permisoId: string, estado: EstadoPermisoUsuario) {
    this.matriz.update(rows =>
      rows.map(r =>
        r.id === permisoId
          ? {
              ...r,
              estado,
              efectivo: estado === 'heredado' ? r.heredadoRol : estado === 'permitido',
            }
          : r
      )
    );
  }
}
