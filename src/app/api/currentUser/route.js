import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function POST() {
       try {
              await connectDb();

              const session = await auth();

              if (!session || session?.user?.email) {
                     return NextResponse.json(
                            { success: false, message: "User not authenticated" },
                            { status: 401 }
                     )
              }

              const findUser = await User.findOne({ email: session?.user?.email }).select("-password");

              if (!findUser) {
                     return NextResponse.json(
                            { success: false, message: "User not found" },
                            { status: 404 }
                     );
              }

              return NextResponse.json(
                     {success:true, data:findUser},
                     {status:404}
              )
       } catch (error) {
              return NextResponse.json(
                     { success: false, message: `Get self user error ${error.message}` },
                     { status: 500 }
              );
       }
}