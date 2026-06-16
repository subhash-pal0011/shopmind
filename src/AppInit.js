"use client"
import React, { useEffect } from 'react'
import CurrentUser from './hooks/CurrentUser'
import AllVendorUser from './hooks/AllVendorUser'
import { disconnectSocket, socketConnection } from './lib/socketConnection'
import { useSelector } from 'react-redux'

const AppInit = ({ children }) => {
       const userData = useSelector((state) => state.user.userData);
       const userId = userData?._id;

       useEffect(() => {
              if (userId) {
                     socketConnection();
              } else {
                     disconnectSocket();
              }
       }, [userId]);

       return (
              <>
                     <CurrentUser />
                     <AllVendorUser />
                     {children}
              </>
       )
}

export default AppInit
