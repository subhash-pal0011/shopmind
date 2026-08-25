"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";
import { socketConnection, disconnectSocket } from "@/lib/socketConnection";
import { toast } from "sonner";
import { CircleCheckBig } from "lucide-react";
import { useForm } from "react-hook-form";

const VendorApproval = () => {
  const [allVendorUserData, setAllVendorUserData] = useState([]);
  const [statusApproveLoding, setStatusApproveLoding] = useState(false);
  const [showRejectRejenPage, setShowRejectRejenPage] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    if (!selectedVendor) {
      toast.error("No vendor selected");
      return;
    }
    approveReject(selectedVendor._id, data.rejectionReason);
  };

  // GET-VENDORS
  const getVendors = async () => {
    try {
      const res = await axios.get("/api/admin/allVendorUser");
      if (res.data.success) {
        setAllVendorUserData(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  
  // REAL TIME GET-VENDORS
  useEffect(() => {
    getVendors();

    const socket = socketConnection();

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
    });

    socket.on("new-approvel-for-notification", (vendors) => {
      console.log("Realtime Vendors:", vendors);
      setAllVendorUserData(vendors);
    });

    return () => {
      socket.off("new-approvel-for-notification");
      disconnectSocket();
    };
  }, []);

  

  // STATUS APPROVED API FUNCTION.
  const handleApprove = async (vendorId) => {
    try {
      setStatusApproveLoding(true);

      const res = await axios.post("/api/vendor/updateVendorStatus", {
        vendorId,
        status: "approved",
      });

      if (res.data.success) {
        toast.success(res.data.message);

        setAllVendorUserData((prev) =>
          prev.filter((item) => item._id !== vendorId),
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server Error");
    } finally {
      setStatusApproveLoding(false);
    }
  };

  // STATUS REJECT API FUNCTION.
  const approveReject = async (vendorId, rejectionReason) => {
    try {
      setStatusApproveLoding(true);

      const res = await axios.post("/api/vendor/updateVendorStatus", {
        vendorId,
        status: "rejected",
        rejectionReason,
      });

      if (res.data.success) {
        toast.success(res.data.message);

        setAllVendorUserData((prev) =>
          prev.filter((item) => item._id !== vendorId),
        );

        setShowRejectRejenPage(false);
        setSelectedVendor(null);
        reset();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server Error");
    } finally {
      setStatusApproveLoding(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-200 p-5 md:px-10">
      <h3 className="text-blue-600 font-semibold text-2xl mb-6">
        Vendor Approval Requests
      </h3>

      {allVendorUserData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {allVendorUserData.map((vendor, index) => (
            <motion.div
              key={vendor._id}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.1, delay: index * 0.2, ease: "easeIn" }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
                  {vendor.name?.charAt(0)?.toUpperCase() || "V"}
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-gray-800">
                    {vendor.name}
                  </h4>

                  <p className="text-sm text-gray-500">{vendor.email}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Shop:</span>{" "}
                  {vendor.shopName || "N/A"}
                </div>

                <p>
                  <span className="font-semibold text-gray-700">Phone:</span>{" "}
                  {vendor.phone || "N/A"}
                </p>

                <p>
                  <span className="font-semibold text-gray-700">GST:</span>{" "}
                  {vendor.gstNumber || "N/A"}
                </p>

                <p>
                  <span className="font-semibold text-gray-700">Address:</span>{" "}
                  {vendor.shopAddress || "N/A"}
                </p>
              </div>

              <div className="mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    vendor.approvalStatus === "approved"
                      ? "bg-green-100 text-green-700"
                      : vendor.approvalStatus === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {vendor.approvalStatus || "Pending"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => handleApprove(vendor._id)}
                  disabled={statusApproveLoding}
                  className="flex-1 min-w-32 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white py-2 rounded-lg flex items-center justify-center cursor-pointer"
                >
                  {statusApproveLoding ? (
                    <img src="/Loading.gif" alt="Loading" className="w-6 h-6" />
                  ) : (
                    "Approve"
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setShowRejectRejenPage(true);
                  }}
                  className="flex-1 min-w-32 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition cursor-pointer"
                >
                  Reject
                </button>

                <AnimatePresence>
                  {showRejectRejenPage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl"
                      >
                        <h2 className="text-xl font-bold mb-4">
                          Reject Vendor
                        </h2>

                        <p className="mb-4">
                          Reject
                          <span className="font-semibold">
                            {" "}
                            {selectedVendor?.shopName}
                          </span>
                          ?
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)}>
                          <textarea
                            {...register("rejectionReason", {
                              required: "Rejection reason is required",
                            })}
                            rows={4}
                            placeholder="Enter rejection reason..."
                            className="w-full border rounded-lg p-2"
                          />

                          {errors.rejectionReason && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.rejectionReason.message}
                            </p>
                          )}

                          <div className="flex justify-end gap-3 mt-5">
                            <button
                              type="button"
                              onClick={() => {
                                setShowRejectRejenPage(false);
                                setSelectedVendor(null);
                                reset();
                              }}
                              className="px-4 py-2 bg-gray-300 rounded-lg"
                            >
                              Cancel
                            </button>

                            <button
                              type="submit"
                              disabled={statusApproveLoding}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg"
                            >
                              {statusApproveLoding ? "Rejecting..." : "Reject"}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex  w-full items-center justify-center">
          <div className="w-full max-w-lg rounded-3xl  text-center mt-10 md:mt-20 ">
            <div className="mx-auto flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-blue-50">
              <CircleCheckBig className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600" />
            </div>

            <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-800">
              No Pending Vendors
            </h2>

            <p className="mt-3 text-sm sm:text-base leading-7 text-gray-500">
              Great job! 🎉 There are currently no vendor approval requests. New
              vendor applications will automatically appear here as soon as they
              are submitted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorApproval;
