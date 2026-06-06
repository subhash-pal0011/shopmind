"use client";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form"
import {
  FaFacebookF,
  FaGoogle,
  FaTwitter,
  FaRegEyeSlash, FaRegEye
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import OtpPage from "@/component/OtpPage";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [show, setShow] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [otpPage, setOtpPage] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpPassword, setOtpPassword] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/api/auth/register", data);
      if (res.data.success) {
        toast(res.data.message);
        setOtpPage(true);
        setOtpEmail(data.email);
        setOtpPassword(data.password);
      }
    } catch (error) {
      console.log("register error:", error);
      toast(error?.response?.data?.message);
    }
  }

  const onLogin = async (data) => {
    
    try {
      const res = await signIn("credentials",{email: data.email,password: data.password, redirect: false });
                            
      if (res.error) {
        toast.error("Invalid email or password");
        return;
      }
      if (res?.ok) {
        toast.success("Logged in successfully");
        router.push("/");
      }
    } catch (error) {
      toast.error(error?.message || "Login failed");
      console.log("login error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-950 via-sky-900 to-cyan-500 flex items-center justify-center px-4 py-10 ">

      <AnimatePresence>

        <motion.div

          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 18
          }}

          className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">

          {/* LEFT SIDE */}
          <motion.div

            className="relative hidden md:flex flex-col justify-between bg-linear-to-b from-sky-600 to-blue-400 p-10 text-white">

            {/* inset-0 MTLB child pura parent ko cover kar dega CHILD IMG HII PERENT ISKE UPER VALA DIV. */}
            <div className="absolute inset-0 opacity-60">
              <Image
                src="/butterfly.avif"
                alt="bg"
                fill
                sizes="50vw"
                loading="eager"
                className="object-cover"
              />
            </div>

            <div className="relative z-40">
              <h1 className="text-5xl font-bold mb-4">
                Welcome
              </h1>

              <p className="text-gray-200 leading-7 max-w-md">
                Join ShopMind and explore a smart AI-powered
                shopping experience with real-time features.
              </p>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6 text-center justify-center">
                <div className="h-px w-20 bg-gray-300"></div>

                <p className="text-xs font-semibold tracking-widest text-gray-400">
                  CONNECT WITH
                </p>

                <div className="h-px w-20 bg-gray-300"></div>
              </div>

              <div className="flex gap-15 justify-center ">
                <button className="w-11 h-11 rounded-full bg-sky-500 hover:scale-110 duration-300 flex items-center justify-center">
                  <FaTwitter />
                </button>

                <button onClick={()=>signIn("google", {callbackUrl:"/"})}
                 className="w-11 h-11 rounded-full bg-red-500 hover:scale-110 duration-300 flex items-center justify-center">
                  <FaGoogle />
                </button>

                <button className="w-11 h-11 rounded-full bg-blue-600 hover:scale-110 duration-300 flex items-center justify-center">
                  <FaFacebookF />
                </button>
              </div>
            </div>
          </motion.div>

          {otpPage ?
            <>
              <OtpPage otpEmail={otpEmail} otpPassword={otpPassword} />
            </>

            :

            <>
              {/* RIGHT SIDE */}
              <div className="p-8 md:p-5 space-y-5">
                <button onClick={() => setShow(!show)} className="md:right-20 right-10 absolute border h-10 w-20 rounded-sm border-gray-600 p-2 bg-blue-500 text-white cursor-pointer">{show ? "Login" : "Sign Up"}</button>

                <h2 className="text-4xl font-bold text-gray-800 mt-10 ">
                  {show ? "Register" : "Welcome Back"}
                </h2>

                <form onSubmit={handleSubmit(show ? onSubmit : onLogin)} className="space-y-8 mt-10">

                  {/* Full Name */}
                  <AnimatePresence>
                    {show &&
                      <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{
                          type: "spring",
                          stiffness: 220,
                          damping: 15
                        }}
                      >
                        <label className="block text-sm font-semibold text-gray-600 uppercase mb-3">
                          Full Name
                        </label>

                        <input
                          type="text"
                          placeholder="Enter Your Full Name"
                          className="w-full border-b border-gray-400 outline-none py-2 focus:border-sky-500"
                          {...register("name", {
                            required: "Name is Required*",
                            validate: (value) => value.trim().length > 0 || "Only spaces are not allowed",
                          })}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs absolute p-1">
                            {errors.name.message}
                          </p>
                        )}
                      </motion.div>
                    }
                  </AnimatePresence>


                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 uppercase mb-3">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="Enter Your Email"
                      className="w-full border-b border-gray-400 outline-none py-2 focus:border-sky-500"
                      {...register("email", {
                        required: "Email is Required*",
                        validate: (value) => value.trim().length > 0 || "Only spaces are not allowed",
                      })}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs absolute p-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-600 mb-3">
                      Password
                    </label>

                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="********"
                      className="w-full border-b border-gray-400 outline-none py-2 pr-10 focus:border-sky-500"
                      {...register("password", {
                        required: "password is Required*",
                        validate: (value) =>
                          value.trim().length > 0 || "spaces are not allowed",
                      })}
                    />

                    <div className="absolute right-2 top-11 cursor-pointer">
                      {showPass ? (
                        <FaRegEye onClick={() => setShowPass(false)} />
                      ) : (
                        <FaRegEyeSlash onClick={() => setShowPass(true)} />
                      )}
                    </div>

                    {errors.password && (
                      <p className="text-red-500 text-xs p-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Button */}
                  <div className="space-y-2">
                    <button className="w-full bg-sky-500 hover:bg-sky-600 duration-300 text-white py-3 rounded-lg shadow-lg font-semibold cursor-pointer text-center items-center justify-center flex">
                      {isSubmitting ? <img src="/Loading.gif" className="h-8 bg-cover" /> : show ? "Sign Up" : "Login"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpPage(!otpPage)}
                      className="block mx-auto text-sm text-sky-500 hover:underline cursor-pointer"
                    >
                      Go to OTP Page
                    </button>
                  </div>

                </form>
              </div>
            </>
          }

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

