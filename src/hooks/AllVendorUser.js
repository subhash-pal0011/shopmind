"use client";
import { setVendorUserData } from "@/redux/allVendorUserSLice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const AllVendorUser = () => {
       const dispatch = useDispatch();

       useEffect(() => {
              const getAllVendorUser = async () => {
                     try {
                            const res = await axios.get("/api/vendor/allVendorUser");

                            if (res.data.success) {
                                   dispatch(setVendorUserData(res.data.data));
                            }
                     } catch (error) {
                            console.log(
                                   "Get current user error:",
                                   error.response?.data || error.message
                            );
                     }
              };
              getAllVendorUser();
       }, [dispatch]);
       
       return null;
};

export default AllVendorUser;

