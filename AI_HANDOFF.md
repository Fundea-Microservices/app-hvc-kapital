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

1. **Verificar visualmente** los cambios en el navegador para asegurar que la paleta se aplica correctamente
2. **Buscar otros componentes** que puedan tener colores hardcodeados y actualizarlos
3. **Considerar agregar** una sección de CSS para el dropdown del usuario con estilos consistentes
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

## Notas para el Desarrollador

- Las variables CSS están definidas en `src/styles.css` bajo `:root`
- Las variables RGB para Tailwind están en `src/styles/colors.css`
- Los componentes usan `style` bindings para aplicar variables CSS (no clases utilitarias de Tailwind)
- Los colores de hover se manejan via clases CSS (`.navbar-toggle:hover`, `.sidebar-item:hover`, etc.)
- El archivo `Paleta_Colores_HVC_Kapital.md` contiene la documentación completa de la paleta
- **Importante:** Los componentes ahora tienen sus propios archivos CSS para estilos hover
- **Build verificado:** El proyecto compila correctamente con `npm run build`
