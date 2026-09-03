import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Product from "@/model/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();

    if (!session) {
      return NextResponse.json(
        {success: false, message: "Unauthorized"},
        { status: 401 },
      );
    }

    const products = await Product.find({ isActive: true });

    if (products.length === 0) {
      return NextResponse.json(
        {success: false, message: "Products don't exist"},
        { status: 404 },
      );
    }

    return NextResponse.json(
      {success: true, data : products},
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {success: false, message: "Internal server error"},
      { status: 500 },
    );
  }
}
