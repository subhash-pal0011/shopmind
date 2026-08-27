import connectDb from "@/lib/connectDb";
import Product from "@/model/product";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectDb();

    const { productId, status, rejectedReason } = await req.json();

    if (!productId || !status) {
      return NextResponse.json(
        {success: false, message: "productId and status are required"},
        { status: 400 },
      );
    }

    // Only these two actions are allowed
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        {success: false, message: "Invalid status. Use approved or rejected"},
        { status: 400 },
      );
    }

    if (status === "rejected" && !rejectedReason?.trim()) {
      return NextResponse.json(
        {success: false, message: "Rejection reason is required"},
        { status: 400 },
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        {success: false, message: "Product does not exist"},
        { status: 404 },
      );
    }

    // APPROVE PRODUCT
    if (status === "approved") {
      product.verificationStatus = "approved";
      product.approvedAt = new Date();

      // Approved product becomes active
      product.isActive = true;

      // Clear old rejection reason if product was previously rejected
      product.rejectedReason = null;
    }

    // REJECT PRODUCT
    if (status === "rejected") {
      product.verificationStatus = "rejected";

      // Rejected product should not be active
      product.isActive = false;

      // No approval date
      product.approvedAt = null;

      product.rejectedReason = rejectedReason.trim();
    }

    const updatedProduct = await product.save();

    return NextResponse.json(
      {success: true, message: status === "approved" ? "Product approved successfully" : "Product rejected successfully"},
      { status: 200 },
    );
  } catch (error) {
    console.error("PRODUCT_VERIFICATION_ERROR:", error);

    return NextResponse.json(
      {success: false, message: "Something went wrong"},
      { status: 500 },
    );
  }
}
