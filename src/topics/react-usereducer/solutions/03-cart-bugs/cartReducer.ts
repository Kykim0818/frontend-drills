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

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'item_added': {
      const existing = state.items.find((item) => item.id === action.product.id);
      if (existing) {
        // 🐛 버그 1: existing.quantity++ 후 같은 state를 반환 → Object.is로 "변경 없음" 판정, 리렌더링 안 됨
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        };
      }
      // 🐛 버그 2: state.items.push() 는 이전 state를 변경 → StrictMode의 두 번 호출 때 두 번 push 됨
      return { ...state, items: [...state.items, { ...action.product, quantity: 1 }] };
    }
    case 'item_removed': {
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };
    }
    case 'quantity_changed': {
      // 🐛 버그 4: 0 이하이면 제거해야 함
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.id !== action.id) };
      }
      // 🐛 버그 3: ...state 를 빠뜨려 coupon 필드가 사라짐
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...item, quantity: action.quantity } : item,
        ),
      };
    }
    case 'coupon_applied': {
      // 🐛 버그 5: localStorage 는 부수 효과 → 이벤트 핸들러로 이동
      //            return 이 없어 다음 case(cart_cleared)로 fallthrough 되어 장바구니가 비워짐
      return { ...state, coupon: action.code };
    }
    case 'cart_cleared': {
      return { ...state, items: [] };
    }
    default: {
      // 🐛 버그 6: 알 수 없는 action을 조용히 무시하면 오타를 찾기 어려움
      throw Error('Unknown action: ' + (action as { type: string }).type);
    }
  }
}

/** 파생 값은 state에 저장하지 말고 렌더링 중에 계산하세요. */
export function getTotal(state: CartState): number {
  const sum = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return state.coupon === 'HALF' ? sum / 2 : sum;
}
