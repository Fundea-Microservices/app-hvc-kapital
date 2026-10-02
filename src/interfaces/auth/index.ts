export interface IPuesto {
    id?: string;        // UUID del puesto
    nombre: string;    // Nombre del puesto
    // Relaciones
    usuarios?: IUsuario[];  // Usuarios asociados al puesto
}

export interface ISucursal {
  id?: string;
  nombre: string;
  municipio: string;
  departamento: string;
  telefono?: string;
  direccion?: string;
  central?: boolean;
  created_at?: Date;
}

export enum MetodoAutenticacionEnum {
  POR_DEFECTO = 'Por Defecto',
  LOCAL = 'Local',
  ACTIVE_DIRECTORY = 'Active Directory'
}

export interface IUsuario {
  id?: string;                   // UUID del usuario
  nombreCompleto: string;        // Nombre completo concatenado
  nombre1: string;               // Primer nombre
  nombre2?: string | null;       // Segundo nombre
  nombre3?: string | null;       // Tercer nombre
  apellido1: string;             // Primer apellido
  apellido2?: string | null;     // Segundo apellido
  apellido3?: string | null;     // Tercer apellido
  documento?: string | null;     // Número de documento de identificación
  tipoDocumento?: string | null; // Tipo de documento (ej. DPI)
  userName: string;              // Nombre de usuario (único)
  clave: string;                 // Contraseña (hash)
  correo: string;                // Correo electrónico (único)
  telefono?: string | null;      // Número de teléfono del usuario
  metodoAutenticacion: MetodoAutenticacionEnum;  // Método de autenticación: 'Local' | 'ActiveDirectory'
  fotoUrl?: string | null;       // URL de la foto
  lastPasswordUpdate: Date;      // Última actualización de contraseña
  huella?: string | null;        // Huella digital (en base64 u otro formato)
  activo: boolean;               // Estado del usuario (activo/inactivo)
  rolId: string;                 // UUID del rol asignado (nunca el literal "Por Defecto")
  puestoId?: string | null;      // ID del puesto (si aplica)
  sucursalId?: string | null;    // ID de la sucursal (si aplica)

  // Autorización
  auth_code?: string | null;     // Código de autorización único del usuario
  autoriza?: boolean;            // Si el usuario puede autorizar acciones de otros

  // Relaciones
  rol?: IRol;                    // Objeto del rol relacionado
  puesto?: IPuesto;              // Objeto del puesto relacionado
  sucursal?: ISucursal;          // Objeto de la sucursal relacionada

  // Auditoría
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface IAcceso {
  id?: string;                   // UUID del acceso
  accesoId?: string;             // UUID del acceso (alias que envía el backend)
  ordenMenu: number;             // Orden del menú
  showApp: boolean;              // Si se muestra en la app móvil
  showWeb: boolean;              // Si se muestra en la web
  activo: boolean;               // Estado del acceso

  mainMenuId?: string | null;    // ID del menú principal (si aplica)
  menuId: string;                // ID del menú relacionado
  rolId: string;                 // ID del rol relacionado

  // Relaciones (opcionalmente incluidas en consultas)
  menu: IMenu;
  subMenus?: ISubmenu[];
  rol?: IRol;

  // Auditoría
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface ISubmenu {
  id?: string;                   // UUID del acceso
  accesoId?: string;             // UUID del acceso (alias que envía el backend)
  ordenMenu: number;             // Orden del menú
  showApp: boolean;              // Si se muestra en la app móvil
  showWeb: boolean;              // Si se muestra en la web
  activo: boolean;               // Estado del acceso

  mainMenuId?: string | null;    // ID del menú principal (si aplica)
  menuId: string;                // ID del menú relacionado
  rolId: string;                 // ID del rol relacionado

  // Relaciones (opcionalmente incluidas en consultas)
  menu: IMenu;

  // Auditoría
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}


export interface IRol {
    id?: string;            // UUID
    rolId?: string;          // UUID
    nombre: string;         // Nombre del rol
    invitado: boolean;      // Indica si es rol invitado
    activo: boolean;        // Indica si está activo
    esAdmin: boolean;       // Indica si tiene privilegios de administrador
    porDefecto: boolean;    // Indica si es el rol asignado por defecto a nuevos usuarios

    // Relaciones
    usuarios?: IUsuario[];  // Usuarios asociados al rol
    accesos?: IAcceso[];    // Accesos asociados al rol

    // Metadatos de auditoría
    created_at: Date;
    updated_at?: Date | null;
    deleted_at?: Date | null;
}

export interface ILogin {
  user: IUsuario,
  token: string
}

/**
 * Permiso por código. Habilita una acción concreta dentro de un módulo.
 * Se asignan a roles (IPermisoRol) y, como excepción, a usuarios (IPermisoUsuario).
 */
export interface IPermiso {
  id?: string;                   // UUID del permiso
  codigo: string;                // Código único (ej. "USR_CREAR")
  modulo: string;                // Módulo al que pertenece (ej. "usuarios")
  accion: string;                // Acción que habilita (ej. "crear")
  descripcion?: string | null;   // Descripción opcional
  activo: boolean;               // Estado del permiso
  requires_auth?: boolean;       // Si la acción requiere autorización adicional

  // Auditoría
  created_at: Date;
  updated_at?: Date | null;
}

/** Asignación de un permiso a un rol. */
export interface IPermisoRol {
  rolId: string;
  permisoId: string;
  autoriza?: boolean;            // Si el rol puede autorizar este permiso
  permiso?: IPermiso;            // Relación incluida en los listados
}

/**
 * Fila de la matriz de permisos de un rol (GET /auth/permisos/rol/matriz).
 * Es un permiso completo más el flag `asignado` que indica si el rol lo tiene.
 */
export interface IPermisoMatriz extends IPermiso {
  asignado: boolean;
}

/**
 * Asignación de un permiso a un usuario.
 * `permitido` permite conceder (true) o denegar explícitamente (false) un permiso
 * a un usuario aunque su rol lo tenga (excepciones por usuario).
 */
export interface IPermisoUsuario {
  usuarioId: string;
  permisoId: string;
  permitido: boolean;
  autoriza?: boolean;            // Si el usuario puede autorizar este permiso
  permiso?: IPermiso;            // Relación incluida en los listados
  usuario?: IUsuario;           // Relación incluida en los listados
}

/**
 * Origen de un permiso en la matriz del usuario (campo `origen` del backend).
 * Precedencia usuario > rol, 3 estados excluyentes:
 * - `ROL`:         heredado de Permiso_Rol y sin excepción directa.
 * - `USUARIO`:     excepción directa en Permiso_Usuario (su `permitido` decide).
 * - `NO_ASIGNADO`: ni por rol ni por usuario.
 */
export type OrigenPermisoUsuario = 'ROL' | 'USUARIO' | 'NO_ASIGNADO';

/** Etiquetas visibles del tag de origen (para pintar el badge en la celda de código). */
export const ORIGEN_PERMISO_USUARIO_LABELS: Record<OrigenPermisoUsuario, string> = {
  ROL: 'Heredado del rol',
  USUARIO: 'Asignación directa',
  NO_ASIGNADO: 'No asignado',
};

/**
 * Valor del select de filtro de ORIGEN de la matriz del usuario.
 * `'todos'` → no filtra (matriz completa). Los demás valores coinciden con
 * el campo `origen` de la fila y con el query param `tipoAsignacion` del backend.
 */
export type FiltroOrigenMatriz = OrigenPermisoUsuario | 'todos';

/** Etiquetas visibles de cada opción del select de filtro de origen. */
export const FILTRO_ORIGEN_MATRIZ_LABELS: Record<FiltroOrigenMatriz, string> = {
  todos: 'Todos los permisos',
  ROL: 'Asignados por rol',
  USUARIO: 'Asignados por usuario',
  NO_ASIGNADO: 'No asignados',
};

/**
 * Fila de la matriz de permisos de un usuario.
 * La devuelve directamente el backend:
 * GET /auth/permisos/usuario/matriz?usuarioId=
 */
export interface IPermisoMatrizUsuario extends IPermiso {
  asignado: boolean;              // true si el permiso es EFECTIVO para el usuario
  origen: OrigenPermisoUsuario;   // Origen para el tag visual (alias de tipoAsignacion)
  tipoAsignacion?: OrigenPermisoUsuario; // Alias documentado de `origen`
}

/** Query params admitidos por GET /auth/permisos/usuario/matriz. */
export interface MatrizPermisoUsuarioQueryParams {
  usuarioId: string;          // UUID del usuario (obligatorio)
  codigo?: string;            // LIKE por código
  modulo?: string;            // LIKE por módulo/descripción
  accion?: string;            // LIKE por acción/descripción
  /** true = solo efectivos · false = solo no efectivos · omitido = todos */
  asignado?: boolean;
  /** Filtra por origen: ROL | USUARIO | NO_ASIGNADO · omitido = todos */
  tipoAsignacion?: OrigenPermisoUsuario;
  page?: number;
  limit?: number;
  all?: boolean;              // true → envía `todos` e ignora paginación
}


export interface IMenu {
  id?: string;            // UUID del menú
  label: string;          // Nombre o etiqueta del menú
  descripcion: string;    // Descripción del menú
  pathApp: string;        // Ruta de la aplicación móvil o cliente
  pathWeb: string;        // Ruta de la aplicación web
  icono: string;          // Nombre del ícono asociado
  color: string;          // Color del ícono o del menú
  principal: boolean;     // Indica si es un menú principal
  activo: boolean;        // Indica si el menú está activo

  // Relaciones
  accesos?: IAcceso[];    // Lista de accesos asociados al menú

  // Metadatos de auditoría
  created_at: Date;       // Fecha de creación
  updated_at?: Date | null; // Fecha de última actualización
  deleted_at?: Date | null; // Fecha de eliminación (soft delete)
}

export enum TipoConfiguracion {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
}
/**
 * Representa una configuración del sistema.
 */
export interface IConfig {
  id?: string;                  // UUID único de la configuración
  llave: string;                // Clave identificadora de la configuración (ej. "TOKEN_EXPIRATION")
  valor: string;                // Valor de la configuración (almacenado como texto)
  tipo: TipoConfiguracion;      // Tipo de dato (string, number, boolean, array, object)
  descripcion?: string | null;  // Descripción opcional sobre el uso de la configuración
  activo: boolean;              // Indica si la configuración está activa

  // Metadatos de auditoría
  created_at: Date;             // Fecha de creación
  updated_at?: Date | null;     // Fecha de última actualización
  deleted_at?: Date | null;     // Fecha de eliminación lógica
}

export const METODOS_AUTENTICACION = Object.values(MetodoAutenticacionEnum);

/** Llave de configuración que guarda el UUID del rol asignado por defecto. */
export const ROL_DEFAULT_CONFIG_KEY = 'ROL_DEFAULT_ID';

/** Valor interno del <select> "Rol por Defecto". Se resuelve a UUID antes de enviar al API. */
export const ROL_POR_DEFECTO_SENTINEL = '__ROL_DEFAULT__';

/**
 * Opciones del filtro "Asignación" de la matriz de permisos × rol.
 * Equivalen al query param `asignado` de GET /auth/permisos/rol/matriz:
 * - TODOS         → parámetro omitido (matriz completa)
 * - ASIGNADOS     → asignado=true
 * - NO_ASIGNADOS  → asignado=false
 */
export enum AsignacionMatrizEnum {
  TODOS = 'todos',
  ASIGNADOS = 'asignados',
  NO_ASIGNADOS = 'no_asignados',
}

/** Etiquetas visibles de cada opción del filtro de asignación (para pintar el <select> sin hardcodear texto en el HTML). */
export const ASIGNACION_MATRIZ_LABELS: Record<AsignacionMatrizEnum, string> = {
  [AsignacionMatrizEnum.TODOS]: 'Todos',
  [AsignacionMatrizEnum.ASIGNADOS]: 'Asignados',
  [AsignacionMatrizEnum.NO_ASIGNADOS]: 'No asignados',
};

/** Query params admitidos por GET /auth/permisos/rol/matriz. */
export interface MatrizPermisosQueryParams {
  rolId: string;          // UUID del rol (obligatorio)
  codigo?: string;        // LIKE por código
  modulo?: string;        // LIKE por módulo/descripción
  accion?: string;        // LIKE por acción/descripción
  /** true = solo asignados · false = solo no asignados · omitido = todos */
  asignado?: boolean;
  page?: number;
  limit?: number;
  all?: boolean;          // true → envía `todos` e ignora paginación
}