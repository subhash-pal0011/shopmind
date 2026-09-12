"use client";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Package,
  Search,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  Phone,
  User,
  IndianRupee,
  ChevronDown,
  Mail,
  CreditCard,
  CalendarDays,
  Hash,
  ImageOff,
} from "lucide-react";

import {
  disconnectSocket,
  socketConnection,
} from "@/lib/socketConnection";

import { toast } from "sonner";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [openStatusOrderId, setOpenStatusOrderId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // =========================================================
  // GET ORDERS
  // =========================================================

  const getOrders = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const res = await axios.get("/api/vendor/getOrders");

      console.log("VENDOR ORDERS RESPONSE:", res.data);

      if (res.data?.success) {
        const orderData = Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        /*
          Delivered orders ko frontend list se remove kar rahe hain.
        */
        const activeOrders = orderData.filter(
          (order) => order?.orderStatus !== "delivered"
        );

        setOrders(activeOrders);
      } else {
        setOrders([]);

        toast.error(
          res.data?.message || "Unable to load orders"
        );
      }
    } catch (error) {
      console.error("GET VENDOR ORDERS ERROR:", error);

      setOrders([]);

      toast.error(
        error?.response?.data?.message ||
          "Unable to load orders"
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // =========================================================
  // REAL TIME ORDERS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      if (!mounted) return;

      await getOrders(true);
    };

    loadOrders();

    const socket = socketConnection();

    const handleNewOrder = async (order) => {
      if (!order?._id) return;

      console.log("SOCKET ORDER:", order);

      await getOrders(false);
    };

    socket.on("product-order", handleNewOrder);

    return () => {
      mounted = false;

      socket.off("product-order", handleNewOrder);

      disconnectSocket();
    };
  }, []);

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return "₹0";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  };

  // =========================================================
  // GET VALID NUMBER
  // =========================================================

  const getNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  // =========================================================
  // GET PRODUCT PRICE
  // =========================================================

  const getProductPrice = (item) => {
    /*
      IMPORTANT:

      1. Order item ka saved price
      2. Populated product ka current price
      3. Different possible field names
    */

    const possiblePrices = [
      item?.price,
      item?.productId?.price,
      item?.productId?.productPrice,
      item?.product?.price,
      item?.product?.productPrice,
    ];

    for (const value of possiblePrices) {
      const price = Number(value);

      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        Number.isFinite(price) &&
        price >= 0
      ) {
        return price;
      }
    }

    return 0;
  };

  // =========================================================
  // GET ITEM TOTAL
  // =========================================================

  const getItemTotal = (item) => {
    const price = getProductPrice(item);

    const quantity = Math.max(
      1,
      getNumber(item?.quantity || 1)
    );

    return price * quantity;
  };

  // =========================================================
  // GET ORDER TOTAL
  // =========================================================

  const getOrderTotal = (order) => {
    /*
      Prefer database totalAmount.

      Agar totalAmount missing hai,
      products se calculate karenge.
    */

    const dbTotal = Number(order?.totalAmount);

    if (
      order?.totalAmount !== undefined &&
      order?.totalAmount !== null &&
      order?.totalAmount !== "" &&
      Number.isFinite(dbTotal)
    ) {
      return dbTotal;
    }

    if (Array.isArray(order?.products)) {
      const itemsTotal = order.products.reduce(
        (total, item) => total + getItemTotal(item),
        0
      );

      const deliveryCharge = getNumber(
        order?.deliveryCharge
      );

      return itemsTotal + deliveryCharge;
    }

    return 0;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "N/A";
    }

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (date) => {
    if (!date) return "";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // GET PRODUCT IMAGE
  // =========================================================

  const getProductImage = (product) => {
    if (!product) return null;

    const images = product?.productImg;

    if (Array.isArray(images)) {
      const firstValidImage = images.find(
        (img) =>
          typeof img === "string" && img.trim()
      );

      return firstValidImage || null;
    }

    if (typeof images === "string") {
      return images.trim() || null;
    }

    return null;
  };

  // =========================================================
  // GET ALL PRODUCT IMAGES
  // =========================================================

  const getProductImages = (product) => {
    if (!product) return [];

    if (Array.isArray(product?.productImg)) {
      return product.productImg.filter(
        (img) =>
          typeof img === "string" && img.trim()
      );
    }

    if (typeof product?.productImg === "string") {
      return product.productImg
        ? [product.productImg]
        : [];
    }

    return [];
  };

  // =========================================================
  // STATUS CONFIG
  // =========================================================

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          icon: Clock3,
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };

      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
        };

      case "shipped":
        return {
          label: "Shipped",
          icon: Truck,
          className:
            "bg-purple-50 text-purple-700 border-purple-200",
          dot: "bg-purple-500",
        };

      case "delivered":
        return {
          label: "Delivered",
          icon: CheckCircle2,
          className:
            "bg-green-50 text-green-700 border-green-200",
          dot: "bg-green-500",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          className:
            "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };

      default:
        return {
          label: status || "Unknown",
          icon: Package,
          className:
            "bg-gray-50 text-gray-700 border-gray-200",
          dot: "bg-gray-500",
        };
    }
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const updateOrderStatus = async (
    orderId,
    newStatus
  ) => {
    console.log(
      "Updating order status:",
      orderId,
      newStatus
    );

    try {
      setUpdatingStatus(orderId);

      const res = await axios.put(
        "/api/vendor/orderStatusUpdate",
        {
          orderId,
          status: newStatus,
        }
      );

      if (res.data?.success) {
        toast.success(
          "Order status updated successfully"
        );

        setOpenStatusOrderId(null);

        await getOrders(false);
      } else {
        toast.error(
          res.data?.message ||
            "Failed to update status"
        );
      }
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update order status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const orderId = String(
        order?._id || ""
      ).toLowerCase();

      const customerName = String(
        order?.userId?.name ||
          order?.address?.fullName ||
          ""
      ).toLowerCase();

      const customerPhone = String(
        order?.userId?.phone ||
          order?.address?.phone ||
          ""
      ).toLowerCase();

      const customerEmail = String(
        order?.userId?.email ||
          order?.address?.email ||
          ""
      ).toLowerCase();

      const productNames =
        Array.isArray(order?.products)
          ? order.products
              .map(
                (item) =>
                  item?.productId?.title ||
                  item?.productId?.name ||
                  ""
              )
              .join(" ")
              .toLowerCase()
          : "";

      const matchesSearch =
        !searchValue ||
        orderId.includes(searchValue) ||
        customerName.includes(searchValue) ||
        customerPhone.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        productNames.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        order?.orderStatus === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const stats = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order?.orderStatus === "pending"
      ).length,

      confirmed: orders.filter(
        (order) =>
          order?.orderStatus === "confirmed"
      ).length,

      shipped: orders.filter(
        (order) =>
          order?.orderStatus === "shipped"
      ).length,
    };
  }, [orders]);

  // =========================================================
  // TOTAL QUANTITY
  // =========================================================

  const getItemsCount = (order) => {
    if (!Array.isArray(order?.products)) {
      return 0;
    }

    return order.products.reduce(
      (total, item) => {
        return (
          total +
          Math.max(
            1,
            getNumber(item?.quantity || 1)
          )
        );
      },
      0
    );
  };

  // =========================================================
  // TOTAL PRODUCTS
  // =========================================================

  const getProductsCount = (order) => {
    if (!Array.isArray(order?.products)) {
      return 0;
    }

    return order.products.length;
  };

  // =========================================================
  // TOGGLE ORDER
  // =========================================================

  const toggleOrder = (id) => {
    setExpandedOrder((prev) =>
      prev === id ? null : id
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] px-3 py-5 sm:px-5 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-white"
                />
              )
            )}
          </div>

          <div className="mt-6 space-y-4">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-white"
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen px-0 sm:px-5 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              title: "Total Orders",
              value: stats.total,
              icon: Package,
              delay: 0,
            },
            {
              title: "Pending",
              value: stats.pending,
              icon: Clock3,
              delay: 0.05,
            },
            {
              title: "Confirmed",
              value: stats.confirmed,
              icon: CheckCircle2,
              delay: 0.1,
            },
            {
              title: "Shipped",
              value: stats.shipped,
              icon: Truck,
              delay: 0.15,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: item.delay,
                  duration: 0.4,
                }}
                whileHover={{
                  y: -3,
                }}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      {item.title}
                    </p>

                    <motion.p
                      key={item.value}
                      initial={{
                        scale: 0.8,
                        opacity: 0,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      className="mt-1 text-2xl font-bold text-gray-950"
                    >
                      {item.value}
                    </motion.p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <Icon size={20} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="mb-6 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search order ID, customer, phone, email or product..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
              />
            </div>

            <div className="relative lg:w-56">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm font-semibold text-gray-700 outline-none focus:border-gray-400 focus:bg-white"
              >
                <option value="all">
                  All Orders
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="shipped">
                  Shipped
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </motion.div>

        {/* =================================================
            FILTER ACTION
        ================================================= */}

        <div className="mb-4 flex justify-end">
          {(search ||
            statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="cursor-pointer text-xs font-bold text-gray-700 underline underline-offset-4"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}

        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="rounded-3xl border border-gray-100 bg-white px-5 py-20 text-center shadow-sm"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-gray-400">
              <Package size={34} />
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-900">
              No orders found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              {search ||
              statusFilter !== "all"
                ? "No orders match your current search or filter."
                : "There are no orders available right now."}
            </p>

            {(search ||
              statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:scale-[1.02]"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          /* =================================================
             ORDER LIST
          ================================================= */

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map(
                (order, index) => {
                  const orderId =
                    order?._id ||
                    `order-${index}`;

                  const status =
                    getStatusConfig(
                      order?.orderStatus
                    );

                  const StatusIcon =
                    status.icon;

                  const customerName =
                    order?.userId?.name ||
                    order?.address?.fullName ||
                    "Customer";

                  const customerPhone =
                    order?.userId?.phone ||
                    order?.address?.phone ||
                    "";

                  const customerEmail =
                    order?.userId?.email ||
                    order?.address?.email ||
                    "";

                  const address =
                    order?.address || {};

                  const items =
                    Array.isArray(
                      order?.products
                    )
                      ? order.products
                      : [];

                  const totalQuantity =
                    getItemsCount(order);

                  const totalProducts =
                    getProductsCount(order);

                  /*
                    IMPORTANT:
                    Order ka final total yahan
                    safely calculate ho raha hai.
                  */
                  const totalAmount =
                    getOrderTotal(order);

                  const isExpanded =
                    expandedOrder ===
                    orderId;

                  const firstProduct =
                    items?.[0]?.productId;

                  const headerImage =
                    getProductImage(
                      firstProduct
                    );

                  return (
                    <motion.div
                      key={orderId}
                      layout
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.98,
                      }}
                      transition={{
                        duration: 0.3,
                        delay:
                          index * 0.035,
                      }}
                      className="relative rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md"
                    >

                      {/* =================================================
                          ORDER HEADER
                      ================================================= */}

                      <div className="relative overflow-visible">
                        <div
                          onClick={() =>
                            toggleOrder(
                              orderId
                            )
                          }
                          className="cursor-pointer p-4 sm:p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            {/* LEFT */}

                            <div className="flex min-w-0 items-start gap-3">

                              {/* PRODUCT IMAGE */}

                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 sm:h-20 sm:w-20">
                                {headerImage ? (
                                  <img
                                    src={
                                      headerImage
                                    }
                                    alt={
                                      firstProduct?.title ||
                                      "Product"
                                    }
                                    className="h-full w-full object-cover"
                                    onError={(
                                      e
                                    ) => {
                                      e.currentTarget.style.display =
                                        "none";

                                      const fallback =
                                        e.currentTarget.parentElement?.querySelector(
                                          ".image-fallback"
                                        );

                                      if (
                                        fallback
                                      ) {
                                        fallback.classList.remove(
                                          "hidden"
                                        );
                                      }
                                    }}
                                  />
                                ) : null}

                                <div
                                  className={`image-fallback absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 ${
                                    headerImage
                                      ? "hidden"
                                      : ""
                                  }`}
                                >
                                  <ImageOff
                                    size={22}
                                  />

                                  <span className="text-[8px]">
                                    No Image
                                  </span>
                                </div>

                                {totalProducts >
                                  1 && (
                                  <span className="absolute bottom-1 right-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    +
                                    {
                                      totalProducts
                                    }
                                  </span>
                                )}
                              </div>

                              {/* ORDER INFO */}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-sm font-bold text-gray-950 sm:text-base">
                                    Order #
                                    {String(
                                      orderId
                                    )
                                      .slice(
                                        -8
                                      )
                                      .toUpperCase()}
                                  </h3>

                                  {/* STATUS */}

                                  <div
                                    className="relative shrink-0"
                                    onClick={(
                                      e
                                    ) =>
                                      e.stopPropagation()
                                    }
                                  >
                                    <button
                                      type="button"
                                      disabled={
                                        updatingStatus ===
                                        orderId
                                      }
                                      onClick={(
                                        e
                                      ) => {
                                        e.stopPropagation();

                                        setOpenStatusOrderId(
                                          (
                                            prev
                                          ) =>
                                            prev ===
                                            orderId
                                              ? null
                                              : orderId
                                        );
                                      }}
                                      className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${status.className}`}
                                    >
                                      <span
                                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${status.dot}`}
                                      />

                                      <StatusIcon
                                        size={
                                          12
                                        }
                                        className="shrink-0"
                                      />

                                      <span className="whitespace-nowrap">
                                        {updatingStatus ===
                                        orderId
                                          ? "Updating..."
                                          : status.label}
                                      </span>

                                      <ChevronDown
                                        size={
                                          12
                                        }
                                        className={`shrink-0 transition-transform ${
                                          openStatusOrderId ===
                                          orderId
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                      />
                                    </button>

                                    {/* STATUS DROPDOWN */}

                                    {openStatusOrderId ===
                                      orderId && (
                                      <div
                                        onClick={(
                                          e
                                        ) =>
                                          e.stopPropagation()
                                        }
                                        className="absolute left-0 top-full z-40 mt-2 w-[210px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
                                      >
                                        {[
                                          "pending",
                                          "confirmed",
                                          "shipped",
                                          "delivered",
                                          "cancelled",
                                        ].map(
                                          (
                                            statusValue
                                          ) => {
                                            const statusOption =
                                              getStatusConfig(
                                                statusValue
                                              );

                                            const Icon =
                                              statusOption.icon;

                                            const isCurrent =
                                              order?.orderStatus ===
                                              statusValue;

                                            return (
                                              <button
                                                key={
                                                  statusValue
                                                }
                                                type="button"
                                                disabled={
                                                  updatingStatus ===
                                                  orderId
                                                }
                                                onClick={(
                                                  e
                                                ) => {
                                                  e.stopPropagation();

                                                  if (
                                                    isCurrent
                                                  ) {
                                                    setOpenStatusOrderId(
                                                      null
                                                    );
                                                    return;
                                                  }

                                                  updateOrderStatus(
                                                    orderId,
                                                    statusValue
                                                  );
                                                }}
                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                              >
                                                <span
                                                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusOption.dot}`}
                                                />

                                                <Icon
                                                  size={
                                                    15
                                                  }
                                                  className="shrink-0"
                                                />

                                                <span className="flex-1 whitespace-nowrap">
                                                  {
                                                    statusOption.label
                                                  }
                                                </span>

                                                {isCurrent && (
                                                  <span className="shrink-0 text-[9px] font-bold uppercase text-gray-400">
                                                    Current
                                                  </span>
                                                )}
                                              </button>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* PRODUCT TITLE */}

                                <p className="mt-1 line-clamp-1 text-xs font-medium text-gray-600">
                                  {firstProduct?.title ||
                                    firstProduct?.name ||
                                    "Product order"}
                                </p>

                                {/* ORDER INFO */}

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <CalendarDays
                                      size={
                                        13
                                      }
                                    />

                                    {formatDate(
                                      order?.createdAt
                                    )}
                                  </span>

                                  <span className="hidden sm:inline">
                                    •
                                  </span>

                                  <span>
                                    {formatTime(
                                      order?.createdAt
                                    )}
                                  </span>

                                  <span className="hidden sm:inline">
                                    •
                                  </span>

                                  <span>
                                    {
                                      totalQuantity
                                    }{" "}
                                    {totalQuantity ===
                                    1
                                      ? "item"
                                      : "items"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* RIGHT */}

                            <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                              <div>
                                <p className="text-[11px] font-medium text-gray-400">
                                  Order Total
                                </p>

                                <p className="mt-0.5 text-lg font-bold text-gray-950">
                                  {formatPrice(
                                    totalAmount
                                  )}
                                </p>
                              </div>

                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform ${
                                  isExpanded
                                    ? "rotate-180"
                                    : ""
                                }`}
                              >
                                <ChevronDown
                                  size={
                                    18
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* =================================================
                          DETAILS
                      ================================================= */}

                      <AnimatePresence
                        initial={false}
                      >
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
                              duration: 0.3,
                            }}
                            className="border-t border-gray-100"
                          >
                            <div className="p-4 sm:p-5">

                              {/* CUSTOMER + ADDRESS */}

                              <div className="grid gap-4 lg:grid-cols-3">

                                {/* CUSTOMER */}

                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                  <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                                      <User
                                        size={
                                          17
                                        }
                                        className="text-gray-600"
                                      />
                                    </div>

                                    <div>
                                      <p className="text-xs text-gray-400">
                                        Customer
                                      </p>

                                      <p className="text-sm font-bold text-gray-900">
                                        Customer Details
                                      </p>
                                    </div>
                                  </div>

                                  <p className="text-base font-bold text-gray-900">
                                    {
                                      customerName
                                    }
                                  </p>

                                  {customerPhone && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                                      <Phone
                                        size={
                                          14
                                        }
                                      />

                                      <span>
                                        {
                                          customerPhone
                                        }
                                      </span>
                                    </div>
                                  )}

                                  {customerEmail && (
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                                      <Mail
                                        size={
                                          14
                                        }
                                      />

                                      <span className="break-all">
                                        {
                                          customerEmail
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* ADDRESS */}

                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 lg:col-span-2">
                                  <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                                      <MapPin
                                        size={
                                          17
                                        }
                                        className="text-gray-600"
                                      />
                                    </div>

                                    <div>
                                      <p className="text-xs text-gray-400">
                                        Delivery
                                      </p>

                                      <p className="text-sm font-bold text-gray-900">
                                        Delivery Address
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-900">
                                      {address?.fullName ||
                                        customerName}
                                    </p>

                                    <p className="text-sm leading-6 text-gray-700">
                                      {address?.address ||
                                        "Address not available"}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                      {address?.city ||
                                        ""}

                                      {address?.city &&
                                      address?.state
                                        ? ", "
                                        : ""}

                                      {address?.state ||
                                        ""}

                                      {address?.pinCode
                                        ? ` - ${address.pinCode}`
                                        : ""}
                                    </p>
                                  </div>

                                  {address?.phone && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                      <Phone
                                        size={
                                          14
                                        }
                                      />

                                      <span>
                                        {
                                          address.phone
                                        }
                                      </span>
                                    </div>
                                  )}

                                  {/* LOCATION */}

                                  {order?.location?.latitude !==
                                    undefined &&
                                    order?.location?.longitude !==
                                      undefined && (
                                      <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <MapPin
                                          size={
                                            14
                                          }
                                          className="text-gray-500"
                                        />

                                        <span className="text-[11px] text-gray-500">
                                          Location:
                                        </span>

                                        <span className="text-[11px] font-semibold text-gray-700">
                                          {Number(
                                            order.location
                                              .latitude
                                          ).toFixed(
                                            5
                                          )}
                                          ,{" "}
                                          {Number(
                                            order.location
                                              .longitude
                                          ).toFixed(
                                            5
                                          )}
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* ORDER META */}

                              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                                {[
                                  {
                                    icon: Hash,
                                    title:
                                      "Order ID",
                                    value:
                                      String(
                                        orderId
                                      ).slice(
                                        -10
                                      ),
                                  },
                                  {
                                    icon: CreditCard,
                                    title:
                                      "Payment",
                                    value:
                                      order?.paymentMethod ||
                                      "N/A",
                                  },
                                  {
                                    icon: CheckCircle2,
                                    title:
                                      "Payment Status",
                                    value:
                                      order?.paymentStatus ||
                                      "N/A",
                                  },
                                  {
                                    icon: CalendarDays,
                                    title:
                                      "Ordered On",
                                    value:
                                      formatDate(
                                        order?.createdAt
                                      ),
                                  },
                                ].map(
                                  (info) => {
                                    const Icon =
                                      info.icon;

                                    return (
                                      <motion.div
                                        key={
                                          info.title
                                        }
                                        whileHover={{
                                          y: -2,
                                        }}
                                        className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                                            <Icon
                                              size={
                                                15
                                              }
                                            />
                                          </div>

                                          <div className="min-w-0">
                                            <p className="text-[10px] font-medium text-gray-400">
                                              {
                                                info.title
                                              }
                                            </p>

                                            <p className="mt-0.5 truncate text-xs font-bold capitalize text-gray-800">
                                              {String(
                                                info.value ||
                                                  "N/A"
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  }
                                )}
                              </div>

                              {/* PRODUCTS */}

                              <div className="mt-6">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-900">
                                      Order Items
                                    </h4>

                                    <p className="mt-0.5 text-xs text-gray-400">
                                      Products included in this order
                                    </p>
                                  </div>

                                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">
                                    {
                                      totalProducts
                                    }{" "}
                                    {totalProducts ===
                                    1
                                      ? "Product"
                                      : "Products"}
                                  </span>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-gray-100">
                                  {items.length >
                                  0 ? (
                                    items.map(
                                      (
                                        item,
                                        itemIndex
                                      ) => {
                                        const product =
                                          item?.productId &&
                                          typeof item.productId ===
                                            "object"
                                            ? item.productId
                                            : null;

                                        const productName =
                                          product?.title ||
                                          product?.name ||
                                          product?.productName ||
                                          "Product";

                                        const productImages =
                                          getProductImages(
                                            product
                                          );

                                        const image =
                                          productImages?.[0] ||
                                          null;

                                        const quantity =
                                          Math.max(
                                            1,
                                            getNumber(
                                              item?.quantity ||
                                                1
                                            )
                                          );

                                        /*
                                          IMPORTANT PRICE LOGIC
                                        */

                                        const price =
                                          getProductPrice(
                                            item
                                          );

                                        const itemTotal =
                                          price *
                                          quantity;

                                        return (
                                          <motion.div
                                            key={
                                              item?._id ||
                                              itemIndex
                                            }
                                            initial={{
                                              opacity: 0,
                                              x: -10,
                                            }}
                                            animate={{
                                              opacity: 1,
                                              x: 0,
                                            }}
                                            transition={{
                                              delay:
                                                itemIndex *
                                                0.05,
                                            }}
                                            className={`p-3 sm:p-4 ${
                                              itemIndex !==
                                              items.length -
                                                1
                                                ? "border-b border-gray-100"
                                                : ""
                                            }`}
                                          >
                                            <div className="flex gap-3 sm:gap-4">

                                              {/* IMAGE */}

                                              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 sm:h-28 sm:w-28">
                                                {image ? (
                                                  <img
                                                    src={
                                                      image
                                                    }
                                                    alt={
                                                      productName
                                                    }
                                                    className="h-full w-full object-cover"
                                                    onError={(
                                                      e
                                                    ) => {
                                                      e.currentTarget.style.display =
                                                        "none";

                                                      const fallback =
                                                        e.currentTarget.parentElement?.querySelector(
                                                          ".product-image-fallback"
                                                        );

                                                      if (
                                                        fallback
                                                      ) {
                                                        fallback.classList.remove(
                                                          "hidden"
                                                        );
                                                      }
                                                    }}
                                                  />
                                                ) : null}

                                                <div
                                                  className={`product-image-fallback absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400 ${
                                                    image
                                                      ? "hidden"
                                                      : ""
                                                  }`}
                                                >
                                                  <ImageOff
                                                    size={
                                                      25
                                                    }
                                                  />

                                                  <span className="text-[9px]">
                                                    No Image
                                                  </span>
                                                </div>
                                              </div>

                                              {/* PRODUCT INFO */}

                                              <div className="min-w-0 flex-1">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                  <div className="min-w-0">
                                                    <p className="line-clamp-2 text-sm font-bold text-gray-900 sm:text-base">
                                                      {
                                                        productName
                                                      }
                                                    </p>

                                                    {product?.category && (
                                                      <p className="mt-1 text-xs text-gray-400">
                                                        {
                                                          product.category
                                                        }
                                                      </p>
                                                    )}

                                                    <div className="mt-3 flex flex-wrap items-center gap-2">

                                                      {/* QUANTITY */}

                                                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600">
                                                        Qty:{" "}
                                                        {
                                                          quantity
                                                        }
                                                      </span>

                                                      {/* PRICE */}

                                                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600">
                                                        {formatPrice(
                                                          price
                                                        )}{" "}
                                                        each
                                                      </span>

                                                      {product?.size && (
                                                        <span className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600">
                                                          Size:{" "}
                                                          {
                                                            product.size
                                                          }
                                                        </span>
                                                      )}

                                                      {product?.freeDelivery && (
                                                        <span className="rounded-lg bg-green-50 px-2.5 py-1.5 text-[11px] font-semibold text-green-700">
                                                          Free Delivery
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>

                                                  {/* ITEM TOTAL */}

                                                  <div className="shrink-0 text-left sm:text-right">
                                                    <p className="text-base font-bold text-gray-900">
                                                      {formatPrice(
                                                        itemTotal
                                                      )}
                                                    </p>

                                                    <p className="mt-0.5 text-[10px] text-gray-400">
                                                      Item Total
                                                    </p>
                                                  </div>
                                                </div>

                                                {/* THUMBNAILS */}

                                                {productImages.length >
                                                  1 && (
                                                  <div className="mt-3 flex gap-2">
                                                    {productImages
                                                      .slice(
                                                        0,
                                                        4
                                                      )
                                                      .map(
                                                        (
                                                          img,
                                                          imgIndex
                                                        ) => (
                                                          <div
                                                            key={
                                                              imgIndex
                                                            }
                                                            className="h-10 w-10 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
                                                          >
                                                            <img
                                                              src={
                                                                img
                                                              }
                                                              alt=""
                                                              className="h-full w-full object-cover"
                                                            />
                                                          </div>
                                                        )
                                                      )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </motion.div>
                                        );
                                      }
                                    )
                                  ) : (
                                    <div className="p-10 text-center">
                                      <Package
                                        size={
                                          30
                                        }
                                        className="mx-auto text-gray-300"
                                      />

                                      <p className="mt-3 text-sm font-semibold text-gray-600">
                                        No product details available
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* STATUS + BILL */}

                              <div className="mt-6 grid gap-4 lg:grid-cols-2">

                                {/* STATUS */}

                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                  <div className="flex items-center justify-between gap-4">
                                    <div>
                                      <p className="text-xs font-medium text-gray-400">
                                        Current Order Status
                                      </p>

                                      <div className="mt-2 flex items-center gap-2">
                                        <div
                                          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${status.className}`}
                                        >
                                          <StatusIcon
                                            size={
                                              18
                                            }
                                          />
                                        </div>

                                        <span className="text-sm font-bold capitalize text-gray-900">
                                          {
                                            status.label
                                          }
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-xs text-gray-400">
                                        Total Items
                                      </p>

                                      <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {
                                          totalQuantity
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* BILL */}

                                <div className="rounded-2xl bg-gray-950 p-5 text-white">

                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                      Subtotal
                                    </span>

                                    <span className="text-sm font-semibold">
                                      {formatPrice(
                                        order?.subtotal ??
                                          0
                                      )}
                                    </span>
                                  </div>

                                  <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                      Delivery Charge
                                    </span>

                                    <span className="text-sm font-semibold">
                                      {formatPrice(
                                        order?.deliveryCharge ??
                                          0
                                      )}
                                    </span>
                                  </div>

                                  <div className="my-4 border-t border-gray-800" />

                                  <div className="flex items-end justify-between">
                                    <div>
                                      <p className="text-xs text-gray-400">
                                        Grand Total
                                      </p>

                                      <p className="mt-1 text-2xl font-bold">
                                        {formatPrice(
                                          totalAmount
                                        )}
                                      </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                                      <IndianRupee
                                        size={
                                          20
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                }
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;