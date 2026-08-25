import connectDb from "@/lib/connectDb";
import eventHandler from "@/lib/eventHandlor";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const vendorUsers = await User.find({userRole: "vendor", approvalStatus: "pending"}).sort({ createdAt: -1 }).lean();

    if (vendorUsers.length === 0) {
      return NextResponse.json(
        {success: true, data: [], message: "No pending vendors"},
        { status: 200 },
      );
    }

    await eventHandler("new-approvel-for-notification", vendorUsers);

    return NextResponse.json(
      {success: true, data: vendorUsers},
      { status: 200 },
    );
  } catch (error) {
    console.error("Get vendors error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
