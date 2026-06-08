/* =========================================================
   SCHEMA.ORG GENERATOR
========================================================= */
export const generateMenuSchema = (menu, baseUrl) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": menu.name,
    "description": menu.description || "",
    "inLanguage": "es",
    "offers": {
      "@type": "Offer",
      "availability": menu.active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceCurrency": "USD",
      "price": menu.minPrice || 0
    },
    "hasMenuSection": menu.categories.map(category => ({
      "@type": "MenuSection",
      "name": category.name,
      "description": category.description || "",
      "hasMenuItem": category.products.map(product => ({
        "@type": "MenuItem",
        "name": product.product?.name || "Producto",
        "description": product.product?.description || "",
        "offers": {
          "@type": "Offer",
          "price": product.price || 0,
          "priceCurrency": "USD"
        }
      }))
    }))
  };

  return JSON.stringify(schema);
};

export const generateRestaurantSchema = (restaurantName, baseUrl, menus) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurantName,
    "url": baseUrl,
    "hasMenu": menus.map(menu => ({
      "@type": "Menu",
      "name": menu.name,
      "url": `${baseUrl}/menu/${menu.slug}`
    }))
  };

  return JSON.stringify(schema);
};

export const generateOpenGraphTags = (menu, baseUrl) => {
  return {
    "og:title": menu.metaTitle || menu.name,
    "og:description": menu.metaDescription || menu.description,
    "og:image": menu.image || `${baseUrl}/default-og-image.jpg`,
    "og:url": `${baseUrl}/menu/${menu.slug}`,
    "og:type": "restaurant.menu",
    "og:locale": "es_ES",
    "twitter:card": "summary_large_image",
    "twitter:title": menu.metaTitle || menu.name,
    "twitter:description": menu.metaDescription || menu.description,
    "twitter:image": menu.image || `${baseUrl}/default-og-image.jpg`
  };
};
