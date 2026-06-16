import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function GET() {
       try {
              await connectDb();

              const vendorUsers = await User.find({
                     userRole: "vendor",
              }).sort({ createdAt: -1 }).lean();
                     

              if (vendorUsers.length === 0) {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "No vendors found",
                            },
                            { status: 404 }
                     );
              }

              return NextResponse.json(
                     {
                            success: true,
                            data: vendorUsers,
                     },
                     { status: 200 }
              );
       } catch (error) {
              console.error("Get vendors error:", error);

              return NextResponse.json(
                     {
                            success: false,
                            message: "Internal Server Error",
                     },
                     { status: 500 }
              );
       }
}