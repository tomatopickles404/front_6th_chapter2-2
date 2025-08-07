import { useState } from 'react';

type AdminTab = 'products' | 'coupons';

export function useActiveTab() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  const handleSwitchTab = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  return {
    activeTab,

    // Actions
    handleSwitchTab,

    // Computed
    isProductsTabActive: activeTab === 'products',
    isCouponsTabActive: activeTab === 'coupons',
  };
}
