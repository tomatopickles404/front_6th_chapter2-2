import { useCoupon } from '../coupon/useCoupon';
import { useCartItems } from './useCartItems';
import { CartItem, Coupon, ProductWithUI } from '../../../types';
import { roundedPrice } from '../../../shared/utils/roundedPrice';

const getProductDiscountRate = (item: CartItem): number => {
  const { discounts } = item.product;
  const { quantity } = item;

  return discounts.reduce((maxDiscount, discount) => {
    return quantity >= discount.quantity && discount.rate > maxDiscount
      ? discount.rate
      : maxDiscount;
  }, 0);
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

const getCartTotalPrice = ({
  cart,
  selectedCoupon,
}: {
  cart: CartItem[];
  selectedCoupon: Coupon | null;
}) => {
  return calculateCartTotal(cart, selectedCoupon);
};

const discountRate = ({ item, cart }: { item: CartItem; cart: CartItem[] }): number => {
  const discountedItemTotalPriceValue = getProductDiscountedPrice(item, cart);
  const originalPrice = item.product.price * item.quantity;
  const hasDiscount = discountedItemTotalPriceValue < originalPrice;
  return hasDiscount ? roundedPrice((1 - discountedItemTotalPriceValue / originalPrice) * 100) : 0;
};

const discountedItemTotalPrice = ({ item, cart }: { item: CartItem; cart: CartItem[] }) => {
  return getProductDiscountedPrice(item, cart);
};

export function useCart() {
  const {
    coupons,
    selectedCoupon,
    updateSelectedCoupon,
    resetSelectedCoupon,
    addCoupon,
    deleteCoupon,
    handleChangeCoupon,
    resetCoupons,
  } = useCoupon();

  const { cart, updateCart, addToCart, removeCartItem, totalItemCount, resetCart } = useCartItems();

  const cartTotalPrice = getCartTotalPrice({
    cart,
    selectedCoupon,
  });

  const completeOrder = (notificationMessage: () => void) => {
    notificationMessage();
    resetCart();
    resetCoupons();
    resetSelectedCoupon();
  };

  const validateUpdateQuantity = ({
    product,
    newQuantity,
  }: {
    product: ProductWithUI;
    newQuantity: number;
  }) => {
    // 재고보다 많을때
    if (newQuantity > product.stock) {
      return { isValid: false, message: `재고는 ${product.stock}개까지만 있습니다.` };
    }
    return { isValid: true };
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
    addToCart,
    removeCartItem,
    totalItemCount,
    cartTotalPrice,
    resetCart,

    // cart utilities
    discountRate,
    discountedItemTotalPrice,
    validateUpdateQuantity,
  };
}
