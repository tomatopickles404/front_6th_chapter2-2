import { useState } from 'react';

type AdminTab = 'products' | 'coupons';

export function useAdminUI() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  const toggleAdminMode = () => {
    setIsAdmin((prev) => !prev);
  };

  const switchToProductsTab = () => {
    setActiveTab('products');
  };

  const switchToCouponsTab = () => {
    setActiveTab('coupons');
  };

  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  return {
    // State
    isAdmin,
    activeTab,

    // Actions
    setIsAdmin,
    setActiveTab,
    toggleAdminMode,
    switchToProductsTab,
    switchToCouponsTab,
    switchTab,

    // Computed
    isProductsTabActive: activeTab === 'products',
    isCouponsTabActive: activeTab === 'coupons',
  };
}
