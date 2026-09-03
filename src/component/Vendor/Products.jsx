"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

const Products = () => {
  const router = useRouter();

  const allVendorProducts = useSelector(
    (state) => state.vendorUser?.allVendorProduct || [],
  );

  const [activeImages, setActiveImages] = useState({});

  const changeProductImage = (productId, imageIndex) => {
    setActiveImages((prev) => ({
      ...prev,
      [productId]: imageIndex,
    }));
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Products
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-sm text-gray-500 mt-1">
            Manage all your products from here
          </motion.p>
        </div>

        <motion.button whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(37, 99, 235, 0.25)" }} whileTap={{ scale: 0.95 }} onClick={() => router.push("/venderPage/addProducts")} className="border border-blue-600 px-5 py-3 text-sm cursor-pointer bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-all duration-300 shadow-sm">
          + Add Product
        </motion.button>
      </motion.div>

      {/* PRODUCT COUNT */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.4 }} className="mb-5">
        <span className="text-sm text-gray-500">
          Total Products:{" "}
          <span className="font-bold text-gray-800">
            {allVendorProducts.length}
          </span>
        </span>
      </motion.div>

      {/* PRODUCTS */}
      <AnimatePresence mode="wait">
        {allVendorProducts.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }} className="min-h-100 flex flex-col items-center justify-center rounded-xl border border-gray-200 shadow-sm">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-6xl mb-4">
              📦
            </motion.div>

            <h2 className="text-xl font-bold text-gray-700">
              No Products Found
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              Start by adding your first product.
            </p>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push("/venderPage/addProducts")} className="mt-5 px-5 py-2.5 rounded-lg cursor-pointer bg-blue-600 text-white text-sm hover:bg-blue-700 transition">
              Add Your First Product
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="products" layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {allVendorProducts.map((product, index) => {
                const productImages = Array.isArray(product?.productImg) && product.productImg.length > 0 ? product.productImg : ["/placeholder.png"];

                const productId = product?._id || index;
                const currentImageIndex = activeImages[productId] ?? 0;

                const currentImage = productImages[currentImageIndex] || productImages[0] || "/placeholder.png";

                const isPending = product?.verificationStatus === "pending";
                const isApproved = product?.verificationStatus === "approved";
                const isRejected = product?.verificationStatus === "rejected";

                return (
                  <motion.div key={productId} layout initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9, y: -20 }} transition={{ duration: 0.45, delay: index * 0.08 }} whileHover={{ y: -8, transition: { duration: 0.25 } }} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                    {/* IMAGE */}
                    <div className="relative h-56 bg-gray-100 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.img key={currentImage} src={currentImage} alt={product?.title || "Product"} initial={{ opacity: 0, scale: 1.08, x: 15 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.98, x: -15 }} transition={{ duration: 0.35, ease: "easeOut" }} whileHover={{ scale: 1.08 }} onError={(e) => { e.currentTarget.src = "/placeholder.png"; }} className="absolute inset-0 w-full h-full object-cover" />
                      </AnimatePresence>

                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent pointer-events-none z-1" />

                      {/* IMAGE COUNT */}
                      {productImages.length > 1 && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + index * 0.05 }} className="absolute top-3 left-3 z-10">
                          <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold">
                            📷 {currentImageIndex + 1}/{productImages.length}
                          </span>
                        </motion.div>
                      )}

                      {/* STATUS */}
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.08 }} className="absolute top-3 right-3 z-10">
                        {isPending && (
                          <span className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-semibold shadow-sm">
                            ⏳ Pending
                          </span>
                        )}

                        {isApproved && (
                          <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold shadow-sm">
                            ✓ Approved
                          </span>
                        )}

                        {isRejected && (
                          <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-[11px] font-semibold shadow-sm">
                            ✕ Rejected
                          </span>
                        )}
                      </motion.div>

                      {/* CATEGORY */}
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.08 }} className="absolute bottom-3 left-3 z-10">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-semibold shadow-sm">
                          {product?.category || "Other"}
                        </span>
                      </motion.div>

                      {/* THUMBNAILS */}
                      {productImages.length > 1 && (
                        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5">
                          {productImages.slice(0, 4).map((img, imageIndex) => (
                            <motion.button key={`${productId}-${imageIndex}`} type="button" onClick={() => changeProductImage(productId, imageIndex)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className={`relative w-8 h-8 rounded-md overflow-hidden border-2 shadow-md cursor-pointer transition-all duration-200 ${currentImageIndex === imageIndex ? "border-white scale-110" : "border-white/50"}`}>
                              <img src={img} alt={`Product ${imageIndex + 1}`} className="w-full h-full object-cover" />

                              {currentImageIndex === imageIndex && (
                                <motion.div layoutId={`active-image-${productId}`} className="absolute inset-0 bg-blue-500/20" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-4">
                      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + index * 0.08 }} className="font-bold text-gray-800 text-lg truncate" title={product?.title}>
                        {product?.title || "Untitled Product"}
                      </motion.h2>

                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 min-h-8">
                        {product?.description || "No description available"}
                      </p>

                      {/* PRICE */}
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-[10px] text-gray-400">Price</p>

                          <motion.p whileHover={{ scale: 1.05 }} className="text-xl font-bold text-blue-600">
                            ₹{Number(product?.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </motion.p>
                        </div>

                        {/* STOCK */}
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400">Stock</p>

                          <p className={`text-sm font-bold ${product?.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                            {product?.stock || 0}{" "}
                            <span className="text-[10px] font-normal">
                              units
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                          <p className="text-[9px] text-gray-400">
                            Replacement
                          </p>

                          <p className="text-xs font-semibold text-gray-700">
                            {product?.replaceDay || 0} Days
                          </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                          <p className="text-[9px] text-gray-400">
                            Warranty
                          </p>

                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {product?.warranty || "No Warranty"}
                          </p>
                        </div>
                      </div>

                      {/* DELIVERY */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {product?.freeDelivery && (
                          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + index * 0.08 }} className="flex items-center running-border-3 gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-600 text-[10px] font-semibold">
                            🚚 Free Delivery
                          </motion.span>
                        )}

                        {product?.payOnDelivery && (
                          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + index * 0.08 }} className="flex items-center running-border-2 gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-semibold">
                            💵 Pay on Delivery
                          </motion.span>
                        )}

                        {!product?.freeDelivery && !product?.payOnDelivery && (
                          <span className="px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-400 text-[10px]">
                            Standard Delivery
                          </span>
                        )}
                      </div>

                      {/* HIGHLIGHTS */}
                      {product?.detailsPoint?.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.4 }} className="mt-4 pt-3 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">
                            Highlights
                          </p>

                          <div className="space-y-1">
                            {product.detailsPoint.slice(0, 2).map((point, pointIndex) => (
                              <motion.div key={pointIndex} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: pointIndex * 0.1 }} className="flex items-center gap-2 text-[11px] text-gray-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="truncate">{point}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* REJECTED REASON */}
                      {isRejected && product?.rejectedReason && (
                        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-100">
                          <p className="text-[9px] font-semibold uppercase text-red-400 mb-1">
                            Rejection Reason
                          </p>

                          <p className="text-xs text-red-700">
                            {product.rejectedReason}
                          </p>
                        </div>
                      )}

                      {/* FOOTER */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-[9px] text-gray-400">Status</p>

                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`w-2 h-2 rounded-full ${product?.isActive ? "bg-green-500" : "bg-gray-400"}`} />

                            <span className="text-[11px] font-medium text-gray-600">
                              {product?.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        {/* VIEW */}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => router.push(`/venderPage/${product?._id}`)} className="px-3 py-2 cursor-pointer rounded-lg bg-gray-900 text-white text-[11px] font-medium hover:bg-blue-600 transition-colors duration-300">
                          View Details →
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
