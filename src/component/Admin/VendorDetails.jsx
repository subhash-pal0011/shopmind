"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  IndianRupee,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  Store,
  User,
  Users,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const VendorDetails = () => {
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState(null);

  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [showVendorList, setShowVendorList] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | FETCH ALL VENDORS
  |--------------------------------------------------------------------------
  */
  const fetchVendors = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get("/api/admin/vendorsDetails", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to fetch vendors");
      }

      const vendorData = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setVendors(vendorData);
      setSummary(response.data?.summary || null);
      setSelectedVendorId((current) => {
        if (
          current &&
          vendorData.some((item) => item?.vendor?._id === current)
        ) {
          return current;
        }

        return vendorData[0]?.vendor?._id || null;
      });
    } catch (err) {
      console.error("GET ALL VENDORS ERROR:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to fetch vendors",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER VENDORS
  |--------------------------------------------------------------------------
  */
  const filteredVendors = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return vendors.filter((item) => {
      const vendor = item?.vendor || {};

      const matchesSearch =
        !searchText ||
        vendor?.name?.toLowerCase().includes(searchText) ||
        vendor?.email?.toLowerCase().includes(searchText) ||
        vendor?.shopName?.toLowerCase().includes(searchText) ||
        vendor?.shopAddress?.toLowerCase().includes(searchText) ||
        vendor?.gstNumber?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" || vendor?.approvalStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vendors, search, statusFilter]);

  /*
  |--------------------------------------------------------------------------
  | SELECTED VENDOR
  |--------------------------------------------------------------------------
  */
  const selectedVendorData = useMemo(() => {
    if (!selectedVendorId) return null;

    return (
      vendors.find((item) => item?.vendor?._id === selectedVendorId) || null
    );
  }, [vendors, selectedVendorId]);

  const selectedVendor = selectedVendorData?.vendor || null;

  const selectedStats = selectedVendorData?.stats || {};

  const selectedOrders = Array.isArray(selectedVendorData?.orders)
    ? selectedVendorData.orders
    : [];

  const selectedProducts = Array.isArray(selectedVendorData?.products)
    ? selectedVendorData.products
    : [];

  const orderStatus = selectedVendorData?.orderStatus || {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  /*
  |--------------------------------------------------------------------------
  | FORMAT HELPERS
  |--------------------------------------------------------------------------
  */
  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getApprovalClass = (status) => {
    switch (status) {
      case "approved":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "rejected":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "delivered":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "confirmed":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "shipped":
        return "border-indigo-200 bg-indigo-50 text-indigo-700";

      case "pending":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "cancelled":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-600";
    }
  };

  const getProductStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TABS
  |--------------------------------------------------------------------------
  */
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Store,
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingBag,
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
    },
    {
      id: "activity",
      label: "Activity",
      icon: Clock3,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc]">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
            <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-200" />

            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="h-150 animate-pulse rounded-2xl bg-white" />

            <div className="h-150 animate-pulse rounded-2xl bg-white lg:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-xl"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={27} />
          </div>

          <h2 className="mt-5 text-xl font-bold">Failed to Load Vendors</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">{error}</p>

          <button
            onClick={() => fetchVendors()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900">
      <motion.header
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="sticky top-0 z-40 border-b border-gray-200 bg-gray-200 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Vendors
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                  Manage all vendor shops and their performance
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* INPUT-SEARCH */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vendor, shop, email..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 sm:w-70"
                />
              </div>

              {/* OPTION */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="cursor-pointer h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm font-medium outline-none sm:w-42.5"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* REFRES */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fetchVendors(true)}
                disabled={refreshing}
                className="cursor-pointer flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />

                <span>Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Vendors",
              value: summary?.totalVendors || 0,
              icon: Store,
              description: "All registered shops",
            },
            {
              title: "Approved Vendors",
              value: summary?.approvedVendors || 0,
              icon: CheckCircle2,
              description: "Approved shops",
            },
            {
              title: "Total Orders",
              value: summary?.totalOrders || 0,
              icon: ShoppingBag,
              description: "Across all vendors",
            },
            {
              title: "Total Revenue",
              value: formatCurrency(summary?.totalRevenue || 0),
              icon: IndianRupee,
              description: "Vendor generated revenue",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.07,
                  duration: 0.4,
                }}
                whileHover={{
                  y: -4,
                }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight">
                      {stat.value}
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mt-4 text-xs text-gray-400">{stat.description}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${
              showVendorList ? "block" : "hidden xl:block"
            } overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm`}
          >
            <div className="border-b border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">All Vendors</h2>

                  <p className="mt-1 text-xs text-gray-400">
                    {filteredVendors.length} vendors found
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-bold">
                  {vendors.length}
                </div>
              </div>
            </div>

            <div className="max-h-180 overflow-y-auto p-2">
              {filteredVendors.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Search size={30} className="mx-auto text-gray-300" />

                  <p className="mt-3 text-sm font-semibold">No vendors found</p>

                  <p className="mt-1 text-xs text-gray-400">
                    Try another search or filter
                  </p>
                </div>
              ) : (
                filteredVendors.map((item, index) => {
                  const vendor = item?.vendor || {};
                  const stats = item?.stats || {};

                  const isSelected = selectedVendorId === vendor?._id;

                  const avatar = vendor?.profileImage || vendor?.image || null;

                  return (
                    <motion.button
                      key={vendor?._id}
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.035,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() => {
                        setSelectedVendorId(vendor?._id);
                        setActiveTab("overview");
                        setShowVendorList(false);
                      }}
                      className={`mb-1.5 flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                        isSelected
                          ? "bg-gray-900 text-white shadow-md"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={vendor?.name || "Vendor"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-500">
                            <Store size={20} />
                          </div>
                        )}

                        <span
                          className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 ${
                            isSelected ? "border-gray-900" : "border-white"
                          } ${
                            vendor?.approvalStatus === "approved"
                              ? "bg-emerald-500"
                              : vendor?.approvalStatus === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {vendor?.shopName || vendor?.name || "Unnamed Shop"}
                        </p>

                        <p
                          className={`mt-0.5 truncate text-xs ${
                            isSelected ? "text-gray-300" : "text-gray-400"
                          }`}
                        >
                          {vendor?.name || "Vendor"}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold capitalize ${
                              isSelected
                                ? "text-gray-300"
                                : vendor?.approvalStatus === "approved"
                                  ? "text-emerald-600"
                                  : vendor?.approvalStatus === "pending"
                                    ? "text-amber-600"
                                    : "text-red-600"
                            }`}
                          >
                            {vendor?.approvalStatus || "unknown"}
                          </span>

                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-gray-400" : "text-gray-400"
                            }`}
                          >
                            •
                          </span>

                          <span
                            className={`text-[10px] ${
                              isSelected ? "text-gray-400" : "text-gray-400"
                            }`}
                          >
                            {stats?.totalProducts || 0} products
                          </span>
                        </div>
                      </div>

                      <ArrowUpRight
                        size={16}
                        className={
                          isSelected ? "text-gray-300" : "text-gray-300"
                        }
                      />
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.aside>

          {/* SELECTED VENDOR DETAILS */}
          <section className={`${showVendorList ? "block" : "block"} min-w-0`}>
            {!selectedVendor ? (
              <div className="flex min-h-125 items-center justify-center rounded-2xl border border-gray-200 bg-white">
                <div className="text-center">
                  <Store size={45} className="mx-auto text-gray-300" />

                  <h2 className="mt-4 text-lg font-bold">Select a Vendor</h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Select any vendor from the list
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* VENDOR PROFILE */}
                <motion.section
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                  }}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="h-24 bg-linear-to-r from-gray-950 via-gray-800 to-gray-700 sm:h-32" />

                  <div className="relative px-5 pb-5 sm:px-7 sm:pb-7">
                    <button
                      onClick={() => setShowVendorList(true)}
                      className="absolute left-5 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold shadow-sm xl:hidden"
                    >
                      <ArrowLeft size={15} />
                      Vendors
                    </button>

                    <div className="-mt-11 flex flex-col gap-5 sm:-mt-14 lg:flex-row lg:items-end lg:justify-between">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <motion.div
                          whileHover={{
                            scale: 1.04,
                          }}
                          className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-lg sm:h-28 sm:w-28"
                        >
                          {selectedVendor?.profileImage ||
                          selectedVendor?.image ? (
                            <img
                              src={
                                selectedVendor?.profileImage ||
                                selectedVendor?.image
                              }
                              alt={selectedVendor?.name || "Vendor"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                              <Store size={35} />
                            </div>
                          )}

                          <span
                            className={`absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-white ${
                              selectedVendor?.approvalStatus === "approved"
                                ? "bg-emerald-500"
                                : selectedVendor?.approvalStatus === "pending"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                          />
                        </motion.div>

                        <div className="pb-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-bold">
                              {selectedVendor?.shopName ||
                                selectedVendor?.name ||
                                "Unnamed Shop"}
                            </h2>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getApprovalClass(
                                selectedVendor?.approvalStatus,
                              )}`}
                            >
                              {selectedVendor?.approvalStatus || "unknown"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            Owner:{" "}
                            <span className="font-semibold text-gray-700">
                              {selectedVendor?.name || "—"}
                            </span>
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Store size={15} />
                              Vendor
                            </span>

                            <span className="hidden h-4 w-px bg-gray-200 sm:block" />

                            <span className="flex items-center gap-1.5">
                              <MapPin size={15} />
                              {selectedVendor?.shopAddress ||
                                "Address not available"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <Star
                            size={20}
                            fill="currentColor"
                            className="text-amber-500"
                          />

                          <div>
                            <p className="font-bold text-gray-900">
                              {selectedStats?.averageRating || 0}
                            </p>

                            <p className="text-xs text-gray-500">
                              {selectedStats?.totalReviews || 0} reviews
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CONTACT DETAILS */}

                    <div className="mt-7 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                          <Mail size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">Email</p>

                          <p className="truncate text-sm font-semibold">
                            {selectedVendor?.email || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                          <Phone size={18} />
                        </div>

                        <div className="">
                          <p className="text-xs text-gray-400">Phone</p>

                          <p className="text-xs font-semibold">
                            {selectedVendor?.phone || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                          <MapPin size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">Shop Address</p>

                          <p className="truncate text-sm font-semibold">
                            {selectedVendor?.shopAddress || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
                          <Clock3 size={18} />
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">Joined</p>

                          <p className="text-sm font-semibold">
                            {formatDate(selectedVendor?.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* GST */}
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-400">GST Number</p>

                        <p className="mt-1 text-sm font-bold">
                          {selectedVendor?.gstNumber || "Not available"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-400">
                          Request Approved At
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          {formatDateTime(selectedVendor?.requestApprovedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* TABS */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm"
                >
                  <div className="flex min-w-max gap-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`cursor-pointer relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                            activeTab === tab.id
                              ? "text-white"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {activeTab === tab.id && (
                            <motion.span
                              layoutId="activeVendorTab"
                              className="absolute inset-0 rounded-lg bg-gray-900"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                              }}
                            />
                          )}

                          <Icon size={15} className="relative z-10" />

                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                <AnimatePresence mode="wait">
                  {activeTab === "overview" && (
                    <motion.div
                      key="overview"
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                      }}
                      transition={{
                        duration: 0.3,
                      }}
                      className="mt-6"
                    >
                      {/* STATS */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                          {
                            title: "Total Revenue",
                            value: formatCurrency(selectedStats?.totalRevenue),
                            icon: IndianRupee,
                            description: "Revenue from vendor products",
                          },
                          {
                            title: "Total Orders",
                            value: selectedStats?.totalOrders || 0,
                            icon: ShoppingBag,
                            description: "Orders containing vendor products",
                          },
                          {
                            title: "Products",
                            value: selectedStats?.totalProducts || 0,
                            icon: Package,
                            description: "Products listed by vendor",
                          },
                          {
                            title: "Customers",
                            value: selectedStats?.totalCustomers || 0,
                            icon: Users,
                            description: "Unique customers",
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
                                delay: index * 0.07,
                              }}
                              whileHover={{
                                y: -4,
                              }}
                              className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                            >
                              <div className="flex min-w-0 items-start justify-between gap-3">
                                {/* LEFT */}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-gray-500">
                                    {stat.title}
                                  </p>

                                  {/* NUMBER */}
                                  <h3
                                    className="
                mt-2
                text-lg
                break-all
                font-bold
                leading-tight
                tracking-tight
                tabular-nums
                text-gray-900
                sm:text-xl
                lg:text-xl
              "
                                  >
                                    {stat.value}
                                  </h3>
                                </div>

                                {/* ICON */}
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                  <Icon size={21} />
                                </div>
                              </div>

                              <p className="mt-5 text-xs leading-5 text-gray-400">
                                {stat.description}
                              </p>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* PRODUCT + ORDER SUMMARY */}
                      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold">
                                Product Summary
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                Current vendor product status
                              </p>
                            </div>

                            <Package size={22} className="text-gray-400" />
                          </div>

                          <div className="mt-6 grid grid-cols-2 gap-3">
                            {[
                              {
                                label: "Active",
                                value: selectedStats?.activeProducts || 0,
                                icon: CheckCircle2,
                                className: "bg-emerald-50 text-emerald-700",
                              },
                              {
                                label: "Approved",
                                value: selectedStats?.approvedProducts || 0,
                                icon: CheckCircle2,
                                className: "bg-blue-50 text-blue-700",
                              },
                              {
                                label: "Pending",
                                value: selectedStats?.pendingProducts || 0,
                                icon: Clock3,
                                className: "bg-amber-50 text-amber-700",
                              },
                              {
                                label: "Rejected",
                                value: selectedStats?.rejectedProducts || 0,
                                icon: XCircle,
                                className: "bg-red-50 text-red-700",
                              },
                            ].map((item) => {
                              const Icon = item.icon;

                              return (
                                <div
                                  key={item.label}
                                  className={`rounded-xl p-4 ${item.className}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <Icon size={18} />

                                    <span className="text-xl font-bold">
                                      {item.value}
                                    </span>
                                  </div>

                                  <p className="mt-3 text-xs font-semibold">
                                    {item.label}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* ORDER SUMMARY */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold">
                                Order Summary
                              </h3>

                              <p className="mt-1 text-sm text-gray-500">
                                Orders by current status
                              </p>
                            </div>

                            <ShoppingBag size={22} className="text-gray-400" />
                          </div>

                          <div className="mt-6 space-y-4">
                            {[
                              {
                                label: "Pending",
                                key: "pending",
                              },
                              {
                                label: "Confirmed",
                                key: "confirmed",
                              },
                              {
                                label: "Shipped",
                                key: "shipped",
                              },
                              {
                                label: "Delivered",
                                key: "delivered",
                              },
                              {
                                label: "Cancelled",
                                key: "cancelled",
                              },
                            ].map((item) => {
                              const count = Number(
                                orderStatus?.[item.key] || 0,
                              );

                              const total = Number(
                                selectedStats?.totalOrders || 0,
                              );

                              const percentage =
                                total > 0
                                  ? Math.round((count / total) * 100)
                                  : 0;

                              return (
                                <div key={item.key}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium capitalize text-gray-600">
                                      {item.label}
                                    </span>

                                    <span className="text-sm font-bold">
                                      {count}
                                    </span>
                                  </div>

                                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
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
                                      className="h-full rounded-full bg-gray-900"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* RECENT ORDERS */}
                      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                          <div>
                            <h3 className="text-lg font-bold">Recent Orders</h3>

                            <p className="mt-1 text-sm text-gray-500">
                              Latest orders containing vendor products
                            </p>
                          </div>

                          <button
                            onClick={() => setActiveTab("orders")}
                            className="cursor-pointer flex items-center gap-1 text-sm font-semibold hover:underline"
                          >
                            View all
                            <ArrowUpRight size={16} />
                          </button>
                        </div>

                        {selectedOrders.length === 0 ? (
                          <div className="px-5 py-14 text-center">
                            <ShoppingBag
                              size={35}
                              className="mx-auto text-gray-300"
                            />

                            <p className="mt-3 text-sm font-semibold">
                              No orders found
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              This vendor has no orders yet.
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px]">
                              <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-400">
                                  <th className="px-6 py-4">Customer</th>

                                  <th className="px-6 py-4">Products</th>

                                  <th className="px-6 py-4">Amount</th>

                                  <th className="px-6 py-4">Status</th>

                                  <th className="px-6 py-4">Date</th>
                                </tr>
                              </thead>

                              <tbody>
                                {selectedOrders
                                  .slice(0, 5)
                                  .map((order, index) => (
                                    <motion.tr
                                      key={order?._id}
                                      initial={{
                                        opacity: 0,
                                      }}
                                      animate={{
                                        opacity: 1,
                                      }}
                                      transition={{
                                        delay: index * 0.05,
                                      }}
                                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                    >
                                      <td className="px-6 py-4">
                                        <div>
                                          <p className="text-sm font-bold">
                                            {order?.customer?.name || "Unknown"}
                                          </p>

                                          <p className="mt-0.5 text-xs text-gray-400">
                                            {order?.customer?.email || "—"}
                                          </p>
                                        </div>
                                      </td>

                                      <td className="px-6 py-4">
                                        <div className="space-y-1">
                                          {order?.products
                                            ?.slice(0, 2)
                                            .map((item, itemIndex) => (
                                              <p
                                                key={`${order?._id}-${itemIndex}`}
                                                className="max-w-[220px] truncate text-sm text-gray-600"
                                              >
                                                {item?.product?.title ||
                                                  "Product"}{" "}
                                                × {item?.quantity || 0}
                                              </p>
                                            ))}

                                          {order?.products?.length > 2 && (
                                            <p className="text-xs text-gray-400">
                                              +{order?.products?.length - 2}{" "}
                                              more
                                            </p>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-6 py-4 text-sm font-bold">
                                        {formatCurrency(order?.vendorAmount)}
                                      </td>

                                      <td className="px-6 py-4">
                                        <span
                                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getOrderStatusClass(
                                            order?.orderStatus,
                                          )}`}
                                        >
                                          {order?.orderStatus || "unknown"}
                                        </span>
                                      </td>

                                      <td className="px-6 py-4 text-xs text-gray-400">
                                        {formatDate(order?.createdAt)}
                                      </td>
                                    </motion.tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* ORDERS */}
                  {activeTab === "orders" && (
                    <motion.div
                      key="orders"
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                      }}
                      className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="border-b border-gray-100 p-5 sm:p-6">
                        <h3 className="text-lg font-bold">All Vendor Orders</h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Orders containing products from{" "}
                          {selectedVendor?.shopName || selectedVendor?.name}
                        </p>
                      </div>

                      {selectedOrders.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                          <ShoppingBag
                            size={40}
                            className="mx-auto text-gray-300"
                          />

                          <h3 className="mt-4 font-bold">No Orders</h3>

                          <p className="mt-1 text-sm text-gray-400">
                            No order has been placed for this vendor.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[950px]">
                            <thead>
                              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-400">
                                <th className="px-6 py-4">Customer</th>

                                <th className="px-6 py-4">Products</th>

                                <th className="px-6 py-4">Vendor Amount</th>

                                <th className="px-6 py-4">Payment</th>

                                <th className="px-6 py-4">Order Status</th>

                                <th className="px-6 py-4">Date</th>
                              </tr>
                            </thead>

                            <tbody>
                              {selectedOrders.map((order, index) => (
                                <motion.tr
                                  key={order?._id}
                                  initial={{
                                    opacity: 0,
                                    x: -10,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    x: 0,
                                  }}
                                  transition={{
                                    delay: index * 0.04,
                                  }}
                                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                                        <User size={16} />
                                      </div>

                                      <div>
                                        <p className="text-sm font-bold">
                                          {order?.customer?.name ||
                                            "Unknown Customer"}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                          {order?.customer?.email || "—"}
                                        </p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-6 py-4">
                                    <div className="space-y-2">
                                      {order?.products?.map(
                                        (item, itemIndex) => (
                                          <div
                                            key={`${order?._id}-${itemIndex}`}
                                            className="flex items-center gap-2"
                                          >
                                            <div className="h-8 w-8 overflow-hidden rounded-lg bg-gray-100">
                                              {item?.product?.image ? (
                                                <img
                                                  src={item?.product?.image}
                                                  alt=""
                                                  className="h-full w-full object-cover"
                                                />
                                              ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                  <Package size={14} />
                                                </div>
                                              )}
                                            </div>

                                            <div className="min-w-0">
                                              <p className="max-w-[230px] truncate text-sm font-medium">
                                                {item?.product?.title ||
                                                  "Product"}
                                              </p>

                                              <p className="text-xs text-gray-400">
                                                Qty: {item?.quantity || 0}
                                              </p>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </td>

                                  <td className="px-6 py-4 text-sm font-bold">
                                    {formatCurrency(order?.vendorAmount)}
                                  </td>

                                  <td className="px-6 py-4">
                                    <div>
                                      <p className="text-sm font-semibold capitalize">
                                        {order?.paymentMethod || "—"}
                                      </p>

                                      <p
                                        className={`mt-1 text-xs font-semibold capitalize ${
                                          order?.paymentStatus === "paid"
                                            ? "text-emerald-600"
                                            : order?.paymentStatus === "failed"
                                              ? "text-red-600"
                                              : "text-amber-600"
                                        }`}
                                      >
                                        {order?.paymentStatus || "pending"}
                                      </p>
                                    </div>
                                  </td>

                                  <td className="px-6 py-4">
                                    <span
                                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getOrderStatusClass(
                                        order?.orderStatus,
                                      )}`}
                                    >
                                      {order?.orderStatus || "unknown"}
                                    </span>
                                  </td>

                                  <td className="px-6 py-4 text-xs text-gray-400">
                                    {formatDateTime(order?.createdAt)}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* PRODUCTS */}
                  {activeTab === "products" && (
                    <motion.div
                      key="products"
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                      }}
                      className="mt-6"
                    >
                      <div className="mb-5">
                        <h3 className="text-lg font-bold">Vendor Products</h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {selectedProducts.length} products listed by this
                          vendor
                        </p>
                      </div>

                      {selectedProducts.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center">
                          <Package
                            size={40}
                            className="mx-auto text-gray-300"
                          />

                          <h3 className="mt-4 font-bold">No Products</h3>

                          <p className="mt-1 text-sm text-gray-400">
                            This vendor has not added any products.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {selectedProducts.map((product, index) => {
                            const image = product?.productImg?.[0];

                            const rating =
                              Array.isArray(product?.reviews) &&
                              product?.reviews?.length
                                ? (
                                    product.reviews.reduce(
                                      (total, review) =>
                                        total + Number(review?.rating || 0),
                                      0,
                                    ) / product.reviews.length
                                  ).toFixed(1)
                                : 0;

                            return (
                              <motion.div
                                key={product?._id}
                                initial={{
                                  opacity: 0,
                                  y: 20,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                transition={{
                                  delay: index * 0.05,
                                }}
                                whileHover={{
                                  y: -5,
                                }}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                              >
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={product?.title || "Product"}
                                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                                      <Package size={45} />
                                    </div>
                                  )}

                                  <span
                                    className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getProductStatusClass(
                                      product?.verificationStatus,
                                    )}`}
                                  >
                                    {product?.verificationStatus || "unknown"}
                                  </span>

                                  {product?.isActive === true && (
                                    <span className="absolute bottom-3 left-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                                      Active
                                    </span>
                                  )}
                                </div>

                                <div className="p-4">
                                  <p className="text-xs text-gray-400">
                                    {product?.category || "Uncategorized"}
                                  </p>

                                  <h4 className="mt-1 line-clamp-2 min-h-[48px] font-bold">
                                    {product?.title || "Unnamed Product"}
                                  </h4>

                                  <div className="mt-3 flex items-center justify-between">
                                    <span className="text-lg font-bold">
                                      {formatCurrency(product?.price)}
                                    </span>

                                    <span className="flex items-center gap-1 text-xs font-semibold">
                                      <Star
                                        size={13}
                                        fill="currentColor"
                                        className="text-amber-500"
                                      />

                                      {rating}
                                    </span>
                                  </div>

                                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                                    <div className="rounded-lg bg-gray-50 p-2.5">
                                      <p className="text-[10px] text-gray-400">
                                        Stock
                                      </p>

                                      <p
                                        className={`mt-0.5 text-sm font-bold ${
                                          Number(product?.stock || 0) <= 10
                                            ? "text-red-600"
                                            : "text-gray-900"
                                        }`}
                                      >
                                        {product?.stock || 0}
                                      </p>
                                    </div>

                                    <div className="rounded-lg bg-gray-50 p-2.5">
                                      <p className="text-[10px] text-gray-400">
                                        Reviews
                                      </p>

                                      <p className="mt-0.5 text-sm font-bold">
                                        {Array.isArray(product?.reviews)
                                          ? product?.reviews?.length
                                          : 0}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ACTIVITY */}
                  {activeTab === "activity" && (
                    <motion.div
                      key="activity"
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -10,
                      }}
                      className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
                    >
                      <div>
                        <h3 className="text-lg font-bold">Vendor Activity</h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Activity generated from real vendor data
                        </p>
                      </div>

                      <div className="relative mt-8">
                        <div className="absolute bottom-0 left-[18px] top-0 w-px bg-gray-200" />

                        <div className="space-y-8">
                          {/* Vendor Created */}

                          <motion.div
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            className="relative flex gap-5"
                          >
                            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                              <User size={16} />
                            </div>

                            <div className="pt-1">
                              <h4 className="text-sm font-bold">
                                Vendor account created
                              </h4>

                              <p className="mt-1 text-sm text-gray-500">
                                Vendor account was registered on the platform.
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {formatDateTime(selectedVendor?.createdAt)}
                              </p>
                            </div>
                          </motion.div>

                          {/* Request */}

                          <motion.div
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay: 0.08,
                            }}
                            className="relative flex gap-5"
                          >
                            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                              <Clock3 size={16} />
                            </div>

                            <div className="pt-1">
                              <h4 className="text-sm font-bold">
                                Vendor request
                              </h4>

                              <p className="mt-1 text-sm text-gray-500">
                                Current approval status:{" "}
                                <span className="font-semibold capitalize">
                                  {selectedVendor?.approvalStatus || "unknown"}
                                </span>
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                {formatDateTime(selectedVendor?.requestSentAt)}
                              </p>
                            </div>
                          </motion.div>

                          {/* Approval */}

                          {selectedVendor?.requestApprovedAt && (
                            <motion.div
                              initial={{
                                opacity: 0,
                                x: -15,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              transition={{
                                delay: 0.16,
                              }}
                              className="relative flex gap-5"
                            >
                              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm">
                                <CheckCircle2 size={16} />
                              </div>

                              <div className="pt-1">
                                <h4 className="text-sm font-bold">
                                  Vendor approved
                                </h4>

                                <p className="mt-1 text-sm text-gray-500">
                                  Vendor approval was completed.
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {formatDateTime(
                                    selectedVendor?.requestApprovedAt,
                                  )}
                                </p>
                              </div>
                            </motion.div>
                          )}

                          {/* Products */}

                          <motion.div
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay: 0.24,
                            }}
                            className="relative flex gap-5"
                          >
                            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                              <Package size={16} />
                            </div>

                            <div className="pt-1">
                              <h4 className="text-sm font-bold">
                                Products listed
                              </h4>

                              <p className="mt-1 text-sm text-gray-500">
                                Vendor currently has{" "}
                                <span className="font-semibold">
                                  {selectedStats?.totalProducts || 0}
                                </span>{" "}
                                products.
                              </p>

                              <button
                                onClick={() => setActiveTab("products")}
                                className="mt-2 flex items-center gap-1 text-xs font-semibold hover:underline"
                              >
                                View products
                                <ArrowUpRight size={13} />
                              </button>
                            </div>
                          </motion.div>

                          {/* Orders */}

                          <motion.div
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay: 0.32,
                            }}
                            className="relative flex gap-5"
                          >
                            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                              <ShoppingBag size={16} />
                            </div>

                            <div className="pt-1">
                              <h4 className="text-sm font-bold">
                                Orders received
                              </h4>

                              <p className="mt-1 text-sm text-gray-500">
                                Total{" "}
                                <span className="font-semibold">
                                  {selectedStats?.totalOrders || 0}
                                </span>{" "}
                                orders containing vendor products.
                              </p>

                              <button
                                onClick={() => setActiveTab("orders")}
                                className="mt-2 flex items-center gap-1 text-xs font-semibold hover:underline"
                              >
                                View orders
                                <ArrowUpRight size={13} />
                              </button>
                            </div>
                          </motion.div>

                          {/* Revenue */}

                          <motion.div
                            initial={{
                              opacity: 0,
                              x: -15,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            transition={{
                              delay: 0.4,
                            }}
                            className="relative flex gap-5"
                          >
                            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                              <IndianRupee size={16} />
                            </div>

                            <div className="pt-1">
                              <h4 className="text-sm font-bold">
                                Revenue generated
                              </h4>

                              <p className="mt-1 text-sm text-gray-500">
                                Total vendor revenue is{" "}
                                <span className="font-semibold">
                                  {formatCurrency(selectedStats?.totalRevenue)}
                                </span>
                                .
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default VendorDetails;
