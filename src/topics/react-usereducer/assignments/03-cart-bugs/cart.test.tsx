import { runCartSuite } from '../../specs/cart.suite';
import { cartReducer } from './cartReducer';
import CartApp from './CartApp';

runCartSuite({ cartReducer, CartApp });
