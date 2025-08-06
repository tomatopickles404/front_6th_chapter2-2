import { CartItem, Coupon, Product } from '../../types';
import { ChangeEvent, useEffect, useState } from 'react';
import { getProductDiscountRate } from '../App';

interface ProductWithUI extends Product {
  description?: string;
  isRecommended?: boolean;
}

const initialCoupons: Coupon[] = [
  {
    name: '5000원 할인',
    code: 'AMOUNT5000',
    discountType: 'amount',
    discountValue: 5000,
  },
  {
    name: '10% 할인',
    code: 'PERCENT10',
    discountType: 'percentage',
    discountValue: 10,
  },
] as const;

export const hasBulkPurchase = (cart: CartItem[]): boolean => {
  return cart.some((cartItem) => cartItem.quantity >= 10);
};

export const getBulkPurchaseDiscount = (hasBulkPurchase: boolean) => {
  return hasBulkPurchase ? 0.05 : 0;
};

const calculateCartTotal = (cart: CartItem[], selectedCoupon: Coupon | null) => {
  let totalBeforeDiscount = 0;
  let totalAfterDiscount = 0;

  cart.forEach((item) => {
    const itemPrice = item.product.price * item.quantity;
    totalBeforeDiscount += itemPrice;
    totalAfterDiscount += getProductDiscountedPrice(item, cart);
  });

  if (selectedCoupon) {
    if (selectedCoupon.discountType === 'amount') {
      totalAfterDiscount = Math.max(0, totalAfterDiscount - selectedCoupon.discountValue);
    } else {
      totalAfterDiscount = Math.round(
        totalAfterDiscount * (1 - selectedCoupon.discountValue / 100)
      );
    }
  }

  return {
    totalBeforeDiscount: Math.round(totalBeforeDiscount),
    totalAfterDiscount: Math.round(totalAfterDiscount),
  };
};

const getProductDiscountedPrice = (item: CartItem, cart: CartItem[]): number => {
  const { price } = item.product;
  const { quantity } = item;

  // 개별 상품 할인률 계산
  const baseDiscount = getProductDiscountRate(item);

  // 전체 장바구니에서 대량 구매 할인 여부 확인
  const hasBulkPurchaseInCart = cart.some((cartItem: CartItem) => cartItem.quantity >= 10);
  const discount = hasBulkPurchaseInCart ? Math.min(baseDiscount + 0.05, 0.5) : baseDiscount;

  return Math.round(price * quantity * (1 - discount));
};

const getCartTotalPrice = ({
  cart,
  selectedCoupon,
}: {
  cart: CartItem[];
  selectedCoupon: Coupon | null;
}) => {
  return calculateCartTotal(cart, selectedCoupon);
};

const getCoupons = () => {
  const saved = localStorage.getItem('coupons');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return initialCoupons;
    }
  }
  return initialCoupons;
};

const getCart = () => {
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export function useCart() {
  const [coupons, setCoupons] = useState<Coupon[]>(getCoupons);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const completeOrder = (notificationMessage: () => void) => {
    notificationMessage();
    resetCart();
    resetCoupons();
    resetSelectedCoupon();
  };

  const resetSelectedCoupon = () => setSelectedCoupon(null);

  const resetCoupons = () => setCoupons(initialCoupons);

  const resetCart = () => {
    localStorage.removeItem('cart');
    setCart([]);
  };

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [...prev, newCoupon]);
  };

  const deleteCoupon = (couponCode: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== couponCode));

    if (selectedCoupon?.code === couponCode) {
      setSelectedCoupon(null);
    }
  };

  const validateApplyCoupon = ({
    coupon,
    totalAfterDiscount,
    notificationMessage,
  }: {
    coupon: Coupon;
    totalAfterDiscount: number;
    notificationMessage: () => void;
  }) => {
    const isNotOver10000 = totalAfterDiscount < 10000;
    if (isNotOver10000 && coupon.discountType === 'percentage') {
      notificationMessage();
      return false;
    }

    return true;
  };

  const applyCoupon = ({
    coupon,
    notificationMessage,
  }: {
    coupon: Coupon;
    notificationMessage: () => void;
  }) => {
    const { totalAfterDiscount } = cartTotalPrice;
    const isValidate = validateApplyCoupon({
      coupon,
      totalAfterDiscount,
      notificationMessage,
    });
    if (!isValidate) {
      return;
    }

    updateSelectedCoupon(coupon);
    notificationMessage();
  };

  const updateSelectedCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
  };

  const handleChangeCoupon = (
    e: ChangeEvent<HTMLSelectElement>,
    notificationMessage: () => void
  ) => {
    const coupon = coupons.find((c) => c.code === e.target.value);
    if (coupon) {
      applyCoupon({
        coupon,
        notificationMessage,
      });

      return;
    }

    resetSelectedCoupon();
  };

  // cart

  const [cart, setCart] = useState<CartItem[]>(getCart);

  const cartTotalPrice = getCartTotalPrice({
    cart,
    selectedCoupon,
  });

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
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

  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const [totalItemCount, setTotalItemCount] = useState(0);

  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);

  const removeCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  return {
    //coupons
    coupons,
    selectedCoupon,
    updateSelectedCoupon,
    resetSelectedCoupon,
    addCoupon,
    deleteCoupon,
    handleChangeCoupon,

    // order
    completeOrder,

    // cart
    cart,
    updateCart,
    getRemainingStock,
    addToCart,
    removeCartItem,
    totalItemCount,
    cartTotalPrice,
  };
}
