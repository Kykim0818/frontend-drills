import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentType } from 'react';
import { vi } from 'vitest';
import { deepFreeze } from '../../../test/deepFreeze';

type Product = { id: string; name: string; price: number };
type CartItem = Product & { quantity: number };
type CartState = { items: CartItem[]; coupon: string | null };

export type CartModule = {
  cartReducer: (state: CartState, action: any) => CartState;
  CartApp: ComponentType;
};

const apple = { id: 'apple', name: '사과', price: 1000 };
const banana = { id: 'banana', name: '바나나', price: 500 };

export function runCartSuite({ cartReducer, CartApp }: CartModule) {
  const withApple = () =>
    deepFreeze<CartState>({ items: [{ ...apple, quantity: 1 }], coupon: 'HALF' });

  describe('과제 3 - cartReducer 버그 수정', () => {
    it('버그 1: 이미 있는 상품을 담으면 새 state로 수량 증가 (원본 불변)', () => {
      const prev = withApple();
      const next = cartReducer(prev, { type: 'item_added', product: apple });
      expect(next).not.toBe(prev);
      expect(next.items[0].quantity).toBe(2);
      expect(prev.items[0].quantity).toBe(1);
    });

    it('버그 2: 새 상품을 담을 때 이전 items 배열을 변경하지 않음', () => {
      const prev = withApple();
      const next = cartReducer(prev, { type: 'item_added', product: banana });
      expect(prev.items).toHaveLength(1);
      expect(next.items.map((i) => i.id)).toEqual(['apple', 'banana']);
    });

    it('버그 3: 수량 변경 시 coupon 유지', () => {
      const next = cartReducer(withApple(), { type: 'quantity_changed', id: 'apple', quantity: 3 });
      expect(next).toEqual({ items: [{ ...apple, quantity: 3 }], coupon: 'HALF' });
    });

    it('버그 4: 수량이 0 이하이면 제거', () => {
      const next = cartReducer(withApple(), { type: 'quantity_changed', id: 'apple', quantity: 0 });
      expect(next.items).toEqual([]);
      expect(next.coupon).toBe('HALF');
    });

    it('버그 5: 쿠폰 적용은 장바구니를 비우지 않고, 리듀서에서 localStorage를 쓰지 않음', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem');
      const next = cartReducer(withApple(), { type: 'coupon_applied', code: 'VIP' });
      expect(next).toEqual({ items: [{ ...apple, quantity: 1 }], coupon: 'VIP' });
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('버그 6: 알 수 없는 action은 에러', () => {
      expect(() => cartReducer(withApple(), { type: 'itemAdded' })).toThrow(/Unknown action: itemAdded/);
    });
  });

  describe('과제 3 - CartApp (StrictMode)', () => {
    it('StrictMode에서도 한 번 클릭 = 한 개, 수량 증가가 화면에 반영', async () => {
      const user = userEvent.setup();
      render(<CartApp />);
      await user.click(screen.getByRole('button', { name: '사과 담기' }));
      expect(screen.getByLabelText('사과 수량')).toHaveValue(1);
      await user.click(screen.getByRole('button', { name: '사과 담기' }));
      expect(screen.getByLabelText('사과 수량')).toHaveValue(2);
      expect(screen.getByTestId('total')).toHaveTextContent('2000');
    });

    it('쿠폰 적용 버튼을 누르면 localStorage에 저장 (이벤트 핸들러에서)', async () => {
      const user = userEvent.setup();
      localStorage.clear();
      render(<CartApp />);
      await user.click(screen.getByRole('button', { name: '바나나 담기' }));
      await user.type(screen.getByPlaceholderText('쿠폰 (HALF)'), 'HALF');
      await user.click(screen.getByRole('button', { name: '쿠폰 적용' }));
      expect(localStorage.getItem('coupon')).toBe('HALF');
      expect(screen.getByTestId('total')).toHaveTextContent('250');
    });
  });
}
