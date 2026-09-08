import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import eventHandler from "@/lib/eventHandlor";
import Order from "@/model/order";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {

    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      products,
      address,
      location,
      paymentMethod,
      subtotal,
      deliveryCharge,
      totalAmount,
    } = body;

   
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Products are required",
        },
        { status: 400 }
      );
    }


    if (!address || typeof address !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery address is required",
        },
        { status: 400 }
      );
    }

    if (
      !address.fullName ||
      !address.phone ||
      !address.address ||
      !address.city ||
      !address.state ||
      !address.pinCode
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Complete delivery address is required",
        },
        { status: 400 }
      );
    }


    if (!location || typeof location !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Location is required",
        },
        { status: 400 }
      );
    }

    if (
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid latitude and longitude are required",
        },
        { status: 400 }
      );
    }

    if (paymentMethod !== "cod") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method for COD order",
        },
        { status: 400 }
      );
    }


    if (
      typeof subtotal !== "number" ||
      typeof totalAmount !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order amount",
        },
        { status: 400 }
      );
    }

    const finalDeliveryCharge =
      typeof deliveryCharge === "number" ? deliveryCharge : 0;


    const formattedProducts = products.map((item) => {
      if (!item.productId) {
        throw new Error("Product ID is missing");
      }

      if (
        typeof item.quantity !== "number" ||
        item.quantity < 1
      ) {
        throw new Error("Invalid product quantity");
      }

      if (
        typeof item.price !== "number" ||
        item.price < 0
      ) {
        throw new Error("Invalid product price");
      }

      return {
        cartId: item.cartId || null,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      };
    });

   
    const order = await Order.create({
      userId: user._id,

      products: formattedProducts,

      address: {
        fullName: address.fullName,
        phone: address.phone,
        email: address.email || session.user.email,
        address: address.address,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
      },

      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },

      paymentMethod: "cod",

      subtotal,

      deliveryCharge: finalDeliveryCharge,

      totalAmount,

      orderStatus: "pending",

      paymentStatus: "pending",
    });


    await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          orders: order._id,
        },
      },
      {
        new: true,
      }
    );


    eventHandler("product-order", order);

   
    return NextResponse.json(
      {
        success: true,
        message: "COD order placed successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("COD ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Something went wrong while placing COD order",
      },
      { status: 500 }
    );
  }
}