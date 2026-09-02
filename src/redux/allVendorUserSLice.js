import { createSlice } from "@reduxjs/toolkit";

export const allVendorUserSlice = createSlice({

  name: "vendorUser",

  initialState: {
    vendorUserData: [],
    allVendorProduct: [],
    allProductForUser : [],
  },

  reducers: {
    setVendorUserData: (state, action) => {
      state.vendorUserData = action.payload;
    },

    setAllVendorProduct: (state, action) => {
      state.allVendorProduct = action.payload;
    },

    setallProductForUser: (state, action) => {
      state.allProductForUser = action.payload;
    },
  },
});

export const {setVendorUserData, setAllVendorProduct , setallProductForUser} = allVendorUserSlice.actions;
export default allVendorUserSlice.reducer;