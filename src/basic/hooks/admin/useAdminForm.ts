import { useState } from 'react';
import { Coupon, ProductWithUI } from '../../../types';
import {
  formatAddMessage,
  formatErrorMessageCRUD,
  formatErrorMessageProduct,
  formatExceedErrorMessage,
} from '../../utils/format';
import { useToggle } from '../utils/useToggle';

type ProductForm = {
  name: string;
  price: number;
  stock: number;
  description: string;
  discounts: Array<{ quantity: number; rate: number }>;
};

type CouponForm = {
  name: string;
  code: string;
  discountType: 'amount' | 'percentage';
  discountValue: number;
};

type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export function useAdminForm({
  addProduct,
  updateProduct,
  addCoupon,
}: {
  addProduct: (product: Omit<ProductWithUI, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<ProductWithUI>) => void;
  addCoupon: (coupon: Coupon) => void;
}) {
  const { isOpen: showProductForm, toggle: toggleProductForm } = useToggle(false);
  const { isOpen: showCouponForm, toggle: toggleCouponForm } = useToggle(false);

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    price: 0,
    stock: 0,
    description: '',
    discounts: [],
  });

  const [couponForm, setCouponForm] = useState<CouponForm>({
    name: '',
    code: '',
    discountType: 'amount',
    discountValue: 0,
  });

  const handleProductSubmit = (e: React.FormEvent): { success: boolean; message?: string } => {
    e.preventDefault();

    try {
      if (editingProduct && editingProduct !== 'new') {
        updateProduct(editingProduct, productForm);
        setEditingProduct(null);
      } else {
        addProduct({
          ...productForm,
          discounts: productForm.discounts,
        });
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: formatErrorMessageCRUD('상품', '추가') };
    }
  };

  const handleEditProduct = (product: ProductWithUI) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      discounts: product.discounts || [],
    });
    toggleProductForm();
  };

  const handleNewProduct = () => {
    setEditingProduct('new');
    setProductForm({
      name: '',
      price: 0,
      stock: 0,
      description: '',
      discounts: [],
    });
    toggleProductForm();
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: 0,
      stock: 0,
      description: '',
      discounts: [],
    });
    setEditingProduct(null);
    toggleProductForm();
  };

  // Coupon form handlers
  const handleCouponSubmit = (e: React.FormEvent): { success: boolean; message?: string } => {
    e.preventDefault();

    try {
      const newCoupon = couponForm as Coupon;
      addCoupon(newCoupon);
      return { success: true, message: formatAddMessage('쿠폰') };
    } catch (error) {
      return { success: false, message: formatErrorMessageCRUD('쿠폰', '추가') };
    }
  };

  const resetCouponForm = () => {
    setCouponForm({
      name: '',
      code: '',
      discountType: 'amount',
      discountValue: 0,
    });
    toggleCouponForm();
  };

  // Form validation helpers - now returns validation results instead of calling notifications
  const validateProductForm = (field: keyof ProductForm, value: any): ValidationResult => {
    switch (field) {
      case 'price':
        if (value < 0) {
          return { isValid: false, message: formatErrorMessageProduct('가격', 0) };
        }
        return { isValid: true };
      case 'stock':
        if (value < 0) {
          return { isValid: false, message: formatErrorMessageProduct('재고', 0) };
        }
        if (value > 9999) {
          return { isValid: false, message: formatExceedErrorMessage('재고', 9999) };
        }
        return { isValid: true };
      default:
        return { isValid: true };
    }
  };

  const validateCouponForm = (field: keyof CouponForm, value: any): ValidationResult => {
    if (field === 'discountValue') {
      if (couponForm.discountType === 'percentage') {
        if (value > 100) {
          return { isValid: false, message: formatExceedErrorMessage('할인율', 100) };
        }
      } else {
        if (value > 100000) {
          return { isValid: false, message: formatExceedErrorMessage('할인 금액', 100000) };
        }
      }
      if (value < 0) {
        return { isValid: false, message: formatErrorMessageProduct('할인값', 0) };
      }
    }
    return { isValid: true };
  };

  // Form update helpers
  const handleProductFormChange = (updates: Partial<ProductForm>) => {
    setProductForm((prev) => ({ ...prev, ...updates }));
  };

  const handleCouponFormChange = (updates: Partial<CouponForm>) => {
    setCouponForm((prev) => ({ ...prev, ...updates }));
  };

  return {
    // Product form state
    showProductForm,
    toggleProductForm,
    editingProduct,
    productForm,
    resetProductForm,

    // Product form handlers
    handleProductSubmit,
    handleNewProduct,
    handleEditProduct,
    handleProductFormChange,

    // Coupon form state
    showCouponForm,
    toggleCouponForm,
    couponForm,
    resetCouponForm,

    // Coupon form handlers
    handleCouponSubmit,
    handleCouponFormChange,

    // Validation
    validateProductForm,
    validateCouponForm,
  };
}
