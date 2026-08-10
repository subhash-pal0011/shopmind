// import { createSlice } from '@reduxjs/toolkit'

// export const userSlice = createSlice({
//        name: 'user',
//        initialState: {
//               userData:null
//        },
//        reducers: {

//               setUserData: (state, action) => {
//                      state.userData = action.payload
//               },
//        },
// })

// export const { setUserData } = userSlice.actions

// export default userSlice.reducer

import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",

  initialState: {
    userData: null,
  },

  reducers: {
    // Set complete user data
    setUserData: (state, action) => {
      state.userData = action.payload;
    },

    // Update existing user data
    updateUser: (state, action) => {
      if (state.userData) {
        state.userData = {
          ...state.userData,
          ...action.payload,
        };
      }
    },
  },
});

export const { setUserData, updateUser} = userSlice.actions;

export default userSlice.reducer;
