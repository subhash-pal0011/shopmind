"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { FaStore, FaMapMarkerAlt } from "react-icons/fa";
import { MdBusinessCenter } from "react-icons/md";

const VendorInfo = () => {
       const {
              register,
              handleSubmit,
              formState: { errors , isSubmitting},
       } = useForm();

       const onSubmit = (data) => {
              console.log(data);
       };

       return (
              <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-blue-950 via-sky-900 to-cyan-500 p-4">
                     <motion.div
                            initial={{ opacity: 0, scale: 0.2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 px-6 shadow-2xl"
                     >
                            <div className="text-center mb-8">
                                   <div className="flex justify-center">
                                          <div className="bg-white/20 p-4 rounded-full">
                                                 <FaStore className="text-3xl text-white" />
                                          </div>
                                   </div>

                                   <h1 className="text-3xl font-bold text-white mt-4">
                                          Complete Your Shop Details
                                   </h1>

                                   <p className="text-gray-200 text-sm mt-2">
                                          Enter your business information to activate your vendor account.
                                   </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                                   {/* Shop Name */}
                                   <div>
                                          <div className="relative">
                                                 <MdBusinessCenter className="absolute left-3 top-3.5 text-white/70" />

                                                 <input
                                                        {...register("shopName", {
                                                               required: "Shop name is required",
                                                        })}
                                                        type="text"
                                                        placeholder="Shop Name"
                                                        className="w-full pl-10 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-300 outline-none focus:border-cyan-300"
                                                 />
                                          </div>

                                          <p className="text-red-300 text-xs mt-1 min-h-5">
                                                 {errors.shopName?.message}
                                          </p>
                                   </div>

                                   {/* Address */}
                                   <div>
                                          <div className="relative">
                                                 <FaMapMarkerAlt className="absolute left-3 top-3.5 text-white/70" />

                                                 <input
                                                        {...register("shopAddress", {
                                                               required: "Business address is required",
                                                        })}
                                                        type="text"
                                                        placeholder="Business Address"
                                                        className="w-full pl-10 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-300 outline-none focus:border-cyan-300"
                                                 />
                                          </div>

                                          <p className="text-red-300 text-xs mt-1 min-h-5">
                                                 {errors.shopAddress?.message}
                                          </p>
                                   </div>

                                   {/* GST Number */}
                                   <div>
                                          <input
                                                 {...register("gstNumber", {
                                                        required: "GST number is required",
                                                 })}
                                                 type="text"
                                                 placeholder="GST Number"
                                                 className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-300 outline-none focus:border-cyan-300"
                                          />

                                          <p className="text-red-300 text-xs mt-1 min-h-5">
                                                 {errors.gstNumber?.message}
                                          </p>
                                   </div>

                                   <button
                                          type="submit"
                                          className="w-full bg-white text-blue-900 font-semibold py-3 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer mt-2 items-center justify-center flex"
                                   >
                                          {isSubmitting ? <img src="/Loading.gif" className=" w-7"/>  : "Activate Vendor Account"}
                                   </button>
                            </form>
                     </motion.div>
              </div>
       );
};

export default VendorInfo;
