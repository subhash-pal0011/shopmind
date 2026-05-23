// import ChooseRole from '@/component/ChooseRole'
// import React from 'react'

// const page = () => {
//   return (
//     <div>
//       <ChooseRole />
//     </div>
//   )
// }

// export default page



"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FaFacebookF,
  FaGoogle,
  FaTwitter,
} from "react-icons/fa";

export default function RegisterPage() {

  const [show, setShow] = useState(true)
  console.log(show)
  return (
    <div className="min-h-screen bg-linear-to-r from-blue-950 via-sky-900 to-cyan-500 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="relative hidden md:flex flex-col justify-between bg-linear-to-b from-sky-600 to-blue-400 p-10 text-white">

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

              <p className="text-xs tracking-widest text-gray-200">
                CONNECT WITH
              </p>

              <div className="h-px w-20 bg-gray-300"></div>
            </div>

            <div className="flex gap-15 justify-center ">
              <button className="w-11 h-11 rounded-full bg-sky-500 hover:scale-110 duration-300 flex items-center justify-center">
                <FaTwitter />
              </button>

              <button className="w-11 h-11 rounded-full bg-red-500 hover:scale-110 duration-300 flex items-center justify-center">
                <FaGoogle />
              </button>

              <button className="w-11 h-11 rounded-full bg-blue-600 hover:scale-110 duration-300 flex items-center justify-center">
                <FaFacebookF />
              </button>
            </div>
          </div>
        </div>


        {/* RIGHT SIDE */}
        {/* p- md:p-14 */}
        <div className="p-8 md:p-5 space-y-5">
          <button onClick={() => setShow(!show)} className="md:right-20 right-10 absolute border h-10 w-20 rounded-sm border-gray-600 p-2 bg-blue-500 text-white cursor-pointer">{show ? "Login" : "Sign Up"}</button>

          <h2 className="text-4xl font-bold text-gray-800 mt-10 ">
            Register
          </h2>

          <form className="space-y-8 mt-10">

            {/* Full Name */}
            {show &&
              <div>
                <label className="block text-sm font-semibold text-gray-600 uppercase mb-3">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter Your Full Name"
                  className="w-full border-b border-gray-400 outline-none py-2 focus:border-sky-500"
                />
              </div>
            }


            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 uppercase mb-3">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter Your Email"
                className="w-full border-b border-gray-400 outline-none py-2 focus:border-sky-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-3">
                Password
              </label>

              <input
                type="password"
                placeholder="********"
                className="w-full border-b border-gray-400 outline-none py-2 focus:border-sky-500"
              />
            </div>

            {/* Checkbox */}
            

            {/* Button */}
            <button className="w-full bg-sky-500 hover:bg-sky-600 duration-300 text-white py-3 rounded-lg shadow-lg font-semibold">
              {show ? "Sign Up" : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

