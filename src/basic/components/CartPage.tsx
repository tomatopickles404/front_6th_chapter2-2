import { ProductWithUI } from '../../types';
import { commaizedNumberWithUnit } from '../../shared/utils/commaizedNumber';
import { EmptyState, ProductList, CartList } from './ui';
import { OrderSummary } from './cart';
import { getCartTotalPrice, validateUpdateQuantity, UpdateQuantityResult } from '../utils/cart';
import { CartItem, Coupon } from '../../types';
import { ChangeEvent } from 'react';
import { useSearch } from '../hooks';

interface CartPageProps {
  cartState: {
    cart: CartItem[];
    updateCart: (cart: CartItem[]) => void;
    addToCart: (params: {
      product: ProductWithUI;
      validateUpdateQuantity: ({
        product,
        newQuantity,
      }: {
        product: ProductWithUI;
        newQuantity: number;
      }) => boolean;
    }) => void;
    removeCartItem: (id: string) => void;
    totalItemCount: number;
    resetCart: () => void;
  };
  couponState: {
    coupons: Coupon[];
    selectedCoupon: Coupon | null;
    updateSelectedCoupon: (coupon: Coupon) => void;
    resetSelectedCoupon: () => void;
    addCoupon: (coupon: Coupon) => void;
    deleteCoupon: (code: string) => void;
    handleChangeCoupon: (
      e: ChangeEvent<HTMLSelectElement>,
      totalAfterDiscount: number,
      notificationMessage: () => void
    ) => void;
    resetCoupons: () => void;
  };
  productState: {
    products: ProductWithUI[];
    getRemainingStock: (params: { product: ProductWithUI; cart: CartItem[] }) => number;
  };
  addNotification: (message: string, type: 'error' | 'success' | 'warning') => void;
}

export function CartPage({ cartState, couponState, productState, addNotification }: CartPageProps) {
  const { cart, addToCart, removeCartItem, resetCart, updateCart } = cartState;
  const { products, getRemainingStock } = productState;
  const { searchTerm, handleSearchTermChange, debouncedSearchTerm, filteredProducts } =
    useSearch(products);
  const { selectedCoupon, handleChangeCoupon, coupons } = couponState;

  const cartTotalPrice = getCartTotalPrice({
    cart,
    selectedCoupon,
  });

  const { totalBeforeDiscount, totalAfterDiscount } = cartTotalPrice;

  const remainingStock = (product: ProductWithUI) => getRemainingStock({ product, cart });

  const validateAddToCart = (product: ProductWithUI): boolean => {
    const remainingStock = getRemainingStock({ product, cart });
    if (remainingStock <= 0) {
      addNotification('재고가 부족합니다!', 'error');
      return false;
    }
    return true;
  };

  const notifyCompleteOrder = () => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(`주문이 완료되었습니다. 주문번호: ${orderNumber}`, 'success');
  };

  const handleAddToCart = (product: ProductWithUI) => {
    if (!validateAddToCart(product)) return;

    addToCart({
      product,
      validateUpdateQuantity: (params: any) => {
        const result = validateUpdateQuantity(params);
        if (!result.isValid && result.message) {
          addNotification(result.message, 'error');
        }
        return result.isValid;
      },
    });
    addNotification('장바구니에 담았습니다', 'success');
  };

  const updateQuantity = (productId: string, newQuantity: number): UpdateQuantityResult => {
    if (newQuantity <= 0) {
      removeCartItem(productId);
      return { success: true, cart: cart.filter((item) => item.product.id !== productId) };
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, reason: 'PRODUCT_NOT_FOUND' };
    }

    const maxStock = product.stock;
    if (newQuantity > maxStock) {
      return { success: false, reason: 'INSUFFICIENT_STOCK', maxStock };
    }

    const updatedCart = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedCart);

    return { success: true, cart: updatedCart };
  };

  const completeOrder = () => {
    notifyCompleteOrder();
    resetCart();
    couponState.resetSelectedCoupon();
  };

  const onQuantityError = (message: string) => addNotification(message, 'error');
  const onCompleteOrder = () => completeOrder();

  return (
    <>
      {/* 검색창 */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchTermChange}
          placeholder="상품 검색..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* 상품 목록 */}
          <section>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">전체 상품</h2>
              <div className="text-sm text-gray-600">총 {products.length}개 상품</div>
            </div>
            {filteredProducts.length === 0 ? (
              <EmptyState searchTerm={debouncedSearchTerm} type="search" />
            ) : (
              <ProductList
                products={filteredProducts}
                remainingStock={remainingStock}
                onAddToCart={handleAddToCart}
                isAdmin={false}
              />
            )}
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <section className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                장바구니
              </h2>
              {cart.length === 0 ? (
                <EmptyState type="cart" />
              ) : (
                <CartList
                  cart={cart}
                  products={products}
                  onRemoveItem={removeCartItem}
                  onUpdateQuantity={updateQuantity}
                  onQuantityError={onQuantityError}
                />
              )}
            </section>

            {cart.length > 0 && (
              <>
                <section className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">쿠폰 할인</h3>
                    <button className="text-xs text-blue-600 hover:underline">쿠폰 등록</button>
                  </div>
                  {coupons.length > 0 && (
                    <select
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      value={selectedCoupon?.code || ''}
                      onChange={(e) =>
                        handleChangeCoupon(e, totalAfterDiscount, () =>
                          addNotification('쿠폰이 적용되었습니다.', 'success')
                        )
                      }
                    >
                      <option value="">쿠폰 선택</option>
                      {coupons.map(({ code, name, discountType, discountValue }) => (
                        <option key={code} value={code}>
                          {name} (
                          {discountType === 'amount'
                            ? `${commaizedNumberWithUnit(discountValue, '원')}`
                            : `${discountValue}%`}
                          )
                        </option>
                      ))}
                    </select>
                  )}
                </section>

                <OrderSummary
                  totalBeforeDiscount={totalBeforeDiscount}
                  totalAfterDiscount={totalAfterDiscount}
                  onCompleteOrder={onCompleteOrder}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
