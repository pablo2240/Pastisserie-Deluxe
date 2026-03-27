// src/types/index.ts

// 1. Interfaces (sin cambios)
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}

// 2. ENUMS REEMPLAZADOS POR CONSTANTES (Solución al error erasableSyntaxOnly)
// Usamos 'as const' para que TypeScript sepa que los valores no cambiarán
export const EstadoEnvio = {
  Pendiente: "Pendiente",
  Asignado: "Asignado",
  EnCamino: "EnCamino",
  Entregado: "Entregado",
  Fallido: "Fallido",
  Devuelto: "Devuelto"
} as const;

// Esto crea un tipo para usarlo como: let estado: EstadoEnvio
export type EstadoEnvio = typeof EstadoEnvio[keyof typeof EstadoEnvio];

export const EstadoPedido = {
  Pendiente: "Pendiente",
  PagoPendiente: "PagoPendiente",
  Confirmado: "Confirmado",
  PagoFallido: "PagoFallido",
  EnPreparacion: "EnPreparacion",
  Listo: "Listo",
  EnCamino: "EnCamino",
  Entregado: "Entregado",
  Cancelado: "Cancelado"
} as const;

export type EstadoPedido = typeof EstadoPedido[keyof typeof EstadoPedido];

// Comunas disponibles para entrega en Medellín
export const ComunasDisponibles = {
  Guayabal: { label: "Comuna 15 - Guayabal", costoEnvio: 5000 },
  Belen: { label: "Comuna 16 - Belén", costoEnvio: 6000 },
} as const;

export type ComunaKey = keyof typeof ComunasDisponibles;

// 3. RESTO DE INTERFACES (sin cambios)
export interface User {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  emailVerificado: boolean;
  fechaRegistro: string;
  activo: boolean;
  rol?: string | string[];
}

export interface LoginResponse {
  token: string;
  expiration: string;
  user: User;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stockMinimo?: number;
  categoriaProductoId?: number;
  categoriaNombre?: string;
  imagenUrl?: string;
  esPersonalizable: boolean;
  activo: boolean;
  promedioCalificacion: number;
  totalReviews: number;
}

export interface CarritoItem {
  id: number;
  productoId: number;
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  imagenUrl?: string;
  promocionId?: number | null;
  nombrePromocion?: string | null;
  precioOriginal?: number | null;
}

export interface Carrito {
  id: number;
  usuarioId: number;
  items: CarritoItem[];
  total: number;
  totalItems: number;
}

export interface DireccionEnvio {
  id: number;
  nombreCompleto: string;
  direccion: string;
  barrio?: string;
  referencia?: string;
  comuna?: string;
  telefono: string;
  esPredeterminada: boolean;
}

export interface PedidoItem {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  promocionId?: number | null;
  nombrePromocion?: string | null;
  precioOriginal?: number | null;
}

export interface PedidoHistorial {
  id: number;
  pedidoId: number;
  estadoAnterior: string;
  estadoNuevo: string;
  fechaCambio: string;
  cambiadoPor?: number;
  notas?: string;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  nombreUsuario: string;
  usuario?: {
    nombre: string;
    email: string;
    telefono?: string;
  };
  fechaPedido: string;
  estado: string;
  subtotal: number;
  costoEnvio: number;
  total: number;
  aprobado: boolean;
  fechaEntregaEstimada?: string;
  items: PedidoItem[];
  direccionEnvio?: DireccionEnvio;
  metodoPago?: string;
  historial?: PedidoHistorial[];
}
// src/types/index.ts

export interface DashboardKPI {
  label: string;
  value: string | number;
  change: string; // Ej: "+12.5%"
  isPositive: boolean;
  icon: 'sales' | 'orders' | 'products' | 'promos';
}

export interface ChartDataSales {
  name: string; // Ej: "Lun"
  ventas: number;
}

export interface ChartDataProducts {
  name: string; // Ej: "Croissants"
  cantidad: number;
}

export interface DashboardData {
  kpis: DashboardKPI[];
  salesData: ChartDataSales[];
  topProducts: ChartDataProducts[];
  recentOrders: Pedido[]; // Reutilizamos tu tipo Pedido existente
}