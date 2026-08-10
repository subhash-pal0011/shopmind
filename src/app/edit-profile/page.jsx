"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FaRegUser } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { updateUser } from "@/redux/userSlice";

const Page = () => {
  const [showEditPage, setShowEditPage] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  const dispatch = useDispatch();

  const userData = useSelector((state) => state.user.userData);

  // --------------------------------
  // React Hook Form
  // --------------------------------

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

  // --------------------------------
  // Set User Data
  // --------------------------------

  useEffect(() => {
    if (userData) {
      reset({
        fullName: userData?.name || "",
        email: userData?.email || "",
        phone: userData?.phone || "",
      });
    }
  }, [userData, reset]);

  // --------------------------------
  // Image Select
  // --------------------------------

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Check image type
    if (!file.type.startsWith("image/")) {
      toast.info("Please select a valid image");

      e.target.value = "";
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.info("Image size should be less than 5MB");

      e.target.value = "";
      return;
    }

    // Old preview URL cleanup
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }

    // Store selected file
    setSelectedFile(file);

    // Create local preview
    const imageUrl = URL.createObjectURL(file);

    setPreviewImage(imageUrl);
  };

  // --------------------------------
  // Cleanup Preview URL
  // --------------------------------

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);


  // --------------------------------
  // Submit
  // --------------------------------
  const onSubmit = async (data) => {
    try {
      if (!userData?.email) {
        toast.info("User email not found");
        return;
      }

      const formData = new FormData();

      formData.append("fullName", data.fullName.trim());

      formData.append("phone", data.phone.trim());

      formData.append("email", userData.email);

      // Add image only if selected
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const response = await axios.put("/api/updateProfile", formData);

      // console.log("Profile Updated:", response.data);

      if (response.data.success) {
        toast.success(response.data.message);

        // Update Redux
        dispatch(
          updateUser({
            name: response.data.user.name,

            phone: response.data.user.phone,

            profileImage: response.data.user.profileImage,
          }),
        );

        // Clear local image
        if (previewImage) {
          URL.revokeObjectURL(previewImage);
        }

        setSelectedFile(null);
        setPreviewImage(null);

        // Close edit section
        setShowEditPage(false);
      }
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message,
      );

      toast.error(error.response?.data?.message || "Profile update failed");
    }
  };


  // --------------------------------
  // Profile Image
  // --------------------------------
  const profileImage = previewImage || userData?.profileImage || null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-2 md:p-5">
      <motion.div
        initial={{
          opacity: 0,
          y: 40,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
        }}
        className="w-full max-w-md rounded-2xl bg-white p-3 shadow-xl md:p-5"
      >

        {/* ========================= */}
        {/* Profile Image */}
        {/* ========================= */}
        <div className="flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-blue-100">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <FaRegUser className="text-6xl text-blue-900" />
            )}
          </div>
        </div>

        {/* ========================= */}
        {/* User Details */}
        {/* ========================= */}

        <div className="mt-5 space-y-2 text-center">
          <h2 className="text-2xl font-bold">{userData?.name || "User"}</h2>

          <p className="text-gray-500">{userData?.email || "No email"}</p>

          <p className="text-gray-600">
            Role:
            <span className="ml-1 font-semibold text-blue-600">
              {userData?.userRole || "user"}
            </span>
          </p>

          <p className="text-gray-600">
            Phone:
            <span className="ml-1 font-semibold">
              {userData?.phone || "Not available"}
            </span>
          </p>
        </div>

        {/* ========================= */}
        {/* Buttons */}
        {/* ========================= */}

        <div className="mt-6 space-y-3">
          {userData?.userRole === "user" && (
            <button
              type="button"
              className="w-full cursor-pointer rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              My Orders
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowEditPage(!showEditPage)}
            className="w-full cursor-pointer rounded-lg border border-blue-600 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            {showEditPage ? "Close" : "Edit Profile"}
          </button>
        </div>

        {/* ========================= */}
        {/* Edit Profile */}
        {/* ========================= */}

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
                {/* ========================= */}
                {/* Change Profile Image */}
                {/* ========================= */}

                <div className="flex justify-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-blue-500 bg-blue-100"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
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
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                {/* ========================= */}
                {/* Full Name */}
                {/* ========================= */}

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

                {/* ========================= */}
                {/* Email */}
                {/* ========================= */}

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    readOnly
                    className="w-full cursor-not-allowed rounded-lg border bg-gray-100 p-3 text-gray-500 outline-none"
                    {...register("email")}
                  />
                </div>

                {/* ========================= */}
                {/* Phone */}
                {/* ========================= */}

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

                {/* ========================= */}
                {/* Submit */}
                {/* ========================= */}

                <motion.button
                  type="submit"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
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
