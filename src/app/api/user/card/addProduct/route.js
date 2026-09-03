import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Product from "@/model/product";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDb();

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is missing",
        },
        {
          status: 400,
        }
      );
    }
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "User doesn't exist",
        },
        {
          status: 401,
        }
      );
    }

    const user = await User.findOne({email: session.user.email});

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User doesn't exist",
        },
        {
          status: 404,
        }
      );
    }

    const existProduct = await Product.findById(productId);

    if (!existProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product doesn't exist",
        },
        {
          status: 404,
        }
      );
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    const existingProduct = user.cart.find( (item) => item.product && item.product.toString() === productId.toString());

    // =========================
    // IF SAME PRODUCT EXISTS
    // INCREASE ONLY ITS QUANTITY
    // =========================
    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 0) + 1;
    }else {
      user.cart.push({
        product: existProduct._id,
        quantity: 1,
      });
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate("cart.product").lean();

    return NextResponse.json(
      {
        success: true,
        message: existingProduct ? "Product quantity increased" : "Product added to cart",
        data: updatedUser.cart,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Add To Cart Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
