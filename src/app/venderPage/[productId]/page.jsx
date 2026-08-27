"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { IoArrowBack } from "react-icons/io5";
import {
  ArrowLeft,
  Package,
  IndianRupee,
  Boxes,
  Tag,
  Truck,
  CreditCard,
  ShieldCheck,
  RotateCcw,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  Trash2,
  Pencil,
  Save,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Page = ({ params }) => {
  const { productId } = React.use(params);
  const router = useRouter();

  const allVendorProducts = useSelector(
    (state) => state.vendorUser?.allVendorProduct || [],
  );

  const product = allVendorProducts.find(
    (item) => String(item._id) === String(productId),
  );

  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isLoading =
    !Array.isArray(allVendorProducts) ||
    (allVendorProducts.length === 0 && product === undefined);

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const startEdit = (field) => {
    setEditing(field);

    let value = product?.[field];

    if (value === null || value === undefined) {
      value = "";
    }

    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  const handleUpdate = async () => {
    if (!editing) return;

    try {
      setSaving(true);

      let value = editValue;

      // Number fields
      if (
        editing === "price" ||
        editing === "stock" ||
        editing === "replaceDay"
      ) {
        value = Number(value);

        if (Number.isNaN(value)) {
          alert("Please enter a valid number");
          return;
        }

        if (value < 0) {
          alert("Value cannot be negative");
          return;
        }
      }

      /*
       * ==================================================
       * APNI UPDATE API YAHA LAGAO
       * ==================================================
       *
       * const res = await fetch(
       *   `/api/vendor/product/${productId}`,
       *   {
       *     method: "PUT",
       *     headers: {
       *       "Content-Type": "application/json",
       *     },
       *     body: JSON.stringify({
       *       [editing]: value,
       *     }),
       *   }
       * );
       *
       * const data = await res.json();
       *
       * if (!res.ok) {
       *   throw new Error(data.message || "Update failed");
       * }
       */

      console.log("UPDATE:", {
        productId,
        field: editing,
        value,
      });

      // Temporary loader
      await new Promise((resolve) => setTimeout(resolve, 800));

      setEditing(null);
      setEditValue("");

      /*
       * API successful hone ke baad
       * Redux state bhi update karna.
       */
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      /*
       * ==================================================
       * APNI DELETE API YAHA LAGAO
       * ==================================================
       *
       * const res = await fetch(
       *   `/api/vendor/product/${productId}`,
       *   {
       *     method: "DELETE",
       *   }
       * );
       *
       * const data = await res.json();
       *
       * if (!res.ok) {
       *   throw new Error(data.message || "Delete failed");
       * }
       */

      console.log("DELETE PRODUCT:", productId);

      await new Promise((resolve) => setTimeout(resolve, 800));

      setDeleteOpen(false);

      window.location.href = "/";
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const status =
    product?.verificationStatus === "approved"
      ? {
          text: "Approved",
          icon: CheckCircle2,
          className: "border-emerald-200 bg-emerald-50 text-emerald-600",
        }
      : product?.verificationStatus === "rejected"
        ? {
            text: "Rejected",
            icon: XCircle,
            className: "border-red-200 bg-red-50 text-red-600",
          }
        : {
            text: "Pending",
            icon: Clock3,
            className: "border-amber-200 bg-amber-50 text-amber-600",
          };

  const StatusIcon = status.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="mb-6 h-10 w-52 rounded-2xl bg-slate-200" />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-137] rounded-3xl bg-white" />

              <div className="space-y-5 lg:col-span-2">
                <div className="h-56 rounded-3xl bg-white" />
                <div className="h-56 rounded-3xl bg-white" />
                <div className="h-56 rounded-3xl bg-white" />
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            Loading product...
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={32} />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-800">
            Product Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This product doesn't exist or has been removed.
          </p>

          <p className="mt-4 break-all rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-400">
            {productId}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            <ArrowLeft size={16} />
            Go Back
          </Link>
        </motion.div>
      </div>
    );
  }

  const image = product.productImg?.[0];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50/50 p-3 sm:p-5">
      <div className="mx-auto max-w-7xl">
        {/* ================= HEADER ================= */}

        <button
          type="button"
          onClick={() => router.back()}
          className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-500 hover:bg-slate-50 hover:border-blue-500 transition-all duration-300 hover:text-gray-800"
        >
          <IoArrowBack size={18} />
          <span className="text-xs">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 mt-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                <Package size={15} />
                Product Management
              </div>

              <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                Product Details
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Click on any editable information to update it.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${status.className}`}
              >
                <StatusIcon size={15} />
                {status.text}
              </div>

              <button
                onClick={() => setDeleteOpen(true)}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-100"
              >
                <Trash2 size={15} />
                <span className="hidden sm:block">Delete</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ================= MAIN ================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ================= IMAGE CARD ================= */}

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                {image ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    src={image}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-300">
                    <Package size={70} />
                  </div>
                )}

                <div className="absolute left-4 top-4 rounded-xl bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur">
                  {product.productImg?.length || 0} Images
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-[10px] font-black uppercase text-blue-600">
                    {product.category}
                  </span>

                  <span
                    className={`rounded-lg px-3 py-1 text-[10px] font-black ${
                      product.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {product.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                {/* TITLE */}

                <div
                  className={`mt-4 rounded-2xl border p-4 ${
                    editing === "title"
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-slate-400" />

                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Product Title
                      </span>
                    </div>

                    {editing !== "title" && (
                      <button
                        onClick={() => startEdit("title")}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-blue-600"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>

                  {editing === "title" ? (
                    <div className="mt-3">
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full rounded-xl border border-blue-200 bg-white px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
                        >
                          <X size={14} />
                          Cancel
                        </button>

                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                        >
                          {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Save size={14} />
                          )}
                          {saving ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-black leading-6 text-slate-800">
                      {product.title}
                    </p>
                  )}
                </div>

                {/* PRICE / STOCK */}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div
                    onClick={() => startEdit("price")}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      editing === "price"
                        ? "border-blue-300 bg-blue-50"
                        : "border-blue-100 bg-blue-50 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-blue-400">
                        Price
                      </p>

                      {editing !== "price" && (
                        <Pencil size={13} className="text-blue-400" />
                      )}
                    </div>

                    {editing === "price" ? (
                      <input
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-2 py-2 text-lg font-black text-blue-600 outline-none"
                      />
                    ) : (
                      <p className="mt-1 flex items-center text-xl font-black text-blue-600">
                        <IndianRupee size={17} />
                        {Number(product.price || 0).toFixed(2)}
                      </p>
                    )}

                    {editing === "price" && (
                      <div className="mt-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                          className="rounded-lg bg-white p-2 text-slate-500"
                        >
                          <X size={13} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdate();
                          }}
                          disabled={saving}
                          className="rounded-lg bg-blue-600 p-2 text-white"
                        >
                          {saving ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Save size={13} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => startEdit("stock")}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      editing === "stock"
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-emerald-100 bg-emerald-50 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-emerald-500">
                        Stock
                      </p>

                      {editing !== "stock" && (
                        <Pencil size={13} className="text-emerald-500" />
                      )}
                    </div>

                    {editing === "stock" ? (
                      <input
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 w-full rounded-lg border border-emerald-200 bg-white px-2 py-2 text-lg font-black text-emerald-600 outline-none"
                      />
                    ) : (
                      <p className="mt-1 text-xl font-black text-emerald-600">
                        {product.stock}
                      </p>
                    )}

                    {editing === "stock" && (
                      <div className="mt-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                          className="rounded-lg bg-white p-2 text-slate-500"
                        >
                          <X size={13} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdate();
                          }}
                          disabled={saving}
                          className="rounded-lg bg-emerald-600 p-2 text-white"
                        >
                          {saving ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Save size={13} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ================= RIGHT CONTENT ================= */}

          <div className="space-y-6 lg:col-span-2">
            {/* BASIC INFORMATION */}

            <motion.section
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/30 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Package size={20} />
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    Basic Information
                  </h2>

                  <p className="text-xs text-slate-400">
                    Click information to edit
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* PRICE */}

                <div
                  className={`rounded-2xl border p-4 ${
                    editing === "price"
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-100 bg-slate-50 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IndianRupee size={15} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Product Price
                      </span>
                    </div>

                    {editing !== "price" && (
                      <button
                        onClick={() => startEdit("price")}
                        className="cursor-pointer text-slate-400 hover:text-blue-600"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>

                  {editing === "price" ? (
                    <>
                      <input
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-blue-200 bg-white px-3 py-3 font-bold outline-none"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-xl border bg-white px-3 py-2 text-xs font-bold"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          {saving && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          {saving ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-lg font-black text-blue-600">
                      ₹{Number(product.price || 0).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* STOCK */}

                <div
                  className={`rounded-2xl border p-4 ${
                    editing === "stock"
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-100 bg-slate-50 hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Boxes size={15} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Stock Quantity
                      </span>
                    </div>

                    {editing !== "stock" && (
                      <button
                        onClick={() => startEdit("stock")}
                        className="cursor-pointer text-slate-400 hover:text-emerald-600"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>

                  {editing === "stock" ? (
                    <>
                      <input
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 font-bold outline-none"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-xl border bg-white px-3 py-2 text-xs font-bold"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          {saving && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          {saving ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-lg font-black text-slate-700">
                      {product.stock}
                    </p>
                  )}
                </div>

                {/* CATEGORY */}

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-slate-400" />

                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Category
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-700">
                    {product.category}
                  </p>
                </div>

                {/* CREATED */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-slate-400" />

                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Created
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-700">
                    {formatDate(product.createdAt)}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* rejectedReason */}
            {product?.rejectedReason && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="mt-4 rounded-xl border border-red-200 bg-linear-to-br from-red-50 to-rose-50 p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <span className="text-lg">!</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-red-600">
                        Product Rejected
                      </p>

                      <span className="rounded-full bg-red-100 px-2 py-1 text-[9px] font-semibold text-red-600">
                        Rejected
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] font-medium text-red-400">
                      Admin feedback
                    </p>

                    <div className="mt-2 rounded-lg border border-red-100 bg-white/70 p-3">
                      <p className="text-xs leading-5 text-red-700">
                        {product.rejectedReason}
                      </p>
                    </div>

                    <p className="mt-2 text-[10px] text-red-400">
                      Please update your product according to the above feedback
                      and resubmit it for verification.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* DESCRIPTION */}
            <motion.section
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h2 className="font-black text-slate-800">Description</h2>

                  <p className="text-xs text-slate-400">
                    Click edit to update description
                  </p>
                </div>
              </div>

              <div
                className={`mt-5 rounded-2xl border p-5 ${
                  editing === "description"
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Product Description
                  </span>

                  {editing !== "description" && (
                    <button
                      onClick={() => startEdit("description")}
                      className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-white hover:text-indigo-600"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                {editing === "description" ? (
                  <>
                    <textarea
                      autoFocus
                      rows={6}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="mt-3 w-full resize-none rounded-xl border border-indigo-200 bg-white p-3 text-sm leading-6 text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100"
                    />

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
                      >
                        <X size={14} />
                        Cancel
                      </button>

                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
                      >
                        {saving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )}

                        {saving ? "Updating..." : "Update"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {product.description || "No description available."}
                  </p>
                )}
              </div>
            </motion.section>

            {/* PRODUCT OPTIONS */}

            <motion.section
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h2 className="font-black text-slate-800">Product Options</h2>

                  <p className="text-xs text-slate-400">
                    Size, warranty and customer options
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* SIZE */}

                <div
                  className={`rounded-2xl border p-4 ${
                    editing === "size"
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-slate-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Size
                      </span>
                    </div>

                    {editing !== "size" && (
                      <button
                        onClick={() => startEdit("size")}
                        className="cursor-pointer text-slate-400 hover:text-blue-600"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>

                  {editing === "size" ? (
                    <>
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-blue-200 bg-white px-3 py-3 text-sm font-bold outline-none"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-xl border bg-white px-3 py-2 text-xs font-bold"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          {saving && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          {saving ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      {product.size || "Not specified"}
                    </p>
                  )}
                </div>

                {/* WARRANTY */}

                <div
                  className={`rounded-2xl border p-4 ${
                    editing === "warranty"
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-slate-400" />

                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Warranty
                      </span>
                    </div>

                    {editing !== "warranty" && (
                      <button
                        onClick={() => startEdit("warranty")}
                        className="cursor-pointer text-slate-400 hover:text-emerald-600"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>

                  {editing === "warranty" ? (
                    <>
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 text-sm font-bold outline-none"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-xl border bg-white px-3 py-2 text-xs font-bold"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          {saving && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          {saving ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      {product.warranty || "No warranty"}
                    </p>
                  )}
                </div>

                {/* FREE DELIVERY */}

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-slate-400" />

                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Free Delivery
                    </span>
                  </div>

                  <p
                    className={`mt-2 text-sm font-black ${
                      product.freeDelivery
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {product.freeDelivery ? "Enabled" : "Disabled"}
                  </p>
                </div>

                {/* COD */}

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={15} className="text-slate-400" />

                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Pay on Delivery
                    </span>
                  </div>

                  <p
                    className={`mt-2 text-sm font-black ${
                      product.payOnDelivery
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {product.payOnDelivery ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* REPLACEMENT */}
            <motion.section
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h2 className="font-black text-slate-800">Replacement</h2>

                  <p className="text-xs text-slate-400">Customer protection</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* REPLACEMENT DAYS */}

                <div
                  className={`rounded-2xl border p-4 ${
                    editing === "replaceDay"
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={15} className="text-slate-400" />

                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Replacement Days
                      </span>
                    </div>

                    {editing !== "replaceDay" && (
                      <button
                        onClick={() => startEdit("replaceDay")}
                        className="cursor-pointer text-slate-400 hover:text-emerald-600"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>

                  {editing === "replaceDay" ? (
                    <>
                      <input
                        autoFocus
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-3 py-3 font-bold outline-none"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={cancelEdit}
                          className="rounded-xl border bg-white px-3 py-2 text-xs font-bold"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          {saving && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
                          {saving ? "Updating..." : "Update"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm font-black text-slate-700">
                      {product.replaceDay
                        ? `${product.replaceDay} Days`
                        : "Not available"}
                    </p>
                  )}
                </div>

                {/* VERIFICATION */}

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-slate-400" />

                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Verification
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-black capitalize text-amber-600">
                    {product.verificationStatus}
                  </p>
                </div>
              </div>
            </motion.section>

            {/* HIGHLIGHTS */}
            <motion.section
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Sparkles size={20} />
                </div>

                <div>
                  <h2 className="font-black text-slate-800">
                    Product Highlights
                  </h2>

                  <p className="text-xs text-slate-400">
                    {product.detailsPoint?.length || 0} selling points
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {product.detailsPoint?.length ? (
                  product.detailsPoint.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                        <CheckCircle2 size={15} />
                      </div>

                      <p className="text-sm font-semibold leading-6 text-slate-700">
                        {point}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No highlights available.
                  </p>
                )}
              </div>
            </motion.section>

            {/* META */}
            <motion.section
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl sm:p-6"
            >
              <div className="flex items-center gap-3">
                <Package size={20} />

                <div>
                  <p className="text-sm font-black">Product ID</p>

                  <p className="mt-1 break-all font-mono text-xs text-white/40">
                    {product._id}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Vendor
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-white/70">
                    {product.vendorUser || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Request Date
                  </p>

                  <p className="mt-2 text-sm font-bold text-white/70">
                    {formatDate(product.requestAt)}
                  </p>
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </div>

      {/* ================= DELETE MODAL ================= */}

      <AnimatePresence>
        {deleteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setDeleteOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="bg-linear-to-br from-red-50 to-white p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <Trash2 size={25} />
                </div>

                <h2 className="mt-5 text-xl font-black text-slate-800">
                  Delete Product?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Are you sure you want to delete this product?
                </p>

                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-black text-red-700">
                    {product.title}
                  </p>

                  <p className="mt-1 break-all font-mono text-[11px] text-red-400">
                    ID: {product._id}
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    disabled={deleting}
                    onClick={() => setDeleteOpen(false)}
                    className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;
