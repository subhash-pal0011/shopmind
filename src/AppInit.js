"use client"
import React from 'react'
import CurrentUser from './hooks/CurrentUser'
import AllVendorUser from './hooks/AllVendorUser'

const AppInit = ({ children }) => {
       return (
              <>
                     <CurrentUser />
                     <AllVendorUser />
                     {children}
              </>
       )
}

export default AppInit
