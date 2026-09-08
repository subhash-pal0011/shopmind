"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import { motion } from "motion/react";

import {
  ShoppingBag,
  Package,
  IndianRupee,
  TrendingUp,
  Users,
  Star,
  Clock3,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  RefreshCw,
  ChevronRight,
  CalendarDays,
  CircleDollarSign,
  Boxes,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

const VendorDashboards = () => {
 
  const [activePeriod, setActivePeriod] = useState("7 Days");

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const router = useRouter()

  // =========================================================
  // PERIOD
  // =========================================================
  const periodNumber = useMemo(() => {
    if (activePeriod === "30 Days") return 30;
    if (activePeriod === "90 Days") return 90;
    return 7;
  }, [activePeriod]);

  // =========================================================
  // FETCH DASHBOARD
  // =========================================================

  const fetchDashboard = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await axios.get(
          `/api/vendor/dashboard?period=${periodNumber}`,
          {
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (!response?.data?.success) {
          throw new Error(
            response?.data?.message ||
              "Unable to fetch dashboard"
          );
        }

        setDashboard(response.data.data);
      } catch (err) {
        console.error(
          "VENDOR DASHBOARD ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [periodNumber]
  );

  // =========================================================
  // FETCH WHEN PERIOD CHANGES
  // =========================================================

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = () => {
    fetchDashboard(true);
  };

  // =========================================================
  // FORMAT PRICE
  // =========================================================
  const formatPrice = useCallback((value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }, []);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = useCallback((date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const statsData = dashboard?.stats || {};

  const periodData = dashboard?.period || {};

  const orderSummary = dashboard?.orderSummary || {};


  const salesData =
    dashboard?.salesData ||
    dashboard?.salesChart ||
    [];

  const orders =
    dashboard?.recentOrders || [];

  const topProducts =
    dashboard?.topProducts || [];

  const lowStockProducts =
    dashboard?.lowStockProducts || [];

  // =========================================================
  // ORDER COUNTS
  // =========================================================

  const processingOrders = Number(
    orderSummary.processing ||
      orderSummary.pending ||
      0
  );

  const shippedOrders = Number(
    orderSummary.shipped || 0
  );

  const deliveredOrders = Number(
    orderSummary.delivered || 0
  );

  const cancelledOrders = Number(
    orderSummary.cancelled || 0
  );

  const totalStatusOrders =
    processingOrders +
    shippedOrders +
    deliveredOrders +
    cancelledOrders;

  const totalOrders =
    Number(
      orderSummary.total || 0
    ) ||
    Number(
      statsData.totalOrders || 0
    );

  // =========================================================
  // SALES DATA NORMALIZATION
  // =========================================================

  const normalizedSalesData = useMemo(() => {
    if (!Array.isArray(salesData)) {
      return [];
    }

    return salesData.map(
      (item, index) => {
        const value = Number(
          item?.value ??
            item?.sales ??
            item?.revenue ??
            0
        );

        let percentage = Number(
          item?.percentage
        );

        if (
          !Number.isFinite(
            percentage
          )
        ) {
          percentage = 0;
        }

        return {
          ...item,
          date:
            item?.date ||
            String(index),
          day:
            item?.day ||
            item?.label ||
            item?.date ||
            `Day ${index + 1}`,
          value,
          percentage,
        };
      }
    );
  }, [salesData]);

  // =========================================================
  // MAX SALES
  // =========================================================

  const maxSales = useMemo(() => {
    if (
      normalizedSalesData.length === 0
    ) {
      return 1;
    }

    return Math.max(
      ...normalizedSalesData.map(
        (item) =>
          Number(item.value || 0)
      ),
      1
    );
  }, [normalizedSalesData]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    const revenueChange = Number(
      periodData.revenueChange || 0
    );

    const orderChange = Number(
      periodData.orderChange || 0
    );

    return [
      {
        title: "Total Revenue",
        value: formatPrice(
          statsData.totalRevenue
        ),
        change:
          revenueChange >= 0
            ? `+${revenueChange}%`
            : `${revenueChange}%`,
        positive:
          revenueChange >= 0,
        icon: IndianRupee,
        description:
          "vs previous period",
      },

      {
        title: "Total Orders",
        value:
          statsData.totalOrders || 0,
        change:
          orderChange >= 0
            ? `+${orderChange}%`
            : `${orderChange}%`,
        positive:
          orderChange >= 0,
        icon: ShoppingBag,
        description:
          "vs previous period",
      },

      {
        title: "Total Products",
        value:
          statsData.totalProducts || 0,
        change:
          statsData.activeProducts ||
          0,
        positive: true,
        icon: Package,
        description:
          "active products",
        noPercentage: true,
      },

      {
        title: "Customers",
        value:
          statsData.customers ??
          statsData.totalCustomers ??
          0,
        change:
          statsData.totalReviews || 0,
        positive: true,
        icon: Users,
        description:
          "unique customers",
        noPercentage: true,
      },
    ];
  }, [
    statsData,
    periodData,
    formatPrice,
  ]);

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (
    status
  ) => {
    switch (
      String(status || "")
        .toLowerCase()
    ) {
      case "delivered":
        return {
          wrapper:
            "bg-emerald-50 text-emerald-700 border-emerald-100",
          icon: CheckCircle2,
          label: "Delivered",
        };

      case "shipped":
        return {
          wrapper:
            "bg-blue-50 text-blue-700 border-blue-100",
          icon: Truck,
          label: "Shipped",
        };

      case "pending":
        return {
          wrapper:
            "bg-amber-50 text-amber-700 border-amber-100",
          icon: Clock3,
          label: "Pending",
        };

      case "confirmed":
        return {
          wrapper:
            "bg-amber-50 text-amber-700 border-amber-100",
          icon: Clock3,
          label: "Confirmed",
        };

      case "cancelled":
        return {
          wrapper:
            "bg-red-50 text-red-700 border-red-100",
          icon: XCircle,
          label: "Cancelled",
        };

      default:
        return {
          wrapper:
            "bg-slate-50 text-slate-600 border-slate-100",
          icon: Activity,
          label:
            status || "Unknown",
        };
    }
  };

  // =========================================================
  // ANIMATION
  // =========================================================

  const cardAnimation = {
    initial: {
      opacity: 0,
      y: 20,
    },

    animate: {
      opacity: 1,
      y: 0,
    },
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse">
          <div className="mb-3 h-3 w-32 rounded bg-slate-200" />

          <div className="mb-2 h-9 w-72 rounded bg-slate-200" />

          <div className="mb-8 h-4 w-96 max-w-full rounded bg-slate-200" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-36 rounded-2xl bg-white shadow-sm"
                />
              )
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="h-95 rounded-2xl bg-white shadow-sm xl:col-span-2" />
            <div className="h-95 rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-6">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <XCircle size={28} />
            </div>

            <h2 className="text-xl font-black text-slate-900">
              Dashboard couldn't load
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <button
              onClick={() =>
                fetchDashboard(false)
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-white transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw
                size={15}
              />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen p-2 sm:p- lg:p-">
   
      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-7"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}

          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Vendor Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Welcome back,{" "}
              {dashboard?.vendor
                ?.name ||
                "Vendor"}{" "}
              👋
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Here's what's happening
              with your store today.
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex flex-wrap items-center gap-3">
            {/* PERIOD */}

            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
              {[
                "7 Days",
                "30 Days",
                "90 Days",
              ].map(
                (period) => (
                  <button
                    key={period}
                    onClick={() =>
                      setActivePeriod(
                        period
                      )
                    }
                    disabled={
                      loading ||
                      refreshing
                    }
                    className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${
                      activePeriod ===
                      period
                        ? "bg-slate-900 text-white shadow"
                        : "text-slate-500 hover:bg-slate-100"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {period}
                  </button>
                )
              )}
            </div>

            {/* REFRESH */}

            <button
              onClick={
                handleRefresh
              }
              disabled={refreshing}
              className="cursor-pointer flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md disabled:opacity-60"
            >
              <RefreshCw
                size={15}
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

            {/* ADD PRODUCT */}

            <button onClick={()=>router.push("/venderPage/addProducts")}
            className="cursor-pointer flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}
      {error && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-red-600">
            <AlertTriangle
              size={15}
              className="shrink-0"
            />

            <span className="truncate">
              {error}
            </span>
          </div>

          <button
            onClick={() =>
              fetchDashboard(true)
            }
            className="shrink-0 text-xs font-black text-red-700 underline"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* ===================================================== */}
      {/* STAT CARDS */}
      {/* ===================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(
          (stat, index) => {
            const Icon =
              stat.icon;

            return (
              <motion.div
                key={
                  stat.title
                }
                {...cardAnimation}
                transition={{
                  duration: 0.4,
                  delay:
                    index * 0.08,
                }}
                whileHover={{
                  y: -4,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-400">
                      {stat.title}
                    </p>

                    <h2 className="mt-2 truncate text-2xl font-black tracking-tight text-slate-900">
                      {stat.value}
                    </h2>
                  </div>

                  <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon
                      size={20}
                    />
                  </div>
                </div>

                <div className="mt-4 flex min-w-0 items-center gap-2">
                  {!stat.noPercentage ? (
                    <span
                      className={`flex shrink-0 items-center gap-0.5 text-xs font-black ${
                        stat.positive
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.positive ? (
                        <ArrowUpRight
                          size={14}
                        />
                      ) : (
                        <ArrowDownRight
                          size={14}
                        />
                      )}

                      {stat.change}
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs font-black text-emerald-600">
                      {stat.change}
                    </span>
                  )}

                  <span className="truncate text-[11px] font-medium text-slate-400">
                    {
                      stat.description
                    }
                  </span>
                </div>
              </motion.div>
            );
          }
        )}
      </div>

      {/* ===================================================== */}
      {/* MAIN GRID */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* =================================================== */}
        {/* SALES OVERVIEW */}
        {/* =================================================== */}

        <motion.div
          {...cardAnimation}
          transition={{
            duration: 0.5,
            delay: 0.25,
          }}
          className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2"
        >
          {/* HEADER */}

          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={18}
                  className="text-emerald-600"
                />

                <h2 className="text-base font-black text-slate-900">
                  Sales Overview
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Revenue performance
                for{" "}
                {activePeriod.toLowerCase()}
              </p>
            </div>

            <div
              className={`w-fit rounded-lg px-3 py-1.5 text-xs font-black ${
                Number(
                  periodData.revenueChange ||
                    0
                ) >= 0
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {Number(
                periodData.revenueChange ||
                  0
              ) >= 0
                ? "+"
                : ""}
              {periodData.revenueChange ||
                0}
              %
            </div>
          </div>

          {/* ================================================= */}
          {/* CHART */}
          {/* ================================================= */}

          <div className="relative h-70 w-full">
            {/* Y AXIS */}

            <div className="absolute inset-0 flex flex-col justify-between">
              {[
                100,
                75,
                50,
                25,
                0,
              ].map(
                (value) => (
                  <div
                    key={
                      value
                    }
                    className="flex items-center gap-3"
                  >
                    <span className="w-7 shrink-0 text-right text-[9px] font-bold text-slate-300">
                      {value}%
                    </span>

                    <div className="h-px flex-1 border-t border-dashed border-slate-100" />
                  </div>
                )
              )}
            </div>

            {/* ================================================= */}
            {/* CHART SCROLL */}
            {/* ================================================= */}

            <div className="absolute bottom-0 left-10 right-0 top-0 overflow-x-auto overflow-y-hidden pb-1">
              <div
                className={`flex h-full items-end ${
                  normalizedSalesData.length >
                  14
                    ? "min-w-225"
                    : "w-full"
                }`}
              >
                {normalizedSalesData.length >
                0 ? (
                  normalizedSalesData.map(
                    (
                      data,
                      index
                    ) => {
                      const percentage =
                        data.percentage >
                        0
                          ? Math.min(
                              data.percentage,
                              100
                            )
                          : data.value >
                              0
                            ? Math.max(
                                (data.value /
                                  maxSales) *
                                  100,
                                5
                              )
                            : 0;

                      return (
                        <div
                          key={
                            data.date ||
                            index
                          }
                          className={`group flex h-full shrink-0 flex-col items-center justify-end ${
                            normalizedSalesData.length >
                            14
                              ? "w-[34px] sm:w-[42px] md:w-[48px]"
                              : "min-w-0 flex-1"
                          }`}
                        >
                          {/* BAR AREA */}

                          <div className="relative flex h-[88%] w-full items-end justify-center">
                            {/* TOOLTIP */}

                            <div className="pointer-events-none absolute -top-7 z-20 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[9px] font-bold text-white shadow-lg group-hover:block">
                              {formatPrice(
                                data.value
                              )}
                            </div>

                            {/* BAR */}

                            <motion.div
                              initial={{
                                height: 0,
                              }}
                              animate={{
                                height: `${percentage}%`,
                              }}
                              transition={{
                                duration:
                                  0.7,
                                delay:
                                  0.25 +
                                  index *
                                    0.015,
                              }}
                              className="w-[18px] rounded-t-lg bg-slate-900 transition-colors duration-200 group-hover:bg-blue-600 sm:w-[22px]"
                            />
                          </div>

                          {/* LABEL */}

                          <span
                            title={
                              data.day
                            }
                            className={`mt-3 truncate px-0.5 text-center text-[8px] font-bold text-slate-400 sm:text-[9px] ${
                              normalizedSalesData.length >
                              14
                                ? "w-full"
                                : "max-w-[55px]"
                            }`}
                          >
                            {
                              data.day
                            }
                          </span>
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <TrendingUp
                        size={
                          28
                        }
                        className="mx-auto mb-2 text-slate-200"
                      />

                      <p className="text-xs font-black text-slate-400">
                        No sales data
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CHART FOOTER */}

          {normalizedSalesData.length >
            14 && (
            <div className="mt-2 flex items-center justify-center gap-1 text-[9px] font-bold text-slate-300">
              <ChevronRight
                size={12}
              />
              Scroll horizontally
              to view all days
            </div>
          )}
        </motion.div>

        {/* =================================================== */}
        {/* ORDER SUMMARY */}
        {/* =================================================== */}

        <motion.div
          {...cardAnimation}
          transition={{
            duration: 0.5,
            delay: 0.32,
          }}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Order Summary
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current order status
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <ShoppingCart
                size={17}
              />
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Processing",
                value:
                  processingOrders,
                color:
                  "bg-amber-500",
              },

              {
                label: "Shipped",
                value:
                  shippedOrders,
                color:
                  "bg-blue-500",
              },

              {
                label: "Delivered",
                value:
                  deliveredOrders,
                color:
                  "bg-emerald-500",
              },

              {
                label: "Cancelled",
                value:
                  cancelledOrders,
                color:
                  "bg-red-500",
              },
            ].map(
              (item) => {
                const percentage =
                  totalStatusOrders >
                  0
                    ? Math.min(
                        (item.value /
                          totalStatusOrders) *
                          100,
                        100
                      )
                    : 0;

                return (
                  <div
                    key={
                      item.label
                    }
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                        />

                        <span className="text-xs font-bold text-slate-600">
                          {
                            item.label
                          }
                        </span>
                      </div>

                      <span className="text-xs font-black text-slate-900">
                        {
                          item.value
                        }
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
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
                        className={`h-full rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* TOTAL */}

          <div className="mt-7 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Total Orders
              </span>

              <span className="text-lg font-black text-slate-900">
                {totalOrders}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===================================================== */}
      {/* RECENT ORDERS + TOP PRODUCTS */}
      {/* ===================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* =================================================== */}
        {/* RECENT ORDERS */}
        {/* =================================================== */}

        <motion.div
          {...cardAnimation}
          transition={{
            duration: 0.5,
            delay: 0.4,
          }}
          className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Latest orders from
                your customers
              </p>
            </div>

            <button className="flex items-center gap-1 text-xs font-black text-blue-600 transition hover:text-blue-700">
              View All
              <ChevronRight
                size={14}
              />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Order
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Product
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.length >
                0 ? (
                  orders.map(
                    (
                      order,
                      index
                    ) => {
                      const status =
                        getStatusStyle(
                          order?.status
                        );

                      const StatusIcon =
                        status.icon;

                      const orderId =
                        order?.id ||
                        order?._id ||
                        index;

                      return (
                        <tr
                          key={
                            orderId
                          }
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                        >
                          {/* ORDER */}

                          <td className="px-5 py-4">
                            <span className="text-xs font-black text-slate-900">
                              {order?.orderNumber ||
                                orderId}
                            </span>
                          </td>

                          {/* CUSTOMER */}

                          <td className="px-5 py-4">
                            <span className="text-xs font-bold text-slate-600">
                              {order?.customer ||
                                order?.customerName ||
                                "Customer"}
                            </span>
                          </td>

                          {/* PRODUCT */}

                          <td className="max-w-[180px] px-5 py-4">
                            <span className="block truncate text-xs font-bold text-slate-600">
                              {order?.product ||
                                "Product"}

                              {Number(
                                order?.productCount ||
                                  0
                              ) > 1 && (
                                <span className="ml-1 text-[9px] text-slate-400">
                                  +
                                  {Number(
                                    order.productCount
                                  ) -
                                    1}{" "}
                                  more
                                </span>
                              )}
                            </span>
                          </td>

                          {/* AMOUNT */}

                          <td className="px-5 py-4">
                            <span className="text-xs font-black text-slate-900">
                              {formatPrice(
                                order?.amount
                              )}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-black ${status.wrapper}`}
                            >
                              <StatusIcon
                                size={
                                  11
                                }
                              />

                              {
                                status.label
                              }
                            </span>
                          </td>

                          {/* DATE */}

                          <td className="px-5 py-4">
                            <span className="whitespace-nowrap text-[10px] font-bold text-slate-400">
                              {formatDate(
                                order?.date ||
                                  order?.createdAt
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center"
                    >
                      <ShoppingBag
                        size={28}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="text-sm font-black text-slate-600">
                        No orders
                        found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Your recent
                        orders will
                        appear here.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* =================================================== */}
        {/* TOP PRODUCTS */}
        {/* =================================================== */}

        <motion.div
          {...cardAnimation}
          transition={{
            duration: 0.5,
            delay: 0.46,
          }}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Top Products
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Best selling products
              </p>
            </div>

            <Boxes
              size={18}
              className="text-slate-400"
            />
          </div>

          <div className="p-4">
            {topProducts.length >
            0 ? (
              topProducts.map(
                (
                  product,
                  index
                ) => (
                  <div
                    key={
                      product?.id ||
                      product?._id ||
                      index
                    }
                    className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-slate-50"
                  >
                    {/* RANK */}

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
                      #
                      {index +
                        1}
                    </div>

                    {/* PRODUCT */}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-slate-800">
                        {product?.name ||
                          product?.title ||
                          "Product"}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="truncate text-[9px] font-bold text-slate-400">
                          {product?.category ||
                            "General"}
                        </span>

                        <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-black text-amber-500">
                          <Star
                            size={9}
                            fill="currentColor"
                          />

                          {Number(
                            product?.rating ||
                              0
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* REVENUE */}

                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-black text-slate-900">
                        {formatPrice(
                          product?.revenue
                        )}
                      </p>

                      <p className="mt-1 text-[9px] font-bold text-slate-400">
                        {product?.sales ||
                          0}{" "}
                        sold
                      </p>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="py-10 text-center">
                <Boxes
                  size={30}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-xs font-black text-slate-500">
                  No sales yet
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ===================================================== */}
      {/* BOTTOM SECTION */}
      {/* ===================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* =================================================== */}
        {/* LOW STOCK */}
        {/* =================================================== */}

        <motion.div
          {...cardAnimation}
          transition={{
            duration: 0.5,
            delay: 0.5,
          }}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <AlertTriangle
                  size={18}
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-black text-slate-900">
                  Low Stock
                </h2>

                <p className="truncate text-[10px] font-bold text-slate-400">
                  Products need
                  attention
                </p>
              </div>
            </div>

            <span className="ml-2 shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-black text-orange-600">
              {
                lowStockProducts.length
              }{" "}
              Items
            </span>
          </div>

          <div className="p-4">
            {lowStockProducts.length >
            0 ? (
              lowStockProducts.map(
                (
                  product,
                  index
                ) => (
                  <div
                    key={
                      product?.id ||
                      product?._id ||
                      index
                    }
                    className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Package
                        size={15}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="truncate text-xs font-bold text-slate-600">
                        {product?.name ||
                          product?.title ||
                          "Product"}
                      </span>
                    </div>

                    <span
                      className={`ml-3 whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-black ${
                        Number(
                          product?.stock ||
                            0
                        ) === 0
                          ? "bg-red-50 text-red-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {Number(
                        product?.stock ||
                          0
                      ) === 0
                        ? "Out of stock"
                        : `${product.stock} left`}
                    </span>
                  </div>
                )
              )
            ) : (
              <div className="py-8 text-center">
                <CheckCircle2
                  size={28}
                  className="mx-auto mb-2 text-emerald-500"
                />

                <p className="text-xs font-black text-emerald-600">
                  Stock looks
                  good
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* =================================================== */}
        {/* CUSTOMER RATING */}
        {/* =================================================== */}

        <motion.div
          {...cardAnimation}
          transition={{
            duration: 0.5,
            delay: 0.56,
          }}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Star
                size={19}
                fill="currentColor"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-black text-slate-900">
                Customer Rating
              </h2>

              <p className="truncate text-[10px] font-bold text-slate-400">
                Overall store
                performance
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-black tracking-tight text-slate-900">
              {Number(
                statsData.averageRating ||
                  0
              ).toFixed(1)}
            </span>

            <span className="mb-1 text-xs font-bold text-slate-400">
              / 5.0
            </span>
          </div>

          <div className="mt-3 flex items-center gap-1">
            {[
              1,
              2,
              3,
              4,
              5,
            ].map(
              (star) => {
                const averageRating =
                  Number(
                    statsData.averageRating ||
                      0
                  );

                return (
                  <Star
                    key={
                      star
                    }
                    size={
                      16
                    }
                    className={
                      star <=
                      Math.round(
                        averageRating
                      )
                        ? "text-amber-500"
                        : "text-slate-200"
                    }
                    fill={
                      star <=
                      Math.round(
                        averageRating
                      )
                        ? "currentColor"
                        : "none"
                    }
                  />
                );
              }
            )}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <span className="text-[10px] font-bold text-slate-500">
              Total Reviews
            </span>

            <span className="text-sm font-black text-slate-900">
              {
                statsData.totalReviews ||
                0
              }
            </span>
          </div>
        </motion.div>

        {/* =================================================== */}
        {/* QUICK ACTIONS */}
        {/* =================================================== */}

        <motion.div
          {...cardAnimation}
          transition={{
            duration: 0.5,
            delay: 0.62,
          }}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="text-sm font-black text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-[10px] font-bold text-slate-400">
            Manage your store
            quickly
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={()=>router.push("/venderPage/addProducts")}
             className="cursor-pointer group rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
              <Plus
                size={17}
                className="mb-3 text-slate-500 transition group-hover:text-white"
              />

              <p className="text-[10px] font-black">
                Add Product
              </p>
            </button>

            <button className="group rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
              <ShoppingBag
                size={17}
                className="mb-3 text-slate-500 transition group-hover:text-white"
              />

              <p className="text-[10px] font-black">
                View Orders
              </p>
            </button>

            <button className="group rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
              <Package
                size={17}
                className="mb-3 text-slate-500 transition group-hover:text-white"
              />

              <p className="text-[10px] font-black">
                Manage Stock
              </p>
            </button>

            <button className="group rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-900 hover:bg-slate-900 hover:text-white">
              <Eye
                size={17}
                className="mb-3 text-slate-500 transition group-hover:text-white"
              />

              <p className="text-[10px] font-black">
                Store Preview
              </p>
            </button>
          </div>
        </motion.div>
      </div>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <CircleDollarSign
            size={16}
            className="text-emerald-500"
          />

          <span className="text-[10px] font-bold text-slate-500">
            Current period revenue{" "}
            <span className="font-black text-emerald-600">
              {formatPrice(
                periodData.currentRevenue ??
                  statsData.totalRevenue ??
                  0
              )}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
          <CalendarDays
            size={13}
          />

          {refreshing
            ? "Updating..."
            : "Updated just now"}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboards;