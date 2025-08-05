import { CartItem, Coupon, Product } from '../../types';
import { useEffect, useState } from 'react';
import { getProductDiscountRate } from '../App';

// const applyCoupon = (coupon: Coupon) => {
//   if (totalAfterDiscount < 10000 && coupon.discountType === 'percentage') {
//     addNotification('percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.', 'error');
//     return;
//   }

//   setSelectedCoupon(coupon);
//   addNotification('쿠폰이 적용되었습니다.', 'success');
// };

// const completeOrder = useCallback(() => {
//   const orderNumber = `ORD-${Date.now()}`;
//   addNotification(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, 'success');
//   setCart([]);
//   setSelectedCoupon(null);
// }, [addNotification]);

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

const getProductDiscountedPrice = (item: CartItem): number => {
  const { price } = item.product;
  const { quantity } = item;
  const productDiscount = getProductDiscountRate(item);

  return Math.round(price * quantity * (1 - productDiscount));
};

const getCartTotals = (cart: CartItem[]) => {
  const bulkDiscount = getBulkPurchaseDiscount(hasBulkPurchase(cart));

  const { totalBeforeDiscount, totalAfterProductDiscount } = cart.reduce(
    (acc, item) => {
      const itemPrice = item.product.price * item.quantity;
      const productDiscountedPrice = getProductDiscountedPrice(item);

      return {
        totalBeforeDiscount: acc.totalBeforeDiscount + itemPrice,
        totalAfterProductDiscount: acc.totalAfterProductDiscount + productDiscountedPrice,
      };
    },
    { totalBeforeDiscount: 0, totalAfterProductDiscount: 0 }
  );

  const totalAfterDiscount = Math.round(totalAfterProductDiscount * (1 - bulkDiscount));

  return {
    totalBeforeDiscount: Math.round(totalBeforeDiscount),
    totalAfterDiscount,
  };
};

const applyCouponDiscount = ({
  totalAfterDiscount,
  selectedCoupon,
}: {
  totalAfterDiscount: number;
  selectedCoupon: Coupon | null;
}) => {
  if (!selectedCoupon) {
    return totalAfterDiscount;
  }

  const { discountType, discountValue } = selectedCoupon;
  const isAmountDiscount = discountType === 'amount';
  const discount = isAmountDiscount ? discountValue : discountValue / 100;

  const discountedTotal = isAmountDiscount
    ? Math.max(0, totalAfterDiscount - discount)
    : Math.round(totalAfterDiscount * (1 - discount));

  return discountedTotal;
};

const getCartTotalPrice = ({
  cart,
  selectedCoupon,
}: {
  cart: CartItem[];
  selectedCoupon: Coupon | null;
}) => {
  const { totalAfterDiscount, totalBeforeDiscount } = getCartTotals(cart);
  const finalTotalAfterDiscount = applyCouponDiscount({
    totalAfterDiscount,
    selectedCoupon,
  });

  return {
    totalBeforeDiscount,
    totalAfterDiscount: finalTotalAfterDiscount,
  };
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
    notificationMessage,
  }: {
    coupon: Coupon;
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
    const isValidate = validateApplyCoupon({ coupon, notificationMessage });
    if (!isValidate) {
      return;
    }

    updateSelectedCoupon(coupon);
    notificationMessage();
  };

  const updateSelectedCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
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
    applyCoupon,

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
