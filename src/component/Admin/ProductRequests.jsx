"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { IoSearchOutline } from "react-icons/io5";
import { disconnectSocket, socketConnection } from "@/lib/socketConnection";
import { toast } from "sonner";

const ProductRequests = () => {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);

  const [rejectReason, setRejectReason] = useState("");

  const [activeImage, setActiveImage] = useState(0);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("pending");

  // FETCH PRODUCT REQUESTS
  const fetchProductRequests = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/admin/getApproveProduct");

      if (response.data?.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error("FETCH PRODUCT REQUESTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };
  // FETCH PRODUCT REAL TIME
  useEffect(() => {
    fetchProductRequests();

    const socket = socketConnection();

    // const handleConnect = () => {
    //   console.log("Socket Connected:", socket.id);
    // };

    const handleProductCreated = (product) => {
      // console.log("Realtime Product:", product);

      setProducts((prevProducts) => {
        // Duplicate product avoid karo
        const alreadyExists = prevProducts.some(
          (item) => item._id === product._id,
        );

        if (alreadyExists) {
          return prevProducts;
        }

        return [product, ...prevProducts];
      });
    };

    // socket.on("connect", handleConnect);
    socket.on("product:created", handleProductCreated);

    return () => {
      // socket.off("connect", handleConnect);
      // socket.off("product:created", handleProductCreated);
      disconnectSocket();
    };
  }, []);
  // REAL TIME DELETE PRODUCT
  useEffect(() => {

    fetchProductRequests();

    const socket = socketConnection();

    const handleProductDeleted = (deletedProduct) => {
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== deletedProduct._id),
      );
    };
    socket.on("deleted-product", handleProductDeleted);
    return () => {
      disconnectSocket();
    };
  }, []);

  // APPROVE PRODUCT
  const handleApprove = async (product) => {
    if (!product?._id) return;

    try {
      setActionLoading(true);

      const res = await axios.put(
        "/api/admin/rejectAndApproveProduct",
        {
          productId: product._id,
          status: "approved",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setProducts((prev) =>
          prev.map((item) =>
            item._id === product._id
              ? {
                  ...item,
                  verificationStatus: "approved",
                  isActive: true,
                  approvedAt: res.data.product?.approvedAt,
                  rejectedReason: null,
                }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error("Approve Error:", error);
      toast.error(error.response?.data?.message || "Failed to approve product");
    } finally {
      setActionLoading(false);
    }
  };

  // REJECT PRODUCT
  const handleReject = async () => {
    if (!selectedProduct?._id) return;

    if (!rejectReason.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }

    try {
      setActionLoading(true);
      const res = await axios.put("/api/admin/rejectAndApproveProduct", {
        productId: selectedProduct._id,
        status: "rejected",
        rejectedReason: rejectReason.trim(),
      });

      if (res.data.success) {
        toast.success(res.data.message);

        // Update product in UI
        setProducts((prev) =>
          prev.map((item) =>
            item._id === selectedProduct._id
              ? {
                  ...item,
                  verificationStatus: "rejected",
                  isActive: false,
                  approvedAt: null,
                  rejectedReason: rejectReason.trim(),
                }
              : item,
          ),
        );

        // Close reject modal
        setSelectedProduct(null);
        setRejectReason("");
      }
    } catch (error) {
      console.error("Reject Error:", error);
      toast.error(error.response?.data?.message || "Failed to reject product");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // FILTER
  // =====================================================
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product?.title?.toLowerCase().includes(search.toLowerCase()) ||
      product?.category?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || product?.verificationStatus === filter;
    return matchesSearch && matchesFilter;
  });

  // =====================================================
  // STATUS
  // =====================================================
  const getStatusStyle = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600"
          />

          <p className="text-sm text-gray-500 mt-4">
            Loading product requests...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-200 p-2 sm:p-2 lg:p-8">
      <motion.div
        initial={{
          opacity: 0,
          y: -25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-7"
      >
        <div>
          <motion.h1
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="text-2xl sm:text-3xl font-bold text-gray-800"
          >
            Product Requests
          </motion.h1>

          <p className="text-sm text-gray-500 mt-1">
            Review and manage vendor product requests
          </p>
        </div>

        {/* SEARCH */}

        <div className="relative w-full lg:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-100 transition"
          />

          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IoSearchOutline size={20} />
          </span>
        </div>
      </motion.div>

      {/* ================================================= */}
      {/* FILTER BAR */}
      {/* ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="flex gap-2 overflow-x-auto pb-2 mb-6"
      >
        {[
          {
            id: "pending",
            name: "Pending",
          },
          {
            id: "approved",
            name: "Approved",
          },
          {
            id: "rejected",
            name: "Rejected",
          },
          {
            id: "all",
            name: "All",
          },
        ].map((item) => {
          const count =
            item.id === "all"
              ? products.length
              : products.filter(
                  (product) => product.verificationStatus === item.id,
                ).length;

          return (
            <motion.button
              key={item.id}
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => setFilter(item.id)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition ${
                filter === item.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {item.name}

              <span
                className={`ml-2 px-1.5 py-0.5 rounded-md ${
                  filter === item.id ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                {count}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* SERCH AUR RENDER DODNO */}
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="min-h-[400px] bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-6xl"
            >
              📋
            </motion.div>

            <h2 className="text-xl font-bold text-gray-700 mt-4">
              No Product Requests
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              There are no products matching your filter.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="products"
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {filteredProducts.map((product, index) => {
                const image = product?.productImg?.[0] || "/placeholder.png";
                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 40,
                      scale: 0.95,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                    }}
                    whileHover={{
                      y: -7,
                    }}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
                  >
                    {/* IMAGE */}

                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      <motion.img
                        src={image}
                        alt={product?.title}
                        whileHover={{
                          scale: 1.08,
                        }}
                        transition={{
                          duration: 0.5,
                        }}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* STATUS */}

                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1.5 rounded-full border text-[10px] font-bold ${getStatusStyle(
                            product?.verificationStatus,
                          )}`}
                        >
                          {product?.verificationStatus === "pending"
                            ? "⏳ Pending"
                            : product?.verificationStatus === "approved"
                              ? "✓ Approved"
                              : "✕ Rejected"}
                        </span>
                      </div>

                      {/* CATEGORY */}

                      <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-gray-700 text-[10px] font-semibold">
                          {product?.category || "Other"}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}

                    <div className="p-4">
                      <h2 className="text-lg font-bold text-gray-800 truncate">
                        {product?.title || "Untitled Product"}
                      </h2>

                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-8">
                        {product?.description || "No description"}
                      </p>

                      {/* PRICE STOCK */}

                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-[10px] text-gray-400">Price</p>

                          <p className="text-xl font-bold text-blue-600">
                            ₹
                            {Number(product?.price || 0).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Stock</p>

                          <p
                            className={`text-sm font-bold ${
                              product?.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {product?.stock || 0}
                          </p>
                        </div>
                      </div>

                      {/* OPTIONS */}

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                          <p className="text-[9px] text-gray-400">
                            Replacement
                          </p>

                          <p className="text-xs font-semibold text-gray-700">
                            {product?.replaceDay || 0} Days
                          </p>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                          <p className="text-[9px] text-gray-400">Warranty</p>

                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {product?.warranty || "None"}
                          </p>
                        </div>
                      </div>

                      {/* DELIVERY */}

                      <div className="flex flex-wrap gap-4 mt-3">
                        {product?.freeDelivery && (
                          <div className="running-border flex items-center border border-blue-500 rounded">
                            <img
                              src="/Delivery.gif"
                              alt="Free Delivery"
                              className="h-8 object-contain"
                            />
                            <span className="text-xs font-semibold text-blue-500 whitespace-nowrap">
                              Free Delivery
                            </span>
                          </div>
                        )}

                        {product?.payOnDelivery && (
                          <div className="running-border">
                            <img
                              src="/Money.gif"
                              alt="Cash on Delivery"
                              className="h-5 w-5 object-contain"
                            />

                            <span className="text-xs font-semibold text-green-400 whitespace-nowrap">
                              COD
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}

                      <div className="flex gap-2 mt-5 pt-4 border-t border-gray-100">
                        <motion.button
                          whileHover={{
                            scale: 1.03,
                          }}
                          whileTap={{
                            scale: 0.97,
                          }}
                          onClick={() => {
                            setSelectedProduct(product);
                            setActiveImage(0);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold cursor-pointer hover:bg-gray-800"
                        >
                          View Request
                        </motion.button>

                        {product?.verificationStatus === "pending" && (
                          <motion.button
                            whileHover={{
                              scale: 1.03,
                            }}
                            whileTap={{
                              scale: 0.97,
                            }}
                            onClick={() => handleApprove(product)}
                            className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-xs font-semibold cursor-pointer hover:bg-green-700"
                          >
                            ✓
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.85,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.85,
                y: 30,
              }}
              transition={{
                type: "spring",
                stiffness: 250,
                damping: 22,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-h-[92vh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden bg-white rounded-xl shadow-2xl"
            >
              {/* MODAL HEADER */}
              <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Product Request
                  </h2>

                  <p className="text-xs text-gray-400">
                    Review before approval
                  </p>
                </div>

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* MODAL BODY */}

              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* IMAGES */}

                <div>
                  <div className="h-70 bg-gray-100 rounded-2xl overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedProduct?.productImg?.[activeImage]}
                        src={
                          selectedProduct?.productImg?.[activeImage] ||
                          "/placeholder.png"
                        }
                        alt={selectedProduct?.title}
                        initial={{
                          opacity: 0,
                          scale: 1.05,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="w-full h-full object-contain"
                      />
                    </AnimatePresence>
                  </div>

                  {/* THUMBNAILS */}

                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {selectedProduct?.productImg?.map((img, index) => (
                      <motion.button
                        key={index}
                        whileHover={{
                          scale: 1.05,
                        }}
                        onClick={() => setActiveImage(index)}
                        className={`cursor-pointer w-16 h-16 shrink-0 rounded-lg overflow-hidden border ${
                          activeImage === index
                            ? "border-blue-600"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* INFO */}

                <div>
                  <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">
                    {selectedProduct?.category || "Other"}
                  </span>

                  <h2 className="text-2xl font-bold text-gray-800 mt-3">
                    {selectedProduct?.title}
                  </h2>

                  <p className="text-sm text-gray-500 mt-2 leading-6">
                    {selectedProduct?.description}
                  </p>

                  <div className="mt-5">
                    <p className="text-[10px] text-gray-400">Price</p>

                    <p className="text-3xl font-bold text-blue-600">
                      ₹
                      {Number(selectedProduct?.price || 0).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </p>
                  </div>

                  {/* DETAILS */}

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[9px] text-gray-400">Stock</p>

                      <p className="text-sm font-bold text-gray-700">
                        {selectedProduct?.stock || 0} Units
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[9px] text-gray-400">Size</p>

                      <p className="text-sm font-bold text-gray-700">
                        {selectedProduct?.size || "N/A"}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[9px] text-gray-400">Replacement</p>

                      <p className="text-sm font-bold text-gray-700">
                        {selectedProduct?.replaceDay || 0} Days
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl">
                      <p className="text-[9px] text-gray-400">Warranty</p>

                      <p className="text-sm font-bold text-gray-700">
                        {selectedProduct?.warranty || "None"}
                      </p>
                    </div>
                  </div>

                  {/* DELIVERY */}

                  <div className="flex flex-wrap gap-3 mt-4">
                    {selectedProduct?.freeDelivery && (
                      <div className="flex items-center px-2 py-2 rounded-xl bg-green-50 text-green-600 border border-green-200">
                        <img
                          src="/Delivery.gif"
                          alt="Delivery"
                          className="h-10 object-contain"
                        />
                        <div>
                          <p className="text-xs font-bold">Free Delivery</p>
                          <p className="text-xs text-green-500">
                            Available on this product
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedProduct?.payOnDelivery && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                        <img
                          src="/Money.gif"
                          alt="Pay on Delivery"
                          className="h-5 object-contain"
                        />
                        <div>
                          <p className="text-xs font-bold">Pay on Delivery</p>
                          <p className="text-[10px] text-blue-500">
                            Cash on delivery available
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* HIGHLIGHTS */}

              {selectedProduct?.detailsPoint?.length > 0 && (
                <div className="px-5 pb-5">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">
                    Product Highlights
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProduct.detailsPoint.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                          ✓
                        </span>

                        <span className="text-xs text-gray-600">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* ACTION FOOTER */}
              {/* ================================================= */}

              {selectedProduct?.verificationStatus === "pending" && (
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex flex-col sm:flex-row justify-end gap-3">
                  <motion.button
                    whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm font-semibold cursor-pointer hover:bg-red-100 disabled:opacity-50"
                  >
                    ✕ Reject Request
                  </motion.button>

                  <motion.button
                    whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    onClick={() => handleApprove(selectedProduct)}
                    disabled={actionLoading}
                    className="px-6 py-3 rounded-xl bg-green-600 text-white text-sm font-semibold cursor-pointer hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "✓ Approve Product"}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
              }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Reject Product
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Please provide a reason
                  </p>
                </div>

                <button
                  onClick={() => setShowRejectModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={5}
                className="w-full mt-5 border border-gray-200 rounded-xl p-3 text-sm outline-none resize-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>

                <motion.button
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Reject Product"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductRequests;
