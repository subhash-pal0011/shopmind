import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Order from "@/model/order";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    
    await connectDb();


    const session = await auth();

    if (!session?.user) {
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

  
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Products are required",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Delivery address is required",
        },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        {
          success: false,
          message: "Location is required",
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


    const order = await Order.create({
      userId: user._id,

      products: products.map((item) => ({
        cartId: item.cartId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),

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

      deliveryCharge: deliveryCharge || 0,

      totalAmount,

      orderStatus: "pending",
      paymentStatus: "pending",
    });

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
        message: "Something went wrong while placing COD order",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
