import { CartItem, ProductWithUI } from '../types';
import { SearchBar } from '../shared/components';
import { NotificationList } from './components/notification';
import { useCart, useSearch, useProduct } from './hooks';
import { useToggle } from '../shared/hooks/useToggle';
import { AdminPage } from './pages/AdminPage';
import { CartPage } from './pages/CartPage';

export default function App() {
  const {
    //coupons
    coupons,
    selectedCoupon,
    addCoupon,
    deleteCoupon,
    handleChangeCoupon,
    // cart
    cart,
    totalItemCount,
    cartTotalPrice,
    // cart utilities
    validateUpdateQuantity,
    // cart actions
    addToCart,
    removeCartItem,
    updateQuantity,
    completeOrder,
  } = useCart();

  const { products } = useProduct();
  const { toggle: toggleAdmin, isOpen: isAdmin } = useToggle(false);
  const { searchTerm, handleSearchTermChange, debouncedSearchTerm, filteredProducts } =
    useSearch(products);

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationList />

      <Header
        isAdmin={isAdmin}
        toggleAdmin={toggleAdmin}
        cart={cart}
        totalItemCount={totalItemCount}
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
      />

      <MainContent
        isAdmin={isAdmin}
        filteredProducts={filteredProducts}
        debouncedSearchTerm={debouncedSearchTerm}
        products={products}
        cart={cart}
        coupons={coupons}
        selectedCoupon={selectedCoupon}
        cartTotalPrice={cartTotalPrice}
        addCoupon={addCoupon}
        deleteCoupon={deleteCoupon}
        addToCart={addToCart}
        removeCartItem={removeCartItem}
        validateUpdateQuantity={validateUpdateQuantity}
        updateQuantity={updateQuantity}
        handleChangeCoupon={handleChangeCoupon}
        completeOrder={completeOrder}
      />
    </div>
  );
}

interface HeaderProps {
  isAdmin: boolean;
  toggleAdmin: () => void;
  cart: CartItem[];
  totalItemCount: number;
  searchTerm: string;
  onSearchTermChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Header({
  isAdmin,
  toggleAdmin,
  cart,
  totalItemCount,
  searchTerm,
  onSearchTermChange,
}: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center flex-1 gap-6">
            <h1 className="text-xl font-semibold text-gray-800">SHOP</h1>
            {!isAdmin && <SearchBar value={searchTerm} onChange={onSearchTermChange} />}
          </div>
          <nav className="flex items-center space-x-4">
            <AdminToggleButton isAdmin={isAdmin} onToggle={toggleAdmin} />
            {!isAdmin && <CartIcon cart={cart} totalItemCount={totalItemCount} />}
          </nav>
        </div>
      </div>
    </header>
  );
}

interface AdminToggleButtonProps {
  isAdmin: boolean;
  onToggle: () => void;
}

function AdminToggleButton({ isAdmin, onToggle }: AdminToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 text-sm rounded transition-colors ${
        isAdmin ? 'bg-gray-800 text-white' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {isAdmin ? '쇼핑몰로 돌아가기' : '관리자 페이지로'}
    </button>
  );
}

interface CartIconProps {
  cart: CartItem[];
  totalItemCount: number;
}

function CartIcon({ cart, totalItemCount }: CartIconProps) {
  return (
    <div className="relative">
      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {cart.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {totalItemCount}
        </span>
      )}
    </div>
  );
}

interface MainContentProps {
  isAdmin: boolean;
  filteredProducts: ProductWithUI[];
  debouncedSearchTerm: string;
  products: ProductWithUI[];
  cart: CartItem[];
  coupons: any[];
  selectedCoupon: any;
  cartTotalPrice: { totalBeforeDiscount: number; totalAfterDiscount: number };
  addCoupon: (coupon: any) => void;
  deleteCoupon: (code: string) => void;
  addToCart: (params: any) => void;
  removeCartItem: (productId: string) => void;
  validateUpdateQuantity: (params: any) => { isValid: boolean; message?: string };
  updateQuantity: (params: any) => any;
  handleChangeCoupon: (
    e: React.ChangeEvent<HTMLSelectElement>,
    totalAfterDiscount: number,
    callback: () => void
  ) => void;
  completeOrder: (callback: () => void) => void;
}

function MainContent({
  isAdmin,
  filteredProducts,
  debouncedSearchTerm,
  products,
  cart,
  coupons,
  selectedCoupon,
  cartTotalPrice,
  addToCart,
  removeCartItem,
  validateUpdateQuantity,
  updateQuantity,
  handleChangeCoupon,
  completeOrder,
}: MainContentProps) {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {isAdmin ? (
        <AdminPage />
      ) : (
        <CartPage
          products={products}
          filteredProducts={filteredProducts}
          debouncedSearchTerm={debouncedSearchTerm}
          cart={cart}
          addToCart={addToCart}
          removeCartItem={removeCartItem}
          validateUpdateQuantity={validateUpdateQuantity}
          onUpdateQuantity={updateQuantity}
          coupons={coupons}
          selectedCoupon={selectedCoupon}
          handleChangeCoupon={handleChangeCoupon}
          completeOrder={completeOrder}
          cartTotalPrice={cartTotalPrice}
        />
      )}
    </main>
  );
}
