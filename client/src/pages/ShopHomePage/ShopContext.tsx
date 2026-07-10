import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ShopUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  integral?: number;
}

interface ShopContextType {
  user: ShopUser | null;
  setUser: (user: ShopUser | null) => void;
  cartCount: number;
  setCartCount: (count: number) => void;
  favorites: string[];
  setFavorites: (ids: string[]) => void;
  addFavorite: (goodsId: string) => void;
  removeFavorite: (goodsId: string) => void;
  isFavorite: (goodsId: string) => boolean;
  categories: any[];
  brands: any[];
  siteConfig: Record<string, any>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ShopUser | null>(() => {
    const saved = localStorage.getItem('shop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cartCount, setCartCount] = useState<number>(() => {
    const cart = localStorage.getItem('shop_cart');
    if (cart) {
      const items = JSON.parse(cart);
      return Object.values(items).reduce((a: number, b: number) => a + b, 0);
    }
    return 0;
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('shop_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) {
      localStorage.setItem('shop_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shop_user');
    }
  }, [user]);

  useEffect(() => {
    // 加载分类和品牌
    Promise.all([
      fetch('/api/shop-categories').then(r => r.json()).catch(() => []),
      fetch('/api/shop-brands').then(r => r.json()).catch(() => []),
    ]).then(([catData, brandData]) => {
      setCategories(Array.isArray(catData) ? catData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
    });
  }, []);

  const addFavorite = (goodsId: string) => {
    if (!favorites.includes(goodsId)) {
      const newFavorites = [...favorites, goodsId];
      setFavorites(newFavorites);
      localStorage.setItem('shop_favorites', JSON.stringify(newFavorites));
    }
  };

  const removeFavorite = (goodsId: string) => {
    const newFavorites = favorites.filter(id => id !== goodsId);
    setFavorites(newFavorites);
    localStorage.setItem('shop_favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (goodsId: string) => favorites.includes(goodsId);

  return (
    <ShopContext.Provider value={{
      user, setUser, cartCount, setCartCount,
      favorites, setFavorites, addFavorite, removeFavorite, isFavorite,
      categories, brands, siteConfig
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within ShopProvider');
  }
  return context;
}