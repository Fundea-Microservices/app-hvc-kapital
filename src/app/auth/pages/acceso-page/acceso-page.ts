import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { RolService } from '../../../../services/auth/rol.service';
import { MenuService } from '../../../../services/auth/menu.service';
import { AccesoService } from '../../../../services/auth/acceso.service';
import { AutorizacionService } from '../../../../services/auth/autorizacion.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { IAcceso, IMenu, IRol, ISubmenu } from '../../../../interfaces/auth';
import UpsertAccesoComponent from '../../components/upsert-acceso/upsert-acceso';
import { CustomIconComponent } from '../../../shared/components/custom-icon/custom-icon.component';
import { ModalAutorizacionComponent } from '../../components/modal-autorizacion/modal-autorizacion';

@Component({
  selector: 'app-acceso-page',
  standalone: true,
  imports: [RouterLink, UpsertAccesoComponent, CustomIconComponent, ModalAutorizacionComponent],
  templateUrl: './acceso-page.html',
  styleUrl: './acceso-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccesoPageComponent {
  private rolService = inject(RolService);
  private menuService = inject(MenuService);
  private accesoService = inject(AccesoService);
  private authService = inject(AuthService);
  autorizacionService = inject(AutorizacionService);

  roles = signal<IRol[]>([]);
  selectedRolId = signal<string>('');

  menus = signal<IMenu[]>([]);
  accesos = signal<IAcceso[]>([]);

  // Modal state
  showUpsert = signal<boolean>(false);
  upsertMenu = signal<IMenu | null>(null);
  guardando = signal(false);
  reordenando = signal(false);

  // Filtro para submenús
  filterSubmenus = signal<string>('');

  ngOnInit() {
    this.loadRoles();
    this.loadMenus();
  }

  async loadRoles() {
    const r = await this.rolService.getRoles({ all: true });
    if (r?.success) this.roles.set(r.data || []);
  }

  async loadMenus() {
    const m = await this.menuService.getMenus({ all: true });
    if (m?.success) this.menus.set(m.data || []);
  }

  async onRolChange(id: string) {
    this.selectedRolId.set(id);
    await this.refreshAccesos();
  }

  async refreshAccesos() {
    const rolId = this.selectedRolId();
    if (!rolId) { this.accesos.set([]); return; }
    const res = await this.accesoService.getAccesosByRol(rolId);
    if (res?.success) this.accesos.set(res.data || []);
  }

  get principalMenus(): IMenu[] {
    return (this.menus() || []).filter(m => m.principal);
  }

  // IDs de menús ya asignados (incluye principales y submenús)
  private assignedIdsSet(): Set<string> {
    const set = new Set<string>();
    const list = this.accesos() || [];
    for (const a of list) {
      if (a?.menuId) set.add(a.menuId);
      const subs = a?.subMenus || [];
      for (const s of subs) {
        if (s?.menuId) set.add(s.menuId);
      }
    }
    return set;
  }

  selectedRol(): IRol | null {
    const id = this.selectedRolId();
    return (this.roles() || []).find(r => r.id === id) || null;
  }

  selectedRolStrict(): IRol {
    return this.selectedRol() as IRol;
  }

  isAssigned(menuId?: string): boolean {
    if (!menuId) return false;
    return this.assignedIdsSet().has(menuId);
  }

  // Submenús disponibles (no asignados aún para este rol)
  subMenusAvailable(): IMenu[] {
    const assignedIds = this.assignedIdsSet();
    const filter = this.filterSubmenus().toLowerCase().trim();
    let subs = (this.menus() || []).filter(m => !m.principal && !assignedIds.has(m.id || ''));

    if (filter) {
      subs = subs.filter(m =>
        (m.label || '').toLowerCase().includes(filter) ||
        (m.descripcion || '').toLowerCase().includes(filter)
      );
    }

    return subs;
  }

  onFilterSubmenusChange(value: string) {
    this.filterSubmenus.set(value);
  }

  // Conteo de submenús ya asignados a un menú principal para el rol
  countSubAccesos(mainMenuId?: string): number {
    if (!mainMenuId) return 0;
    return (this.accesos() || []).filter(a => a.mainMenuId === mainMenuId && !a.menu?.principal).length;
  }

  hasSubAccesos(mainMenuId?: string): boolean {
    return this.countSubAccesos(mainMenuId) > 0;
  }

  async eliminarAcceso(acceso: IAcceso) {
    // Si es un menú principal y tiene submenús asignados, impedir eliminación directa
    if (acceso.menu?.principal && this.hasSubAccesos(acceso.menu?.id)) {
      alert('Este menú principal tiene submenús asignados. Elimine o reasigne primero sus submenús.');
      return;
    }
    const ok = confirm('¿Eliminar este acceso?');
    if (!ok) return;
    const accesoKey = this.resolveAccesoId(acceso);
    if (!accesoKey) return;
    try {
      await this.accesoService.deleteAcceso(accesoKey);
      await this.refreshAccesos();
    } catch (error: any) {
      this.autorizacionService.handleError428(error, {
        endpoint: 'auth/accesos',
        metodoHttp: 'DELETE',
        params: { id: this.resolveAccesoId(acceso) },
        onSuccess: () => this.refreshAccesos(),
      });
    }
  }

  // Asignar: abre modal
  abrirAsignar(menu: IMenu) {
    this.upsertMenu.set(menu);
    this.showUpsert.set(true);
  }

  cerrarModal() {
    this.showUpsert.set(false);
    this.upsertMenu.set(null);
  }

  // Guardar asignación
  async onSaveAcceso(dto: any) {
    this.guardando.set(true);
    try {
      await this.accesoService.createAcceso(dto);
      await this.refreshAccesos();
      this.cerrarModal();
    } catch (error: any) {
      this.autorizacionService.handleError428(error, {
        endpoint: 'auth/accesos',
        metodoHttp: 'POST',
        body: dto,
        onSuccess: () => {
          this.refreshAccesos();
          this.cerrarModal();
        },
      });
    } finally {
      this.guardando.set(false);
    }
  }

  // Reordenar (HTML5 drag & drop)
  dragSubAcceso: IAcceso | ISubmenu | null = null;

  onDragOver(ev: DragEvent) {
    ev.preventDefault();
    if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
  }

  onDragStartSub(ev: DragEvent, item: IAcceso | ISubmenu) {
    this.dragSubAcceso = item;
    ev.dataTransfer?.setData('text/plain', item.id || '');
    if (ev.dataTransfer) ev.dataTransfer.effectAllowed = 'move';
  }

  onDragEndSub() {
    this.dragSubAcceso = null;
  }

  async onDropSub(ev: DragEvent, targetIndex: number, mainMenuId: string) {
    ev.preventDefault();
    ev.stopPropagation();

    const dragged = this.dragSubAcceso;
    this.dragSubAcceso = null;
    const draggedId = this.resolveAccesoId(dragged);
    if (!draggedId || this.reordenando()) return;

    const parent = (this.accesos() || []).find(a => a.menu?.id === mainMenuId || a.menuId === mainMenuId);
    const hermanos = parent?.subMenus || [];
    if (targetIndex < 0 || targetIndex >= hermanos.length) return;

    const destino = hermanos[targetIndex];
    const destinoId = this.resolveAccesoId(destino);
    if (!destinoId || destinoId === draggedId) return;
    if (!hermanos.some(s => this.resolveAccesoId(s) === draggedId)) return;

    const nuevoOrden = destino.ordenMenu;
    const payload = { id: draggedId, nuevoOrden };

    this.reordenando.set(true);
    try {
      const resp = await this.accesoService.reorderAcceso(payload);
      if (resp?.success) {
        this.aplicarReordenLocal(mainMenuId, draggedId, nuevoOrden);
        this.sincronizarSesionSiMismoRol();
      }
    } catch (error: any) {
      this.autorizacionService.handleError428(error, {
        endpoint: 'auth/accesos/reorder',
        metodoHttp: 'PATCH',
        body: payload,
        onSuccess: () => {
          this.aplicarReordenLocal(mainMenuId, draggedId, nuevoOrden);
          this.sincronizarSesionSiMismoRol();
        },
      });
    } finally {
      this.reordenando.set(false);
    }
  }

  private resolveAccesoId(item?: IAcceso | ISubmenu | null): string {
    return item?.id || item?.accesoId || '';
  }

  /**
   * A toma el ordenMenu del destino; los hermanos de la rama se desplazan.
   */
  private aplicarReordenLocal(mainMenuId: string, draggedId: string, nuevoOrden: number): void {
    this.accesos.update(list =>
      list.map(parent => {
        if (parent.menu?.id !== mainMenuId && parent.menuId !== mainMenuId) return parent;
        const subs = [...(parent.subMenus || [])];
        const dragged = subs.find(s => this.resolveAccesoId(s) === draggedId);
        if (!dragged) return parent;

        const draggedOrden = dragged.ordenMenu;
        if (draggedOrden === nuevoOrden) return parent;

        const nextSubs = subs
          .map(s => {
            const copy = { ...s };
            if (this.resolveAccesoId(copy) === draggedId) {
              copy.ordenMenu = nuevoOrden;
            } else if (draggedOrden < nuevoOrden) {
              if (copy.ordenMenu > draggedOrden && copy.ordenMenu <= nuevoOrden) {
                copy.ordenMenu -= 1;
              }
            } else if (copy.ordenMenu >= nuevoOrden && copy.ordenMenu < draggedOrden) {
              copy.ordenMenu += 1;
            }
            return copy;
          })
          .sort((a, b) => a.ordenMenu - b.ordenMenu);

        return { ...parent, subMenus: nextSubs };
      })
    );
  }

  /** Si el rol editado es el del usuario logueado, el menú lateral se reconstruye. */
  private sincronizarSesionSiMismoRol(): void {
    const user = this.authService.user();
    const userRolId = user?.rolId || user?.rol?.id || '';
    if (!userRolId || userRolId !== this.selectedRolId()) return;
    this.authService.updateAccesos(this.accesos());
  }

  changeActive(acceso: IAcceso, checked: boolean) {
    acceso.activo = checked;
    this.updateAcceso(acceso);
  }

  async updateAcceso(acceso: IAcceso) {
    try {
      let resp = await this.accesoService.updateAcceso(acceso);
      if (resp?.success) {
        this.cerrarModal();
      }
    } catch (error: any) {
      this.autorizacionService.handleError428(error, {
        endpoint: 'auth/accesos',
        metodoHttp: 'PUT',
        body: { ordenMenu: acceso.ordenMenu, showApp: acceso.showApp, showWeb: acceso.showWeb, activo: acceso.activo, mainMenuId: acceso.mainMenuId, menuId: acceso.menuId, rolId: acceso.rolId },
        params: { id: acceso.id! },
        onSuccess: () => this.refreshAccesos(),
      });
    }
  }

  changeShowApp(acceso: IAcceso, checked: boolean) {
    acceso.showApp = checked;
    this.updateAcceso(acceso);
  }

  changeShowWeb(acceso: IAcceso, checked: boolean) {
    acceso.showWeb = checked;
    this.updateAcceso(acceso);
  }
}
