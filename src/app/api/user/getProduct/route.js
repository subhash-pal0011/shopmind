import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Product from "@/model/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const products = await Product.find({
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
    .lean();

    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No active products found.",
          data: [],
        },
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Products fetched successfully.",
        count: products.length,
        data: products,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ERROR FETCHING PRODUCTS:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}