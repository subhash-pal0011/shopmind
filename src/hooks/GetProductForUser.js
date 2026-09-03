"use client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setallProductForUser } from "@/redux/allVendorUserSLice";
import {disconnectSocket, socketConnection} from "@/lib/socketConnection";

const GetProductForUser = () => {
  const dispatch = useDispatch();

  const products = useSelector(
    (state) => state.allVendorUser?.allProductForUser || []
  );

  const productsRef = useRef(products);

  // Keep ref updated with latest Redux products
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Initial API fetch
  useEffect(() => {
    const getAllVendorProduct = async () => {
      try {
        const res = await axios.get("/api/user/getProduct");

        if (res.data.success) {
          dispatch(setallProductForUser(res.data.data));
        }
      } catch (error) {
        console.error("Error fetching products for user:", error);
      }
    };

    getAllVendorProduct();
  }, [dispatch]);

  // Socket connection
  useEffect(() => {
    const socket = socketConnection();

    if (!socket) return;

    const handleApprovedProduct = (updatedProduct) => {

      const currentProducts = productsRef.current;

      const productExists = currentProducts.some(
        (product) => product._id === updatedProduct._id
      );

      let newProducts;

      if (productExists) {
        // Replace existing product
        newProducts = currentProducts.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        );
      } else {
        newProducts = [...currentProducts, updatedProduct];
      }

      dispatch(setallProductForUser(newProducts));
    };

    socket.on("approved-product", handleApprovedProduct);

    return () => {
      socket.off("approved-product", handleApprovedProduct);
      disconnectSocket();
    };
  }, [dispatch]);

  return null;
};

export default GetProductForUser;

