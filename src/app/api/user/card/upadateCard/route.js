import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Product from "@/model/product";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    // =========================
    // CONNECT DATABASE
    // =========================

    await connectDb();

    // =========================
    // CHECK AUTHENTICATION
    // =========================

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

    // =========================
    // GET REQUEST DATA
    // =========================

    const { productId, action } = await req.json();

    // =========================
    // VALIDATE PRODUCT ID
    // =========================

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          message: "ProductId missing",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDATE ACTION
    // =========================

    if (!action || !["increase", "decrease"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid action. Use increase or decrease",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CHECK PRODUCT
    // =========================

    const productExists = await Product.findById(productId);

    if (!productExists) {
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

    // =========================
    // FIND USER
    // =========================

    const user = await User.findById(session.user.id);

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

    // =========================
    // CHECK CART
    // =========================

    if (!Array.isArray(user.cart) || user.cart.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cart is empty",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // FIND CART PRODUCT
    // =========================

    const cartItem = user.cart.find(
      (item) =>
        item.product &&
        item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found in cart",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // INCREASE QUANTITY
    // =========================

    if (action === "increase") {
      const currentQuantity = Number(cartItem.quantity || 1);

      const stock = Number(productExists.stock || 0);

      // Stock check
      if (currentQuantity >= stock) {
        return NextResponse.json(
          {
            success: false,
            message: "Maximum available stock reached",
            quantity: currentQuantity,
            stock: stock,
          },
          {
            status: 400,
          }
        );
      }

      cartItem.quantity = currentQuantity + 1;
    }

    // =========================
    // DECREASE QUANTITY
    // =========================

    if (action === "decrease") {
      const currentQuantity = Number(cartItem.quantity || 1);

      // If quantity is 1, remove product
      if (currentQuantity <= 1) {
        user.cart = user.cart.filter(
          (item) =>
            item.product &&
            item.product.toString() !== productId.toString()
        );
      } else {
        cartItem.quantity = currentQuantity - 1;
      }
    }

    // =========================
    // SAVE USER
    // =========================

    await user.save();

    // =========================
    // GET UPDATED CART
    // =========================

    const updatedUser = await User.findById(session.user.id)
      .populate("cart.product")
      .lean();

    // =========================
    // SUCCESS RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        message:
          action === "increase"
            ? "Quantity increased successfully"
            : "Quantity decreased successfully",

        data: updatedUser?.cart || [],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Update Cart Error:", error);

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