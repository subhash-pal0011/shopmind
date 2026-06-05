"use client"
import axios from 'axios'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from "react-hook-form"
import { toast } from 'sonner'

const OtpPage = ({ otpEmail, otpPassword }) => {
       console.log("email:", otpEmail)
       const router = useRouter()
       const {
              register,
              handleSubmit,
              formState: { isSubmitting },
       } = useForm()


       const onSubmit = async (data) => {
              //Object.keys(data) → keys deta hai.

              // OTP form me hum Object.values(data) isliye lagate hain kyunki react-hook-form data ko object ke form me deta hai, aur hume sab digits ko jodkar ek OTP string banani hoti hai.

              try {
                     const otp = Object.values(data.otp).join("");
                     console.log("otp:", otp)

                     let res = await axios.post("/api/auth/verifyOtp", {
                            email: otpEmail, otp: otp
                     });
                     if (res.data.success) {
                            toast.success(res.data.message);

                            const login = await signIn("credentials", {
                                   email: otpEmail,
                                   password: otpPassword,
                                   redirect : false
                            })
                            console.log("autoLoginRes :" ,login);
                            if (login?.ok) {
                                   router.push("/");
                            } else {
                                   toast.error("Auto login failed");
                                   
                            }
                     } else {
                            toast.error(res.data.message);
                     }
              } catch (error) {
                     console.log("register error:", error);
                     toast(error?.response?.data?.message)
              }
       }
       return (
              <div className='h-screen w-full bg-gray-100 items-center text-center flex justify-center'>

                     <form onSubmit={handleSubmit(onSubmit)} className='space-x-2 space-y-5 text-center items-center flex flex-col justify-center'>
                            <div className='space-x-2 space-y-5'>
                                   <h2 className="text-2xl font-semibold">Verify Email OTP</h2>
                                   {Array.from({ length: 4 }).map((_, index) => (
                                          <input key={index} type='text' maxLength={1} inputMode='numeric' {...register(`otp.${index}`, { required: true, pattern: /^[0-9]$/ })}
                                                 className='border border-green-500 h-12 w-12 rounded-sm focus:ring-green-700 focus:outline-none focus:border-2 text-center'

                                                 onInput={(e) => {

                                                        e.target.value = e.target.value.replace(/[^0-9]/g, "");

                                                        if (e.target.nextSibling && e.target.value) {
                                                               e.target.nextSibling.focus();
                                                        }
                                                 }}
                                                 onKeyDown={(e) => {
                                                        if (e.key === "Backspace" && !e.target.value) {
                                                               if (e.target.previousSibling) {
                                                                      e.target.previousSibling.focus();
                                                               }
                                                        }
                                                 }}
                                          />
                                   ))}
                            </div>

                            <button className="border cursor-pointer bg-gray-600 text-white rounded w-20 text-center items-center flex justify-center h-10">
                                   {isSubmitting ? (
                                          <img src="/Loading.gif" className="h-10" />
                                   ) : (
                                          "Submit"
                                   )}
                            </button>
                     </form>

              </div>
       )
}

export default OtpPage
