// ─────────────────────────────────────────────────────────────────────────────
// NEBULA — Navigation Types
// ─────────────────────────────────────────────────────────────────────────────

export type RootTabParamList = {
  Inicio:   undefined;
  Carta:    { categoryFilter?: string } | undefined;
  Pedidos:  undefined;
  Reservas: undefined;
  Cuenta:   undefined;
};

// Stack param lists para cada tab
export type InicioStackParamList   = { Home: undefined };
export type CartaStackParamList    = { Carta: { categoryFilter?: string } | undefined; RouletteModal: undefined };
export type PedidosStackParamList  = { Pedido: undefined; OrderStatus: { orderId: string } };
export type ReservasStackParamList = { Reservas: undefined };
export type CuentaStackParamList   = { Auth: undefined; Account: undefined };
