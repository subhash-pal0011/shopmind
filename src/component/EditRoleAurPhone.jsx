"use client";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/navigation";
const EditRoleAurPhone = () => {
       const [selectedRole, setSelectedRole] = useState("");
       const router = useRouter();

       const {
              register,
              handleSubmit,
              formState: { errors, isSubmitting },
       } = useForm();

       const onSubmit = async (data) => {
              if (!selectedRole) {
                     toast.info("Plz Select Role")
                     return;
              }

              const formData = {
                     ...data,
                     role: selectedRole,
              };

              console.log(formData);

              try {
                     const res = await axios.post("/api/user/phoneEditRole" , formData);
                     if(res.data.success){
                            toast.success(res.data.message);
                            router.push("/")
                     }
              } catch (error) {
                     console.log("Edit Role And PhoneNum Error : " , error);
                     toast.error(error?.response?.data?.message)
              }
       };

       const roles = [
              {
                     name: "admin",
                     title: "Admin",
                     image: "/admin.gif",
                     description: "Manage users, products and platform settings.",
              },
              {
                     name: "vendor",
                     title: "Vendor",
                     image: "/vendor.gif",
                     description: "Sell products and manage your business.",
              },
              {
                     name: "user",
                     title: "User",
                     image: "/user.gif",
                     description: "Browse products and enjoy the platform.",
              },
       ];

       return (
              <div className="min-h-screen md:h-screen flex items-center justify-center bg-linear-to-r from-blue-950 via-sky-900 to-cyan-500 p-3">
                     <motion.div initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            className="w-full max-w-4xl rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-6 md:p-10">

                            {/* Heading */}
                            <div className="text-center mb-8">
                                   <h1 className="text-3xl md:text-4xl font-bold text-white">
                                          Choose Your Role
                                   </h1>

                                   <p className="text-gray-200 mt-3">
                                          Select your role and enter your mobile number to continue.
                                   </p>
                            </div>

                            <form
                                   onSubmit={handleSubmit(onSubmit)}
                                   className="space-y-8"
                            >
                                   {/* Phone Number */}
                                   <div className="text-center">
                                          <input
                                                 type="tel"
                                                 placeholder="Enter mobile number"
                                                 {...register("phone", {
                                                        required: true,
                                                        pattern: {
                                                               value: /^[6-9]\d{9}$/,
                                                               message: "Enter a valid 10-digit mobile number",
                                                        },
                                                 })}
                                                 className="w-full bg-white/20 text-white rounded-xl px-4 py-3 outline-none border border-gray-300 focus:ring-2 focus:ring-cyan-500"
                                          />

                                          {/* {errors.phone && (
                                                 <p className="text-red-300 text-xs mt-2">
                                                        {errors.phone.message}
                                                 </p>
                                          )} */}
                                   </div>

                                   {/* Roles */}
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                          {roles.map((role) => (
                                                 <button
                                                        key={role.name}
                                                        type="button"
                                                        onClick={() => setSelectedRole(role.name)}
                                                        className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center 
                                                               ${selectedRole === role.name ? "border-cyan-400 bg-cyan-500/20 scale-105" : "border-white/20 bg-white/10 hover:bg-white/20"}`}
                                                 >
                                                        <Image src={role.image} alt={role.title} width={90} height={90}/>


                                                        <h3 className="text-xl font-semibold text-white mt-4">
                                                               {role.title}
                                                        </h3>

                                                        <p className="text-sm text-gray-300 mt-2 text-center">
                                                               {role.description}
                                                        </p>
                                                 </button>
                                          ))}
                                   </div>

                                   {/* Selected Role */}
                                   {/* {selectedRole && (
                                          <p className="text-center text-cyan-300 font-xs">
                                                 Selected Role: {selectedRole}
                                          </p>
                                   )} */}

                                   {/* Submit */}
                                   <div className="text-center">
                                          <button
                                                 type="submit"
                                                 disabled={isSubmitting}
                                                 className="px-8 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-all duration-300 disabled:opacity-50 cursor-pointer"
                                          >
                                                 {isSubmitting ? "Please wait..." : "Continue"}
                                          </button>
                                   </div>
                            </form>
                     </motion.div>
              </div>
       );
};

export default EditRoleAurPhone;
