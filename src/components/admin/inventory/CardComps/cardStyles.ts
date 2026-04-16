export type StockStatus = "critical" | "low" | "optimal";

export const getStockStatus = (stock: number): StockStatus => {
  if (stock <= 5) return "critical";
  if (stock <= 15) return "low";
  return "optimal";
};