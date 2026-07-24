"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FaRegUser } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import axios from "axios";

const Page = () => {
  const [showEditPage, setShowEditPage] = useState(false);
  const userData = useSelector((state) => state.user.userData);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (userData) {
      reset({
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone,
      });
    }
  }, [userData]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("phone", data.phone);

      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      console.log([...formData.entries()]);

      const response = await axios.put("/api/updateProfile", formData);

      console.log("Profile Updated:", response.data);

      // Agar Sonner use kar rahe ho
      // toast.success(response.data.message);

      setShowEditPage(false);
    } catch (error) {
      console.log(
        "Error updating profile:",
        error.response?.data || error.message,
      );

      // toast.error(error.response?.data?.message || "Profile update failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-2 md:p-5">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl bg-white shadow-xl p-3 md:p-5"
      >
        {/* User Icon */}

        <div className="flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-100">
            <FaRegUser className="text-6xl text-blue-600" />
          </div>
        </div>

        {/* User Details */}

        <div className="mt-5 text-center space-y-2">
          <h2 className="text-2xl font-bold">{userData?.name}</h2>

          <p className="text-gray-500">{userData?.email}</p>

          <p className="text-gray-600">
            Role :
            <span className="font-semibold text-blue-600 ml-1">
              {userData?.userRole}
            </span>
          </p>

          <p className="text-gray-600">
            Phone :<span className="font-semibold ml-1">9876543210</span>
          </p>
        </div>

        {/* Buttons */}

        <div className="mt-6 space-y-3">
          {userData?.userRole === "user" && (
            <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition cursor-pointer">
              My Orders
            </button>
          )}

          <button
            onClick={() => setShowEditPage(!showEditPage)}
            className="w-full rounded-lg border border-blue-600 py-3 font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            {showEditPage ? "Close" : "Edit Profile"}
          </button>
        </div>

        {/* Animated Form */}

        <AnimatePresence>
          {showEditPage && (
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: 30,
                height: 0,
              }}
              transition={{
                duration: 0.35,
              }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 space-y-4 border-t pt-6"
              >
                <div className="flex justify-center">
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-blue-100 border-2 border-blue-500"
                  >
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaRegUser className="text-6xl text-blue-600" />
                    )}

                    <div className="absolute bottom-0 w-full bg-black/50 py-1 text-center text-xs text-white">
                      Change
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                {/* Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: {
                        value: 3,
                        message: "Minimum 3 characters required",
                      },
                    })}
                  />

                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                {/* <div>
                                                               <input
                                                                      type="email"
                                                                      placeholder="Email"
                                                                      className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                                                                      {...register("email", {
                                                                             required: "Email is required",
                                                                             pattern: {
                                                                                    value:
                                                                                           /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
                                                                                    message: "Invalid Email",
                                                                             },
                                                                      })}
                                                               />

                                                               {errors.email && (
                                                                      <p className="mt-1 text-sm text-red-500">
                                                                             {errors.email.message}
                                                                      </p>
                                                               )}
                                                        </div> */}

                {/* Phone */}
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter valid phone number",
                      },
                    })}
                  />

                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Button */}
                <motion.button
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Page;
