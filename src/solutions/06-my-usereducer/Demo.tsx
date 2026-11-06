import { useMyReducer } from './useMyReducer';

type Action = { type: 'incremented' } | { type: 'reset' };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'incremented':
      return state + 1;
    case 'reset':
      return 0;
  }
}

export default function Demo() {
  const [count, dispatch] = useMyReducer(reducer, 0);
  return (
    <div className="card">
      <p>
        count: <strong>{count}</strong>
      </p>
      <div className="row">
        <button
          onClick={() => {
            dispatch({ type: 'incremented' });
            dispatch({ type: 'incremented' });
            dispatch({ type: 'incremented' });
          }}
        >
          +3 (dispatch 세 번)
        </button>
        <button onClick={() => dispatch({ type: 'reset' })}>리셋</button>
      </div>
    </div>
  );
}
