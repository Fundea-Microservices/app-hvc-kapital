# Guía de Colores `@theme` — HVC Kapital

## Referencia rápida de dónde se usa cada color

Ubicación: `src/styles.css` → bloque `@theme`

---

## 1. Primarios

### `--color-primary` → `#1E335E` (Azul Principal)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `text-primary` | Links de breadcrumb | Todos los `*-page.html` |
| `border-primary` | Focus ring de inputs | `upsert-config`, `upsert-sucursal` |
| `bg-primary` | — (reservado) | — |

---

### `--color-primary-dark` → `#071737` (Azul Oscuro)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `text-primary-dark` | Títulos de sección (`h2`, `h3`) | Todos los `*-page.html` |
| `text-primary-dark` | Labels de formularios | Todos los `upsert-*.html` |
| `text-primary-dark` | Texto de breadcrumbs | Todos los `*-page.html` |
| `text-primary-dark` | Nombre de usuario en dropdown | `nav-bar.html` |
| `text-primary-dark` | Texto de modales (títulos) | Todos los `*-page.html` |
| `bg-primary-dark` | Fondo del sidebar | `dashboard-page.html` |
| `bg-primary-dark` | Fondo del navbar | `dashboard-page.html` |
| `bg-primary-dark` | Fondo de páginas 401/404 | `401-page.html`, `404-page.html` |
| `bg-primary-dark` | Fondo del login | `login.html` |
| `border-primary-dark` | — (reservado) | — |

---

### `--color-primary-light` → `#95A2BB` (Azul Claro / Grisáceo)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `text-primary-light` | Item actual en breadcrumb | Todos los `*-page.html` |
| `text-primary-light` | Estados vacíos ("No se encontraron...") | Todos los `*-page.html` |
| `text-primary-light` | Texto secundario en modales | `usuarios-page.html`, `mi-perfil-page.html` |
| `text-primary-light` | Labels de búsqueda | `sucursal-page.html` |
| `text-primary-light` | Texto de teléfono/dirección | `sucursal-page.html` |
| `text-primary-light` | Texto de ayuda/permisos | `permisos-rol-page.html` |
| `border-primary-light` | Bordes de tarjetas/contenedores | Todos los `*-page.html` |
| `border-primary-light` | Bordes de secciones (header, footer) | Todos los `*-page.html` |
| `border-primary-light` | Bordes de modales | Todos los `*-page.html` |
| `border-primary-light` | Bordes de inputs/selects | Todos los `upsert-*.html` |
| `border-primary-light` | Bordes de tablas de configuración | `upsert-config.html` |
| `border-primary-light` | Bordes de listas de items | `acceso-page.html` |
| `bg-primary-light` | Fondo de botones de paginación | `pagination.html` |

---

## 2. Acentos

### `--color-accent-orange` → `#FA9A37` (Naranja Acento)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `text-accent-orange` | Sucursal en dropdown del navbar | `nav-bar.html` |
| `ring-accent-orange` | Anillo del avatar del usuario | `nav-bar.html` |
| `bg-accent-orange` | — (reservado para CTAs) | — |
| `border-accent-orange` | Borde izquierdo de item activo en sidebar | `side-menu-list.component.html` |
| `accent-accent-orange` | Color de checkboxes | `acceso-page.html`, `upsert-acceso.html` |

---

### `--color-accent-gold` → `#FCC232` (Amarillo Oro)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `bg-accent-gold` | Toggle switch activo | `usuarios-page.html`, `permiso-page.html`, `menu-page.html`, `configuraciones-page.html`, `permisos-rol-page.html` |
| `text-accent-gold` | — (reservado) | — |

---

### `--color-accent-peach` → `#F9D3AD` (Durazno Suave)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `bg-accent-peach` | Badges de menú/rol en acceso | `upsert-acceso.html` |

---

## 3. Neutros

### `--color-gray` → `#8D9EBF` (Gris Neutro)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `text-gray` | Username en dropdown del navbar | `nav-bar.html` |
| `text-gray` | Descripción de permisos en tabla | `permiso-page.html`, `permisos-rol-page.html` |
| `text-gray` | Texto de dirección en cards | `sucursal-page.html` |
| `text-gray` | Texto de ayuda de iconos | `upsert-menu.html` |
| `text-gray` | Footer del login | `login.html` |
| `border-gray` | Select de paginación | `pagination.html` |

---

### `--color-gray-light` → `#A4ABBD` (Gris Suave)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `text-gray-light` | Texto "(opcional)" en labels | `upsert-usuario.html`, `upsert-sucursal.html` |
| `text-gray-light` | Link "Admin" en footer | `login.html` |
| `text-gray-light` | Texto "Accede a tu cuenta" | `login.html` |
| `bg-gray-light` | Fondo de toggle switch (inactivo) | Todos los `upsert-*.html` |

---

## 4. Estado

### `--color-success` → `#22C55E` (Verde Éxito)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `bg-success` | — (reservado para confirmaciones) | — |
| `text-success` | — (reservado) | — |

---

### `--color-warning` → `#F59E0B` (Naranja/Amarillo Alerta)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `bg-warning/15` | Alerta "Seleccione un rol" | `acceso-page.html` |
| `border-warning` | Borde de alerta | `acceso-page.html` |

---

### `--color-danger` → `#EF4444` (Rojo Peligro)

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `text-danger` | Errores de validación | Todos los `upsert-*.html` |
| `text-danger` | Mensaje de error en login | `login.html` |
| `bg-danger` | Botones de eliminar | Todos los `*-page.html` (modales) |
| `bg-danger/10` | Alertas de confirmación de eliminación | Todos los `*-page.html` (modales) |

---

## 5. Sidebar

| Token | Clase | Elemento / Uso | Archivos |
|:---|:---|:---|:---|
| `--color-sidebar-bg` | `bg-sidebar-bg` | Fondo del sidebar | `dashboard-page.html` |
| `--color-sidebar-border` | `border-sidebar-border` | Borde derecho del sidebar | `dashboard-page.html` |
| `--color-sidebar-hover` | `bg-sidebar-hover` | Hover de items del sidebar | `side-menu-list.component.css` |
| `--color-sidebar-active` | `bg-sidebar-active` | Item activo del sidebar | `side-menu-list.component.css` |
| `--color-sidebar-text` | `text-sidebar-text` | Texto/iconos del sidebar | `side-menu-list.component.css` |
| `--color-sidebar-text-active` | `text-sidebar-text-active` | Texto de item activo | `side-menu-list.component.css` |

---

## 6. Navbar

| Token | Clase | Elemento / Uso | Archivos |
|:---|:---|:---|:---|
| `--color-navbar-bg` | `bg-navbar-bg` | Fondo del navbar | `nav-bar.html` |
| `--color-navbar-border` | `border-navbar-border` | Borde inferior del navbar | `dashboard-page.html` |
| `--color-navbar-hover` | `bg-navbar-hover` | Hover de botones del navbar | `nav-bar.css` |
| `--color-navbar-text` | `text-navbar-text` | Texto principal del navbar | `nav-bar.html`, `side-menu.html` |
| `--color-navbar-text-secondary` | `text-navbar-text-secondary` | Texto secundario (rol) | `nav-bar.html`, `side-menu-list.component.html` |

---

## 7. UI Genéricos

### `--color-hover` → `#eef0f2`

| Clase generada | Elemento / Uso | Archivos |
|:---|:---|:---|
| `bg-hover` | Fondo de botones cerrar modal (✕) | Todos los `*-page.html` |
| `bg-hover` | Hover de items de dropdown | `nav-bar.css` |

---

## 8. Tabla

| Token | Clase | Elemento / Uso | Archivos |
|:---|:---|:---|:---|
| `--color-table-border` | `border-table-border` | Bordes de celdas de tabla | Todos los `*-page.html` |
| `--color-table-header-bg` | `bg-table-header-bg` | Fondo de encabezados | `acceso-page.html` |
| `--color-table-header` | `text-table-header` | Texto de encabezados | `acceso-page.html` |
| `--color-table-row-bg` | `bg-table-row-bg` | Fondo de filas | `acceso-page.html` |

---

## 9. Resumen Visual

```
┌─────────────────────────────────────────────────────────┐
│                    APLICACIÓN HVC                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─── SIDEBAR ──────────────────────────────────────┐   │
│  │ bg-sidebar-bg    border-sidebar-border            │   │
│  │ text-sidebar-text                                 │   │
│  │ bg-sidebar-hover  bg-sidebar-active               │   │
│  └───────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── NAVBAR ───────────────────────────────────────┐   │
│  │ bg-navbar-bg    border-navbar-border              │   │
│  │ text-navbar-text  text-navbar-text-secondary      │   │
│  └───────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── CONTENIDO ────────────────────────────────────┐   │
│  │                                                   │   │
│  │  Breadcrumb:                                      │   │
│  │    Links → text-primary                           │   │
│  │    Actual → text-primary-light                    │   │
│  │                                                   │   │
│  │  Tarjetas:                                        │   │
│  │    Bordes → border-primary-light                  │   │
│  │    Títulos → text-primary-dark                    │   │
│  │                                                   │   │
│  │  Tablas:                                          │   │
│  │    Bordes → border-table-border                   │   │
│  │    Headers → text-table-header                    │   │
│  │                                                   │   │
│  │  Inputs:                                          │   │
│  │    Bordes → border-primary-light                  │   │
│  │    Focus → ring-primary                           │   │
│  │                                                   │   │
│  │  Botones:                                         │   │
│  │    Primario → bg-primary (btn-hvc-primary)        │   │
│  │    Eliminar → bg-danger                           │   │
│  │    Cancelar → bg-primary-light                    │   │
│  │                                                   │   │
│  │  Errores:                                         │   │
│  │    Validación → text-danger                       │   │
│  │    Eliminación → bg-danger/10                     │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Cómo agregar un nuevo color

1. Agregar en `@theme`:
```css
--color-nuevo: #HEXVALOR;
```

2. Usar en templates:
```html
<div class="bg-nuevo text-nuevo border-nuevo">
```

3. Las variantes hover/focus funcionan automáticamente:
```html
<button class="bg-nuevo hover:bg-nuevo/80 focus:ring-nuevo">
```
