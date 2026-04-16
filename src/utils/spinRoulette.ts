export function spinRoulettePro(
  items: any[],
  canMakeDrink: (id: string) => boolean
) {
  const valid = items.filter(
    (i) =>
      i.enabled &&
      i.productId &&
      canMakeDrink(i.productId._id)
  );

  if (valid.length === 0) return null;

  const totalWeight = valid.reduce(
    (acc, i) => acc + i.weight,
    0
  );

  let random = Math.random() * totalWeight;

  for (const item of valid) {
    if (random < item.weight) {
      return item.productId;
    }
    random -= item.weight;
  }

  return valid[0].productId;
}