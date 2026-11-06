export type Product = { id: string; name: string; price: number };
export type CartItem = Product & { quantity: number };
export type CartState = { items: CartItem[]; coupon: string | null };

export type CartAction =
  | { type: 'item_added'; product: Product }
  | { type: 'item_removed'; id: string }
  | { type: 'quantity_changed'; id: string; quantity: number }
  | { type: 'coupon_applied'; code: string }
  | { type: 'cart_cleared' };

export const initialCart: CartState = { items: [], coupon: null };

// ⚠️ 이 리듀서에는 버그가 6개 있습니다. README의 리포트를 참고해서 모두 고치세요.
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'item_added': {
      const existing = state.items.find((item) => item.id === action.product.id);
      if (existing) {
        existing.quantity++;
        return state;
      }
      state.items.push({ ...action.product, quantity: 1 });
      return { ...state };
    }
    case 'item_removed': {
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };
    }
    case 'quantity_changed': {
      return {
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: action.quantity } : item,
        ),
      } as CartState;
    }
    case 'coupon_applied': {
      localStorage.setItem('coupon', action.code);
      state = { ...state, coupon: action.code };
    }
    case 'cart_cleared': {
      return { ...state, items: [] };
    }
    default: {
      return state;
    }
  }
}

/** 파생 값은 state에 저장하지 말고 렌더링 중에 계산하세요. */
export function getTotal(state: CartState): number {
  const sum = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return state.coupon === 'HALF' ? sum / 2 : sum;
}
