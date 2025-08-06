import { useEffect, useState } from 'react';
import { CartItem, Product } from '../../types';
import { useLocalStorage } from './useLocalStorage';

export interface ProductWithUI extends Product {
  description?: string;
  isRecommended?: boolean;
}

export const hasBulkPurchase = (cart: CartItem[]): boolean => {
  return cart.some((cartItem) => cartItem.quantity >= 10);
};

export const getBulkPurchaseDiscount = (hasBulkPurchase: boolean) => {
  return hasBulkPurchase ? 0.05 : 0;
};

export function useCartItems() {
  const [cart, setCart] = useLocalStorage<CartItem[]>('cart', []);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
  };

  const resetCart = () => {
    localStorage.removeItem('cart');
    setCart([]);
  };

  const getRemainingStock = (product: Product): number => {
    return product.stock - (cart.find((item) => item.product.id === product.id)?.quantity ?? 0);
  };

  const addToCart = ({
    product,
    validateUpdateQuantity,
  }: {
    product: ProductWithUI;
    validateUpdateQuantity: ({
      product,
      newQuantity,
    }: {
      product: ProductWithUI;
      newQuantity: number;
    }) => boolean;
  }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + 1;

        if (!validateUpdateQuantity({ product, newQuantity })) {
          return prevCart;
        }

        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const [totalItemCount, setTotalItemCount] = useState<number>(0);

  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);

  return {
    cart,
    updateCart,
    getRemainingStock,
    addToCart,
    removeCartItem,
    totalItemCount,
    resetCart,
  };
}
