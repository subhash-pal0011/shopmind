import { createSlice } from '@reduxjs/toolkit'

export const allVendorUserSLice = createSlice({
       name: 'userVender',
       initialState: {
              vendorUserData:[]
       },
       reducers: {
              
              setVendorUserData: (state, action) => {
                     state.vendorUserData = action.payload
              },
       },
})

export const { setVendorUserData } = allVendorUserSLice.actions

export default allVendorUserSLice.reducer