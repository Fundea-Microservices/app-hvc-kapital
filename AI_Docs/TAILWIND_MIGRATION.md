# Migración: `style=""` → Clases Tailwind

## HVC Kapital — Sistema de Administración de Inversiones

**Fecha:** 2026-08-21  
**Branch:** `feature/color-changes`  
**Estado:** ✅ Completada

---

## 1. Objetivo

Migrar todos los atributos `style=""` de los templates HTML del proyecto a clases utilitarias de Tailwind CSS, estableciendo `@theme` en `styles.css` como la **fuente de verdad única** para los colores del proyecto.

**Antes:** Los colores se definían en dos lugares paralelos:
- `@theme { --color-primary: ... }` → clases Tailwind (`bg-primary`, `text-primary`)
- `:root { --hvc-primary: ... }` → variables CSS usadas en `style=""`

**Después:** Los colores se definen en `@theme` y se usan exclusivamente como clases Tailwind en los templates.

---

## 2. Tokens de Color en `@theme`

Se registraron los siguientes tokens en `src/styles.css` bajo `@theme` para generar automáticamente las clases utilitarias de Tailwind:

```css
@theme {
  /* Primarios */
  --color-primary: #1E335E;
  --color-primary-dark: #071737;
  --color-primary-light: #95A2BB;

  /* Acentos */
  --color-accent-orange: #FA9A37;
  --color-accent-gold: #FCC232;
  --color-accent-peach: #F9D3AD;

  /* Neutros */
  --color-gray: #8D9EBF;
  --color-gray-light: #A4ABBD;

  /* Estado */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;

  /* Sidebar */
  --color-sidebar-bg: #071737;
  --color-sidebar-border: #1E335E;
  --color-sidebar-hover: #1E335E;
  --color-sidebar-active: #FA9A37;
  --color-sidebar-text: #cbd5e1;
  --color-sidebar-text-active: #ffffff;

  /* Navbar */
  --color-navbar-bg: #071737;
  --color-navbar-border: #1E335E;
  --color-navbar-hover: #1E335E;
  --color-navbar-text: #f1f5f9;
  --color-navbar-text-secondary: #A4ABBD;

  /* UI Genéricos */
  --color-hover: #eef0f2;

  /* Tabla */
  --color-table-border: #cbd5e1;
  --color-table-header-bg: #ffffff;
  --color-table-header: #1E335E;
  --color-table-row-bg: #ffffff;
}
```

### Clases Tailwind generadas

| Token `@theme` | Clase generada | Ejemplo de uso |
|:---|:---|:---|
| `--color-primary` | `bg-primary`, `text-primary`, `border-primary` | `<div class="bg-primary">` |
| `--color-primary-dark` | `bg-primary-dark`, `text-primary-dark` | `<h2 class="text-primary-dark">` |
| `--color-primary-light` | `bg-primary-light`, `text-primary-light`, `border-primary-light` | `<span class="text-primary-light">` |
| `--color-danger` | `bg-danger`, `text-danger`, `border-danger` | `<div class="text-danger">` |
| `--color-hover` | `bg-hover` | `<button class="bg-hover">` |
| `--color-table-border` | `border-table-border` | `<td class="border border-table-border">` |

---

## 3. Mapeo de `style=""` → Clases Tailwind

### 3.1 Patrones de Breadcrumb

| Antes | Después |
|:---|:---|
| `style="color: var(--text)"` | `text-primary-dark` |
| `style="color: var(--hvc-primary)"` | `text-primary` |
| `style="color: var(--hvc-primary-light)"` | `text-primary-light` |

### 3.2 Patrones de Tarjeta/Contenedor

| Antes | Después |
|:---|:---|
| `style="border: 1px solid var(--hvc-primary-light)"` | `border border-primary-light` |
| `style="border-bottom: 1px solid var(--hvc-primary-light)"` | `border-b border-primary-light` |
| `style="border-top: 1px solid var(--hvc-primary-light)"` | `border-t border-primary-light` |

### 3.3 Patrones de Títulos

| Antes | Después |
|:---|:---|
| `style="color: var(--hvc-primary-dark)"` | `text-primary-dark` |
| `style="color: var(--hvc-gray)"` | `text-gray` |
| `style="color: var(--hvc-gray-light)"` | `text-gray-light` |

### 3.4 Patrones de Estados Vacíos/Carga

| Antes | Después |
|:---|:---|
| `style="color: var(--hvc-primary-light)"` | `text-primary-light` |

### 3.5 Patrones de Tabla

| Antes | Después |
|:---|:---|
| `style="border: 1px solid var(--table-border-color)"` | `border border-table-border` |
| `style="color: var(--table-header-color)"` | `text-table-header` |

### 3.6 Patrones de Modal

| Antes | Después |
|:---|:---|
| `style="background-color: var(--hover)"` | `bg-hover` |
| `style="background-color: var(--hvc-danger); opacity: 0.1"` | `bg-danger/10` |
| `style="background-color: var(--hvc-danger)"` | `bg-danger` |

### 3.7 Patrones de Formulario

| Antes | Después |
|:---|:---|
| `style="color: var(--text)"` | `text-primary-dark` |
| `style="color: var(--hvc-danger)"` | `text-danger` |
| `style="border-color: var(--hvc-primary-light)"` | `border-primary-light` |
| `style="--tw-ring-color: var(--hvc-primary)"` | `ring-primary` |

### 3.8 Patrones de Toggle/Switch

| Antes | Después |
|:---|:---|
| `style="background-color: var(--hvc-gray-light)"` | `bg-gray-light` |
| `style="--tw-ring-color: var(--hvc-primary)"` | `ring-primary` |

### 3.9 Patrones de Sidebar/Navbar

| Antes | Después |
|:---|:---|
| `style="background-color: var(--sidebar-bg)"` | `bg-sidebar-bg` |
| `style="border-color: var(--sidebar-border)"` | `border-sidebar-border` |
| `style="background-color: var(--navbar-bg)"` | `bg-navbar-bg` |
| `style="color: var(--navbar-text)"` | `text-navbar-text` |
| `style="color: var(--navbar-text-secondary)"` | `text-navbar-text-secondary` |
| `[style.border-color]="'var(--hvc-accent-orange)'"` | `routerLinkActive="border-l-4 border-accent-orange"` |

---

## 4. Archivos Migrados (26 en total)

### 4.1 Dashboard (3 archivos)

| Archivo | `style=""` eliminados | Clases Tailwind aplicadas |
|:---|:---:|:---|
| `dashboard-page.html` | 2 | `bg-sidebar-bg`, `border-sidebar-border`, `border-b`, `border-navbar-border` |
| `nav-bar.html` | 6 | `bg-navbar-bg`, `text-navbar-text`, `ring-accent-orange`, `text-navbar-text-secondary`, `text-accent-orange`, `text-primary-dark`, `text-gray` |
| `side-menu.html` | 1 | `text-navbar-text` |
| `side-menu-list.component.html` | 3 + 1 SVG | `text-navbar-text-secondary`, `border-accent-orange` en `routerLinkActive` |

### 4.2 Shared (4 archivos)

| Archivo | `style=""` eliminados | Clases Tailwind aplicadas |
|:---|:---:|:---|
| `pagination.html` | 4 | `text-primary-dark`, `text-gray`, `border-primary-light`, `bg-primary-light` |
| `home-page.html` | 8 | `border-primary-light`, `text-primary-dark`, `text-gray`, `bg-white` |
| `401-page.html` | 3 | `bg-primary-dark`, `text-primary-light`, `text-gray-light` |
| `404-page.html` | 3 | `bg-primary-dark`, `text-primary-light`, `text-gray-light` |

### 4.3 Auth Pages (11 archivos)

| Archivo | `style=""` eliminados |
|:---|:---:|
| `login.html` | 11 |
| `usuarios-page.html` | ~20 |
| `mi-perfil-page.html` | ~20 |
| `permiso-page.html` | ~15 |
| `menu-page.html` | ~25 |
| `puesto-page.html` | ~12 |
| `configuraciones-page.html` | ~15 |
| `rol-page.html` | ~15 |
| `sucursal-page.html` | ~20 |
| `permisos-rol-page.html` | ~20 |
| `acceso-page.html` | ~20 |

### 4.4 Auth Components (8 archivos)

| Archivo | `style=""` eliminados |
|:---|:---:|
| `upsert-usuario.html` | ~15 |
| `upsert-rol.html` | ~8 |
| `upsert-sucursal.html` | ~12 |
| `upsert-puesto.component.html` | ~5 |
| `upsert-permiso.html` | ~10 |
| `upsert-menu.html` | ~12 |
| `upsert-config.html` | ~15 |
| `upsert-acceso.html` | ~10 |

---

## 5. Bugs Corregidos

### 5.1 `rgba()` con valores hex (side-menu.css)

```css
/* ❌ Antes — no funcionaba */
.sidebar-close-btn {
  background-color: rgba(var(--color-primary), 0.5);
}

/* ✅ Después — funciona con cualquier formato de color */
.sidebar-close-btn {
  background-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
}
```

### 5.2 `ring-color` inválido (nav-bar.html)

```html
<!-- ❌ Antes — ring-color no es CSS válido -->
<img class="ring-2" style="ring-color: var(--hvc-accent-orange);">

<!-- ✅ Después — usa la clase Tailwind correcta -->
<img class="ring-2 ring-accent-orange">
```

### 5.3 Variable inexistente (home-page.html)

```html
<!-- ❌ Antes — --color-corporate-dark no existe en ningún lado -->
<div style="background: linear-gradient(to right, 
  rgba(var(--color-primary), 0.1), 
  rgba(var(--color-corporate-dark), 0.1));">

<!-- ✅ Después — usa variables que sí existen en @theme -->
<div style="background: linear-gradient(to right, 
  color-mix(in srgb, var(--color-primary) 10%, transparent), 
  color-mix(in srgb, var(--color-primary-dark) 10%, transparent));">
```

> **Nota:** Los gradientes se mantuvieron como `style=""` porque son estilos complejos que no tienen sentido como clases utilitarias simples.

---

## 6. Archivos CSS de Componentes

Los archivos CSS de componentes se **mantuvieron intactos**. Proporcionan:
- **Hover states** con transiciones suaves
- **Estilos reutilizables** que se aplican en múltiples elementos
- **Lógica de estilo específica** que no tiene sentido como clases utilitarias

### Archivos CSS que siguen activos:

| Archivo | Clases CSS | Uso |
|:---|:---|:---|
| `nav-bar.css` | `.navbar-toggle`, `.navbar-user-btn`, `.navbar-dropdown-item`, `.navbar-dropdown-item--danger` | Hover states del navbar |
| `side-menu.css` | `.sidebar-close-btn` | Botón cerrar sidebar (móvil) |
| `side-menu-list.component.css` | `.sidebar-item`, `.sidebar-accordion-toggle`, `.sidebar-submenu-item` | Hover states del menú lateral |
| `pagination.css` | `.pagination-btn`, `.pagination-btn--active` | Hover states de paginación |
| `home-page.css` | `.home-card` | Hover states de tarjetas |
| `401-page.css` | `h1`, `p` | Text-shadows y estilos específicos |
| `404-page.css` | `h1`, `p` | Text-shadows y estilos específicos |

---

## 7. Limpieza de Variables `:root` (2026-08-21)

### Problema

Las variables `--hvc-*` en `:root` tenían los **mismos valores hardcoded** que las variables `--color-*` en `@theme`. Esto creaba duplicación y riesgo de inconsistencia.

### Solución

Se reemplazaron los valores hardcoded en `:root` con **referencias a `@theme`**:

```css
/* ❌ Antes — valores duplicados */
:root {
  --hvc-primary: #1E335E;
  --hvc-primary-dark: #071737;
  /* ... */
}

/* ✅ Después — una sola fuente de verdad */
:root {
  --hvc-primary: var(--color-primary);
  --hvc-primary-dark: var(--color-primary-dark);
  /* ... */
}
```

### Variables actualizadas

| Variable `:root` | Antes | Después |
|:---|:---|:---|
| `--hvc-primary` | `#1E335E` | `var(--color-primary)` |
| `--hvc-primary-light` | `#95A2BB` | `var(--color-primary-light)` |
| `--hvc-primary-dark` | `#071737` | `var(--color-primary-dark)` |
| `--hvc-accent-orange` | `#FA9A37` | `var(--color-accent-orange)` |
| `--hvc-accent-gold` | `#FCC232` | `var(--color-accent-gold)` |
| `--hvc-accent-peach` | `#F9D3AD` | `var(--color-accent-peach)` |
| `--hvc-gray` | `#8D9EBF` | `var(--color-gray)` |
| `--hvc-gray-light` | `#A4ABBD` | `var(--color-gray-light)` |
| `--hvc-success` | `#22C55E` | `var(--color-success)` |
| `--hvc-warning` | `#F59E0B` | `var(--color-warning)` |
| `--hvc-danger` | `#EF4444` | `var(--color-danger)` |
| `--hover` | `#eef0f2` | `var(--color-hover)` |
| `--text` | `var(--hvc-primary-dark)` | `var(--color-primary-dark)` |
| `--textsecun` | `var(--hvc-gray)` | `var(--color-gray)` |
| `--sidebar-*` | `var(--hvc-*)` / hardcoded | `var(--color-sidebar-*)` |
| `--navbar-*` | `var(--hvc-*)` / hardcoded | `var(--color-navbar-*)` |
| `--toastr-*` | `var(--hvc-*)` | `var(--color-*)` |
| `--table-*` | hardcoded | `var(--color-table-*)` |

---

## 8. Arquitectura de Colores (Resultado Final)

```
src/styles.css
├── @theme { --color-*: #hex; }     ← ÚNICA fuente de verdad
│   ├── --color-primary: #1E335E
│   ├── --color-primary-dark: #071737
│   ├── --color-primary-light: #95A2BB
│   ├── --color-accent-orange: #FA9A37
│   ├── --color-sidebar-*
│   ├── --color-navbar-*
│   ├── --color-hover: #eef0f2
│   └── --color-table-*
│
├── :root { --hvc-*: var(--color-*) }  ← Referencias (backward compat)
│   ├── --hvc-primary: var(--color-primary)
│   ├── --hvc-primary-dark: var(--color-primary-dark)
│   ├── --sidebar-bg: var(--color-sidebar-bg)
│   └── ... (otros)
│
└── .css de componentes { var(--hvc-*) }  ← Siguen funcionando
    ├── nav-bar.css
    ├── side-menu.css
    ├── side-menu-list.component.css
    ├── pagination.css
    └── ...
```

### Regla de decisión:

| Necesidad | Dónde definir | Ejemplo |
|:---|:---|:---|
| Color de fondo/texto en HTML | `@theme` → clase Tailwind | `bg-primary`, `text-primary-dark` |
| Hover state de un componente | Archivo `.css` del componente | `.sidebar-item:hover` |
| Borde dinámico (routerLinkActive) | `routerLinkActive="border-accent-orange"` | En el template |
| Estilo complejo (gradiente, text-shadow) | `style=""` (aceptable) | `style="background: linear-gradient(...)"` |
| Nuevo color en la paleta | Agregar en `@theme` | `--color-nuevo: #hex;` |

---

## 9. Verificación

- ✅ Build exitoso: `npx ng build` sin errores
- ✅ 0 archivos HTML con `style=""` restantes (excepto gradientes complejos)
- ✅ Todos los colores definidos en `@theme` como fuente de verdad
- ✅ Variables `:root` ahora referencian `@theme` (sin duplicación)
- ✅ CSS files de componentes mantienen hover states
- ✅ Bugs corregidos: `rgba()`, `ring-color`, variable inexistente

---

## 10. Guía para Nuevos Componentes

Al crear nuevos componentes, seguir este patrón:

```html
<!-- ✅ CORRECTO: Usar clases Tailwind -->
<div class="bg-white border border-primary-light rounded-lg">
  <h2 class="text-lg font-semibold text-primary-dark">Título</h2>
  <p class="text-sm text-gray">Descripción</p>
</div>

<!-- ❌ INCORRECTO: Usar style="" con variables -->
<div style="background-color: white; border: 1px solid var(--hvc-primary-light);">
  <h2 style="color: var(--hvc-primary-dark);">Título</h2>
  <p style="color: var(--hvc-gray);">Descripción</p>
</div>
```

### Para hover states:

```css
/* En el .css del componente */
.mi-componente-boton:hover {
  background-color: var(--hvc-primary-dark);
  color: #ffffff;
}
```
