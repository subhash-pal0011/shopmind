import connectDb from "@/lib/connectDb";
import Product from "@/model/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const products = await Product.find({
      verificationStatus: "pending",
    })
      .populate("vendorUser", "name email")
      .sort({ requestAt: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "Product requests fetched successfully",
        products,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET PRODUCT REQUESTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch product requests",
      },
      { status: 500 },
    );
  }
}
