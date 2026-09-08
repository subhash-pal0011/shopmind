import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import Product from "@/model/product";

export async function GET() {
  try {
 
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }


    await connectDb();


    const vendor = await User.findOne({
      email: session.user.email,
    }).select(
      "_id name email userRole shopName shopAddress approvalStatus"
    );

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    if (vendor.userRole !== "vendor") {
      return NextResponse.json(
        {
          success: false,
          message: "Only vendors can access vendor products.",
        },
        { status: 403 }
      );
    }

    const products = await Product.find({
      vendorUser: vendor._id,
    })
      .sort({ createdAt: -1 })
    .lean();

  
    return NextResponse.json(
      {
        success: true,
        message: "Vendor products fetched successfully.",
        vendor: {
          _id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          shopName: vendor.shopName,
          shopAddress: vendor.shopAddress,
          approvalStatus: vendor.approvalStatus,
        },
        count: products.length,
        data: products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET VENDOR PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vendor products.",
      },
      { status: 500 }
    );
  }
}