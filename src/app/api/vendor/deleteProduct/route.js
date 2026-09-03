import connectDb from "@/lib/connectDb";
import eventHandler from "@/lib/eventHandlor";
import Product from "@/model/product";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    await connectDb();

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is missing",
        },
        { status: 400 },
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product doesn't exist",
        },
        { status: 404 },
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    eventHandler("deleted-product", deletedProduct);

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete product error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while deleting the product",
      },
      { status: 500 },
    );
  }
}
