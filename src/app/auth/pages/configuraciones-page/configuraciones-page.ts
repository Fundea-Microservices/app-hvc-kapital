import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { IConfig, IRol, TipoConfiguracion, ROL_DEFAULT_CONFIG_KEY } from '../../../../interfaces/auth';
import { IConfigModulo, IConfigPolitica } from '../../../../interfaces/config';
import { IPagination } from '../../../../interfaces/shared';
import { ConfigService } from '../../../../services/auth/config.service';
import { ConfigModuloService } from '../../../../services/auth/config-modulo.service';
import { ConfigPoliticaService } from '../../../../services/auth/config-politica.service';
import { RolService } from '../../../../services/auth/rol.service';
import { AutorizacionService } from '../../../../services/auth/autorizacion.service';
import { UpsertConfigComponent } from '../../components/upsert-config/upsert-config';
import { ModalAutorizacionComponent } from '../../components/modal-autorizacion/modal-autorizacion';

const emptyConfig: IConfig = {
  id: '',
  llave: '',
  valor: '',
  tipo: TipoConfiguracion.STRING,
  descripcion: '',
  activo: true,
  created_at: new Date(),
};

@Component({
  selector: 'app-configuraciones-page',
  standalone: true,
  imports: [RouterLink, PaginationComponent, UpsertConfigComponent, CustomIconComponent, ModalAutorizacionComponent],
  templateUrl: './configuraciones-page.html',
  styleUrl: './configuraciones-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfiguracionesPageComponent {
  configService = inject(ConfigService);
  rolService = inject(RolService);
  private readonly moduloService = inject(ConfigModuloService);
  private readonly politicaService = inject(ConfigPoliticaService);
  autorizacionService = inject(AutorizacionService);

  configs = signal<IConfig[]>([]);
  roles = signal<IRol[]>([]);
  modulos = signal<IConfigModulo[]>([]);
  politicas = signal<IConfigPolitica[]>([]);

  isLoading = signal(false);
  buscador = signal('');
  /** Filtros en cascada Módulo → Política (locales sobre el listado completo). */
  filtroModuloId = signal('');
  filtroPoliticaId = signal('');
  pagination = signal<IPagination>({ page: 1, pageSize: 10, totalItems: 0 });

  nuevoConfig = signal(true);
  configEdit = signal<IConfig>({ ...emptyConfig });
  guardando = signal(false);
  formKey = signal(Date.now());
  modal = signal({ titulo: 'Crear Configuración', visible: false });

  /** Políticas disponibles en el filtro según el módulo seleccionado. */
  politicasFiltro = computed<IConfigPolitica[]>(() => {
    const moduloId = this.filtroModuloId();
    const lista = moduloId
      ? this.politicas().filter((p) => p.moduloId === moduloId)
      : this.politicas();
    return [...lista].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
  });

  @ViewChild('upsertModal', { static: true }) upsertModal!: ElementRef<HTMLDivElement>;
  @ViewChild('deleteModal', { static: true }) deleteModal!: ElementRef<HTMLDivElement>;

  async ngOnInit() {
    await Promise.all([this.fetchRoles(), this.fetchCatalogos(), this.fetchData()]);
  }

  private async fetchRoles() {
    const resp = await this.rolService.getRoles({ all: true });
    if (resp?.success) this.roles.set(resp.data || []);
  }

  /** Módulos y políticas se cargan completos para filtros, columnas y selects. */
  private async fetchCatalogos() {
    const [mods, pols] = await Promise.all([
      this.moduloService.getModulos({ todos: true }),
      this.politicaService.getPoliticas({ todos: true }),
    ]);
    if (mods?.success) this.modulos.set(mods.data || []);
    if (pols?.success) this.politicas.set(pols.data || []);
  }

  /**
   * Visualización de la columna Valor. No muta cfg.valor:
   * para ROL_DEFAULT_ID muestra el nombre del rol cuyo UUID está guardado.
   */
  displayValor(cfg: IConfig): string {
    if (cfg.llave !== ROL_DEFAULT_CONFIG_KEY) return cfg.valor;
    const uuid = (cfg.valor || '').trim();
    if (!uuid) return cfg.valor;
    const rol = (this.roles() || []).find(r => r.id === uuid || r.rolId === uuid);
    return rol?.nombre || cfg.valor;
  }

  ngAfterViewInit() {
    this.initializePreline();
  }

  private initializePreline() {
    if (typeof window !== 'undefined' && (window as any).HSStaticMethods) {
      setTimeout(() => (window as any).HSStaticMethods.autoInit(), 100);
    }
  }

  // ── Resolución de módulo / política del parámetro ─────────────────────

  politicaDeConfig(cfg: IConfig): string {
    return cfg.politicaId || cfg.politica?.id || '';
  }

  moduloDeConfig(cfg: IConfig): string {
    if (cfg.politica?.moduloId) return cfg.politica.moduloId;
    return this.moduloIdDePolitica(this.politicaDeConfig(cfg));
  }

  nombreModulo(moduloId: string): string {
    if (!moduloId) return '—';
    return this.modulos().find((m) => m.id === moduloId)?.nombre || '—';
  }

  nombrePolitica(politicaId: string): string {
    if (!politicaId) return '—';
    return this.politicas().find((p) => p.id === politicaId)?.nombre || '—';
  }

  private moduloIdDePolitica(politicaId: string): string {
    if (!politicaId) return '';
    return this.politicas().find((p) => p.id === politicaId)?.moduloId || '';
  }

  private normalize(t: string): string { return (t || '').toLowerCase(); }

  private filter(list: IConfig[], term: string): IConfig[] {
    const q = this.normalize(term);
    const moduloId = this.filtroModuloId();
    const politicaId = this.filtroPoliticaId();

    return (list || []).filter(c => {
      const polId = this.politicaDeConfig(c);
      const modId = this.moduloDeConfig(c);

      if (moduloId && modId !== moduloId) return false;
      if (politicaId && polId !== politicaId) return false;
      if (!q) return true;

      return this.normalize(c.llave).includes(q) ||
        this.normalize(c.descripcion || '').includes(q) ||
        this.normalize(c.tipo || '').includes(q) ||
        this.normalize(this.nombreModulo(modId)).includes(q) ||
        this.normalize(this.nombrePolitica(polId)).includes(q);
    });
  }

  async fetchData() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    const resp = await this.configService.getConfigs({ all: true });
    if (resp?.success) {
      const data = resp.data || [];
      this.configs.set(data);
      this.updatePaginationTotals();
      setTimeout(() => (window as any).HSStaticMethods?.autoInit(), 100);
    }
    this.isLoading.set(false);
  }

  getPageSlice(): IConfig[] {
    const filtered = this.filter(this.configs(), this.buscador());
    const { page, pageSize } = this.pagination();
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }

  private updatePaginationTotals() {
    const total = this.filter(this.configs(), this.buscador()).length;
    this.pagination.update(p => ({ ...p, totalItems: total }));
  }

  onSearch(term: string) {
    this.buscador.set(term);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.updatePaginationTotals();
  }

  /** Al cambiar de módulo se descarta la política si no pertenece al destino. */
  onFiltroModulo(moduloId: string) {
    this.filtroModuloId.set(moduloId);
    const politicaActual = this.filtroPoliticaId();
    if (politicaActual && !this.politicasFiltro().some((p) => p.id === politicaActual)) {
      this.filtroPoliticaId.set('');
    }
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.updatePaginationTotals();
  }

  onFiltroPolitica(politicaId: string) {
    this.filtroPoliticaId.set(politicaId);
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.updatePaginationTotals();
  }

  /** Restablece módulo, política y búsqueda. */
  limpiarFiltros() {
    this.buscador.set('');
    this.filtroModuloId.set('');
    this.filtroPoliticaId.set('');
    this.pagination.update(p => ({ ...p, page: 1 }));
    this.updatePaginationTotals();
  }

  onChangePage(p: IPagination) {
    this.pagination.set(p);
  }

  openUpsertModal(nuevo: boolean, cfg: IConfig = emptyConfig) {
    this.formKey.set(Date.now());
    this.nuevoConfig.set(nuevo);
    this.configEdit.set({ ...cfg });
    this.modal.update(m => ({ ...m, titulo: nuevo ? 'Crear Configuración' : 'Editar Configuración', visible: true }));

    const modalEl = this.upsertModal.nativeElement;
    if ((window as any).HSOverlay) new (window as any).HSOverlay(modalEl).open();
    else {
      modalEl.classList.remove('hidden');
      modalEl.classList.add('pointer-events-auto');
    }
  }

  openCreate() { this.openUpsertModal(true, { ...emptyConfig }); }

  openDeleteModal(cfg: IConfig) {
    this.configEdit.set({ ...cfg });
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

  async upsertConfig(cfg: IConfig) {
    this.guardando.set(true);
    try {
      if (!cfg.id) await this.createConfig(cfg);
      else await this.updateConfig(cfg);
    } finally {
      this.guardando.set(false);
    }
  }

  async createConfig(cfg: IConfig) {
    const payload = this.buildPayload(cfg);
    const datos428 = (error: any) => error.error?.requiresAuth
      ? error.error
      : { requiresAuth: true, permisoId: error.error?.permisoId || '', permisoCodigo: error.error?.permisoCodigo || '' };

    try {
      const resp = await this.configService.createConfig(payload);
      if (resp?.success) {
        const nuevaConfig = resp.data;
        this.configs.update(configs => [nuevaConfig, ...configs]);
        this.updatePaginationTotals();
        this.closeModal();
        this.configEdit.set({ ...emptyConfig });
        this.nuevoConfig.set(true);
      }
    } catch (error: any) {
      if (error.status === 428) {
        this.closeModal();
        this.autorizacionService.ejecutarConCallbacks(
          { endpoint: 'auth/config', metodoHttp: 'POST', body: payload },
          { onSuccess: () => this.fetchData() },
          datos428(error)
        );
      }
    }
  }

  async updateConfig(cfg: IConfig) {
    const actual = this.configs().find(c => c.id === cfg.id);
    const politicaAnterior = actual ? this.politicaDeConfig(actual) : this.politicaDeConfig(this.configEdit());
    const politicaNueva = this.politicaDeConfig(cfg);

    const payload: Record<string, any> = {
      llave: cfg.llave,
      tipo: cfg.tipo,
      valor: cfg.valor,
      descripcion: cfg.descripcion,
      activo: cfg.activo,
    };
    // Solo se envía la política cuando cambia: el backend rechaza asignar una inactiva.
    if (politicaNueva && politicaNueva !== politicaAnterior) {
      payload['politicaId'] = politicaNueva;
    }

    const datos428 = (error: any) => error.error?.requiresAuth
      ? error.error
      : { requiresAuth: true, permisoId: error.error?.permisoId || '', permisoCodigo: error.error?.permisoCodigo || '' };

    try {
      const resp = await this.configService.updateConfig(cfg.id || '', payload);
      if (resp?.success) {
        const actualizada: IConfig = {
          ...resp.data,
          politicaId: resp.data.politicaId || payload['politicaId'] || politicaAnterior || undefined,
        };
        if (payload['politicaId']) actualizada.politica = null;

        this.configs.update(configs =>
          configs.map(c => c.id === actualizada.id ? actualizada : c)
        );
        this.updatePaginationTotals();
        this.closeModal();
      }
    } catch (error: any) {
      if (error.status === 428) {
        this.closeModal();
        this.autorizacionService.ejecutarConCallbacks(
          { endpoint: 'auth/config', metodoHttp: 'PATCH', body: payload, params: { id: cfg.id! } },
          { onSuccess: () => this.fetchData() },
          datos428(error)
        );
      }
    }
  }

  async deleteConfig(cfg: IConfig) {
    const datos428 = (error: any) => error.error?.requiresAuth
      ? error.error
      : { requiresAuth: true, permisoId: error.error?.permisoId || '', permisoCodigo: error.error?.permisoCodigo || '' };

    try {
      const resp = await this.configService.deleteConfig(cfg.id || '');
      if (resp?.success) {
        await this.fetchData();
        this.closeModal();
        this.configEdit.set({ ...emptyConfig });
        this.nuevoConfig.set(true);
      }
    } catch (error: any) {
      if (error.status === 428) {
        this.closeModal();
        this.autorizacionService.ejecutarConCallbacks(
          { endpoint: 'auth/config', metodoHttp: 'DELETE', params: { id: cfg.id! } },
          { onSuccess: () => { this.fetchData(); this.configEdit.set({ ...emptyConfig }); this.nuevoConfig.set(true); } },
          datos428(error)
        );
      }
    }
  }

  onToggleActivo(cfg: IConfig, activo: boolean) {
    const updated: IConfig = { ...cfg, activo } as IConfig;
    this.updateConfig(updated);
  }

  /** Payload limpio: solo campos aceptados por el backend (sin relaciones ni auditoría). */
  private buildPayload(cfg: IConfig): any {
    return {
      llave: cfg.llave,
      tipo: cfg.tipo,
      valor: cfg.valor,
      descripcion: cfg.descripcion,
      activo: cfg.activo,
      politicaId: this.politicaDeConfig(cfg),
    };
  }
}
