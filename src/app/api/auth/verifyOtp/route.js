import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
       try {
              await connectDb();

              const { email, otp } = await req.json();

              if (!email || !otp) {
                     return NextResponse.json(
                            { succes: false, message: "Something is missing" },
                            { status: 400 }
                     )
              }

              const existUser = await User.findOne({email});

              if (!existUser) {
                     return NextResponse.json(
                            { succes: false, message: "User is not existing"},
                            { status: 400 }
                     )
              }

              if (existUser.otp !== otp) {
                     return NextResponse.json(
                            { success: false, message: "Invalid OTP" },
                            { status: 400 }
                     );
              }

              if (existUser.userVerified) {
                     return NextResponse.json(
                            { success: false, message: "User already verified" },
                            { status: 400 }
                     );
              }
              if (existUser.otpExp < Date.now()) {
                     return NextResponse.json(
                            { success: false, message: "OTP expired" },
                            { status: 400 }
                     );
              }
              existUser.otp = null;
              existUser.otpExp = null;
              existUser.userVerified = true;

              await existUser.save()

              return NextResponse.json(
                     { success: true, message: "OTP verified successfully 🎉" },
                     { status: 200 }
              )

       } catch (error) {
              console.error("OTP VERIFY ERROR:", error);

              return NextResponse.json(
                     { success: false, message: "Server error" },
                     { status: 500 }
              );
       }
}