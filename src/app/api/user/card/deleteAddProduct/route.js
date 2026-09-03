import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    await connectDb();

    const session = await auth();

    // Authentication check
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Get cartId from request body
    const { cartId } = await req.json();

    if (!cartId) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart ID is required",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Check cart
    if (!Array.isArray(user.cart) || user.cart.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart is empty",
        },
        { status: 404 }
      );
    }

    // Check cart item
    const cartItem = user.cart.find(
      (item) => item._id.toString() === cartId.toString()
    );

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Remove product from cart
    user.cart = user.cart.filter((item) => item._id.toString() !== cartId.toString());
      
    

    // Save user
    await user.save();

    // Populate product details
    await user.populate("cart.product");

    return NextResponse.json(
      {
        success: true,
        message: "Product removed from cart successfully",
        data: user.cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete Cart Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}