"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "motion/react";
import { socketConnection } from "@/lib/socketConnection";

const VendorApproval = () => {

  // const allVendorUserData = useSelector((state) => state.vendorUser.vendorUserData);

  const [allVendorUserData, setAllVendorUserData] = useState([]);

  const getVendors = async () => {
    try {
      const res = await axios.get("/api/vendor/allVendorUser");

      if (res.data.success) {
        setAllVendorUserData(res.data.data);
      }
    } catch (err) {
      console.log("Fetch error:", err.message);
    }
  };

  useEffect(() => {
    getVendors();

    const socket = socketConnection();

    //socket connect check
    socket.on("connect", () => {
      console.log("socket connected:", socket.id);
    });

    //REAL-TIME LISTENER
    socket.on("new-approvel-for-notification", (notifi) => {
      // console.log("realtime event:", notifi);

      getVendors();
    });

    return () => {
      socket.off("connect");
      socket.off("new-approvel-for-notification");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-200 p-5 md:px-10">
      <h3 className="text-blue-600 font-semibold text-2xl mb-6">
        Vendor Approval Requests
      </h3>

      {allVendorUserData?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {allVendorUserData.map((vendor, index) => (

            <motion.div key={vendor._id}
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

                  <p className="text-sm text-gray-500">
                    {vendor.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">
                    Shop:
                  </span>{" "}
                  {vendor.shopName || "N/A"}
                </div>

                <p>
                  <span className="font-semibold text-gray-700">
                    Phone:
                  </span>{" "}
                  {vendor.phone || "N/A"}
                </p>

                <p>
                  <span className="font-semibold text-gray-700">
                    GST:
                  </span>{" "}
                  {vendor.gstNumber || "N/A"}
                </p>
              </div>

              <div className="mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${vendor.approvalStatus === "approved" ? "bg-green-100 text-green-700"
                    : vendor.approvalStatus === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {vendor.approvalStatus || "Pending"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <button className="flex-1 min-w-32 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition cursor-pointer">
                  Approve
                </button>

                <button className="flex-1 min-w-32 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition cursor-pointer">
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-gray-500 items-center justify-center flex flex-col">

          <p className="mt-20">No vendor requests found</p>
          <img src="/Loading.gif" className="h-30" />
        </div>
      )}
    </div>
  );
};

export default VendorApproval;
