import { createSlice } from "@reduxjs/toolkit";

export const allVendorUserSlice = createSlice({
  name: "vendorUser",

  initialState: {
    vendorUserData: [],
    allVendorProduct: [],
  },

  reducers: {
    setVendorUserData: (state, action) => {
      state.vendorUserData = action.payload;
    },

    setAllVendorProduct: (state, action) => {
      state.allVendorProduct = action.payload;
    },
  },
});

export const {setVendorUserData, setAllVendorProduct} = allVendorUserSlice.actions;
export default allVendorUserSlice.reducer;