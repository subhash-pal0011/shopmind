import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Order from "@/model/order";
import Product from "@/model/product";
import User from "@/model/user";

export async function GET() {
  try {
   
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }


    const user = await User.findOne({
      email: session.user.email,
    }).select("_id");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }


    const orders = await Order.find({
      userId: user._id,
      orderStatus: "delivered",
    })
      .populate({
        path: "products.productId",
        model: Product,
        select:
          "title productImg price category reviews",
      })
      .sort({
        createdAt: -1,
      })
    .lean();


    const pendingReviews = [];

    for (const order of orders) {
      if (
        !Array.isArray(order.products) ||
        order.products.length === 0
      ) {
        continue;
      }

      for (const item of order.products) {
        const product = item.productId;

        if (!product?._id) {
          continue;
        }

        const alreadyReviewed =
        Array.isArray(product.reviews) &&
        product.reviews.some(
          (review) =>
            String(review.user) ===
            String(user._id)
        );


        if (alreadyReviewed) {
          continue;
        }

     
        const productImage =
          Array.isArray(product.productImg) &&
          product.productImg.length > 0
            ? product.productImg[0]
            : null;

   
        pendingReviews.push({
          orderId: order._id,

          productId: product._id,

          productName:
            product.title || "Product",

          productImage,

          productImages:
            Array.isArray(product.productImg)
              ? product.productImg
              : [],

          price:
            item.price ??
            product.price ??
            0,

          quantity:
            item.quantity ?? 1,

          category:
            product.category || "",

          deliveredAt:
            order.updatedAt ||
            order.createdAt,
        });
      }
    }


    return NextResponse.json(
      {
        success: true,
        count: pendingReviews.length,
        data: pendingReviews,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PENDING REVIEW API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch pending reviews",
      },
      {
        status: 500,
      }
    );
  }
}
