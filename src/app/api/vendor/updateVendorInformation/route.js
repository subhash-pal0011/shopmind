import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import eventHandler from "@/lib/eventHandlor";
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
        { status: 401 },
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user || user.userRole !== "vendor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only vendors can update request.",
        },
        { status: 403 },
      );
    }

    // Already approved
    if (user.approvalStatus === "approved") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is already approved.",
        },
        { status: 400 },
      );
    }

    const body = await req.json();

    const { shopName, phone, gstNumber, address} = body;

    if(!shopName || !phone || !gstNumber || !address){
      return NextResponse.json(
        {
          success: false,
          message: "something missing",
        },
        { status: 400 },
      );
    }

    // Update Vendor Details
    user.shopName = shopName;
    user.phone = phone;
    user.gstNumber = gstNumber;
    user.shopAddress = address;

    // Send Again For Approval
    user.approvalStatus = "pending";
    user.rejectionReason = null;
    user.requestApprovedAt = null;

    await user.save();

    // Send Updated Pending Vendor List
    const pendingVendors = await User.find({userRole: "vendor", approvalStatus: "pending"}).sort({ createdAt: -1 }).lean();
      

    await eventHandler("new-approvel-for-notification", pendingVendors);

    return NextResponse.json({
      success: true,
      message: "Vendor request submitted successfully.",
      data: user,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
