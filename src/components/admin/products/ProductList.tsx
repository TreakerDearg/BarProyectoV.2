"use client";

import ProductItem from "./ProductItem";

export default function ProductList({ products, refresh }: any) {
  return (
    <div className="flex flex-col gap-4">
      {products.map((p: any) => (
        <ProductItem
          key={p._id}
          product={p}
          refresh={refresh}
        />
      ))}
    </div>
  );
}