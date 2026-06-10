"use client";

import { useState, useCallback } from "react";
import type { Menu, MenuProduct, MenuCategory } from "../../../types/menu";
import type { Product } from "../../../types/product";
import { getProductId } from "../utils/menuUtils";

interface MenuBuilderState {
  selectedMenu: Menu | null;
  selectedCategory: string | null;
  draggedProduct: Product | null;
  expandedCategories: Set<string>;
  imageFile: File | null;
}

export function useMenuBuilder() {
  const [state, setState] = useState<MenuBuilderState>({
    selectedMenu: null,
    selectedCategory: null,
    draggedProduct: null,
    expandedCategories: new Set<string>(),
    imageFile: null,
  });

  const selectMenu = useCallback((menu: Menu | null) => {
    setState(prev => ({ ...prev, selectedMenu: menu, selectedCategory: null, imageFile: null }));
  }, []);

  const selectCategory = useCallback((categoryName: string) => {
    setState(prev => ({ ...prev, selectedCategory: categoryName }));
  }, []);

  const setDraggedProduct = useCallback((product: Product | null) => {
    setState(prev => ({ ...prev, draggedProduct: product }));
  }, []);

  const toggleCategoryExpansion = useCallback((categoryName: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedCategories);
      if (newExpanded.has(categoryName)) {
        newExpanded.delete(categoryName);
      } else {
        newExpanded.add(categoryName);
      }
      return { ...prev, expandedCategories: newExpanded };
    });
  }, []);

  const addProductToCategory = useCallback((product: Product, categoryName: string) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      const menuProduct: MenuProduct = {
        product: product._id!,
        price: product.price || 0,
        available: product.available || false,
        hasRecipe: product.hasRecipe || false,
        missingIngredients: [],
      };

      const updatedCategories = (prev.selectedMenu.categories || []).map((cat: MenuCategory) => {
        if (cat.name === categoryName) {
          return {
            ...cat,
            products: [...cat.products, menuProduct],
          };
        }
        return cat;
      });

      const updatedMenu = {
        ...prev.selectedMenu,
        categories: updatedCategories,
      };

      return { ...prev, selectedMenu: updatedMenu };
    });
  }, []);

  const removeProductFromCategory = useCallback((categoryName: string, productId: string) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      const updatedCategories = (prev.selectedMenu.categories || []).map((cat: MenuCategory) => {
        if (cat.name === categoryName) {
          return {
            ...cat,
            products: cat.products.filter(p => getProductId(p.product) !== productId),
          };
        }
        return cat;
      });

      const updatedMenu = {
        ...prev.selectedMenu,
        categories: updatedCategories,
      };

      return { ...prev, selectedMenu: updatedMenu };
    });
  }, []);

  const reorderProducts = useCallback((categoryName: string, sourceIndex: number, destIndex: number) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      const updatedCategories = (prev.selectedMenu.categories || []).map((cat: MenuCategory) => {
        if (cat.name === categoryName) {
          const products = [...cat.products];
          const [removed] = products.splice(sourceIndex, 1);
          products.splice(destIndex, 0, removed);
          return { ...cat, products };
        }
        return cat;
      });

      const updatedMenu = {
        ...prev.selectedMenu,
        categories: updatedCategories,
      };

      return { ...prev, selectedMenu: updatedMenu };
    });
  }, []);

  const createCategory = useCallback((categoryName: string) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      const newCategory: MenuCategory = {
        name: categoryName,
        products: [],
      };

      const updatedMenu = {
        ...prev.selectedMenu,
        categories: [...(prev.selectedMenu.categories || []), newCategory],
      };

      return { ...prev, selectedMenu: updatedMenu, expandedCategories: new Set([...prev.expandedCategories, categoryName]) };
    });
  }, []);

  const updateMenu = useCallback((updates: Partial<Menu & { imageFile?: File }>) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      // Extract imageFile if present
      const { imageFile, ...menuUpdates } = updates;

      const updatedMenu = {
        ...prev.selectedMenu,
        ...menuUpdates,
      };

      return { 
        ...prev, 
        selectedMenu: updatedMenu,
        imageFile: imageFile || prev.imageFile,
      };
    });
  }, []);

  const deleteCategory = useCallback((categoryName: string) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      const updatedCategories = (prev.selectedMenu.categories || []).filter(cat => cat.name !== categoryName);
      const updatedMenu = {
        ...prev.selectedMenu,
        categories: updatedCategories,
      };

      return { ...prev, selectedMenu: updatedMenu };
    });
  }, []);

  return {
    selectedMenu: state.selectedMenu,
    selectedCategory: state.selectedCategory,
    draggedProduct: state.draggedProduct,
    expandedCategories: state.expandedCategories,
    imageFile: state.imageFile,
    selectMenu,
    selectCategory,
    setDraggedProduct,
    toggleCategoryExpansion,
    addProductToCategory,
    removeProductFromCategory,
    reorderProducts,
    createCategory,
    updateMenu,
    deleteCategory,
  };
}
