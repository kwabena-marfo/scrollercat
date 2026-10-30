"use client";

import { useSyncExternalStore } from "react";
import { useDispatch, useSelector } from "react-redux";

import { persistor, type AppDispatch, type RootState } from "@/store";
import { roundMoney } from "@/helpers/money";

// There's no PersistGate around the app (it would blank every page on the
// server, and the storefront needs SSR for search engines). Instead, pages
// that depend on the saved cart wait for `ready` — the cart has been read
// back from localStorage.
const subscribe = (onChange: () => void) => persistor.subscribe(onChange);
const isBootstrapped = () => persistor.getState().bootstrapped;
const onServer = () => false;

export default function useCart() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart.items);
  const ready = useSyncExternalStore(subscribe, isBootstrapped, onServer);

  return {
    ready,
    items: ready ? items : [],
    count: ready ? items.reduce((sum, i) => sum + i.quantity, 0) : 0,
    subtotal: roundMoney(items.reduce((sum, i) => sum + i.price * i.quantity, 0)),
    dispatch,
  };
}
