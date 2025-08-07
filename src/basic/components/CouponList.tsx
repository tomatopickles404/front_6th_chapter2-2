import { useCouponList } from '../hooks/admin';
import { Coupon } from '../../types';
import { Button } from '../../shared/components';
import { commaizedNumberWithUnit } from '../../shared/utils/commaizedNumber';

interface CouponListProps {
  coupons: Coupon[];
  onDeleteCoupon: (couponCode: string) => void;
  onAddNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
  addCoupon: (coupon: Coupon) => void;
}

export function CouponList({
  coupons,
  onDeleteCoupon,
  onAddNotification,
  addCoupon,
}: CouponListProps) {
  const {
    showCouponForm,
    couponForm,
    handleCouponSubmit,
    handleCouponFormChange,
    validateCouponForm,
    resetCouponForm,
    toggleCouponForm,
  } = useCouponList({ addCoupon });

  return (
    <section className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">쿠폰 관리</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{coupon.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 font-mono">{coupon.code}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-indigo-700">
                      {coupon.discountType === 'amount'
                        ? `${commaizedNumberWithUnit(coupon.discountValue, '원')} 할인`
                        : `${coupon.discountValue}% 할인`}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    onDeleteCoupon(coupon.code);
                    onAddNotification('쿠폰이 삭제되었습니다.', 'success');
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ))}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-gray-400 transition-colors">
            <Button onClick={toggleCouponForm} variant="secondary">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="mt-2 text-sm font-medium">새 쿠폰 추가</p>
            </Button>
          </div>
        </div>

        {showCouponForm && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <form
              onSubmit={(e) => {
                const result = handleCouponSubmit(e);
                if (result.success) {
                  resetCouponForm();
                }
              }}
              className="space-y-4"
            >
              <h3 className="text-md font-medium text-gray-900">새 쿠폰 생성</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰명</label>
                  <input
                    type="text"
                    value={couponForm.name}
                    onChange={(e) =>
                      handleCouponFormChange({ ...couponForm, name: e.target.value })
                    }
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border text-sm"
                    placeholder="신규 가입 쿠폰"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 코드</label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) =>
                      handleCouponFormChange({
                        ...couponForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border text-sm font-mono"
                    placeholder="WELCOME2024"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">할인 타입</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      handleCouponFormChange({
                        ...couponForm,
                        discountType: e.target.value as 'amount' | 'percentage',
                      })
                    }
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border text-sm"
                  >
                    <option value="amount">정액 할인</option>
                    <option value="percentage">정률 할인</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {couponForm.discountType === 'amount' ? '할인 금액' : '할인율(%)'}
                  </label>
                  <input
                    type="text"
                    value={couponForm.discountValue === 0 ? '' : couponForm.discountValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        handleCouponFormChange({
                          ...couponForm,
                          discountValue: value === '' ? 0 : parseInt(value),
                        });
                      }
                    }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const validation = validateCouponForm('discountValue', value);

                      if (!validation.isValid && validation.message) {
                        onAddNotification(validation.message, 'error');

                        // Auto-correct to max/min values
                        if (couponForm.discountType === 'percentage') {
                          if (value > 100) {
                            handleCouponFormChange({ ...couponForm, discountValue: 100 });
                          } else if (value < 0) {
                            handleCouponFormChange({ ...couponForm, discountValue: 0 });
                          }
                        } else {
                          if (value > 100000) {
                            handleCouponFormChange({
                              ...couponForm,
                              discountValue: 100000,
                            });
                          } else if (value < 0) {
                            handleCouponFormChange({ ...couponForm, discountValue: 0 });
                          }
                        }
                      }
                    }}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2 border text-sm"
                    placeholder={couponForm.discountType === 'amount' ? '5000' : '10'}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" onClick={resetCouponForm} variant="secondary">
                  취소
                </Button>
                <Button type="submit" variant="primary">
                  쿠폰 생성
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
