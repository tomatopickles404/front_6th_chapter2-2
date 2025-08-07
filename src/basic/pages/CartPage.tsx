import { CartItem, Coupon, ProductWithUI } from '../../types';
import { ProductList, CartList, EmptyState } from '../components/ui';
import { commaizedNumberWithUnit } from '../../shared/utils/commaizedNumber';
import { UpdateQuantityResult } from '../utils/cart';

interface CartPageProps {
  // Product related props
  products: ProductWithUI[];
  filteredProducts: ProductWithUI[];
  debouncedSearchTerm: string;

  // Cart related props
  cart: CartItem[];
  addToCart: (params: {
    product: ProductWithUI;
    validateUpdateQuantity: (params: any) => boolean;
  }) => void;
  removeCartItem: (productId: string) => void;
  validateUpdateQuantity: (params: any) => { isValid: boolean; message?: string };
  onUpdateQuantity: ({
    productId,
    newQuantity,
    products,
  }: {
    productId: string;
    newQuantity: number;
    products: ProductWithUI[];
  }) => UpdateQuantityResult;

  // Coupon related props
  coupons: Coupon[];
  selectedCoupon: Coupon | null;
  handleChangeCoupon: (
    e: React.ChangeEvent<HTMLSelectElement>,
    totalAfterDiscount: number,
    callback: () => void
  ) => void;

  // Order related props
  completeOrder: (callback: () => void) => void;
  cartTotalPrice: { totalBeforeDiscount: number; totalAfterDiscount: number };

  // Notification related props
  onAddNotification: (message: string, type?: 'error' | 'success' | 'warning') => void;
}

export function CartPage({
  products,
  filteredProducts,
  debouncedSearchTerm,
  cart,
  addToCart,
  removeCartItem,
  validateUpdateQuantity,
  onUpdateQuantity,
  coupons,
  selectedCoupon,
  handleChangeCoupon,
  completeOrder,
  cartTotalPrice,

  onAddNotification,
}: CartPageProps) {
  const remainingStock = (product: ProductWithUI) => {
    const cartItem = cart.find((item) => item.product.id === product.id);
    return product.stock - (cartItem?.quantity || 0);
  };

  const { totalBeforeDiscount, totalAfterDiscount } = cartTotalPrice;

  const handleAddToCart = (product: ProductWithUI) => {
    addToCart({
      product,
      validateUpdateQuantity: (params: any) => {
        const result = validateUpdateQuantity(params);
        return result.isValid;
      },
    });
    onAddNotification('장바구니에 담았습니다', 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        {/* 상품 목록 */}
        <section>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">전체 상품</h2>
            <div className="text-sm text-gray-600">총 {products.length}개 상품</div>
          </div>
          {filteredProducts.length === 0 ? (
            <EmptyState type="search" searchTerm={debouncedSearchTerm} />
          ) : (
            <ProductList
              products={filteredProducts}
              remainingStock={remainingStock}
              onAddToCart={handleAddToCart}
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
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
                onUpdateQuantity={(productId: string, newQuantity: number) => {
                  return onUpdateQuantity({ productId, newQuantity, products });
                }}
                onQuantityError={(message: string) => {
                  onAddNotification(message, 'error');
                }}
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
                        onAddNotification('쿠폰이 적용되었습니다.', 'success')
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

              <section className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-4">결제 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액</span>
                    <span className="font-medium">
                      {commaizedNumberWithUnit(totalBeforeDiscount, '원')}
                    </span>
                  </div>
                  {totalBeforeDiscount - totalAfterDiscount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>할인 금액</span>
                      <span>
                        {`-${commaizedNumberWithUnit(
                          totalBeforeDiscount - totalAfterDiscount,
                          '원'
                        )}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="font-semibold">결제 예정 금액</span>
                    <span className="font-bold text-lg text-gray-900">
                      {commaizedNumberWithUnit(totalAfterDiscount, '원')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const notifyCompleteOrder = () => {
                      const orderNumber = `ORD-${Date.now()}`;
                      onAddNotification(
                        `주문이 완료되었습니다. 주문번호: ${orderNumber}`,
                        'success'
                      );
                    };
                    completeOrder(notifyCompleteOrder);
                  }}
                  className="w-full mt-4 py-3 bg-yellow-400 text-gray-900 rounded-md font-medium hover:bg-yellow-500 transition-colors"
                >
                  {commaizedNumberWithUnit(totalAfterDiscount, '원')} 결제하기
                </button>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  <p>* 실제 결제는 이루어지지 않습니다</p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
