"use client"
import React, { useEffect } from 'react'
import CurrentUser from './hooks/CurrentUser'
import AllVendorUser from './hooks/AllVendorUser'
import { disconnectSocket, socketConnection } from './lib/socketConnection'
import { useSelector } from 'react-redux'
import GetAllVendorProduct from './hooks/GetAllVendorProduct'
import GetProductForUser from './hooks/GetProductForUser'

const AppInit = ({ children }) => {
       const userData = useSelector((state) => state.user.userData);
       const userId = userData?._id;
       

       useEffect(() => {
              if (userId) {
                     const socket  = socketConnection();
                     
                     socket.emit("userId", userId);
              } 
              else {
                     disconnectSocket();
              }
       }, [userId]);

       return (
              <>
                     <CurrentUser />
                     <AllVendorUser />
                     <GetAllVendorProduct />
                     <GetProductForUser />
                     {children}
              </>
       )
}

export default AppInit