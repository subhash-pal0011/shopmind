"use client";

import React, { useEffect, useState } from "react";
import VendorDashBoard from "./VendorDashBoard";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const VendorPage = ({ user }) => {
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // ==========================================
  // USER DATA CHANGE HONE PAR FORM RESET
  // ==========================================

  useEffect(() => {
    if (user) {
      reset({
        shopName: user?.shopName || "",
        phone: user?.phone || "",
        gstNumber: user?.gstNumber || "",
        email: user?.email || "",
        address: user?.shopAddress || "",
      });
    }
  }, [user, reset]);

  // ==========================================
  // UPDATE VENDOR INFORMATION
  // ==========================================

  const onSubmit = async (data) => {
    if (
      !data.shopName?.trim() ||
      !data.gstNumber?.trim() ||
      !data.address?.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const res = await axios.post(
        "/api/vendor/updateVendorInformation",
        {
          shopName: data.shopName.trim(),
          phone: data.phone?.trim() || "",
          gstNumber: data.gstNumber.trim(),
          email: data.email?.trim() || "",
          address: data.address.trim(),
        }
      );

      if (res?.data?.success) {
        toast.success(
          res.data.message || "Information updated successfully"
        );

        setShowForm(false);

        // Form ko updated values ke saath reset kar do
        reset(data);

        // Agar API updated user return karti hai,
        // to yahan parent se user refresh karwana better hoga.
      } else {
        toast.error(
          res?.data?.message || "Unable to update information"
        );
      }
    } catch (error) {
      console.error("Update vendor error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Server Error. Please try again."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
        <img
          src="/Loading.gif"
          alt="Loading"
          className="w-24 h-24 object-contain"
        />

        <p className="mt-3 text-gray-500">
          Loading vendor information...
        </p>
      </div>
    );
  }


  // ==========================================
  // APPROVED
  // ==========================================

  if (
    user?.approvalStatus?.toLowerCase() === "approved"
  ) {
    return (
      <div className="min-h-screen w-full">
        <VendorDashBoard />
      </div>
    );
  }

  // ==========================================
  // REJECTED
  // ==========================================

  if (
    user?.approvalStatus?.toLowerCase() === "rejected"
  ) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">

        <AnimatePresence mode="wait">

          {!showForm ? (
            // ====================================
            // REJECTED CARD
            // ====================================

            <motion.div
              key="rejected-card"
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              initial={{
                opacity: 0,
                y: 80,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -100,
                scale: 0.95,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >

              {/* HEADER */}

              <div className="bg-red-600 p-6 flex flex-col items-center">

                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <span className="text-5xl">
                    ❌
                  </span>
                </div>

                <h1 className="text-xl md:text-3xl font-bold text-white mt-5 text-center">
                  Vendor Request Rejected
                </h1>

                <p className="text-red-100 mt-2 text-center">
                  Unfortunately, your vendor application was not approved.
                </p>

              </div>

              {/* BODY */}

              <div className="p-6">

                {/* STATUS */}

                <div className="bg-red-50 border border-red-200 rounded-xl p-5">

                  <p className="font-semibold text-red-700">
                    Application Status
                  </p>

                  <p className="mt-2 text-red-600 font-medium">
                    Rejected
                  </p>

                </div>

                {/* REJECTION REASON */}

                <div className="mt-5 bg-gray-50 rounded-xl border border-gray-200 p-5">

                  <h3 className="font-semibold text-gray-800">
                    Rejection Reason
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {user?.rejectionReason ||
                      "No rejection reason was provided."}
                  </p>

                </div>

                {/* BUTTON */}

                <div className="mt-6">

                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition font-semibold"
                  >
                    Update Information
                  </button>

                </div>

              </div>

            </motion.div>
          ) : (
            // ====================================
            // UPDATE FORM
            // ====================================

            <motion.form
              key="update-form"
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 md:p-8"
              initial={{
                y: "100vh",
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              exit={{
                y: "100vh",
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 70,
                damping: 12,
              }}
            >

              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Update Vendor Information
              </h1>

              <p className="text-gray-500 mt-2 mb-8">
                Update your details and submit your request again.
              </p>

              <div className="grid md:grid-cols-2 gap-5">

                {/* SHOP NAME */}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Shop Name *
                  </label>

                  <input
                    type="text"
                    placeholder="Shop Name"
                    className={`w-full border rounded-xl h-12 px-4 outline-none focus:border-blue-500 ${
                      errors.shopName
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    {...register("shopName", {
                      required: "Shop name is required",
                      validate: (value) =>
                        value.trim().length > 0 ||
                        "Shop name cannot be empty",
                    })}
                  />

                  {errors.shopName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shopName.message}
                    </p>
                  )}
                </div>

                {/* PHONE */}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Phone
                  </label>

                  <input
                    type="text"
                    placeholder="Phone"
                    className="w-full border border-gray-300 rounded-xl h-12 px-4 outline-none focus:border-blue-500"
                    {...register("phone")}
                  />
                </div>

                {/* GST */}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    GST Number *
                  </label>

                  <input
                    type="text"
                    placeholder="GST Number"
                    className={`w-full border rounded-xl h-12 px-4 outline-none focus:border-blue-500 uppercase ${
                      errors.gstNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    {...register("gstNumber", {
                      required: "GST number is required",
                      validate: (value) =>
                        value.trim().length > 0 ||
                        "GST number cannot be empty",
                    })}
                  />

                  {errors.gstNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.gstNumber.message}
                    </p>
                  )}
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full border border-gray-300 rounded-xl h-12 px-4 outline-none focus:border-blue-500"
                    {...register("email")}
                  />
                </div>

                {/* ADDRESS */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Address *
                  </label>

                  <textarea
                    placeholder="Shop Address"
                    rows={4}
                    className={`w-full border rounded-xl p-4 outline-none resize-none focus:border-blue-500 ${
                      errors.address
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    {...register("address", {
                      required: "Address is required",
                      validate: (value) =>
                        value.trim().length > 0 ||
                        "Address cannot be empty",
                    })}
                  />

                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address.message}
                    </p>
                  )}

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col md:flex-row gap-4 mt-8">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-300 cursor-pointer bg-gray-100 hover:bg-gray-200 transition font-semibold"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white cursor-pointer hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition font-semibold"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Again"}
                </button>

              </div>

            </motion.form>
          )}

        </AnimatePresence>

      </div>
    );
  }

  // ==========================================
  // PENDING / OTHER STATUS
  // ==========================================

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-white to-orange-100 flex items-center justify-center p-4">

      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >

        {/* HEADER */}

        <div className="bg-yellow-500 p-6 flex flex-col items-center">

          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">

            <span className="text-5xl">
              ⏳
            </span>

          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white mt-5 text-center">
            Vendor Request Pending
          </h1>

          <p className="text-yellow-50 mt-2 text-center">
            Your vendor application is currently under review.
          </p>

        </div>

        {/* BODY */}

        <div className="p-6">

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">

            <p className="font-semibold text-yellow-700">
              Application Status
            </p>

            <p className="mt-2 text-yellow-600 font-medium capitalize">
              {user?.approvalStatus || "Pending"}
            </p>

          </div>

          <div className="mt-5 bg-gray-50 rounded-xl border p-5">

            <h3 className="font-semibold text-gray-800">
              What happens next?
            </h3>

            <p className="mt-2 text-gray-600 leading-6">
              Your vendor application has been submitted successfully.
              Please wait while our admin reviews your information.
              Once your request is approved, your vendor dashboard
              will become available.
            </p>

          </div>

          {/* CURRENT STATUS FOR DEBUG */}

          <div className="mt-5 text-center text-xs text-gray-400">
            Status: {user?.approvalStatus || "undefined"}
          </div>

        </div>

      </motion.div>

    </div>
  );
};

export default VendorPage;
