"use client";

import { setUserData } from "@/redux/userSlice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const CurrentUser = () => {
       const dispatch = useDispatch();

       useEffect(() => {
              const getCurrentUser = async () => {
                     try {
                            const res = await axios.get("/api/currentUser");

                            if (res.data.success) {
                                   dispatch(setUserData(res.data.data));
                            }
                     } catch (error) {
                            console.log(
                                   "Get current user error:",
                                   error.response?.data || error.message
                            );
                     }
              };

              getCurrentUser();
       }, [dispatch]);

       return null;
};

export default CurrentUser;
