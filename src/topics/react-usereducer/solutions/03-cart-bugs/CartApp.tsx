import { StrictMode, useReducer, useState } from 'react';
import { cartReducer, getTotal, initialCart, type Product } from './cartReducer';

const products: Product[] = [
  { id: 'apple', name: '사과', price: 1000 },
  { id: 'banana', name: '바나나', price: 500 },
];

function Cart() {
  const [state, dispatch] = useReducer(cartReducer, initialCart);
  const [code, setCode] = useState('');

  function handleApplyCoupon() {
    dispatch({ type: 'coupon_applied', code });
    // 부수 효과는 이벤트 핸들러에서 (리듀서는 순수하게)
    localStorage.setItem('coupon', code);
  }

  return (
    <div className="card">
      <div className="row">
        {products.map((p) => (
          <button key={p.id} onClick={() => dispatch({ type: 'item_added', product: p })}>
            {p.name} 담기
          </button>
        ))}
      </div>
      <ul>
        {state.items.map((item) => (
          <li key={item.id}>
            {item.name} ×{' '}
            <input
              type="number"
              aria-label={`${item.name} 수량`}
              value={item.quantity}
              onChange={(e) =>
                dispatch({ type: 'quantity_changed', id: item.id, quantity: Number(e.target.value) })
              }
            />
            <button onClick={() => dispatch({ type: 'item_removed', id: item.id })}>빼기</button>
          </li>
        ))}
      </ul>
      <div className="row">
        <input placeholder="쿠폰 (HALF)" value={code} onChange={(e) => setCode(e.target.value)} />
        <button onClick={handleApplyCoupon}>쿠폰 적용</button>
        <button onClick={() => dispatch({ type: 'cart_cleared' })}>비우기</button>
      </div>
      <p>
        쿠폰: {state.coupon ?? '없음'} / 합계: <strong data-testid="total">{getTotal(state)}</strong>원
      </p>
    </div>
  );
}

export default function CartApp() {
  return (
    <StrictMode>
      <Cart />
    </StrictMode>
  );
}
