"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  MapPin,
  Phone,
  CalendarDays,
  IndianRupee,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  CreditCard,
  Hash,
  Navigation,
  ShoppingBag,
  ImageOff,
  CircleCheck,
  CircleDot,
} from "lucide-react";
import { IoArrowBack } from "react-icons/io5";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { disconnectSocket, socketConnection } from "@/lib/socketConnection";

const page = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const router = useRouter();

  const getOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/user/userOrder");

      if (res.data?.success) {
        const orderData = Array.isArray(res.data?.data) ? res.data.data : [];
        setOrders(orderData);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("GET USER ORDERS ERROR:", error);
      setOrders([]);
      toast.error(error?.response?.data?.message || "Unable to load your orders");
    } finally {
      setLoading(false);
    }
  };
  // REAL TIME STATUS UPDATE
  useEffect(() => {
    let socket;

    const initSocket = async () => {
      try {

        await getOrders();

        socket = socketConnection();

        // Order status update event
        socket.on("orderStatusUpdated", (updatedOrder) => {
          setOrders((prevOrders) =>
            prevOrders.map((order) => {
              const currentOrderId = order?._id?.toString();
              const updatedOrderId = updatedOrder?.orderId?.toString();
              if (currentOrderId === updatedOrderId) {
                return {
                  ...order,
                  orderStatus: updatedOrder.status,
                };
              }

              return order;
            }),
          );
        });
      } catch (error) {
        console.error("SOCKET INITIALIZATION ERROR:", error);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.off("orderStatusUpdated");
        disconnectSocket();
      }
    };
  }, []);


  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Order Placed",
          icon: Clock3,
          className: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };

      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          className: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };

      case "shipped":
        return {
          label: "Shipped",
          icon: Truck,
          className: "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500",
        };

      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          className: "bg-green-50 text-green-700 border-green-200",
          dot: "bg-green-500",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          className: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };

      default:
        return {
          label: status || "Unknown",
          icon: Package,
          className: "bg-gray-50 text-gray-700 border-gray-200",
          dot: "bg-gray-500",
        };
    }
  };

  const getProductImage = (item) => {
    const product = item?.productId;

    if (!product || typeof product !== "object") {
      return null;
    }

    const imageData =
      product?.productImg ||
      product?.images ||
      product?.image ||
      product?.thumbnail ||
      null;

    if (Array.isArray(imageData)) {
      const first = imageData[0];

      if (typeof first === "string") {
        return first;
      }

      if (first && typeof first === "object") {
        return (
          first?.url ||
          first?.secure_url ||
          first?.src ||
          first?.image ||
          first?.path ||
          null
        );
      }
    }

    if (typeof imageData === "string") {
      return imageData;
    }

    if (imageData && typeof imageData === "object") {
      return (
        imageData?.url ||
        imageData?.secure_url ||
        imageData?.src ||
        imageData?.path ||
        null
      );
    }

    return null;
  };

  const getProductName = (item) => {
    const product = item?.productId;

    if (!product || typeof product !== "object") {
      return "Product";
    }

    return product?.title || product?.name || product?.productName || "Product";
  };

  const getProductCategory = (item) => {
    const product = item?.productId;

    if (!product || typeof product !== "object") {
      return "";
    }

    return product?.category || product?.productCategory || "";
  };

  const getProductSize = (item) => {
    return item?.size || item?.selectedSize || item?.productSize || "";
  };

  // =========================================================
  // DATE
  // =========================================================
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // TIME
  // =========================================================
  const formatTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // TOTAL ITEMS
  // =========================================================
  const getTotalItems = (order) => {
    if (!Array.isArray(order?.products)) {
      return 0;
    }

    return order.products.reduce(
      (total, item) => total + Number(item?.quantity || 0),
      0,
    );
  };

  // =========================================================
  // TOGGLE
  // =========================================================
  const toggleOrder = (id) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-60 animate-pulse rounded bg-gray-200" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
              >
                <div className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-gray-200" />

                  <div className="flex-1">
                    <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-28 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>

                <div className="mt-5 h-28 animate-pulse rounded-xl bg-gray-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center cursor-pointer text-gray-700 transition-colors duration-200 hover:text-blue-500"
        >
          <IoArrowBack size={20} />
          <span className="ml-1 text-sm font-medium transition-colors duration-200">
            Back
          </span>
        </button>

        {/* =====================================================
            EMPTY
        ====================================================== */}
        {orders.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="flex min-h-105 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-center shadow-sm m-2 sm:m-8"
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"
            >
              <ShoppingBag size={36} className="text-gray-400" />
            </motion.div>

            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              No Orders Yet
            </h2>

            <p className="mt-2 max-w-md text-xs leading-6 text-gray-500 sm:text-sm">
              You haven't placed any orders yet. Your orders will appear here
              after you complete your purchase.
            </p>
          </motion.div>
        ) : (
          /* =====================================================
             ORDERS
          ====================================================== */
          <div className="space-y-4 sm:space-y-5 mt-5">
            {orders.map((order, index) => {
              const status = getStatusConfig(order?.orderStatus);

              const StatusIcon = status.icon;

              const isExpanded = expandedOrder === order?._id;

              const totalItems = getTotalItems(order);

              return (
                <motion.div
                  key={order?._id || index}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.06,
                  }}
                  whileHover={{
                    y: -2,
                  }}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  {/* =================================================
                      ORDER HEADER
                  ================================================== */}
                  <div className="border-b border-gray-100 p-3.5 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* LEFT */}

                      <div className="flex min-w-0 items-center gap-3">
                        <motion.div
                          whileHover={{
                            rotate: 5,
                            scale: 1.05,
                          }}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 sm:h-12 sm:w-12"
                        >
                          <Package size={21} className="text-gray-600" />
                        </motion.div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                              Order #{String(order?._id || "").slice(-8)}
                            </h2>

                            <span className="hidden text-gray-300 sm:inline">
                              |
                            </span>

                            <span className="text-xs text-gray-500">
                              {totalItems} {totalItems === 1 ? "item" : "items"}
                            </span>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500 sm:text-xs">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={12} />
                              {formatDate(order?.createdAt)}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={12} />
                              {formatTime(order?.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}

                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                        {/* STATUS */}

                        <motion.div
                          initial={{
                            opacity: 0,
                            scale: 0.9,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold sm:px-3 sm:text-xs ${status.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                          />

                          <StatusIcon size={13} />

                          {status.label}
                        </motion.div>

                        {/* TOTAL */}

                        <div className="flex items-center gap-1 text-sm font-bold text-gray-900 sm:text-base">
                          <IndianRupee size={15} />

                          {Number(order?.totalAmount || 0).toLocaleString(
                            "en-IN",
                          )}
                        </div>

                        {/* VIEW */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => toggleOrder(order?._id)}
                          className="cursor-pointer ml-auto inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 sm:ml-0 sm:text-xs"
                        >
                          {isExpanded ? "Hide" : "Details"}

                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      PRODUCTS
                  ================================================== */}
                  <div className="p-3.5 sm:p-5">
                    {Array.isArray(order?.products) &&
                    order.products.length > 0 ? (
                      <div className="space-y-3.5 sm:space-y-4">
                        {order.products.map((item, itemIndex) => {
                          const image = getProductImage(item);

                          const productName = getProductName(item);

                          const category = getProductCategory(item);

                          const size = getProductSize(item);

                          const quantity = Number(item?.quantity || 0);

                          const price = Number(item?.price || 0);

                          return (
                            <motion.div
                              key={item?._id || item?.cartId || itemIndex}
                              initial={{
                                opacity: 0,
                                x: -15,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              transition={{
                                duration: 0.3,
                                delay: itemIndex * 0.05,
                              }}
                              className="flex gap-3 sm:gap-4"
                            >
                              {/* IMAGE */}

                              <motion.div
                                whileHover={{
                                  scale: 1.04,
                                }}
                                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:h-28 sm:w-28"
                              >
                                {image ? (
                                  <img
                                    src={image}
                                    alt={productName}
                                    className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImageOff
                                      size={26}
                                      className="text-gray-300"
                                    />
                                  </div>
                                )}
                              </motion.div>

                              {/* DETAILS */}

                              <div className="min-w-0 flex-1">
                                <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900 sm:text-base">
                                  {productName}
                                </h3>

                                {category && (
                                  <p className="mt-1 text-[11px] text-gray-500 sm:text-xs">
                                    {category}
                                  </p>
                                )}

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-gray-500 sm:gap-x-4 sm:text-xs">
                                  <span>
                                    Qty:{" "}
                                    <strong className="text-gray-700">
                                      {quantity}
                                    </strong>
                                  </span>

                                  {size && (
                                    <span>
                                      Size:{" "}
                                      <strong className="text-gray-700">
                                        {size}
                                      </strong>
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 flex items-center gap-1 text-sm font-bold text-gray-900 sm:text-base">
                                  <IndianRupee size={13} />

                                  {price.toLocaleString("en-IN")}
                                </div>
                              </div>

                              {/* TOTAL */}

                              <div className="hidden shrink-0 text-right sm:block">
                                <p className="text-xs text-gray-400">
                                  Item Total
                                </p>

                                <p className="mt-1 flex items-center justify-end gap-1 text-sm font-bold text-gray-900">
                                  <IndianRupee size={13} />

                                  {(price * quantity).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                        No product information available.
                      </div>
                    )}

                    {/* MOBILE TOTAL */}

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 sm:hidden">
                      <span className="text-xs text-gray-500">Order Total</span>

                      <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                        <IndianRupee size={14} />

                        {Number(order?.totalAmount || 0).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      TRACKING
                  ================================================== */}
                  <div className="border-t border-gray-100 bg-gray-50/70 px-3.5 py-4 sm:px-5">
                    <div className="flex items-center justify-between gap-1 sm:gap-2">

                      {/* ORDERED */}
                      <div
                        className={`flex min-w-0 flex-col items-center gap-1 text-center text-[10px] font-semibold sm:flex-row sm:text-xs ${
                          [
                            "pending",
                            "confirmed",
                            "shipped",
                            "delivered",
                          ].includes(order?.orderStatus)
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        <CircleCheck
                          size={16}
                          className={
                            [
                              "pending",
                              "confirmed",
                              "shipped",
                              "delivered",
                            ].includes(order?.orderStatus)
                              ? "text-green-600"
                              : "text-gray-300"
                          }
                        />

                        <span>Ordered</span>
                      </div>

                      <motion.div className="h-px flex-1 bg-gray-200" />

                      {/* CONFIRMED */}
                      <div
                        className={`flex min-w-0 flex-col items-center gap-1 text-center text-[10px] font-semibold sm:flex-row sm:text-xs ${
                          ["confirmed", "shipped", "delivered"].includes(
                            order?.orderStatus,
                          )
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        <CircleDot
                          size={16}
                          className={
                            ["confirmed", "shipped", "delivered"].includes(
                              order?.orderStatus,
                            )
                              ? "text-blue-600"
                              : "text-gray-300"
                          }
                        />

                        <span>Confirmed</span>
                      </div>

                      <div className="h-px flex-1 bg-gray-200" />

                      {/* SHIPPED */}
                      <div
                        className={`flex min-w-0 flex-col items-center gap-1 text-center text-[10px] font-semibold sm:flex-row sm:text-xs ${
                          ["shipped", "delivered"].includes(order?.orderStatus)
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        <Truck
                          size={16}
                          className={
                            ["shipped", "delivered"].includes(
                              order?.orderStatus,
                            )
                              ? "text-purple-600"
                              : "text-gray-300"
                          }
                        />

                        <span>Shipped</span>
                      </div>

                      <div className="h-px flex-1 bg-gray-200" />

                      {/* DELIVERED */}
                      <div
                        className={`flex min-w-0 flex-col items-center gap-1 text-center text-[10px] font-semibold sm:flex-row sm:text-xs ${
                          order?.orderStatus === "delivered"
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        <CheckCircle2
                          size={16}
                          className={
                            order?.orderStatus === "delivered"
                              ? "text-green-600"
                              : "text-gray-300"
                          }
                        />

                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* MESSAGE */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={order?.orderStatus}
                        initial={{
                          opacity: 0,
                          y: 5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -5,
                        }}
                        className="mt-3 text-center"
                      >
                        {order?.orderStatus === "pending" && (
                          <p className="text-[11px] text-gray-500 sm:text-xs">
                            Your order has been placed and is waiting for
                            confirmation.
                          </p>
                        )}

                        {order?.orderStatus === "confirmed" && (
                          <p className="text-[11px] text-blue-600 sm:text-xs">
                            Your order has been confirmed.
                          </p>
                        )}

                        {order?.orderStatus === "shipped" && (
                          <p className="text-[11px] text-purple-600 sm:text-xs">
                            Your order has been shipped and is on the way.
                          </p>
                        )}

                        {order?.orderStatus === "delivered" && (
                          <p className="text-[11px] font-semibold text-green-600 sm:text-xs">
                            Your order has been delivered successfully.
                          </p>
                        )}

                        {order?.orderStatus === "cancelled" && (
                          <p className="text-[11px] font-semibold text-red-600 sm:text-xs">
                            This order has been cancelled.
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* =================================================
                      EXPANDED DETAILS
                  ================================================== */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.35,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-100 p-3.5 sm:p-5">
                          {/* ADDRESS + INFO */}

                          <div className="grid gap-4 lg:grid-cols-2">
                            {/* ADDRESS */}

                            <motion.div
                              initial={{
                                opacity: 0,
                                y: 10,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              className="rounded-xl border border-gray-200 bg-white p-4"
                            >
                              <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                                  <MapPin size={17} className="text-gray-700" />
                                </div>

                                <div>
                                  <h3 className="text-sm font-bold text-gray-900">
                                    Delivery Address
                                  </h3>

                                  <p className="text-[11px] text-gray-500">
                                    Shipping information
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-sm text-gray-600">
                                <p className="font-bold text-gray-900">
                                  {order?.address?.fullName || "N/A"}
                                </p>

                                <p>{order?.address?.address || "N/A"}</p>

                                <p>
                                  {order?.address?.city || "N/A"},{" "}
                                  {order?.address?.state || "N/A"} -{" "}
                                  {order?.address?.pinCode || "N/A"}
                                </p>

                                {order?.address?.phone && (
                                  <p className="flex items-center gap-2 pt-2 font-medium text-gray-700">
                                    <Phone size={14} />

                                    {order.address.phone}
                                  </p>
                                )}
                              </div>
                            </motion.div>

                            {/* ORDER INFO */}

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
                                delay: 0.05,
                              }}
                              className="rounded-xl border border-gray-200 bg-white p-4"
                            >
                              <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                                  <Hash size={17} className="text-gray-700" />
                                </div>

                                <div>
                                  <h3 className="text-sm font-bold text-gray-900">
                                    Order Information
                                  </h3>

                                  <p className="text-[11px] text-gray-500">
                                    Order & payment details
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-gray-500">
                                    Order ID
                                  </span>

                                  <span className="max-w-[190px] truncate font-semibold text-gray-900 sm:max-w-[250px]">
                                    {order?._id || "N/A"}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-gray-500">Payment</span>

                                  <span className="flex items-center gap-1.5 font-semibold uppercase text-gray-900">
                                    <CreditCard size={14} />

                                    {order?.paymentMethod || "COD"}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-gray-500">
                                    Payment Status
                                  </span>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                                      order?.paymentStatus === "paid"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-amber-50 text-amber-700"
                                    }`}
                                  >
                                    {order?.paymentStatus || "pending"}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-gray-500">
                                    Order Date
                                  </span>

                                  <span className="font-semibold text-gray-900">
                                    {formatDate(order?.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          </div>

                          {/* LOCATION */}

                          {order?.location && (
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
                              className="mt-4 rounded-xl border border-gray-200 bg-white p-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                    <Navigation
                                      size={18}
                                      className="text-gray-700"
                                    />
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-bold text-gray-900">
                                      Delivery Location
                                    </h3>

                                    <p className="text-[11px] text-gray-500">
                                      Location saved with this order
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-lg bg-gray-50 px-3 py-2 text-[11px] text-gray-500">
                                  <span>
                                    Lat:{" "}
                                    <strong className="text-gray-700">
                                      {order.location.latitude}
                                    </strong>
                                  </span>

                                  <span className="mx-2 text-gray-300">|</span>

                                  <span>
                                    Lng:{" "}
                                    <strong className="text-gray-700">
                                      {order.location.longitude}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* BILL */}

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
                              delay: 0.15,
                            }}
                            className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
                          >
                            <div className="mb-4 flex items-center gap-2">
                              <IndianRupee
                                size={18}
                                className="text-gray-700"
                              />

                              <h3 className="text-sm font-bold text-gray-900">
                                Bill Details
                              </h3>
                            </div>

                            <div className="ml-auto max-w-md space-y-3">
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>

                                <span className="font-medium text-gray-900">
                                  ₹
                                  {Number(order?.subtotal || 0).toLocaleString(
                                    "en-IN",
                                  )}
                                </span>
                              </div>

                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Delivery Charge</span>

                                <span className="font-medium text-gray-900">
                                  ₹
                                  {Number(
                                    order?.deliveryCharge || 0,
                                  ).toLocaleString("en-IN")}
                                </span>
                              </div>

                              <div className="border-t border-gray-200 pt-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-900">
                                    Total
                                  </span>

                                  <span className="flex items-center gap-1 text-lg font-bold text-gray-900">
                                    <IndianRupee size={17} />

                                    {Number(
                                      order?.totalAmount || 0,
                                    ).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
