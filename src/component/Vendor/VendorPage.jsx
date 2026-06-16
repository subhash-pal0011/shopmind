import React from "react";
import VendorDashBoard from "./VendorDashBoard";

const VendorPage = ({ user }) => {
       if (!user) {
              return (
                     <div className="min-h-screen w-full flex flex-col items-center justify-center">
                            <img
                                   src="/Loading.gif"
                                   alt="Loading"
                                   className="w-24 h-24"
                            />
                     </div>
              );
       } else if (user.approvalStatus === "approved") {
              return (
                     <div>
                            <VendorDashBoard />
                     </div>
              )
       } 
       else if (user.approvalStatus === "pending") {
              return (
                     <div className="min-h-screen  flex items-center justify-center p-4">
                            <div className="max-w-lg w-full bg-white/10 backdrop-blur-xl  rounded-3xl p-8 text-center shadow-2xl border border-cyan-400">

                                   <img
                                          src="/Loading.gif"
                                          alt="Pending Approval"
                                          className="w-28 h-28 mx-auto"
                                   />

                                   <h1 className="text-3xl font-bold text-white mt-4">
                                          Vendor Approval Pending
                                   </h1>

                                   <p className="text-gray-200 mt-3 leading-relaxed">
                                          Your vendor account has been submitted successfully and is currently
                                          under review by our admin team.
                                   </p>

                                   <div className="mt-6 bg-white/10 rounded-xl p-4">
                                          <p className="text-cyan-300 font-medium">
                                                 ⏳ Status: Pending Review
                                          </p>

                                          <p className="text-sm text-gray-300 mt-2">
                                                 This process usually takes 24–48 hours. You will gain access to
                                                 vendor features once your account is approved.
                                          </p>
                                   </div>

                            </div>
                     </div>
              );
       } 
       else {
              return (
                     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                            <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-red-200 p-8 text-center">

                                   <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-red-100">
                                          <span className="text-4xl text-red-600">✕</span>
                                   </div>

                                   <h1 className="text-3xl font-bold text-gray-800 mt-5">
                                          Vendor Request Rejected
                                   </h1>

                                   <p className="text-gray-600 mt-3">
                                          Unfortunately, your vendor application could not be approved at this
                                          time.
                                   </p>

                                   <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100">
                                          <p className="text-red-600 font-medium">
                                                 Status: Rejected
                                          </p>

                                          <p className="text-sm text-gray-600 mt-2">
                                                 Please review your business information and submit a new request,
                                                 or contact support if you believe this was a mistake.
                                          </p>
                                   </div>

                                   <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                                          <button
                                                 className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
                                          >
                                                 Update Information
                                          </button>

                                          <button
                                                 className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition cursor-pointer"
                                          >
                                                 Contact Support
                                          </button>
                                   </div>
                            </div>
                     </div>
              );
       }

};

export default VendorPage;
