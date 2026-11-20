import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { ModalAutorizacionComponent } from '../../../auth/components/modal-autorizacion/modal-autorizacion';
import { UpsertConfigModuloComponent } from '../../components/upsert-config-modulo/upsert-config-modulo';
import { UpsertConfigPoliticaComponent } from '../../components/upsert-config-politica/upsert-config-politica';
import {
  ConfigModuloPayload,
  ConfigPoliticaPayload,
  IConfigModulo,
  IConfigPolitica,
} from '../../../../interfaces/config';
import { ConfigModuloService } from '../../../../services/auth/config-modulo.service';
import { ConfigPoliticaService } from '../../../../services/auth/config-politica.service';
import { AutorizacionService } from '../../../../services/auth/autorizacion.service';

@Component({
  selector: 'app-modulos-politicas-page',
  standalone: true,
  imports: [
    RouterLink,
    CustomIconComponent,
    UpsertConfigModuloComponent,
    UpsertConfigPoliticaComponent,
    ModalAutorizacionComponent,
  ],
  templateUrl: './modulos-politicas-page.html',
  styleUrl: './modulos-politicas-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ModulosPoliticasPageComponent implements OnInit {
  private readonly moduloService = inject(ConfigModuloService);
  private readonly politicaService = inject(ConfigPoliticaService);
  readonly autorizacionService = inject(AutorizacionService);

  modulos = signal<IConfigModulo[]>([]);
  politicas = signal<IConfigPolitica[]>([]);
  moduloSeleccionadoId = signal<string>('');

  busquedaModulos = signal('');
  busquedaPoliticas = signal('');

  isLoadingModulos = signal(true);
  isLoadingPoliticas = signal(true);

  // ── CRUD de módulos (Paso 2) ──────────────────────────────────────────
  moduloEdit = signal<IConfigModulo | null>(null);
  nuevoModulo = signal(true);
  guardandoModulo = signal(false);
  formKeyModulo = signal(0);

  tituloModalModulo = computed(() =>
    this.nuevoModulo() ? 'Nuevo módulo' : 'Editar módulo'
  );

  ordenSugerido = computed(() => {
    const ordenes = this.modulos().map((m) => m.orden);
    return (ordenes.length ? Math.max(...ordenes) : 0) + 1;
  });

  // ── CRUD de políticas (Paso 3) ────────────────────────────────────────
  politicaEdit = signal<IConfigPolitica | null>(null);
  nuevaPolitica = signal(true);
  guardandoPolitica = signal(false);
  formKeyPolitica = signal(0);

  tituloModalPolitica = computed(() =>
    this.nuevaPolitica() ? 'Nueva política' : 'Editar política'
  );

  // ── Reordenamiento (Paso 4) ───────────────────────────────────────────
  reordenandoModulo = signal(false);
  reordenandoPolitica = signal(false);
  dragModuloId = signal<string | null>(null);
  dragPoliticaId = signal<string | null>(null);
  moduloDropId = signal<string | null>(null);
  politicaDropId = signal<string | null>(null);

  /**
   * El reordenamiento solo se permite sobre la lista completa: con un filtro
   * activo el destino visible no coincide con el orden real del backend.
   */
  reorderModulosBloqueado = computed(() => this.busquedaModulos().trim().length > 0);
  reorderPoliticasBloqueado = computed(() => this.busquedaPoliticas().trim().length > 0);

  @ViewChild('upsertModuloModal', { static: true })
  upsertModuloModal!: ElementRef<HTMLDivElement>;

  @ViewChild('deleteModuloModal', { static: true })
  deleteModuloModal!: ElementRef<HTMLDivElement>;

  @ViewChild('upsertPoliticaModal', { static: true })
  upsertPoliticaModal!: ElementRef<HTMLDivElement>;

  @ViewChild('deletePoliticaModal', { static: true })
  deletePoliticaModal!: ElementRef<HTMLDivElement>;

  moduloSeleccionado = computed<IConfigModulo | null>(() => {
    const id = this.moduloSeleccionadoId();
    return this.modulos().find((m) => m.id === id) ?? null;
  });

  modulosOrdenados = computed<IConfigModulo[]>(() =>
    [...this.modulos()].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
  );

  modulosFiltrados = computed<IConfigModulo[]>(() => {
    const term = this.normalize(this.busquedaModulos());
    return this.modulosOrdenados()
      .filter((m) => !term
        || this.normalize(m.codigo).includes(term)
        || this.normalize(m.nombre).includes(term)
        || this.normalize(m.descripcion ?? '').includes(term));
  });

  politicasDelModulo = computed<IConfigPolitica[]>(() => {
    const moduloId = this.moduloSeleccionadoId();
    if (!moduloId) return [];
    return this.politicas()
      .filter((p) => p.moduloId === moduloId)
      .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
  });

  politicasFiltradas = computed<IConfigPolitica[]>(() => {
    const term = this.normalize(this.busquedaPoliticas());
    const lista = this.politicasDelModulo();
    if (!term) return lista;
    return lista.filter((p) =>
      this.normalize(p.codigo).includes(term)
      || this.normalize(p.nombre).includes(term)
      || this.normalize(p.descripcion ?? '').includes(term)
    );
  });

  async ngOnInit(): Promise<void> {
    await this.cargarTodo();
  }

  async cargarTodo(): Promise<void> {
    await Promise.all([this.cargarModulos(), this.cargarPoliticas()]);
    this.asegurarSeleccionValida();
  }

  /** Carga independiente: un panel no queda bloqueado por el otro. */
  private async cargarModulos(): Promise<void> {
    this.isLoadingModulos.set(true);
    try {
      const resp = await this.moduloService.getModulos({ todos: true });
      if (resp?.success) this.modulos.set(resp.data ?? []);
    } finally {
      this.isLoadingModulos.set(false);
    }
  }

  private async cargarPoliticas(): Promise<void> {
    this.isLoadingPoliticas.set(true);
    try {
      const resp = await this.politicaService.getPoliticas({ todos: true });
      if (resp?.success) this.politicas.set(resp.data ?? []);
    } finally {
      this.isLoadingPoliticas.set(false);
    }
  }

  private asegurarSeleccionValida(): void {
    const actual = this.moduloSeleccionadoId();
    const lista = this.modulos();
    if (!actual || !lista.some((m) => m.id === actual)) {
      this.moduloSeleccionadoId.set(lista[0]?.id ?? '');
    }
  }

  seleccionarModulo(moduloId: string): void {
    if (moduloId === this.moduloSeleccionadoId()) return;
    this.moduloSeleccionadoId.set(moduloId);
    this.busquedaPoliticas.set('');
  }

  onBuscarModulos(term: string): void {
    this.busquedaModulos.set(term);
  }

  onBuscarPoliticas(term: string): void {
    this.busquedaPoliticas.set(term);
  }

  contarPoliticas(moduloId: string): number {
    return this.politicas().filter((p) => p.moduloId === moduloId).length;
  }

  contarPoliticasActivas(moduloId: string): number {
    return this.politicas().filter((p) => p.moduloId === moduloId && p.activo).length;
  }

  // ── Modales ───────────────────────────────────────────────────────────

  abrirModalCrearModulo(): void {
    this.abrirModalModulo(true, null);
  }

  abrirModalEditarModulo(modulo: IConfigModulo): void {
    this.abrirModalModulo(false, modulo);
  }

  private abrirModalModulo(nuevo: boolean, modulo: IConfigModulo | null): void {
    this.nuevoModulo.set(nuevo);
    this.moduloEdit.set(modulo ? { ...modulo } : null);
    this.formKeyModulo.update((key) => key + 1);
    this.abrirOverlay(this.upsertModuloModal?.nativeElement);
  }

  abrirModalEliminarModulo(modulo: IConfigModulo): void {
    this.moduloEdit.set({ ...modulo });
    this.abrirOverlay(this.deleteModuloModal?.nativeElement);
  }

  cerrarModalesModulo(): void {
    this.cerrarOverlay(this.upsertModuloModal?.nativeElement);
    this.cerrarOverlay(this.deleteModuloModal?.nativeElement);
  }

  private abrirOverlay(modalEl?: HTMLDivElement): void {
    if (!modalEl) return;
    if ((window as any).HSOverlay) {
      new (window as any).HSOverlay(modalEl).open();
    } else {
      modalEl.classList.remove('hidden');
      modalEl.classList.add('pointer-events-auto');
    }
  }

  private cerrarOverlay(modalEl?: HTMLDivElement): void {
    if (!modalEl) return;
    if ((window as any).HSOverlay) {
      (window as any).HSOverlay.close(modalEl);
    } else {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('open', 'pointer-events-auto');
    }
  }

  // ── Escrituras ────────────────────────────────────────────────────────

  async guardarModulo(payload: ConfigModuloPayload): Promise<void> {
    const esNuevo = this.nuevoModulo();
    const id = this.moduloEdit()?.id;
    if (!esNuevo && !id) return;

    // En edición no se envía `orden`: solo cambia con drag & drop (Paso 4).
    const payloadSinOrden = { ...payload };
    delete payloadSinOrden.orden;
    const body = esNuevo ? payload : payloadSinOrden;

    this.guardandoModulo.set(true);
    try {
      const resp = esNuevo
        ? await this.moduloService.createModulo(payload)
        : await this.moduloService.updateModulo(id!, payloadSinOrden);

      if (resp?.success) {
        this.cerrarModalesModulo();
        await this.cargarTodo();
        const idGuardado = esNuevo ? resp.data?.id : id;
        if (idGuardado) this.moduloSeleccionadoId.set(idGuardado);
        this.busquedaPoliticas.set('');
      }
    } catch (error: any) {
      this.autorizacionService.handleError428(error, {
        endpoint: 'config/modulos',
        metodoHttp: esNuevo ? 'POST' : 'PATCH',
        body,
        params: !esNuevo && id ? { id } : undefined,
        closeModal: () => this.cerrarModalesModulo(),
        onSuccess: async (data) => {
          await this.cargarTodo();
          const creadoId = esNuevo ? (data as any)?.ejecucion?.id : id;
          if (creadoId) this.moduloSeleccionadoId.set(creadoId);
          this.busquedaPoliticas.set('');
        },
      });
    } finally {
      this.guardandoModulo.set(false);
    }
  }

  async cambiarActivoModulo(modulo: IConfigModulo, activo: boolean): Promise<void> {
    if (modulo.activo === activo) return;

    const anterior = modulo.activo;
    this.modulos.update((lista) =>
      lista.map((m) => (m.id === modulo.id ? { ...m, activo } : m))
    );

    try {
      const resp = await this.moduloService.updateModulo(modulo.id, { activo });
      if (!resp?.success) this.revertirActivo(modulo.id, anterior);
    } catch (error: any) {
      this.revertirActivo(modulo.id, anterior);
      this.autorizacionService.handleError428(error, {
        endpoint: 'config/modulos',
        metodoHttp: 'PATCH',
        body: { activo },
        params: { id: modulo.id },
        onSuccess: () => this.cargarTodo(),
      });
    }
  }

  private revertirActivo(moduloId: string, activoAnterior: boolean): void {
    this.modulos.update((lista) =>
      lista.map((m) => (m.id === moduloId ? { ...m, activo: activoAnterior } : m))
    );
  }

  async eliminarModulo(): Promise<void> {
    const modulo = this.moduloEdit();
    if (!modulo) return;

    this.guardandoModulo.set(true);
    try {
      const resp = await this.moduloService.deleteModulo(modulo.id);
      if (resp?.success) {
        this.cerrarModalesModulo();
        await this.cargarTodo();
      }
    } catch (error: any) {
      this.autorizacionService.handleError428(error, {
        endpoint: 'config/modulos',
        metodoHttp: 'DELETE',
        params: { id: modulo.id },
        closeModal: () => this.cerrarModalesModulo(),
        onSuccess: () => this.cargarTodo(),
      });
    } finally {
      this.guardandoModulo.set(false);
    }
  }

  // ── Reordenamiento de módulos (Paso 4) ────────────────────────────────

  onModuloDragStart(event: DragEvent, modulo: IConfigModulo): void {
    if (this.reordenandoModulo() || this.reorderModulosBloqueado()) {
      event.preventDefault();
      return;
    }

    this.dragModuloId.set(modulo.id);
    this.moduloDropId.set(null);
    event.dataTransfer?.setData('text/plain', modulo.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onModuloDragOver(event: DragEvent, modulo: IConfigModulo): void {
    if (!this.dragModuloId() || this.dragModuloId() === modulo.id) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.moduloDropId.set(modulo.id);
  }

  onModuloDragLeave(event: DragEvent, moduloId: string): void {
    if (this.moduloDropId() !== moduloId) return;
    const current = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    // Ignora la salida hacia un hijo del propio módulo (evita parpadeo).
    if (current && related && current.contains(related)) return;
    this.moduloDropId.set(null);
  }

  onModuloDragEnd(): void {
    this.dragModuloId.set(null);
    this.moduloDropId.set(null);
  }

  async onModuloDrop(event: DragEvent, destino: IConfigModulo): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const draggedId = this.dragModuloId();
    this.onModuloDragEnd();
    if (!draggedId || draggedId === destino.id) return;
    if (this.reordenandoModulo() || this.reorderModulosBloqueado()) return;

    const origen = this.modulos().find((m) => m.id === draggedId);
    if (!origen || origen.orden === destino.orden) return;

    await this.reordenarModulo(draggedId, destino.orden);
  }

  private async reordenarModulo(id: string, nuevoOrden: number): Promise<void> {
    const snapshot = this.modulos();
    const payload = { id, nuevoOrden };

    this.aplicarReordenModuloLocal(id, nuevoOrden);
    this.reordenandoModulo.set(true);
    try {
      const resp = await this.moduloService.reorderModulo(payload);
      if (resp?.success) {
        await this.cargarTodo();
      } else {
        this.modulos.set(snapshot);
      }
    } catch (error: any) {
      this.modulos.set(snapshot);
      this.autorizacionService.handleError428(error, {
        endpoint: 'config/modulos/reorder',
        metodoHttp: 'PATCH',
        body: payload,
        onSuccess: () => this.cargarTodo(),
      });
    } finally {
      this.reordenandoModulo.set(false);
    }
  }

  /** Mueve el módulo al orden destino y desplaza a los demás como el backend. */
  private aplicarReordenModuloLocal(id: string, nuevoOrden: number): void {
    this.modulos.update((lista) => {
      const dragged = lista.find((m) => m.id === id);
      if (!dragged || dragged.orden === nuevoOrden) return lista;

      const ordenAnterior = dragged.orden;
      return lista.map((m) => {
        if (m.id === id) return { ...m, orden: nuevoOrden };
        if (ordenAnterior < nuevoOrden && m.orden > ordenAnterior && m.orden <= nuevoOrden) {
          return { ...m, orden: m.orden - 1 };
        }
        if (ordenAnterior > nuevoOrden && m.orden >= nuevoOrden && m.orden < ordenAnterior) {
          return { ...m, orden: m.orden + 1 };
        }
        return m;
      });
    });
  }

  // ── CRUD de políticas (Paso 3) ────────────────────────────────────────

  abrirModalCrearPolitica(): void {
    if (!this.modulos().length) return;
    this.nuevaPolitica.set(true);
    this.politicaEdit.set(null);
    this.formKeyPolitica.update((key) => key + 1);
    this.abrirOverlay(this.upsertPoliticaModal?.nativeElement);
  }

  abrirModalEditarPolitica(politica: IConfigPolitica): void {
    this.nuevaPolitica.set(false);
    this.politicaEdit.set({ ...politica });
    this.formKeyPolitica.update((key) => key + 1);
    this.abrirOverlay(this.upsertPoliticaModal?.nativeElement);
  }

  abrirModalEliminarPolitica(politica: IConfigPolitica): void {
    this.politicaEdit.set({ ...politica });
    this.abrirOverlay(this.deletePoliticaModal?.nativeElement);
  }

  cerrarModalesPolitica(): void {
    this.cerrarOverlay(this.upsertPoliticaModal?.nativeElement);
    this.cerrarOverlay(this.deletePoliticaModal?.nativeElement);
  }

  async guardarPolitica(payload: ConfigPoliticaPayload): Promise<void> {
    const esNuevo = this.nuevaPolitica();
    const original = this.politicaEdit();
    const id = original?.id;
    if (!esNuevo && !id) return;

    // El orden solo se envía al crear o al mover de módulo; en una edición
    // normal se conserva para no desplazar la política por un dato obsoleto.
    const cambioModulo = !esNuevo && !!original && payload.moduloId !== original.moduloId;
    const payloadSinOrden: Partial<ConfigPoliticaPayload> = { ...payload };
    if (!esNuevo && !cambioModulo) delete payloadSinOrden.orden;

    this.guardandoPolitica.set(true);
    try {
      const resp = esNuevo
        ? await this.politicaService.createPolitica(payload)
        : await this.politicaService.updatePolitica(id!, payloadSinOrden);

      if (resp?.success) {
        this.cerrarModalesPolitica();
        await this.cargarTodo();
        this.busquedaPoliticas.set('');
        this.seleccionarModuloSiExiste(payload.moduloId);
      }
    } catch (error: any) {
      this.autorizacionService.handleError428(error, {
        endpoint: 'config/politicas',
        metodoHttp: esNuevo ? 'POST' : 'PATCH',
        body: payloadSinOrden,
        params: !esNuevo && id ? { id } : undefined,
        closeModal: () => this.cerrarModalesPolitica(),
        onSuccess: async () => {
          await this.cargarTodo();
          this.busquedaPoliticas.set('');
          this.seleccionarModuloSiExiste(payload.moduloId);
        },
      });
    } finally {
      this.guardandoPolitica.set(false);
    }
  }

  async cambiarActivoPolitica(politica: IConfigPolitica, activo: boolean): Promise<void> {
    if (politica.activo === activo) return;

    const anterior = politica.activo;
    this.politicas.update((lista) =>
      lista.map((p) => (p.id === politica.id ? { ...p, activo } : p))
    );

    try {
      const resp = await this.politicaService.updatePolitica(politica.id, { activo });
      if (!resp?.success) this.revertirActivoPolitica(politica.id, anterior);
    } catch (error: any) {
      this.revertirActivoPolitica(politica.id, anterior);
      this.autorizacionService.handleError428(error, {
        endpoint: 'config/politicas',
        metodoHttp: 'PATCH',
        body: { activo },
        params: { id: politica.id },
        onSuccess: () => this.cargarTodo(),
      });
    }
  }

  private revertirActivoPolitica(politicaId: string, activoAnterior: boolean): void {
    this.politicas.update((lista) =>
      lista.map((p) => (p.id === politicaId ? { ...p, activo: activoAnterior } : p))
    );
  }

  async eliminarPolitica(): Promise<void> {
    const politica = this.politicaEdit();
    if (!politica) return;

    this.guardandoPolitica.set(true);
    try {
      const resp = await this.politicaService.deletePolitica(politica.id);
      if (resp?.success) {
        this.cerrarModalesPolitica();
        await this.cargarTodo();
      }
    } catch (error: any) {
      this.autorizacionService.handleError428(error, {
        endpoint: 'config/politicas',
        metodoHttp: 'DELETE',
        params: { id: politica.id },
        closeModal: () => this.cerrarModalesPolitica(),
        onSuccess: () => this.cargarTodo(),
      });
    } finally {
      this.guardandoPolitica.set(false);
    }
  }

  // ── Reordenamiento de políticas (Paso 4) ──────────────────────────────

  onPoliticaDragStart(event: DragEvent, politica: IConfigPolitica): void {
    if (this.reordenandoPolitica() || this.reorderPoliticasBloqueado()) {
      event.preventDefault();
      return;
    }

    this.dragPoliticaId.set(politica.id);
    this.politicaDropId.set(null);
    event.dataTransfer?.setData('text/plain', politica.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onPoliticaDragOver(event: DragEvent, politica: IConfigPolitica): void {
    if (!this.dragPoliticaId() || this.dragPoliticaId() === politica.id) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.politicaDropId.set(politica.id);
  }

  onPoliticaDragLeave(event: DragEvent, politicaId: string): void {
    if (this.politicaDropId() !== politicaId) return;
    const current = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    // Ignora la salida hacia una celda de la propia fila (evita parpadeo).
    if (current && related && current.contains(related)) return;
    this.politicaDropId.set(null);
  }

  onPoliticaDragEnd(): void {
    this.dragPoliticaId.set(null);
    this.politicaDropId.set(null);
  }

  async onPoliticaDrop(event: DragEvent, destino: IConfigPolitica): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const draggedId = this.dragPoliticaId();
    this.onPoliticaDragEnd();
    if (!draggedId || draggedId === destino.id) return;
    if (this.reordenandoPolitica() || this.reorderPoliticasBloqueado()) return;

    const origen = this.politicas().find((p) => p.id === draggedId);
    if (!origen || origen.moduloId !== destino.moduloId || origen.orden === destino.orden) return;

    await this.reordenarPolitica(draggedId, destino.orden);
  }

  private async reordenarPolitica(id: string, nuevoOrden: number): Promise<void> {
    const snapshot = this.politicas();
    const payload = { id, nuevoOrden };

    this.aplicarReordenPoliticaLocal(id, nuevoOrden);
    this.reordenandoPolitica.set(true);
    try {
      const resp = await this.politicaService.reorderPolitica(payload);
      if (resp?.success) {
        await this.cargarTodo();
      } else {
        this.politicas.set(snapshot);
      }
    } catch (error: any) {
      this.politicas.set(snapshot);
      this.autorizacionService.handleError428(error, {
        endpoint: 'config/politicas/reorder',
        metodoHttp: 'PATCH',
        body: payload,
        onSuccess: () => this.cargarTodo(),
      });
    } finally {
      this.reordenandoPolitica.set(false);
    }
  }

  /** Mueve la política al orden destino dentro de su módulo. */
  private aplicarReordenPoliticaLocal(id: string, nuevoOrden: number): void {
    this.politicas.update((lista) => {
      const dragged = lista.find((p) => p.id === id);
      if (!dragged || dragged.orden === nuevoOrden) return lista;

      const ordenAnterior = dragged.orden;
      const moduloId = dragged.moduloId;
      return lista.map((p) => {
        if (p.moduloId !== moduloId) return p;
        if (p.id === id) return { ...p, orden: nuevoOrden };
        if (ordenAnterior < nuevoOrden && p.orden > ordenAnterior && p.orden <= nuevoOrden) {
          return { ...p, orden: p.orden - 1 };
        }
        if (ordenAnterior > nuevoOrden && p.orden >= nuevoOrden && p.orden < ordenAnterior) {
          return { ...p, orden: p.orden + 1 };
        }
        return p;
      });
    });
  }

  private seleccionarModuloSiExiste(moduloId: string): void {
    if (moduloId && this.modulos().some((m) => m.id === moduloId)) {
      this.moduloSeleccionadoId.set(moduloId);
    }
  }

  private normalize(value: string): string {
    return (value || '').toLowerCase().trim();
  }
}
