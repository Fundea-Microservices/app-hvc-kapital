import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ModalAutorizacionComponent } from '../../components/modal-autorizacion/modal-autorizacion';
import { UsuariosService } from '../../../../services/auth/usuarios.service';
import { PermisoUsuarioService } from '../../../../services/auth/permiso-usuario.service';
import { AutorizacionService } from '../../../../services/auth/autorizacion.service';
import {
  FiltroOrigenMatriz,
  FILTRO_ORIGEN_MATRIZ_LABELS,
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
 * PermisosUsuarioPage — Asignación de permisos a usuarios.
 *
 * La matriz la devuelve el backend (GET /auth/permisos/usuario/matriz):
 *  - `asignado`: si el permiso es EFECTIVO para el usuario.
 *  - `origen`:   'ROL' (heredado) | 'USUARIO' (excepción directa) | 'NO_ASIGNADO'.
 *
 * La fila con origen 'ROL' muestra el switch BLOQUEADO: un permiso heredado del
 * rol no se puede asignar ni desasignar desde el usuario (el backend también lo
 * rechaza con 400: AUT-100-02 al crear / AUT-104-02 al retirar).
 *
 * Escritura vía POST/PUT/DELETE /auth/permisos/usuario con flujo 428
 * (modal de auth_code del supervisor) para creación/edición/eliminación.
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
  private permisoUsuarioService = inject(PermisoUsuarioService);
  private toastr = inject(ToastrService);
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

  // --- Matriz de permisos (la construye el backend) ---
  matriz = signal<IPermisoMatrizUsuario[]>([]);
  isLoading = signal(false);
  // permisoIds que están guardando un cambio (para deshabilitar su switch)
  saving = signal<Set<string>>(new Set());

  // --- Filtros (client-side sobre la matriz completa) ---
  fCodigo = signal('');
  fModulo = signal('');
  fAccion = signal('');
  // Filtro de ORIGEN: enum (no texto hardcodeado en el HTML)
  fOrigen = signal<FiltroOrigenMatriz>('todos');
  // Opciones pintadas en el <select> derivadas del enum + sus etiquetas
  readonly opcionesOrigen = (
    Object.keys(FILTRO_ORIGEN_MATRIZ_LABELS) as FiltroOrigenMatriz[]
  ).map(valor => ({ valor, etiqueta: FILTRO_ORIGEN_MATRIZ_LABELS[valor] }));

  pagination = signal<IPagination>({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });

  /** Filtrado local por origen / código / módulo / acción. */
  matrizFiltrada = computed(() => {
    const codigo = this.fCodigo().trim().toLowerCase();
    const modulo = this.fModulo().trim().toLowerCase();
    const accion = this.fAccion().trim().toLowerCase();
    const origen = this.fOrigen();
    return this.matriz().filter(p =>
      // Origen: 'todos' → sin filtro; ROL | USUARIO | NO_ASIGNADO → coincidencia exacta
      (origen === 'todos' || p.origen === origen) &&
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
    const usuariosResp = await this.usuariosService.getUsuarios({ all: true, limit: 1000 });
    if (usuariosResp?.success) {
      this.usuariosList.set(usuariosResp.data || []);
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
   * Carga la matriz desde el backend (GET /auth/permisos/usuario/matriz),
   * que devuelve cada permiso con `asignado` y `origen`.
   *
   * @param silencioso cuando es true no alterna el spinner (se usa para
   * resincronizar tras un cambio exitoso sin parpadear la tabla).
   */
  async fetchMatriz(silencioso = false) {
    const usuario = this.selectedUsuario();
    if (!usuario?.id) return;
    if (!silencioso && this.isLoading()) return;

    if (!silencioso) this.isLoading.set(true);

    const resp = await this.permisoUsuarioService.getMatriz({
      usuarioId: usuario.id,
      all: true,
    });

    if (resp?.success) {
      const data = resp.data || [];
      this.matriz.set(data);
      // El refetch silencioso (tras un toggle) conserva la página actual para
      // no sacar al usuario de donde estaba; una carga normal resetea a la 1.
      this.pagination.update(p => ({
        ...p,
        page: silencioso ? p.page : 1,
        totalItems: data.length,
      }));
    }

    if (!silencioso) this.isLoading.set(false);
  }

  onSearch() {
    this.pagination.update(p => ({ ...p, page: 1 }));
  }

  /** Cambio del select "Origen": actualiza el filtro y vuelve a la página 1. */
  onOrigenChange(valor: FiltroOrigenMatriz) {
    if (valor === this.fOrigen()) return;
    this.fOrigen.set(valor);
    this.onSearch();
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
   * Asigna o retira un permiso según el nuevo estado del switch.
   *
   *  origen 'ROL'         → BLOQUEADO (heredado del rol: ni asignable ni retirable).
   *  origen 'USUARIO'     → ya existe fila directa: encender = PUT (permitido=true),
   *                          apagar = DELETE (retira la excepción).
   *  origen 'NO_ASIGNADO' → encender = POST (crea la excepción).
   *
   * Actualización optimista con revert + resincronización silenciosa; si el
   * backend responde 428 se abre el modal de autorización (PIN del supervisor).
   */
  async toggleAsignado(permiso: IPermisoMatrizUsuario, asignar: boolean) {
    const usuario = this.selectedUsuario();
    const permisoId = permiso.id;
    if (!usuario?.id || !permisoId) return;
    if (permiso.asignado === asignar || this.isSaving(permisoId)) return;

    // BLINDAJE (defensa en profundidad): el switch está deshabilitado en la UI,
    // pero si llegase a dispararse, el backend lo rechazaría igualmente.
    if (permiso.origen === 'ROL') {
      this.toastr.error(
        'El usuario ya tiene asignado este permiso a través de su rol',
        'No permitido'
      );
      return;
    }

    const usuarioId = usuario.id;
    const existeFilaDirecta = permiso.origen === 'USUARIO';

    const contexto: Contexto428 = asignar
      ? existeFilaDirecta
        ? { metodoHttp: 'PUT', body: { permitido: true, autoriza: false }, params: { usuarioId, permisoId } }
        : { metodoHttp: 'POST', body: { usuarioId, permisoId, permitido: true, autoriza: false } }
      : { metodoHttp: 'DELETE', params: { usuarioId, permisoId } };

    // Actualización optimista
    this.updateRow(permisoId, asignar, asignar ? 'USUARIO' : 'NO_ASIGNADO');
    this.setSaving(permisoId, true);

    try {
      const resp = asignar
        ? existeFilaDirecta
          ? await this.permisoUsuarioService.actualizar(usuarioId, permisoId, true)
          : await this.permisoUsuarioService.asignar(usuarioId, permisoId, true)
        : await this.permisoUsuarioService.revocar(usuarioId, permisoId);

      if (resp?.success) {
        // El `origen` puede haber cambiado (p. ej. al retirar una fila legada
        // redundante el permiso vuelve a 'ROL'): resincroniza sin spinner.
        await this.fetchMatriz(true);
      } else {
        // Error no-428 (el service ya lo notificó por toastr): revertir.
        this.updateRow(permisoId, !asignar, permiso.origen);
      }
    } catch (error: any) {
      // La acción NO se ejecutó (428 u otro error lanzado): revertir siempre.
      this.updateRow(permisoId, !asignar, permiso.origen);

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

  /** Revierte/aplica el estado de la fila de forma optimista. */
  private updateRow(
    permisoId: string,
    asignado: boolean,
    origen: IPermisoMatrizUsuario['origen']
  ) {
    this.matriz.update(rows =>
      rows.map(r =>
        r.id === permisoId ? { ...r, asignado, origen } : r
      )
    );
  }
}
