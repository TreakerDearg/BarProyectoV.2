export const getProductId = (productProp: string | { _id: string } | any): string => {
  if (!productProp) return "";
  if (typeof productProp === "string") return productProp;
  if (typeof productProp === "object" && productProp !== null && productProp._id) {
    return productProp._id;
  }
  return "";
};

export const getProductDisplayName = (
  productProp: any,
  fallbackIdSliceLength = 8
): string => {
  if (!productProp) return "N/A";
  if (typeof productProp === "string") {
    return `Producto #${productProp.slice(0, fallbackIdSliceLength)}`;
  }
  if (typeof productProp === "object" && productProp !== null) {
    if (productProp.name) return productProp.name;
    if (productProp._id) {
      return `Producto #${productProp._id.slice(0, fallbackIdSliceLength)}`;
    }
  }
  return "N/A";
};
