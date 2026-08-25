"use client";
import { setAllVendorProduct } from "@/redux/allVendorUserSLice";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const GetAllVendorProduct = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getAllVendorProduct = async () => {
      try {
        const res = await axios.get("/api/vendor/getAllAddProduct");
        if (res.data.success) {
          dispatch(setAllVendorProduct(res.data.data));
        }
      } catch (error) {
        console.error("Error fetching vendor products:", error);
      }
    };
    getAllVendorProduct();
  }, [dispatch]);
  return null;
};

export default GetAllVendorProduct;
