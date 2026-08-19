# Manual de Paleta de Colores y Guía de Aplicación UI
## HVC Kapital — Sistema de Administración de Inversiones

---

## 1. Introducción
El presente documento define la paleta de colores oficial de **HVC Kapital** y establece la relación directa entre las variables CSS globales, las clases utilitarias definidas en `styles.css` y su uso recomendado dentro de la interfaz de usuario (UI). El objetivo es garantizar una experiencia visual profesional, accesible y fácil de mantener en todo el ecosistema frontend del proyecto.

---

## 2. Resumen General de la Paleta y Clases CSS Utilitarias

| Categoría | Nombre del Color | Hexadecimal | Variable CSS | Clases CSS Utilitarias (`styles.css`) | Rol Principal en la Interfaz |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primario** | Azul Principal | `#1E335E` | `--hvc-primary` | `.bg-primary`, `.text-primary`, `.bg-corporate-light-blue`, `.btn-hvc-primary` | Header, navegación, botones primarios, títulos clave |
| **Primario** | Azul Oscuro | `#071737` | `--hvc-primary-dark` | `.bg-corporate-dark-blue`, `.bg-primary-700` | Texto principal, encabezados (H1-H3), barra lateral activa |
| **Primario** | Azul Claro | `#95A2BB` | `--hvc-primary-light` | `.bg-secondary`, `.text-secondary`, `.bg-primary-100` | Textos secundarios, iconos inactivos, bordes suaves |
| **Acento** | Naranja Acento | `#FA9A37` | `--hvc-accent-orange` | `.bg-terciary`, `.text-terciary`, `.btn-hvc-accent` | Llamados a la acción (CTA), botones acento, datos alcistas |
| **Acento** | Amarillo Oro | `#FCC232` | `--hvc-accent-gold` | `.bg-corporate-accent-gold` | Alertas preventivas, estado pendiente, hover del botón acento |
| **Acento** | Durazno Suave | `#F9D3AD` | `--hvc-accent-peach` | `.bg-primary-50` | Fondos de selección, hovers suaves, badges secundarios |
| **Neutro** | Gris Neutro | `#8D9EBF` | `--hvc-gray` | Variable `--textsecun` | Textos secundarios de apoyo, placeholders |
| **Neutro** | Gris Suave | `#A4ABBD` | `--hvc-gray-light` | N/A | Bordes deshabilitados, elementos inactivos |
| **Estado** | Verde Éxito | `#22C55E` | `--hvc-success` | `.bg-success-500`, `.bg-success-50` | Confirmaciones, estados aprobados, rendimientos positivos |
| **Estado** | Naranja/Amarillo Alerta | `#F59E0B` | `--hvc-warning` | `.bg-warning-500`, `.bg-warning-50` | Advertencias de sistema, transacciones en proceso |
| **Estado** | Rojo Peligro | `#EF4444` | `--hvc-danger` | `.bg-danger-500`, `.bg-danger-50` | Errores críticos, eliminación, saldos negativos |

---

## 3. Especificación Detallada y Uso de Clases CSS

### 3.1. Colores Primarios Corporativos
Definen la identidad gráfica de la marca en la aplicación.

#### Azul Principal (`#1E335E`)
* **Variables:** `--hvc-primary`
* **Clases Utilitarias:**
  * `.bg-primary` / `.bg-corporate-light-blue`: Fondo azul institucional.
  * `.text-primary`: Color de fuente o icono en azul institucional.
  * `.btn-hvc-primary`: Estilo de botón principal.
* **Uso Recomendado:** Barra de navegación superior (Navbar), títulos de módulos y botones de confirmación principal.

#### Azul Oscuro (`#071737`)
* **Variables:** `--hvc-primary-dark`, `--text`
* **Clases Utilitarias:**
  * `.bg-corporate-dark-blue` / `.bg-primary-700`: Fondo azul oscuro corporativo.
* **Uso Recomendado:** Texto base (`<body>`), títulos principales (`<h1>`, `<h2>`, `<h3>`), sidebars corporativos y fondo `:hover` de `.btn-hvc-primary`.

#### Azul Claro / Grisáceo (`#95A2BB`)
* **Variables:** `--hvc-primary-light`
* **Clases Utilitarias:**
  * `.bg-secondary` / `.bg-primary-100`: Fondo azul claro.
  * `.text-secondary`: Texto secundario o descriptivo.
* **Uso Recomendado:** Subtítulos, labels de formularios y textos de apoyo.

---

### 3.2. Colores de Acento
Aportan dinamismo e impulsan la interacción del usuario.

#### Naranja Acento (`#FA9A37`)
* **Variables:** `--hvc-accent-orange`
* **Clases Utilitarias:**
  * `.bg-terciary`: Fondo naranja acento.
  * `.text-terciary`: Texto naranja acento.
  * `.btn-hvc-accent`: Botón de llamado a la acción destacado.
* **Uso Recomendado:** Botones de alta prioridad ("Nueva Inversión", "Crear Orden") e indicadores alcistas.

#### Amarillo Oro (`#FCC232`)
* **Variables:** `--hvc-accent-gold`
* **Clases Utilitarias:**
  * `.bg-corporate-accent-gold`: Fondo dorado acento.
* **Uso Recomendado:** Estado `:hover` del botón acento (`.btn-hvc-accent:hover`), badges de estado "Pendiente" y alertas preventivas.

#### Durazno Suave (`#F9D3AD`)
* **Variables:** `--hvc-accent-peach`
* **Clases Utilitarias:**
  * `.bg-primary-50`: Fondo durazno suave.
* **Uso Recomendado:** Resaltado de filas seleccionadas en tablas, hovers suaves y contenedores de información destacada.

---

### 3.3. Estilos de Botones Globales (`styles.css`)

El proyecto dispone de dos clases nativas para botones que gestionan el cambio de estado (`:hover`) automáticamente:

* **`.btn-hvc-primary`:**
  * **Fondo inicial:** `var(--hvc-primary)` (`#1E335E`)
  * **Texto:** `#ffffff`
  * **Estado Hover:** `var(--hvc-primary-dark)` (`#071737`)
  * **Uso:** Formularios, filtros de búsqueda y confirmaciones de modales.

* **`.btn-hvc-accent`:**
  * **Fondo inicial:** `var(--hvc-accent-orange)` (`#FA9A37`)
  * **Texto:** `#ffffff`
  * **Estado Hover:** `var(--hvc-accent-gold)` (`#FCC232`)
  * **Uso:** Acciones prioritarias (Llamados a la Acción / CTA), registro de operaciones e inversión directa.

---

### 3.4. Clases Utilitarias de Estado y Feedback

Clases para indicadores de estado, toasts o alertas:

* **Éxito (Success):**
  * `.bg-success-500`: Fondo verde sólido (`rgb(34 197 94)`).
  * `.bg-success-50`: Fondo verde claro para alertas (`rgb(240 253 244)`).
* **Advertencia (Warning):**
  * `.bg-warning-500`: Fondo amarillo/naranja sólido (`rgb(245 158 11)`).
  * `.bg-warning-50`: Fondo claro para avisos (`rgb(255 251 235)`).
* **Peligro / Error (Danger):**
  * `.bg-danger-500`: Fondo rojo sólido (`rgb(239 68 68)`).
  * `.bg-danger-50`: Fondo claro para mensajes de error o validación (`rgb(254 242 242)`).

---

### 3.5. Componente de Tablas CSS (`.gc-table`)

Estilos centralizados para tablas de datos financieros:

* **`.gc-table`:**
  * Define la estructura base con bordes `var(--table-border-color)` (`#cbd5e1`) y tipografía unificada.
  * Filas intercaladas automáticas (`nth-child(even)` -> `#f3f4f6`).
  * Estado al pasar el cursor (`tbody tr:hover` -> `#e5e7eb`).
* **`.gc-table--compact`:**
  * Variante de menor tamaño (`0.8125rem`) y relleno reducido para optimizar el espacio en pantallas con alta densidad de datos.

---

## 4. Guía de Jerarquía Tipográfica de Marca

| Elemento UI | Fuente Recomendada | Peso (Weight) | Color Aplicable | Clase / Variable CSS Sugerida |
| :--- | :--- | :--- | :--- | :--- |
| **Titulares (`H1`, `H2`, `H3`)** | Inter | SemiBold (600) | Azul Oscuro (`#071737`) | `--text` / `.bg-corporate-dark-blue` |
| **Cuerpo de Texto / Datos Tablas** | Inter | Regular (400) | Azul Oscuro (`#071737`) | `--table-text-color` / `.gc-table` |
| **Textos Secundarios / Formularios** | Inter | Medium (500) | Azul Grisáceo (`#95A2BB`) | `.text-secondary` / `--textsecun` |

---

## 5. Código Global de Estilos (`styles.css`)

```css
@import "tailwindcss";
@import "preline/variants.css";
@import "./styles/colors.css";
@import "ngx-toastr/toastr";

:root {
  /* Nueva Paleta Oficial HVC Kapital */
  --hvc-primary: #1E335E;
  --hvc-primary-light: #95A2BB;
  --hvc-primary-dark: #071737;
  
  --hvc-accent-orange: #FA9A37;
  --hvc-accent-gold: #FCC232;
  --hvc-accent-peach: #F9D3AD;
  
  --hvc-gray: #8D9EBF;
  --hvc-gray-light: #A4ABBD;

  /* Variables base de la aplicación */
  --bg: #fafbfc;
  --border: #eef0f2;
  --text: var(--hvc-primary-dark);
  --textsecun: var(--hvc-gray);
  --hover: #eef0f2;

  /* Tabla variables */
  --table-font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif;
  --table-font-size: 0.875rem; 
  --table-text-color: var(--hvc-primary-dark); 
  --table-header-bg: #ffffff; 
  --table-header-color: var(--hvc-primary); 
  --table-row-bg: #ffffff; 
  --table-row-alt-bg: #f3f4f6; 
  --table-row-hover-bg: #e5e7eb; 
  --table-border-color: #cbd5e1; 
  --table-cell-py: 0.5rem; 
  --table-cell-px: 0.5rem; 
}

/* Custom color utilities */
.bg-primary { background-color: var(--hvc-primary); }  
.bg-secondary { background-color: var(--hvc-primary-light); }  
.bg-terciary { background-color: var(--hvc-accent-orange); }  
.text-primary { color: var(--hvc-primary); }  
.text-secondary { color: var(--hvc-primary-light); }  
.text-terciary { color: var(--hvc-accent-orange); }  

.bg-corporate-dark-blue { background-color: var(--hvc-primary-dark); }
.bg-corporate-light-blue { background-color: var(--hvc-primary); }
.bg-corporate-accent-gold { background-color: var(--hvc-accent-gold); }

.bg-primary-50 { background-color: var(--hvc-accent-peach); }
.bg-primary-100 { background-color: var(--hvc-primary-light); }
.bg-primary-700 { background-color: var(--hvc-primary-dark); }

/* Estilos para los botones */
.btn-hvc-primary {
  background-color: var(--hvc-primary);
  color: #ffffff;
  transition: background-color 0.2s ease;
}
.btn-hvc-primary:hover {
  background-color: var(--hvc-primary-dark);
}

.btn-hvc-accent {
  background-color: var(--hvc-accent-orange);
  color: #ffffff;
  transition: background-color 0.2s ease;
}
.btn-hvc-accent:hover {
  background-color: var(--hvc-accent-gold);
}

/* Tablas CSS */
.gc-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--table-border-color);
  font-family: var(--table-font-family);
  font-size: var(--table-font-size);
  color: var(--table-text-color);
  background-color: var(--table-row-bg);
}

.gc-table thead th {
  background-color: var(--table-header-bg);
  color: var(--table-header-color);
  font-weight: 700;
  text-align: center;
}

.gc-table th,
.gc-table td {
  padding: var(--table-cell-py) var(--table-cell-px);
  border: 1px solid var(--table-border-color);
  vertical-align: middle;
}

.gc-table tbody tr:nth-child(odd) { background-color: var(--table-row-bg); }
.gc-table tbody tr:nth-child(even) { background-color: var(--table-row-alt-bg); }
.gc-table tbody tr:hover { background-color: var(--table-row-hover-bg); }

.gc-table--compact { font-size: 0.8125rem; }
.gc-table--compact th,
.gc-table--compact td { padding: 0.375rem 0.5rem; }