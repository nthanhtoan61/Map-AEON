// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./locationSlice";

export const store = configureStore({
  reducer: {
    locations: locationReducer,
  },
});
