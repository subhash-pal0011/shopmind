import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
       try {
              await connectDb();

              const session = await auth();

              if (!session?.user?.email) {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "Unauthorized",
                            },
                            { status: 401 }
                     );
              }

              const { shopName, shopAddress, gstNumber } = await req.json();
                     

              if (!shopName || !shopAddress || !gstNumber) {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "All fields are required",
                            },
                            { status: 400 }
                     );
              }

              const existingUser = await User.findOne({email: session.user.email});
                     
              if (!existingUser) {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "User not found",
                            },
                            { status: 404 }
                     );
              }

              existingUser.shopName = shopName;
              existingUser.shopAddress = shopAddress;
              existingUser.gstNumber = gstNumber;

              await existingUser.save();

              return NextResponse.json(
                     {
                            success: true,
                            message: "Vendor profile updated successfully",
                            user: existingUser,
                     },
                     { status: 200 }
              );
       } catch (error) {
              console.error(
                     "Vendor profile update error:",
                     error
              );

              return NextResponse.json(
                     {
                            success: false,
                            message: "Internal Server Error",
                     },
                     { status: 500 }
              );
       }
}