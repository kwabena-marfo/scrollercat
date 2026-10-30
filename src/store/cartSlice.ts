import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// The cart lives in the browser (persisted by redux-persist). Prices here
// are only for display — checkout re-prices everything on the server.
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image?: string | null;
  stock: number;
  quantity: number;
};

type CartState = { items: CartItem[] };

const initialState: CartState = { items: [] };

const clamp = (qty: number, stock: number) => Math.max(1, Math.min(qty, Math.max(stock, 1), 99));

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, { payload }: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.productId === payload.productId);
      if (existing) {
        existing.quantity = clamp(existing.quantity + payload.quantity, payload.stock);
        existing.stock = payload.stock;
        existing.price = payload.price;
      } else {
        state.items.push({ ...payload, quantity: clamp(payload.quantity, payload.stock) });
      }
    },
    setQuantity(state, { payload }: PayloadAction<{ productId: string; quantity: number }>) {
      const item = state.items.find((i) => i.productId === payload.productId);
      if (item) item.quantity = clamp(payload.quantity, item.stock);
    },
    removeFromCart(state, { payload }: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
