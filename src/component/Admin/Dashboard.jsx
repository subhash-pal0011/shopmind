"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  RefreshCw,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  Star,
  XCircle,
  CreditCard,
  Truck,
  AlertCircle,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

const Dashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [categories, setCategories] = useState([]);

  const [summary, setSummary] = useState({
    totalVendors: 0,
    approvedVendors: 0,
    pendingVendors: 0,
    rejectedVendors: 0,

    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,

    activeProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    rejectedProducts: 0,

    totalCustomers: 0,
    totalItemsSold: 0,
    totalReviews: 0,
    averageRating: 0,
  });

  const [orderStatus, setOrderStatus] = useState({
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  const [paymentStatus, setPaymentStatus] = useState({
    pending: 0,
    paid: 0,
    failed: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState({
    online: 0,
    cod: 0,
  });

  const [topVendors, setTopVendors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

 
  const formatCurrency = useCallback((value) => {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return "₹0";
    }

    return `₹${number.toLocaleString("en-IN")}`;
  }, []);

  // FORMAT NUMBER
  const formatNumber = useCallback((value) => {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toLocaleString("en-IN");
  }, []);

  // FORMAT DATE
  const formatDate = useCallback((date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  // FORMAT TIME
  const formatTime = useCallback((date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // STATUS CLASS
  const getOrderStatusClass = useCallback((status) => {
    switch (status) {
      case "delivered":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "shipped":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "confirmed":
        return "border-indigo-200 bg-indigo-50 text-indigo-700";

      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  }, []);

  // PAYMENT STATUS CLASS
  const getPaymentStatusClass = useCallback((status) => {
    switch (status) {
      case "paid":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "failed":
        return "border-red-200 bg-red-50 text-red-700";

      case "pending":
      default:
        return "border-amber-200 bg-amber-50 text-amber-700";
    }
  }, []);

  // STATUS LABEL
  const getStatusLabel = useCallback((status) => {
    if (!status) {
      return "Unknown";
    }

    return (
      String(status).charAt(0).toUpperCase() +
      String(status).slice(1)
    );
  }, []);

  // GET DASHBOARD
  const getDashboard = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await axios.get(
          "/api/admin/dashboard",
          {
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Failed to fetch dashboard data."
          );
        }

        const data = response.data;

        // =====================================================
        // VENDORS
        // =====================================================

        setVendors(
          Array.isArray(data.vendors)
            ? data.vendors
            : []
        );

        // =====================================================
        // RECENT ORDERS
        // =====================================================

        setRecentOrders(
          Array.isArray(data.recentOrders)
            ? data.recentOrders
            : []
        );

        // =====================================================
        // CATEGORIES
        // =====================================================

        setCategories(
          Array.isArray(data.categories)
            ? data.categories
            : []
        );

        // =====================================================
        // SUMMARY
        // =====================================================

        setSummary({
          totalVendors: Number(
            data.summary?.totalVendors || 0
          ),

          approvedVendors: Number(
            data.summary?.approvedVendors || 0
          ),

          pendingVendors: Number(
            data.summary?.pendingVendors || 0
          ),

          rejectedVendors: Number(
            data.summary?.rejectedVendors || 0
          ),

          totalRevenue: Number(
            data.summary?.totalRevenue || 0
          ),

          totalOrders: Number(
            data.summary?.totalOrders || 0
          ),

          totalProducts: Number(
            data.summary?.totalProducts || 0
          ),

          activeProducts: Number(
            data.summary?.activeProducts || 0
          ),

          pendingProducts: Number(
            data.summary?.pendingProducts || 0
          ),

          approvedProducts: Number(
            data.summary?.approvedProducts || 0
          ),

          rejectedProducts: Number(
            data.summary?.rejectedProducts || 0
          ),

          totalCustomers: Number(
            data.summary?.totalCustomers || 0
          ),

          totalItemsSold: Number(
            data.summary?.totalItemsSold || 0
          ),

          totalReviews: Number(
            data.summary?.totalReviews || 0
          ),

          averageRating: Number(
            data.summary?.averageRating || 0
          ),
        });

        // =====================================================
        // ORDER STATUS
        // =====================================================

        setOrderStatus({
          pending: Number(
            data.orderStatus?.pending || 0
          ),

          confirmed: Number(
            data.orderStatus?.confirmed || 0
          ),

          shipped: Number(
            data.orderStatus?.shipped || 0
          ),

          delivered: Number(
            data.orderStatus?.delivered || 0
          ),

          cancelled: Number(
            data.orderStatus?.cancelled || 0
          ),
        });

        // =====================================================
        // PAYMENT STATUS
        // =====================================================

        setPaymentStatus({
          pending: Number(
            data.paymentStatus?.pending || 0
          ),

          paid: Number(
            data.paymentStatus?.paid || 0
          ),

          failed: Number(
            data.paymentStatus?.failed || 0
          ),
        });

        // =====================================================
        // PAYMENT METHOD
        // =====================================================

        setPaymentMethod({
          online: Number(
            data.paymentMethod?.online || 0
          ),

          cod: Number(
            data.paymentMethod?.cod || 0
          ),
        });

        // =====================================================
        // TOP VENDORS
        // =====================================================

        setTopVendors(
          Array.isArray(data.topVendors)
            ? data.topVendors
            : []
        );
      } catch (error) {
        console.error(
          "ADMIN DASHBOARD ERROR:",
          error
        );

        console.error(
          "API ERROR RESPONSE:",
          error?.response?.data
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    getDashboard();
  }, [getDashboard]);

  // SAFE TOP VENDORS
  const calculatedTopVendors = useMemo(() => {
    if (topVendors.length > 0) {
      return topVendors.slice(0, 5);
    }

    return [...vendors]
      .sort(
        (a, b) =>
          Number(
            b?.stats?.totalRevenue || 0
          ) -
          Number(
            a?.stats?.totalRevenue || 0
          )
      )
      .slice(0, 5);
  }, [topVendors, vendors]);

  // ORDER TOTAL
  const totalOrderStatuses = useMemo(() => {
    return (
      Number(orderStatus.pending || 0) +
      Number(orderStatus.confirmed || 0) +
      Number(orderStatus.shipped || 0) +
      Number(orderStatus.delivered || 0) +
      Number(orderStatus.cancelled || 0)
    );
  }, [orderStatus]);

  // PAYMENT TOTAL
  const totalPaymentStatuses = useMemo(() => {
    return (
      Number(paymentStatus.pending || 0) +
      Number(paymentStatus.paid || 0) +
      Number(paymentStatus.failed || 0)
    );
  }, [paymentStatus]);

  // LAST UPDATED
  const [lastUpdated, setLastUpdated] =
  useState(null);

  useEffect(() => {
    if (!loading) {
      setLastUpdated(new Date());
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">

            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-9 w-52 rounded bg-gray-200" />
                <div className="h-4 w-80 max-w-full rounded bg-gray-200" />
              </div>

              <div className="h-11 w-28 rounded-xl bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-36 rounded-2xl bg-gray-200"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-gray-200"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="h-80 rounded-2xl bg-gray-200 lg:col-span-2" />
              <div className="h-80 rounded-2xl bg-gray-200" />
            </div>

            <div className="h-96 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }


  if (error && !vendors.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle
                size={30}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Dashboard load nahi hua
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => getDashboard()}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </motion.div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200">

      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
        >

          <div className="min-w-0">

            <p className="text-sm font-medium text-gray-500">
              Admin Panel
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage vendors, products, customers and orders.
            </p>

          </div>

          <button
            type="button"
            onClick={() => getDashboard(true)}
            disabled={refreshing}
            className="inline-flex w-fit shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </motion.div>

        {/* ERROR */}
        <AnimatePresence>
          {error && vendors.length > 0 && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[
            {
              title: "Total Revenue",
              value: formatCurrency(
                summary.totalRevenue
              ),
              description:
                "Revenue from marketplace orders",
              icon: IndianRupee,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
            },

            {
              title: "Total Orders",
              value: formatNumber(
                summary.totalOrders
              ),
              description:
                "Orders across all vendors",
              icon: ShoppingBag,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-600",
            },

            {
              title: "Total Products",
              value: formatNumber(
                summary.totalProducts
              ),
              description:
                "Products listed by vendors",
              icon: Package,
              iconBg: "bg-violet-50",
              iconColor: "text-violet-600",
            },

            {
              title: "Total Vendors",
              value: formatNumber(
                summary.totalVendors
              ),
              description:
                "Registered vendor accounts",
              icon: Store,
              iconBg: "bg-orange-50",
              iconColor: "text-orange-600",
            },
          ].map((stat, index) => {

            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -4,
                }}
                className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-2 break-all text-xl font-bold leading-tight tracking-tight tabular-nums text-gray-900 sm:text-2xl">
                      {stat.value}
                    </h2>

                    <p className="mt-3 text-xs text-gray-400">
                      {stat.description}
                    </p>

                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
                  >
                    <Icon
                      size={21}
                      className={stat.iconColor}
                    />
                  </div>

                </div>

              </motion.div>
            );
          })}

        </div>

        {/* VENDOR STATUS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {[
            {
              title: "Approved Vendors",
              value:
                summary.approvedVendors,
              icon: CheckCircle2,
              bg: "bg-emerald-50",
              text: "text-emerald-600",
            },

            {
              title: "Pending Vendors",
              value:
                summary.pendingVendors,
              icon: Clock3,
              bg: "bg-amber-50",
              text: "text-amber-600",
            },

            {
              title: "Rejected Vendors",
              value:
                summary.rejectedVendors,
              icon: XCircle,
              bg: "bg-red-50",
              text: "text-red-600",
            },
          ].map((item, index) => {

            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{
                  opacity: 0,
                  x:
                    index === 0
                      ? -15
                      : index === 2
                        ? 15
                        : 0,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay:
                    0.25 +
                    index * 0.08,
                }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
                  >
                    <Icon
                      size={22}
                      className={item.text}
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm text-gray-500">
                      {item.title}
                    </p>

                    <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                      {formatNumber(
                        item.value
                      )}
                    </p>

                  </div>

                </div>

              </motion.div>
            );
          })}

        </div>

        {/* BUSINESS OVERVIEW + TOP VENDORS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* BUSINESS OVERVIEW */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2"
          >

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Business Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Overall marketplace performance
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <Activity size={19} />
              </div>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* CUSTOMERS */}

              <div className="rounded-2xl bg-gray-50 p-5">

                <div className="flex items-center justify-between">

                  <p className="text-sm text-gray-500">
                    Customers
                  </p>

                  <Users
                    size={19}
                    className="text-gray-400"
                  />

                </div>

                <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">
                  {formatNumber(
                    summary.totalCustomers
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Unique customers
                </p>

              </div>

              {/* ITEMS */}

              <div className="rounded-2xl bg-gray-50 p-5">

                <div className="flex items-center justify-between">

                  <p className="text-sm text-gray-500">
                    Items Sold
                  </p>

                  <ShoppingBag
                    size={19}
                    className="text-gray-400"
                  />

                </div>

                <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">
                  {formatNumber(
                    summary.totalItemsSold
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Total quantities sold
                </p>

              </div>

              {/* REVIEWS */}

              <div className="rounded-2xl bg-gray-50 p-5">

                <div className="flex items-center justify-between">

                  <p className="text-sm text-gray-500">
                    Reviews
                  </p>

                  <Star
                    size={19}
                    className="text-gray-400"
                  />

                </div>

                <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">
                  {formatNumber(
                    summary.totalReviews
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Product reviews
                </p>

              </div>

              {/* RATING */}

              <div className="rounded-2xl bg-gray-50 p-5">

                <div className="flex items-center justify-between">

                  <p className="text-sm text-gray-500">
                    Average Rating
                  </p>

                  <span className="text-lg">
                    ★
                  </span>

                </div>

                <p className="mt-3 text-2xl font-bold tabular-nums text-gray-900">

                  {Number(
                    summary.averageRating || 0
                  ).toFixed(1)}

                  <span className="ml-1 text-sm font-normal text-gray-400">
                    / 5
                  </span>

                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Overall product rating
                </p>

              </div>

            </div>

          </motion.div>

          {/* TOP VENDORS */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.48,
            }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Top Vendors
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  By total revenue
                </p>
              </div>

              <TrendingUp
                size={19}
                className="text-gray-400"
              />

            </div>

            <div className="mt-5 space-y-4">

              {calculatedTopVendors.length > 0 ? (
                calculatedTopVendors.map(
                  (item, index) => {

                    const vendor =
                      item?.vendor ||
                      item;

                    const revenue =
                      item?.stats?.totalRevenue ??
                      item?.totalRevenue ??
                      0;

                    return (
                      <motion.div
                        key={
                          vendor?._id ||
                          item?._id ||
                          index
                        }
                        initial={{
                          opacity: 0,
                          x: 10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        transition={{
                          delay:
                            index * 0.05,
                        }}
                        className="flex items-center gap-3"
                      >

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-semibold text-gray-900">
                            {vendor?.shopName ||
                              vendor?.name ||
                              "Unknown Vendor"}
                          </p>

                          <p className="truncate text-xs text-gray-400">
                            {vendor?.email ||
                              "No email"}
                          </p>

                        </div>

                        <p className="max-w-[130px] break-all text-right text-sm font-bold tabular-nums text-gray-900">
                          {formatCurrency(
                            revenue
                          )}
                        </p>

                      </motion.div>
                    );
                  }
                )
              ) : (
                <div className="py-10 text-center">

                  <Store
                    size={30}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 text-sm text-gray-400">
                    No vendors found
                  </p>

                </div>
              )}

            </div>

          </motion.div>

        </div>

        {/* ORDER + PAYMENT ANALYTICS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ORDER STATUS */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Order Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Current order distribution
                </p>
              </div>

              <Truck
                size={19}
                className="text-gray-400"
              />

            </div>

            <div className="mt-6 space-y-4">

              {[
                {
                  label: "Pending",
                  key: "pending",
                  className:
                    "bg-amber-500",
                },
                {
                  label: "Confirmed",
                  key: "confirmed",
                  className:
                    "bg-indigo-500",
                },
                {
                  label: "Shipped",
                  key: "shipped",
                  className:
                    "bg-blue-500",
                },
                {
                  label: "Delivered",
                  key: "delivered",
                  className:
                    "bg-emerald-500",
                },
                {
                  label: "Cancelled",
                  key: "cancelled",
                  className:
                    "bg-red-500",
                },
              ].map((item) => {

                const count =
                  Number(
                    orderStatus[item.key] ||
                      0
                  );

                const percentage =
                  totalOrderStatuses > 0
                    ? Math.round(
                        (count /
                          totalOrderStatuses) *
                          100
                      )
                    : 0;

                return (
                  <div key={item.key}>

                    <div className="mb-2 flex items-center justify-between gap-3">

                      <p className="text-sm font-medium text-gray-600">
                        {item.label}
                      </p>

                      <p className="text-sm font-bold tabular-nums text-gray-900">
                        {formatNumber(count)}
                      </p>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${percentage}%`,
                        }}
                        transition={{
                          duration: 0.7,
                        }}
                        className={`h-full rounded-full ${item.className}`}
                      />

                    </div>

                  </div>
                );
              })}

            </div>

          </motion.div>

          {/* PAYMENT */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Payment Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Payment status and methods
                </p>
              </div>

              <CreditCard
                size={19}
                className="text-gray-400"
              />

            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-emerald-50 p-4">

                <p className="text-sm text-emerald-700">
                  Paid
                </p>

                <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-800">
                  {formatNumber(
                    paymentStatus.paid
                  )}
                </p>

              </div>

              <div className="rounded-2xl bg-amber-50 p-4">

                <p className="text-sm text-amber-700">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold tabular-nums text-amber-800">
                  {formatNumber(
                    paymentStatus.pending
                  )}
                </p>

              </div>

              <div className="rounded-2xl bg-red-50 p-4">

                <p className="text-sm text-red-700">
                  Failed
                </p>

                <p className="mt-2 text-2xl font-bold tabular-nums text-red-800">
                  {formatNumber(
                    paymentStatus.failed
                  )}
                </p>

              </div>

              <div className="rounded-2xl bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Total Payments
                </p>

                <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
                  {formatNumber(
                    totalPaymentStatuses
                  )}
                </p>

              </div>

            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">

              <div className="rounded-xl border border-gray-100 p-4">

                <div className="flex items-center gap-2">

                  <CreditCard
                    size={16}
                    className="text-gray-400"
                  />

                  <span className="text-xs text-gray-500">
                    Online
                  </span>

                </div>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatNumber(
                    paymentMethod.online
                  )}
                </p>

              </div>

              <div className="rounded-xl border border-gray-100 p-4">

                <div className="flex items-center gap-2">

                  <ShoppingBag
                    size={16}
                    className="text-gray-400"
                  />

                  <span className="text-xs text-gray-500">
                    COD
                  </span>

                </div>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatNumber(
                    paymentMethod.cod
                  )}
                </p>

              </div>

            </div>

          </motion.div>

        </div>

        {/* PRODUCT STATUS */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Product Overview
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Product verification and availability
              </p>
            </div>

            <Package
              size={19}
              className="text-gray-400"
            />

          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Total
              </p>
              <p className="mt-2 text-xl font-bold tabular-nums text-gray-900">
                {formatNumber(
                  summary.totalProducts
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-600">
                Active
              </p>
              <p className="mt-2 text-xl font-bold tabular-nums text-emerald-800">
                {formatNumber(
                  summary.activeProducts
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs text-amber-600">
                Pending
              </p>
              <p className="mt-2 text-xl font-bold tabular-nums text-amber-800">
                {formatNumber(
                  summary.pendingProducts
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-xs text-red-600">
                Rejected
              </p>
              <p className="mt-2 text-xl font-bold tabular-nums text-red-800">
                {formatNumber(
                  summary.rejectedProducts
                )}
              </p>
            </div>

          </div>

        </motion.div>

        {/* RECENT ORDERS */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >

          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest orders across marketplace
              </p>

            </div>

            <div className="flex w-fit items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500">

              <ShoppingBag size={15} />

              {formatNumber(
                summary.totalOrders
              )}{" "}
              total orders

            </div>

          </div>

          {recentOrders.length > 0 ? (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead>

                  <tr className="border-b border-gray-100 bg-gray-50/70">

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentOrders.map(
                    (order, index) => {

                      const customer =
                        order?.customer ||
                        order?.userId ||
                        null;

                      return (
                        <motion.tr
                          key={
                            order?._id ||
                            index
                          }
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            delay:
                              index * 0.04,
                          }}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                        >

                          {/* ORDER */}

                          <td className="px-5 py-4">

                            <p className="font-mono text-xs font-semibold text-gray-700">
                              #
                              {String(
                                order?._id ||
                                  ""
                              ).slice(-8)}
                            </p>

                          </td>

                          {/* CUSTOMER */}

                          <td className="px-5 py-4">

                            <div className="max-w-[190px]">

                              <p className="truncate text-sm font-medium text-gray-800">
                                {customer?.name ||
                                  "Guest"}
                              </p>

                              <p className="truncate text-xs text-gray-400">
                                {customer?.email ||
                                  ""}
                              </p>

                            </div>

                          </td>

                          {/* AMOUNT */}

                          <td className="px-5 py-4">

                            <p className="font-semibold tabular-nums text-gray-900">

                              {formatCurrency(
                                order?.totalAmount ??
                                  order?.vendorAmount ??
                                  0
                              )}

                            </p>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getOrderStatusClass(
                                order?.orderStatus
                              )}`}
                            >
                              {getStatusLabel(
                                order?.orderStatus
                              )}
                            </span>

                          </td>

                          {/* PAYMENT */}

                          <td className="px-5 py-4">

                            <div className="flex flex-col items-start gap-1">

                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getPaymentStatusClass(
                                  order?.paymentStatus
                                )}`}
                              >
                                {getStatusLabel(
                                  order?.paymentStatus
                                )}
                              </span>

                              <span className="text-[11px] text-gray-400">
                                {String(
                                  order?.paymentMethod ||
                                    ""
                                ).toUpperCase()}
                              </span>

                            </div>

                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-5 py-4">

                            <p className="text-sm text-gray-500">
                              {formatDate(
                                order?.createdAt
                              )}
                            </p>

                            <p className="text-xs text-gray-400">
                              {formatTime(
                                order?.createdAt
                              )}
                            </p>

                          </td>

                        </motion.tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">

                <ShoppingBag
                  size={25}
                  className="text-gray-400"
                />

              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No orders yet
              </h3>

              <p className="mt-1 max-w-sm text-sm text-gray-400">
                Orders will appear here when customers place them.
              </p>

            </div>

          )}

        </motion.div>

        {/* CATEGORIES */}
        {categories.length > 0 && (

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Categories
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Product distribution by category
                </p>

              </div>

              <Package
                size={19}
                className="text-gray-400"
              />

            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">

              {categories
                .slice(0, 10)
                .map((category, index) => (

                  <motion.div
                    key={
                      category?.category ||
                      index
                    }
                    whileHover={{
                      y: -3,
                    }}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >

                    <p className="truncate text-sm font-semibold text-gray-900">
                      {category?.category ||
                        "Uncategorized"}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-2">

                      <div>

                        <p className="text-xl font-bold tabular-nums text-gray-900">
                          {formatNumber(
                            category?.products ||
                              0
                          )}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          Products
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-sm font-semibold tabular-nums text-gray-700">
                          {formatNumber(
                            category?.stock ||
                              0
                          )}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          Stock
                        </p>

                      </div>

                    </div>

                  </motion.div>

                ))}

            </div>

          </motion.div>

        )}

        {/* ALL VENDORS */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-lg font-bold text-gray-900">
                All Vendors
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Vendor performance overview
              </p>

            </div>

            <div className="w-fit rounded-xl bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600">

              {formatNumber(
                vendors.length
              )}{" "}
              Vendors

            </div>

          </div>

          {vendors.length > 0 ? (

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

              {vendors.map(
                (item, index) => {

                  const vendor =
                    item?.vendor || {};

                  const stats =
                    item?.stats || {};

                  const approvalStatus =
                    vendor?.approvalStatus ||
                    "pending";

                  return (
                    <motion.div
                      key={
                        vendor?._id ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.04,
                      }}
                      whileHover={{
                        y: -3,
                      }}
                      className="rounded-2xl border border-gray-200 p-4 transition-shadow hover:shadow-md"
                    >

                      {/* VENDOR HEADER */}

                      <div className="flex items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">

                          {vendor?.profileImage ||
                          vendor?.image ? (

                            <img
                              src={
                                vendor?.profileImage ||
                                vendor?.image
                              }
                              alt={
                                vendor?.shopName ||
                                vendor?.name ||
                                "Vendor"
                              }
                              className="h-full w-full object-cover"
                            />

                          ) : (

                            <Store
                              size={20}
                              className="text-gray-400"
                            />

                          )}

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">

                            <div className="min-w-0">

                              <h3 className="truncate font-semibold text-gray-900">
                                {vendor?.shopName ||
                                  vendor?.name ||
                                  "Unknown Vendor"}
                              </h3>

                              <p className="truncate text-xs text-gray-400">
                                {vendor?.email ||
                                  "No email"}
                              </p>

                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                                approvalStatus ===
                                "approved"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : approvalStatus ===
                                      "rejected"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {approvalStatus}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* VENDOR STATS */}

                      <div className="mt-4 grid grid-cols-2 gap-2">

                        <div className="min-w-0 rounded-xl bg-gray-50 p-3">

                          <p className="text-[11px] text-gray-400">
                            Revenue
                          </p>

                          <p className="mt-1 break-all text-sm font-bold tabular-nums text-gray-900">
                            {formatCurrency(
                              stats?.totalRevenue
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl bg-gray-50 p-3">

                          <p className="text-[11px] text-gray-400">
                            Orders
                          </p>

                          <p className="mt-1 text-sm font-bold tabular-nums text-gray-900">
                            {formatNumber(
                              stats?.totalOrders
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl bg-gray-50 p-3">

                          <p className="text-[11px] text-gray-400">
                            Products
                          </p>

                          <p className="mt-1 text-sm font-bold tabular-nums text-gray-900">
                            {formatNumber(
                              stats?.totalProducts
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl bg-gray-50 p-3">

                          <p className="text-[11px] text-gray-400">
                            Rating
                          </p>

                          <p className="mt-1 text-sm font-bold tabular-nums text-gray-900">

                            {Number(
                              stats?.averageRating ||
                                0
                            ).toFixed(1)}

                            <span className="ml-1 text-xs text-gray-400">
                              / 5
                            </span>

                          </p>

                        </div>

                      </div>

                      {/* EXTRA STATS */}

                      <div className="mt-3 grid grid-cols-3 gap-2">

                        <div className="rounded-xl border border-gray-100 p-2.5 text-center">

                          <p className="text-[10px] text-gray-400">
                            Customers
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {formatNumber(
                              stats?.totalCustomers
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl border border-gray-100 p-2.5 text-center">

                          <p className="text-[10px] text-gray-400">
                            Sold
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {formatNumber(
                              stats?.totalItemsSold
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl border border-gray-100 p-2.5 text-center">

                          <p className="text-[10px] text-gray-400">
                            Reviews
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {formatNumber(
                              stats?.totalReviews
                            )}
                          </p>

                        </div>

                      </div>

                      {/* FOOTER */}

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">

                        <div className="flex items-center gap-1.5 text-xs text-gray-400">

                          <Clock3 size={13} />

                          Joined{" "}
                          {formatDate(
                            vendor?.createdAt
                          )}

                        </div>

                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500">

                          Vendor

                          <ArrowUpRight
                            size={14}
                          />

                        </div>

                      </div>

                    </motion.div>
                  );
                }
              )}

            </div>

          ) : (

            <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">

                <Store
                  size={25}
                  className="text-gray-400"
                />

              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No vendors found
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Registered vendors will appear here.
              </p>

            </div>

          )}

        </motion.div>

        {/* FOOTER */}
        <div className="flex flex-col justify-between gap-2 pb-4 text-xs text-gray-400 sm:flex-row">

          <p>
            Admin Dashboard • Live database data
          </p>

          <p>
            Last updated:{" "}
            {lastUpdated
              ? lastUpdated.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "N/A"}
          </p>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;