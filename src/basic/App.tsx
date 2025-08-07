import { CartItem, ProductWithUI } from '../types';
import { SearchBar } from './components/ui';
import { Button } from '../shared/components';
import { useCart, useNotification, useProduct, useSearch, useToggle } from './hooks';
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

  const { notifications, addNotification } = useNotification();
  const { products, addProduct, updateProduct, deleteProduct, getRemainingStock } =
    useProduct(addNotification);

  const { toggle: toggleAdmin, isOpen: isAdmin } = useToggle(false);

  const { searchTerm, handleSearchTermChange, debouncedSearchTerm, filteredProducts } =
    useSearch(products);

  const remainingStock = (product: ProductWithUI) => getRemainingStock({ product, cart });

  return (
    <div className="min-h-screen bg-gray-50">
      {notifications.length > 0 && (
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-md shadow-md text-white flex justify-between items-center ${
                notif.type === 'error'
                  ? 'bg-red-600'
                  : notif.type === 'warning'
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
            >
              <span className="mr-2">{notif.message}</span>
              <Button onClick={() => addNotification(notif.message, notif.type)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}

      <Header
        isAdmin={isAdmin}
        searchTerm={searchTerm}
        onSearchTermChange={handleSearchTermChange}
        toggleAdmin={toggleAdmin}
        cart={cart}
        totalItemCount={totalItemCount}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPage
            products={products}
            remainingStock={remainingStock}
            addProduct={addProduct}
            updateProduct={updateProduct}
            addCoupon={addCoupon}
            onDeleteProduct={deleteProduct}
            onDeleteCoupon={deleteCoupon}
            onAddNotification={addNotification}
            coupons={coupons}
          />
        ) : (
          <CartPage
            products={products}
            filteredProducts={filteredProducts}
            debouncedSearchTerm={debouncedSearchTerm}
            cart={cart}
            onAddNotification={addNotification}
            addToCart={addToCart}
            removeCartItem={removeCartItem}
            validateUpdateQuantity={validateUpdateQuantity}
            onUpdateQuantity={updateQuantity}
            selectedCoupon={selectedCoupon}
            handleChangeCoupon={handleChangeCoupon}
            cartTotalPrice={cartTotalPrice}
            completeOrder={completeOrder}
            coupons={coupons}
          />
        )}
      </main>
    </div>
  );
}

interface HeaderProps {
  isAdmin: boolean;
  searchTerm: string;
  onSearchTermChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleAdmin: () => void;
  cart: CartItem[];
  totalItemCount: number;
}

function Header({
  isAdmin,
  searchTerm,
  onSearchTermChange,
  toggleAdmin,
  cart,
  totalItemCount,
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
            <Button onClick={toggleAdmin} variant={isAdmin ? 'primary' : 'secondary'}>
              {isAdmin ? '쇼핑몰로 돌아가기' : '관리자 페이지로'}
            </Button>
            {!isAdmin && (
              <div className="relative">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
