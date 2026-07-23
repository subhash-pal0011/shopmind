"use client";
import React, { useEffect } from "react";
import VendorDashBoard from "./VendorDashBoard";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const VendorPage = ({ user }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      shopName: user?.shopName || "",
      phone: user?.phone || "",
      gstNumber: user?.gstNumber || "",
      email: user?.email || "",
      address: user?.shopAddress || "",
    },
  });

  const [showForm, setShowForm] = React.useState(false);


  const onSubmit = async (data) => {
    if(!data.shopName ||  !data.gstNumber || !data.address) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.post("/api/vendor/updateVendorInformation", {
        shopName: data.shopName,
        phone: data.phone,
        gstNumber: data.gstNumber,
        email: data.email,
        address: data.address,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        reset();
        setShowForm(false);
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server Error");
    }
  };
  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center">
        <img src="/Loading.gif" alt="Loading" className="w-24 h-24" />
      </div>
    );
  } else if (user.approvalStatus === "approved") {
    return (
      <div>
        <VendorDashBoard />
      </div>
    );
  } else if (user.approvalStatus === "rejected") {
    return (
      <div className="bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-2">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              key="rejected-card"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -250, scale: 0.92 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            >
              {/* Header */}
              <div className="bg-red-600 p-5 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
                  <span className="text-5xl">❌</span>
                </div>

                <h1 className="text-xl md:text-3xl font-bold text-white mt-5">
                  Vendor Request Rejected
                </h1>

                <p className="text-red-100 mt-2 text-center">
                  Unfortunately, your vendor application was not approved.
                </p>
              </div>

              <div className="p-5">
                <div className="bg-red-50 border rounded-xl p-5">
                  <p className="font-semibold text-red-700">
                    Application Status
                  </p>

                  <p className="mt-2">Rejected</p>
                </div>

                <div className="mt-5 bg-gray-50 rounded-xl border p-5">
                  <h3 className="font-semibold">Rejection Reason</h3>

                  <p className="mt-2">{user.rejectionReason}</p>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white cursor-pointer"
                  >
                    Update Information
                  </button>

                  <button className="flex-1 py-3 rounded-xl border cursor-pointer">
                    Contact Support
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.form
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8"
              key="update-form"
              initial={{ y: "100vh", opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 12 }}
            >
              <h1 className="text-3xl font-bold">Update Vendor Information</h1>

              <p className="text-gray-500 mt-2 mb-8">
                Update your details and submit your request again.
              </p>

              <div className="grid md:grid-cols-2 gap-5">
                <input
                  className="border rounded-xl h-12 p-4"
                  defaultValue={user.shopName || ""}
                  placeholder="Shop Name"
                />

                <input
                  className="border rounded-xl h-12 p-4"
                  defaultValue={user.phone || ""}
                  placeholder="Phone"
                />

                <input
                  className="border rounded-xl h-12 p-4"
                  defaultValue={user.gstNumber || ""}
                  placeholder="GST Number"
                />

                <input
                  className="border rounded-xl h-12 p-4"
                  defaultValue={user.email || ""}
                  placeholder="Email"
                />

                <input
                  className="border rounded-xl h-12 p-4"
                  defaultValue={user.shopAddress || ""}
                  placeholder="Address"
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
                >
                  Back
                </button>

                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition"
                >
                  {isSubmitting ? "Submitting..." : "Submit Again"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }
};

export default VendorPage;
