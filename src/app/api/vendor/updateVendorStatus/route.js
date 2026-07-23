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

    const admin = await User.findOne({
      email: session.user.email,
    });

    if (!admin || admin.userRole !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Admin access only",
        },
        { status: 403 },
      );
    }

    // Request Body
    const { vendorId, status, rejectionReason } = await req.json();

    if (!vendorId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "vendorId and status are required",
        },
        { status: 400 },
      );
    }

    // Find Vendor
    const vendor = await User.findById(vendorId);

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor not found",
        },
        { status: 404 },
      );
    }

    // Approve Vendor
    if (status === "approved") {
      vendor.approvalStatus = "approved";
      vendor.requestApprovedAt = new Date();
      vendor.rejectionReason = null;

      await vendor.save();
    }

    // Reject Vendor
    else if (status === "rejected") {
      vendor.approvalStatus = "rejected";
      vendor.requestApprovedAt = new Date();
      vendor.rejectionReason = rejectionReason?.trim() || "Not specified";

      await vendor.save();
    }

    // Invalid Status
    else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
        },
        { status: 400 },
      );
    }

    // Send Updated Pending Vendors via Socket
    const pendingVendors = await User.find({
      userRole: "vendor",
      approvalStatus: "pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    await eventHandler("new-approvel-for-notification", pendingVendors);

    return NextResponse.json({
      success: true,
      message:
        status === "approved"
          ? "Vendor approved successfully"
          : "Vendor rejected successfully",
    });
  } catch (error) {
    console.error("Vendor approval error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
