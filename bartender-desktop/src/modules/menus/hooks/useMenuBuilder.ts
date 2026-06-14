"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Menu, MenuProduct, MenuCategory } from "../../../types/menu";
import type { Product } from "../../../types/product";
import { getProductId } from "../utils/menuUtils";
import { updateMenu as updateMenuAPI } from "../../../services/menuService";

interface MenuBuilderState {
  selectedMenu: Menu | null;
  selectedCategory: string | null;
  draggedProduct: Product | null;
  expandedCategories: Set<string>;
  imageFile: File | null;
  history: Menu[];
  historyIndex: number;
  isSaving: boolean;
  lastSaved: Date | null;
}

const MAX_HISTORY = 50;
const AUTO_SAVE_DELAY = 2000; // 2 seconds
const STORAGE_KEY = 'menu_builder_state';

const saveToLocalStorage = (state: MenuBuilderState) => {
  try {
    const serialized = JSON.stringify({
      selectedMenu: state.selectedMenu,
      selectedCategory: state.selectedCategory,
      expandedCategories: Array.from(state.expandedCategories),
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('[useMenuBuilder] Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    const data = JSON.parse(serialized);
    return {
      selectedMenu: data.selectedMenu,
      selectedCategory: data.selectedCategory,
      expandedCategories: new Set(data.expandedCategories),
    };
  } catch (error) {
    console.error('[useMenuBuilder] Failed to load from localStorage:', error);
    return null;
  }
};

export function useMenuBuilder() {
  const [state, setState] = useState<MenuBuilderState>(() => {
    const savedState = loadFromLocalStorage();
    return {
      selectedMenu: savedState?.selectedMenu || null,
      selectedCategory: savedState?.selectedCategory || null,
      draggedProduct: null,
      expandedCategories: (savedState?.expandedCategories || new Set<string>()) as Set<string>,
      imageFile: null,
      history: savedState?.selectedMenu ? [JSON.parse(JSON.stringify(savedState.selectedMenu))] : [],
      historyIndex: savedState?.selectedMenu ? 0 : -1,
      isSaving: false,
      lastSaved: null,
    };
  });

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;
      
      const newIndex = prev.historyIndex - 1;
      const restoredMenu = JSON.parse(JSON.stringify(prev.history[newIndex]));
      
      return {
        ...prev,
        historyIndex: newIndex,
        selectedMenu: restoredMenu,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      
      const newIndex = prev.historyIndex + 1;
      const restoredMenu = JSON.parse(JSON.stringify(prev.history[newIndex]));
      
      return {
        ...prev,
        historyIndex: newIndex,
        selectedMenu: restoredMenu,
      };
    });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Auto-save with debounce
  const autoSaveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!state.selectedMenu || !state.selectedMenu._id) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setState(prev => ({ ...prev, isSaving: true }));
        await updateMenuAPI(state.selectedMenu._id, state.selectedMenu, { allowEmptyCategories: true });
        setState(prev => ({ ...prev, isSaving: false, lastSaved: new Date() }));
      } catch (error) {
        console.error('[useMenuBuilder] Auto-save failed:', error);
        setState(prev => ({ ...prev, isSaving: false }));
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [state.selectedMenu]);

  // Save to localStorage when important state changes
  useEffect(() => {
    saveToLocalStorage(state);
  }, [state.selectedMenu, state.selectedCategory, state.expandedCategories]);

  const selectMenu = useCallback((menu: Menu | null) => {
    setState(prev => {
      if (menu) {
        // Push initial state to history when selecting a menu
        const newHistory = [JSON.parse(JSON.stringify(menu))];
        return { 
          ...prev, 
          selectedMenu: menu, 
          selectedCategory: null, 
          imageFile: null,
          history: newHistory,
          historyIndex: 0,
        };
      }
      return { ...prev, selectedMenu: menu, selectedCategory: null, imageFile: null };
    });
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

      // Push to history before mutation
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(prev.selectedMenu)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();

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

      return { 
        ...prev, 
        selectedMenu: updatedMenu,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const removeProductFromCategory = useCallback((categoryName: string, productId: string) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      // Push to history before mutation
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(prev.selectedMenu)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();

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

      return { 
        ...prev, 
        selectedMenu: updatedMenu,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const reorderProducts = useCallback((categoryName: string, sourceIndex: number, destIndex: number) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      // Push to history before mutation
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(prev.selectedMenu)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();

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

      return { 
        ...prev, 
        selectedMenu: updatedMenu,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const createCategory = useCallback((categoryName: string) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      // Push to history before mutation
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(prev.selectedMenu)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();

      const newCategory: MenuCategory = {
        name: categoryName,
        products: [],
      };

      const updatedMenu = {
        ...prev.selectedMenu,
        categories: [...(prev.selectedMenu.categories || []), newCategory],
      };

      return { 
        ...prev, 
        selectedMenu: updatedMenu,
        expandedCategories: new Set([...prev.expandedCategories, categoryName]),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const updateMenu = useCallback((updates: Partial<Menu & { imageFile?: File }>) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      // Push to history before mutation
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(prev.selectedMenu)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();

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
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const deleteCategory = useCallback((categoryName: string) => {
    setState(prev => {
      if (!prev.selectedMenu) return prev;

      // Push to history before mutation
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(prev.selectedMenu)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();

      const updatedCategories = (prev.selectedMenu.categories || []).filter(cat => cat.name !== categoryName);
      const updatedMenu = {
        ...prev.selectedMenu,
        categories: updatedCategories,
      };

      return { 
        ...prev, 
        selectedMenu: updatedMenu,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  return {
    selectedMenu: state.selectedMenu,
    selectedCategory: state.selectedCategory,
    draggedProduct: state.draggedProduct,
    expandedCategories: state.expandedCategories,
    imageFile: state.imageFile,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
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
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
