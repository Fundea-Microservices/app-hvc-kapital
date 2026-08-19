# AI_HANDOFF.md — Documento de Contexto y Control de Cambios

## Información del Proyecto

- **Nombre:** HVC Kapital — Sistema de Administración de Inversiones
- **Framework:** Angular (con standalone components)
- **Estilos:** Tailwind CSS + CSS personalizado
- **Paleta de Colores:** Paleta Oficial HVC Kapital (documentada en `Paleta_Colores_HVC_Kapital.md`)
- **Branch Actual:** `feature/color-changes`
- **Última Actualización:** 2026-08-19

---

## Estado Actual del Proyecto

### Paleta de Colores Implementada

| Categoría | Color | Hexadecimal | Variable CSS |
|:---|:---|:---|:---|
| Primario | Azul Principal | `#1E335E` | `--hvc-primary` |
| Primario | Azul Oscuro | `#071737` | `--hvc-primary-dark` |
| Primario | Azul Claro | `#95A2BB` | `--hvc-primary-light` |
| Acento | Naranja Acento | `#FA9A37` | `--hvc-accent-orange` |
| Acento | Amarillo Oro | `#FCC232` | `--hvc-accent-gold` |
| Acento | Durazno Suave | `#F9D3AD` | `--hvc-accent-peach` |
| Neutro | Gris Neutro | `#8D9EBF` | `--hvc-gray` |
| Neutro | Gris Suave | `#A4ABBD` | `--hvc-gray-light` |
| Estado | Verde Éxito | `#22C55E` | `--hvc-success` |
| Estado | Naranja Alerta | `#F59E0B` | `--hvc-warning` |
| Estado | Rojo Peligro | `#EF4444` | `--hvc-danger` |

### Archivos Modificados (Último Cambio)

#### 1. `src/styles.css`
- **Cambio:** Agregadas variables de estado (`--hvc-success`, `--hvc-warning`, `--hvc-danger`)
- **Cambio:** Agregadas variables para sidebar y navbar (`--sidebar-bg`, `--sidebar-border`, `--sidebar-hover`, `--sidebar-text`, `--sidebar-text-active`, `--navbar-bg`, `--navbar-border`, `--navbar-hover`, `--navbar-text`, `--navbar-text-secondary`)
- **Propósito:** Centralizar colores de sidebar/navbar en variables CSS para fácil mantenimiento

#### 2. `src/styles/colors.css`
- **Cambio:** Actualizadas todas las variables RGB para alinearse con la paleta HVC Kapital
- **Cambio:** Variables de sidebar ahora usan `--hvc-primary-dark` y `--hvc-primary`
- **Cambio:** Variables de texto ahora usan `--hvc-primary-dark` y `--hvc-gray`
- **Propósito:** Alinear variables legacy de Tailwind con la paleta oficial

#### 3. `src/app/dashboard/pages/dashboard-page/dashboard-page.html`
- **Cambio:** Reemplazado `bg-[#0f2138]` por `var(--sidebar-bg)`
- **Cambio:** Reemplazado `border-[#1b3553]` por `var(--sidebar-border)`
- **Cambio:** Reemplazado `border-[#1b3553]` en nav-bar por `var(--navbar-border)`
- **Propósito:** Usar variables CSS en lugar de colores hardcodeados

#### 4. `src/app/dashboard/components/nav-bar/nav-bar.html`
- **Cambio:** Reemplazados todos los colores hardcodeados (`#0f2138`, `#1b3553`, `#244569`, `#1e2328`, `#979a9c`, `#eef0f2`) por variables CSS HVC
- **Cambio:** Hover states ahora usan `var(--navbar-border)` y `var(--hover)`
- **Cambio:** Iconos de perfil usan `var(--hvc-primary-dark)` y `var(--hvc-danger)`
- **Propósito:** Consistencia visual con paleta HVC Kapital

#### 5. `src/app/dashboard/components/side-menu/side-menu.html`
- **Cambio:** Reemplazado `bg-slate-700/50` por `rgba(var(--color-primary), 0.5)`
- **Cambio:** Reemplazado `text-sky-100` por `var(--navbar-text)`
- **Cambio:** Close button usa `var(--sidebar-hover)` en hover
- **Propósito:** Alinear sidebar con paleta HVC

#### 6. `src/app/dashboard/components/side-menu/side-menu-list/side-menu-list.component.html`
- **Cambio:** Reemplazados colores hardcodeados (`#1b3553`, `#cbd5e1`, `text-sky-400`, `text-slate-300`, `text-slate-400`) por variables CSS HVC
- **Cambio:** Items activos ahora usan `var(--hvc-accent-orange)` como border-left
- **Cambio:** Texto del sidebar usa `var(--sidebar-text)` y `var(--sidebar-text-active)`
- **Cambio:** Hover states son inline con style bindings para mayor control
- **Propósito:** Menú lateral completamente alineado con paleta HVC

---

## Mapeo de Colores Hardcodeados → Variables HVC

| Color Hardcodeado | Uso Original | Variable HVC Asignada |
|:---|:---|:---|
| `#0f2138` | Fondo sidebar/navbar | `var(--hvc-primary-dark)` / `var(--sidebar-bg)` / `var(--navbar-bg)` |
| `#1b3553` | Bordes y hover en sidebar/navbar | `var(--hvc-primary)` / `var(--sidebar-border)` / `var(--navbar-border)` |
| `#244569` | Hover en botones navbar | `var(--sidebar-hover)` / `var(--navbar-hover)` |
| `#1e2328` | Texto en dropdown | `var(--hvc-primary-dark)` |
| `#979a9c` | Texto secundario | `var(--hvc-gray)` |
| `#eef0f2` | Hover background | `var(--hover)` |
| `#f1f5f9` | Fondo contenido principal | Se mantiene (slate-100) |
| `#cbd5e1` | Iconos sidebar | `var(--sidebar-text)` |
| `bg-slate-700/50` | Close button sidebar | `rgba(var(--color-primary), 0.5)` |
| `text-sky-100` | Título sidebar/navbar | `var(--navbar-text)` |
| `text-sky-400` | Borde activo sidebar | `var(--hvc-accent-orange)` |
| `text-slate-300` | Texto items sidebar | `var(--sidebar-text)` |
| `text-slate-400` | Texto secundario sidebar | `var(--navbar-text-secondary)` |

---

## Próximos Pasos Recomendados

1. ✅ **Verificar visualmente** los cambios en el navegador para asegurar que la paleta se aplica correctamente (acceso-page y configuraciones-page migrados)
2. **Buscar otros componentes** que puedan tener colores hardcodeados y actualizarlos (quedan páginas auth: login-page, usuarios-page, mi-perfil-page, permiso-page, menu-page, puesto-page, rol-page, sucursal-page, permisos-rol-page)
3. **Considerar agregar** una sección de CSS para el dropdown del usuario del navbar con estilos consistentes
4. **Documentar** en este archivo cualquier cambio futuro para mantener el contexto

---

## Archivos CSS Creados (Nuevos)

#### 7. `src/app/dashboard/components/nav-bar/nav-bar.css`
- **Cambio:** Creado archivo CSS con estilos hover para navbar
- **Clases:** `.navbar-toggle`, `.navbar-user-btn`, `.navbar-dropdown-item`, `.navbar-dropdown-item--danger`
- **Propósito:** Manejar hover states via CSS en lugar de inline event handlers

#### 8. `src/app/dashboard/components/side-menu/side-menu.css`
- **Cambio:** Creado archivo CSS con estilos hover para sidebar
- **Clases:** `.sidebar-close-btn`
- **Propósito:** Manejar hover states via CSS en lugar de inline event handlers

#### 9. `src/app/dashboard/components/side-menu/side-menu-list/side-menu-list.component.css`
- **Cambio:** Creado archivo CSS con estilos hover para items del menú
- **Clases:** `.sidebar-item`, `.sidebar-accordion-toggle`, `.sidebar-submenu-item`
- **Propósito:** Manejar hover states via CSS en lugar de inline event handlers

---

## Enfoque de Implementación

### Cambio de Event Handlers a CSS Classes

Durante la implementación, se descubrió que usar `(mouseenter)` y `(mouseleave)` con `$event.target.style` causaba errores de TypeScript porque `EventTarget` no tiene la propiedad `style`. La solución fue:

1. **Crear archivos CSS** para cada componente con clases de hover
2. **Usar clases CSS** en lugar de event handlers inline
3. **Mantener `style` bindings** solo para colores estáticos (no hover)

### Variables CSS para Sidebar y Navbar

Se definieron variables específicas para sidebar y navbar en `src/styles.css`:

```css
/* Sidebar y Navbar - Paleta HVC Kapital */
--sidebar-bg: var(--hvc-primary-dark);
--sidebar-border: var(--hvc-primary);
--sidebar-hover: var(--hvc-primary);
--sidebar-text: #cbd5e1;
--sidebar-text-active: #ffffff;
--navbar-bg: var(--hvc-primary-dark);
--navbar-border: var(--hvc-primary);
--navbar-hover: var(--hvc-primary);
--navbar-text: #f1f5f9;
--navbar-text-secondary: var(--hvc-gray-light);
```

---

## Últimos Cambios (2026-08-19 - Sesión 3.5: Paleta HVC en páginas acceso y configuraciones)

### Páginas Auth Migradas a Paleta HVC

#### 30. `src/app/auth/pages/acceso-page/acceso-page.html`
- **Cambio:** Reemplazados todos los colores hardcodeados (`text-blue-600`, `text-gray-700`, `text-gray-500`, `border-gray-300`, `bg-green-600`, `bg-red-600`, `text-green-600`, `bg-yellow-100`, `border-yellow-500`, `text-yellow-700`, `bg-gray-50`, `bg-gray-100`, `odd:bg-white even:bg-gray-100`, `hover:bg-gray-200`)
- **Cambio:** Breadcrumbs usan `var(--hvc-primary)` para links, `var(--text)` para texto base, `var(--hvc-primary-light)` para items inactivos
- **Cambio:** Alerta warning usa `var(--hvc-warning)` con opacidad para fondo
- **Cambio:** Botones "Añadir" usan clase `.btn-acceso-add` con `var(--hvc-success)`
- **Cambio:** Botones "Eliminar" usan clase `.btn-acceso-delete` con `var(--hvc-danger)`
- **Cambio:** Tabla usa `var(--table-header-bg)`, `var(--table-header-color)`, `var(--table-border-color)`, `var(--table-row-bg)`, `var(--table-row-alt-bg)`
- **Cambio:** Checkboxes usan `accent-color: var(--hvc-success)`
- **Cambio:** Modal usa `var(--hvc-primary-dark)` para título y `var(--hvc-primary-light)` para bordes
- **Propósito:** Página de accesos completamente alineada con paleta HVC Kapital

#### 31. `src/app/auth/pages/acceso-page/acceso-page.css` (Nuevo)
- **Cambio:** Creado archivo CSS con estilos hover para botones y filas de tabla
- **Clases:** `.btn-acceso-add`, `.btn-acceso-delete`, `.acceso-table-row`, `.acceso-table-row-sub`
- **Propósito:** Hover states via CSS para botones de acción y filas de tabla con drag & drop

#### 32. `src/app/auth/pages/configuraciones-page/configuraciones-page.html`
- **Cambio:** Reemplazados todos los colores hardcodeados (`text-blue-600`, `text-gray-700`, `text-gray-500`, `text-gray-800`, `border-gray-300`, `bg-blue-600 hover:bg-blue-700`, `bg-green-600 hover:bg-green-700`, `bg-red-600 hover:bg-red-700`, `peer-checked:bg-blue-600`, `bg-gray-100 hover:bg-gray-200`, `bg-red-50 border-red-200 text-red-800`)
- **Cambio:** Breadcrumbs usan misma paleta que acceso-page
- **Cambio:** Botón "Nueva configuración" usa clase `.btn-hvc-primary` global
- **Cambio:** Tabla usa `gc-table` existente con `var(--table-border-color)` para celdas
- **Cambio:** Toggle switch usa `peer-checked:bg-success-500` (safelist en `styles.css`)
- **Cambio:** Botones de acción usan clases `.config-btn-edit` y `.config-btn-delete` con `var(--hvc-success)` y `var(--hvc-danger)`
- **Cambio:** Modales usan `var(--hvc-primary-dark)` para títulos y `var(--hvc-primary-light)` para bordes
- **Cambio:** Alerta de eliminación usa `var(--hvc-danger)` con opacidad
- **Propósito:** Página de configuraciones completamente alineada con paleta HVC Kapital

#### 33. `src/app/auth/pages/configuraciones-page/configuraciones-page.css` (Nuevo)
- **Cambio:** Creado archivo CSS con estilos hover para botones y filas de tabla
- **Clases:** `.config-btn-edit`, `.config-btn-delete`, `.config-table-row`
- **Propósito:** Hover states via CSS para botones de acción y filas de tabla

#### 34. `src/styles.css`
- **Cambio:** Agregado `@source inline("peer-checked:bg-success-500")` al safelist de Tailwind
- **Propósito:** Permitir uso dinámico de `peer-checked:bg-success-500` en toggle switches de configuraciones-page

---

## Últimos Cambios (2026-08-19 - Sesión 2)

### Componentes Shared Actualizados

#### 10. `src/app/shared/components/pagination/pagination.html`
- **Cambio:** Reemplazados colores hardcodeados (`text-gray-700`, `text-gray-600`, `bg-gray-200`, `hover:bg-gray-300`, `bg-blue-500`) por variables CSS HVC
- **Cambio:** Select usa `var(--hvc-gray)` para texto y `var(--hvc-primary-light)` para bordes
- **Cambio:** Botones usan `var(--hvc-primary-light)` y `var(--hvc-primary)` para estados hover/active
- **Propósito:** Paginación alineada con paleta HVC Kapital

#### 11. `src/app/shared/components/pagination/pagination.css` (Nuevo)
- **Cambio:** Creado archivo CSS con estilos hover para paginación
- **Clases:** `.pagination-btn`, `.pagination-btn--active`
- **Propósito:** Manejar hover states via CSS

#### 12. `src/app/shared/components/custom-icon/custom-icon.component.ts`
- **Cambio:** `DEFAULT_COLOR` actualizado de `rgb(50, 50, 50)` a `var(--hvc-primary-dark)`
- **Cambio:** Icono de fallback `help-circle` usa `var(--hvc-danger)` en lugar de `text-red-500`
- **Propósito:** Iconos usan colores de paleta HVC Kapital

#### 13. `src/app/shared/pages/401-page/401-page.html`
- **Cambio:** Reemplazado `bg-blue-600` por `var(--hvc-primary-dark)`
- **Cambio:** Reemplazado `bg-blue-200 hover:bg-blue-700` por clase `btn-hvc-primary`
- **Cambio:** Texto usa `var(--hvc-primary-light)` y `var(--hvc-gray-light)`
- **Propósito:** Página 401 alineada con paleta HVC

#### 14. `src/app/shared/pages/401-page/401-page.css`
- **Cambio:** Eliminados colores hardcodeados `#007aff`
- **Cambio:** `h1` usa `var(--hvc-primary-light)` con text-shadow usando `var(--hvc-primary)`
- **Cambio:** `p` usa `var(--hvc-gray-light)`
- **Propósito:** Estilos de página 401 consistentes con HVC

#### 15. `src/app/shared/pages/404-page/404-page.html`
- **Cambio:** Mismos cambios que 401-page (colores HVC)
- **Propósito:** Página 404 alineada con paleta HVC

#### 16. `src/app/shared/pages/404-page/404-page.css`
- **Cambio:** Mismos cambios que 401-page CSS
- **Propósito:** Estilos de página 404 consistentes con HVC

#### 17. `src/app/shared/pages/home-page/home-page.html`
- **Cambio:** Reemplazado `text-[#1e2328]` por `var(--hvc-primary-dark)`
- **Cambio:** Reemplazados `text-gray-500`, `text-gray-600`, `text-gray-900` por `var(--hvc-gray)` y `var(--hvc-primary-dark)`
- **Cambio:** Reemplazado `border-gray-200` por `var(--hvc-primary-light)`
- **Cambio:** Gradiente de fondo usa `rgba(var(--color-primary), 0.1)` y `rgba(var(--color-corporate-dark), 0.1)`
- **Propósito:** HomePage alineada con paleta HVC

#### 18. `src/app/shared/pages/home-page/home-page.css` (Nuevo)
- **Cambio:** Creado archivo CSS con estilos hover para tarjetas
- **Clases:** `.home-card`
- **Propósito:** Hover states para tarjetas de acceso rápido

---

## Últimos Cambios (2026-08-19 - Sesión 3: Storybook Stories)

### Stories de Páginas Auth Creadas

Se crearon 11 stories para todas las páginas del módulo `auth/pages`, incluidas en `src/stories/`. Cada story sigue el patrón del `dashboard-page.component.stories.ts` existente, con:

- Mock de servicios para evitar llamadas HTTP reales
- Providers de Angular (Router, HttpClient, Animations, Toastr)
- Datos mock pre-cargados para visualización en Storybook

#### 19. `src/stories/login-page.component.stories.ts`
- **Componente:** `LoginComponent`
- **Mocks:** `AuthService`, `AccesoService`
- **Propósito:** Visualizar la página de login sin backend

#### 20. `src/stories/usuarios-page.component.stories.ts`
- **Componente:** `UsuariosPageComponent`
- **Mocks:** `AuthService`, `UsuariosService`, `RolService`, `PuestoService`, `SucursalService`, `StorageService`
- **Datos:** 2 usuarios mock con roles y puestos
- **Propósito:** Visualizar la gestión de usuarios

#### 21. `src/stories/mi-perfil-page.component.stories.ts`
- **Componente:** `MiPerfilPageComponent`
- **Mocks:** `AuthService`, `UsuariosService`, `RolService`, `PuestoService`
- **Datos:** Usuario mock con perfil completo
- **Propósito:** Visualizar la página de perfil de usuario

#### 22. `src/stories/permiso-page.component.stories.ts`
- **Componente:** `PermisoPageComponent`
- **Mocks:** `PermisoService`
- **Datos:** 3 permisos mock (USR_CREAR, USR_EDITAR, ROL_CREAR)
- **Propósito:** Visualizar la gestión de permisos

#### 23. `src/stories/menu-page.component.stories.ts`
- **Componente:** `MenuPageComponent`
- **Mocks:** `MenuService`
- **Datos:** 2 menús principales + 2 submenús mock
- **Propósito:** Visualizar la gestión de menús con tabs

#### 24. `src/stories/puesto-page.component.stories.ts`
- **Componente:** `PuestoPageComponent`
- **Mocks:** `PuestoService`
- **Datos:** 3 puestos mock
- **Propósito:** Visualizar la gestión de puestos

#### 25. `src/stories/configuraciones-page.component.stories.ts`
- **Componente:** `ConfiguracionesPageComponent`
- **Mocks:** `ConfigService`
- **Datos:** 3 configuraciones mock (APP_NAME, MAX_SESSION_MINUTES, ENABLE_NOTIFICATIONS)
- **Propósito:** Visualizar la gestión de configuraciones

#### 26. `src/stories/rol-page.component.stories.ts`
- **Componente:** `RolPageComponent`
- **Mocks:** `RolService`
- **Datos:** 3 roles mock (Administrador, Operador, Invitado)
- **Propósito:** Visualizar la gestión de roles

#### 27. `src/stories/sucursal-page.component.stories.ts`
- **Componente:** `SucursalPageComponent`
- **Mocks:** `SucursalService`
- **Datos:** 3 sucursales mock (Central, Santa Tecla, San Miguel)
- **Propósito:** Visualizar la gestión de sucursales

#### 28. `src/stories/permisos-rol-page.component.stories.ts`
- **Componente:** `PermisosRolPageComponent`
- **Mocks:** `RolService`, `PermisoRolService`
- **Datos:** 2 roles + 3 permisos en matriz mock
- **Propósito:** Visualizar la asignación de permisos por rol

#### 29. `src/stories/acceso-page.component.stories.ts`
- **Componente:** `AccesoPageComponent`
- **Mocks:** `RolService`, `MenuService`, `AccesoService`
- **Datos:** 2 roles + 4 menús + 1 acceso mock con submenús
- **Propósito:** Visualizar la asignación de accesos por rol

---

## Notas para el Desarrollador

- Las variables CSS están definidas en `src/styles.css` bajo `:root`
- Las variables RGB para Tailwind están en `src/styles/colors.css`
- Los componentes usan `style` bindings para aplicar variables CSS (no clases utilitarias de Tailwind)
- Los colores de hover se manejan via clases CSS (`.navbar-toggle:hover`, `.sidebar-item:hover`, etc.)
- El archivo `Paleta_Colores_HVC_Kapital.md` contiene la documentación completa de la paleta
- **Importante:** Los componentes ahora tienen sus propios archivos CSS para estilos hover
- **Storybook:** Las stories usan servicios mock para evitar llamadas HTTP reales. Cada story está en `src/stories/<nombre>-page.component.stories.ts`
- **Build verificado:** El proyecto compila correctamente con `npm run build`
