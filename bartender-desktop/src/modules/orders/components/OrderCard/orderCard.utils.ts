export function getTableLabel(table: any) {
  if (typeof table === "object") return table?.number ?? "XX";
  return "XX";
}

export function isBarOrder(items: any[]) {
  return items.some(
    (i) =>
      i.type === "drink" ||
      (typeof i.product === "object" && i.product?.type === "drink")
  );
}