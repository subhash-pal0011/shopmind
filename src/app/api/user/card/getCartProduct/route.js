import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import Product from "@/model/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Connect MongoDB
    await connectDb();

    // Get session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // Find user and populate cart products
    const user = await User.findById(session.user.id)
      .populate({
        path: "cart.product",
        model: Product,
      })
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Cart fetched successfully",
        data: user.cart || [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}