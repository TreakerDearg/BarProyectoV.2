/* =========================================================
   LAZY LOADING UTILITIES
========================================================= */
export const createLazyImageLoader = () => {
  const imageCache = new Map();

  return {
    loadImage: async (url) => {
      if (imageCache.has(url)) {
        return imageCache.get(url);
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          imageCache.set(url, img);
          resolve(img);
        };
        img.onerror = reject;
        img.src = url;
      });
    },
    preloadImages: async (urls) => {
      return Promise.all(urls.map(url => 
        this.loadImage(url).catch(() => null)
      ));
    },
    clearCache: () => {
      imageCache.clear();
    }
  };
};

export const lazyLoader = createLazyImageLoader();
