import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { RolService } from '../../../../services/auth/rol.service';
import { PermisoRolService } from '../../../../services/auth/permiso-rol.service';
import { AutorizacionService } from '../../../../services/auth/autorizacion.service';
import { IRol, IPermisoMatriz, AsignacionMatrizEnum, ASIGNACION_MATRIZ_LABELS } from '../../../../interfaces/auth';
import { IPagination } from '../../../../interfaces/shared';
import { ModalAutorizacionComponent } from '../../components/modal-autorizacion/modal-autorizacion';

@Component({
  selector: 'app-permisos-rol-page',
  imports: [RouterLink, CustomIconComponent, PaginationComponent, ModalAutorizacionComponent],
  templateUrl: './permisos-rol-page.html',
  styleUrl: './permisos-rol-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PermisosRolPageComponent {
  private rolService = inject(RolService);
  private permisoRolService = inject(PermisoRolService);
  autorizacionService = inject(AutorizacionService);

  // --- Roles / autocomplete ---
  rolesList = signal<IRol[]>([]);
  rolQuery = signal('');
  showRolDropdown = signal(false);
  selectedRol = signal<IRol | null>(null);

  filteredRoles = computed(() => {
    const q = this.rolQuery().trim().toLowerCase();
    const roles = this.rolesList();
    if (!q) return roles;
    return roles.filter(r => r.nombre.toLowerCase().includes(q));
  });

  // --- Matriz de permisos ---
  matriz = signal<IPermisoMatriz[]>([]);
  isLoading = signal(false);
  // permisoIds que están guardando un cambio (para deshabilitar su switch)
  saving = signal<Set<string>>(new Set());

  // --- Filtros ---
  fCodigo = signal('');
  fModulo = signal('');
  fAccion = signal('');
  // Filtro de asignación: enum (no texto hardcodeado en el HTML)
  fAsignado = signal<AsignacionMatrizEnum>(AsignacionMatrizEnum.TODOS);
  // Opciones pintadas en el <select> derivadas del enum + sus etiquetas
  readonly opcionesAsignacion = (Object.values(AsignacionMatrizEnum) as AsignacionMatrizEnum[]).map(valor => ({
    valor,
    etiqueta: ASIGNACION_MATRIZ_LABELS[valor],
  }));

  pagination = signal<IPagination>({
    page: 1,
    pageSize: 10,
    totalItems: 0
  });

  async ngOnInit() {
    const resp = await this.rolService.getRoles({ all: true, limit: 1000 });
    if (resp?.success) {
      this.rolesList.set(resp.data || []);
    }
  }

  // ---------- Autocomplete de rol ----------
  onRolFocus() {
    this.showRolDropdown.set(true);
  }

  onRolBlur() {
    // Pequeño retraso para permitir el click sobre una opción antes de ocultar
    setTimeout(() => this.showRolDropdown.set(false), 150);
  }

  onRolInput(value: string) {
    this.rolQuery.set(value);
    this.showRolDropdown.set(true);
    // Si el texto deja de coincidir con el rol seleccionado, limpiamos la matriz
    const sel = this.selectedRol();
    if (sel && sel.nombre !== value) {
      this.selectedRol.set(null);
      this.matriz.set([]);
      this.pendienteFetch = false;
      this.pagination.update(p => ({ ...p, totalItems: 0 }));
    }
  }

  selectRol(rol: IRol) {
    this.limpiarTimerBusqueda();
    this.selectedRol.set(rol);
    this.rolQuery.set(rol.nombre);
    this.showRolDropdown.set(false);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.fetchMatriz();
  }

  clearRol() {
    this.selectedRol.set(null);
    this.rolQuery.set('');
    this.matriz.set([]);
    this.pendienteFetch = false;
    this.pagination.update(p => ({ ...p, page: 1, totalItems: 0 }));
  }

  // ---------- Matriz ----------
  async fetchMatriz() {
    const rol = this.selectedRol();
    if (!rol?.id) return;
    // Si ya hay una consulta en vuelo, marca pendiente y relanza al terminar
    // (evita que la última tecla escrita quede sin reflejar en la tabla)
    if (this.isLoading()) {
      this.pendienteFetch = true;
      return;
    }

    this.isLoading.set(true);
    const resp = await this.permisoRolService.getMatriz({
      rolId: rol.id,
      codigo: this.fCodigo(),
      modulo: this.fModulo(),
      accion: this.fAccion(),
      asignado: this.asignadoParam(),
      page: this.pagination().page,
      limit: this.pagination().pageSize,
    });

    if (resp?.success) {
      this.matriz.set(resp.data || []);
      if (resp.metadata) {
        this.pagination.update(p => ({ ...p, totalItems: resp.metadata?.total || 0 }));
      }
    }
    this.isLoading.set(false);

    if (this.pendienteFetch) {
      this.pendienteFetch = false;
      this.fetchMatriz();
    }
  }

  onSearch() {
    // Cancela cualquier búsqueda automática en espera y aplica de inmediato
    this.limpiarTimerBusqueda();
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.fetchMatriz();
  }

  // --- Filtros de texto: recarga automática (debounce) al escribir ---
  onCodigoInput(valor: string) {
    this.fCodigo.set(valor);
    this.buscarAutomatico();
  }

  onModuloInput(valor: string) {
    this.fModulo.set(valor);
    this.buscarAutomatico();
  }

  onAccionInput(valor: string) {
    this.fAccion.set(valor);
    this.buscarAutomatico();
  }

  /** Programa una recarga automática con debounce para no disparar una petición por tecla. */
  private buscarAutomatico() {
    this.limpiarTimerBusqueda();
    this.timerBusqueda = setTimeout(() => {
      this.timerBusqueda = null;
      this.onSearch();
    }, 200);
  }

  private limpiarTimerBusqueda() {
    if (this.timerBusqueda !== null) {
      clearTimeout(this.timerBusqueda);
      this.timerBusqueda = null;
    }
  }

  ngOnDestroy() {
    this.limpiarTimerBusqueda();
  }

  /** Cambio del select "Asignación": actualiza el filtro y recarga inmediatamente (page → 1, respeta pageSize). */
  onAsignadoChange(valor: AsignacionMatrizEnum) {
    if (valor === this.fAsignado()) return;
    this.fAsignado.set(valor);
    this.onSearch();
  }

  // Timer de la búsqueda automática (debounce) y marca de fetch en vuelo
  private timerBusqueda: ReturnType<typeof setTimeout> | null = null;
  private pendienteFetch = false;

  /** Mapea la opción del enum al query param `asignado`: true | false | undefined (undefined → se omite = Todos). */
  private asignadoParam(): boolean | undefined {
    const filtro = this.fAsignado();
    if (filtro === AsignacionMatrizEnum.ASIGNADOS) return true;
    if (filtro === AsignacionMatrizEnum.NO_ASIGNADOS) return false;
    return undefined;
  }

  onChangePage(newPagination: IPagination) {
    // El cambio de página ya consulta con los filtros actuales: cancela el debounce pendiente
    this.limpiarTimerBusqueda();
    this.matriz.set([]);
    this.pagination.set(newPagination);
    this.fetchMatriz();
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

  /** Asigna o retira el permiso según el nuevo estado del switch. */
  async togglePermiso(permiso: IPermisoMatriz, asignar: boolean) {
    const rol = this.selectedRol();
    if (!rol?.id || !permiso.id) return;
    const permisoId = permiso.id;

    // Actualización optimista
    this.updateRow(permisoId, asignar);
    this.setSaving(permisoId, true);

    try {
      const resp = asignar
        ? await this.permisoRolService.asignar(rol.id, permisoId)
        : await this.permisoRolService.retirar(rol.id, permisoId);

      if (!resp?.success) {
        this.updateRow(permisoId, !asignar);
      }
    } catch (error: any) {
      this.updateRow(permisoId, !asignar);
      this.autorizacionService.handleError428(error, {
        endpoint: 'auth/permisos/rol',
        metodoHttp: asignar ? 'POST' : 'DELETE',
        body: asignar ? { rolId: rol.id, permisoId } : undefined,
        params: asignar ? undefined : { rolId: rol.id, permisoId },
        onSuccess: () => this.fetchMatriz(),
      });
    } finally {
      this.setSaving(permisoId, false);
    }
  }

  private updateRow(permisoId: string, asignado: boolean) {
    this.matriz.update(rows =>
      rows.map(r => r.id === permisoId ? { ...r, asignado } : r)
    );
  }
}
