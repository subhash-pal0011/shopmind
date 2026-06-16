import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import allVendorUserReducer from "./allVendorUserSLice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    vendorUser: allVendorUserReducer,
  },
});