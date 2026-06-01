import connectDb from "@/lib/connectDb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { sendMail } from "@/utils/nodemailer";

export async function POST(req) {
       try {
              await connectDb();

              const { name, email, password } = await req.json();

              if (!name || !email || !password) {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "Something is missing",
                            },
                            { status: 400 }
                     );
              }

              const existUser = await User.findOne({ email });

              if (existUser) {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "User already exists",
                            },
                            { status: 400 }
                     );
              }

              const hashPassword = await bcrypt.hash(password, 10);
              const otp = Math.floor(1000 + Math.random() * 9000).toString();
              const otpExp = Date.now() + 5 * 60 * 1000;
              sendMail(email, otp)

              const userCreate = await User.create({
                     name,
                     email,
                     otp,
                     otpExp,
                     password: hashPassword,
              });

              const senderDataForResponseFrontend = {
                     _id: userCreate._id,
                     name: userCreate.name,
                     email: userCreate.email,
              };

              return NextResponse.json(
                     {
                            success: true,
                            data: senderDataForResponseFrontend,
                            message: "User registered successfully",
                     },
                     { status: 201 }
              );
       } catch (error) {
              return NextResponse.json(
                     {
                            success: false,
                            message: "Internal Server Error",
                            error: error.message,
                     },
                     { status: 500 }
              );
       }
}