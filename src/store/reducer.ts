import { combineReducers } from "@reduxjs/toolkit";

import cartReducer from "./cartSlice";

const reducer = combineReducers({
  cart: cartReducer,
});

export default reducer;
