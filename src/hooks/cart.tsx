import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadStoragedData(): Promise<void> {
      const loadedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (loadedProducts) setProducts(JSON.parse(loadedProducts));
    }

    loadStoragedData();
  }, []);

  const addToCart = useCallback(
    async productToAdd => {
      const existentProductIndex = products.findIndex(
        product => product.id === productToAdd.id,
      );

      if (existentProductIndex !== -1) {
        const updatedProducts = products;
        updatedProducts[existentProductIndex].quantity += 1;
        setProducts([...updatedProducts]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...updatedProducts]),
        );
      } else {
        setProducts([...products, { ...productToAdd, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, { ...productToAdd, quantity: 1 }]),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      const updatedProducts = products;
      updatedProducts[productIndex].quantity += 1;
      setProducts([...updatedProducts]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...updatedProducts]),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(product => product.id === id);
      const updatedProducts = products;

      if (updatedProducts[productIndex].quantity === 1) {
        updatedProducts.splice(productIndex, 1);
      } else {
        updatedProducts[productIndex].quantity -= 1;
      }

      setProducts([...updatedProducts]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify([...updatedProducts]),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
