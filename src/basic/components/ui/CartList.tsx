import { CartItem, ProductWithUI } from '../../../types';
import { CartItemDiscount, CartItemPrice } from '../cart';
import { UpdateQuantityResult } from '../../utils/cart';

interface CartListProps {
  cart: CartItem[];
  products: ProductWithUI[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => UpdateQuantityResult;
  onQuantityError: (message: string) => void;
}

export function CartList({ cart, onRemoveItem, onUpdateQuantity, onQuantityError }: CartListProps) {
  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {cart.map((item) => (
        <div key={item.product.id} className="border-b pb-3 last:border-b-0">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-gray-900 flex-1">{item.product.name}</h4>
            <button
              onClick={() => onRemoveItem(item.product.id)}
              className="text-gray-400 hover:text-red-500 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  const result = onUpdateQuantity(item.product.id, item.quantity - 1);
                  if (!result.success) {
                    if (result.reason === 'INSUFFICIENT_STOCK' && result.maxStock !== undefined) {
                      onQuantityError(`재고는 ${result.maxStock}개까지만 있습니다.`);
                    } else if (result.reason === 'PRODUCT_NOT_FOUND') {
                      onQuantityError('상품을 찾을 수 없습니다.');
                    } else {
                      onQuantityError('수량 업데이트에 실패했습니다.');
                    }
                  }
                }}
                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                <span className="text-xs">−</span>
              </button>
              <span className="mx-3 text-sm font-medium w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => {
                  const result = onUpdateQuantity(item.product.id, item.quantity + 1);
                  if (!result.success) {
                    if (result.reason === 'INSUFFICIENT_STOCK' && result.maxStock !== undefined) {
                      onQuantityError(`재고는 ${result.maxStock}개까지만 있습니다.`);
                    } else if (result.reason === 'PRODUCT_NOT_FOUND') {
                      onQuantityError('상품을 찾을 수 없습니다.');
                    } else {
                      onQuantityError('수량 업데이트에 실패했습니다.');
                    }
                  }
                }}
                className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                <span className="text-xs">+</span>
              </button>
            </div>
            <div className="text-right">
              <CartItemDiscount item={item} cart={cart} />
              <CartItemPrice item={item} cart={cart} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
