import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
       try {
              await connectDb();


              const { phone, role } = await req.json();


              const session = await auth();

              if (!session?.user?.email) {
                     return NextResponse.json(
                            { success: false, message: "Unauthorized" },
                            { status: 401 }
                     );
              }

              if (!phone || !role) {
                     return NextResponse.json(
                            { success: false, message: "Phone-Number and Role are required" },
                            { status: 400 }
                     );
              }

              const findUser = await User.findOne({
                     email: session.user.email,
              });

              if (!findUser) {
                     return NextResponse.json(
                            { success: false, message: "User not found" },
                            { status: 404 }
                     );
              }

              findUser.phone = phone;
              findUser.userRole = role;

              await findUser.save();

              return NextResponse.json(
                     {
                            success: true,
                            message: "Profile updated successfully",
                            user: findUser,
                     },
                     { status: 200 }
              );
       } catch (error) {
              console.error(error);

              return NextResponse.json(
                     {
                            success: false,
                            message: "Internal Server Error",
                     },
                     { status: 500 }
              );
       }
}