import { NextResponse } from "next/server";

import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";

import User from "@/model/user";
import Product from "@/model/product";
import Order from "@/model/order";

import stripe from "@/lib/stripe";

// ======================================================
// POST
// CREATE ONLINE ORDER
// ======================================================

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      products,
      address,
      location,
      paymentMethod,
      deliveryCharge = 0,
    } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Products are required.",
        },
        { status: 400 }
      );
    }

    if (paymentMethod !== "online") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method.",
        },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          message: "Address is required.",
        },
        { status: 400 }
      );
    }

    if (
      !location ||
      typeof location.latitude !== "number" ||
      typeof location.longitude !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid location is required.",
        },
        { status: 400 }
      );
    }

    await connectDb();

    // --------------------------------------------------
    // USER
    // --------------------------------------------------

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // PRODUCTS
    // --------------------------------------------------

    const orderProducts = [];

    let subtotal = 0;

    for (const item of products) {
      const productId = item.productId;
      const quantity = Number(item.quantity);

      if (!productId) {
        return NextResponse.json(
          {
            success: false,
            message: "Product ID is missing.",
          },
          { status: 400 }
        );
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid quantity.",
          },
          { status: 400 }
        );
      }

      const product = await Product.findById(productId);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "Product not found.",
          },
          { status: 404 }
        );
      }

      if (product.verificationStatus !== "approved") {
        return NextResponse.json(
          {
            success: false,
            message: `${product.title} is not approved.`,
          },
          { status: 400 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: `${product.title} is unavailable.`,
          },
          { status: 400 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `${product.title} has only ${product.stock} stock.`,
          },
          { status: 400 }
        );
      }

      const price = Number(product.price);

      subtotal += price * quantity;

      orderProducts.push({
        cartId: item.cartId || undefined,
        productId: product._id,
        quantity,
        price,
      });
    }

    // --------------------------------------------------
    // TOTAL
    // --------------------------------------------------

    const finalDeliveryCharge =
      Number(deliveryCharge) || 0;

    const totalAmount =
      subtotal + finalDeliveryCharge;

    // --------------------------------------------------
    // CREATE ORDER
    // --------------------------------------------------

    const order = await Order.create({
      userId: user._id,

      products: orderProducts,

      address: {
        fullName: address.fullName,
        phone: address.phone,
        email:
          address.email?.trim() ||
          session.user.email,
        address: address.address,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
      },

      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      },

      paymentMethod: "online",

      subtotal,

      deliveryCharge: finalDeliveryCharge,

      totalAmount,

      orderStatus: "pending",

      paymentStatus: "pending",

      stripePaymentIntentId: null,
    });

    // --------------------------------------------------
    // STRIPE PAYMENT INTENT
    // --------------------------------------------------

    let paymentIntent;

    try {
      paymentIntent =
        await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100),

          currency: "inr",

          payment_method_types: ["card"],

          metadata: {
            orderId: order._id.toString(),
            userId: user._id.toString(),
            userEmail: session.user.email,
          },
        });
    } catch (stripeError) {
      await Order.findByIdAndDelete(order._id);

      console.error(
        "STRIPE ERROR:",
        stripeError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to initialize Stripe payment.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // SAVE STRIPE ID
    // --------------------------------------------------

    order.stripePaymentIntentId =
      paymentIntent.id;

    await order.save();

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Order created. Redirecting to payment.",

        orderId: order._id.toString(),

        paymentIntentId:
          paymentIntent.id,

        clientSecret:
          paymentIntent.client_secret,

        amount: totalAmount,

        currency: "inr",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE ONLINE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to create online order.",
      },
      { status: 500 }
    );
  }
}


// ======================================================
// GET
// PAYMENT DETAILS
// ======================================================

export async function GET(req) {
  try {
    console.log("GET ONLINE PAYMENT API CALLED");

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const { searchParams } =
      new URL(req.url);

    const orderId =
      searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDb();

    // --------------------------------------------------
    // USER
    // --------------------------------------------------

    const user = await User.findOne({
      email: session.user.email,
    }).select("_id");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // ORDER
    // --------------------------------------------------

    const order = await Order.findOne({
      _id: orderId,
      userId: user._id,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // PAYMENT METHOD
    // --------------------------------------------------

    if (order.paymentMethod !== "online") {
      return NextResponse.json(
        {
          success: false,
          message:
            "This is not an online payment order.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // ALREADY PAID
    // --------------------------------------------------

    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        {
          success: false,
          message: "Order is already paid.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // STRIPE PAYMENT INTENT
    // --------------------------------------------------

    let paymentIntent;

    if (order.stripePaymentIntentId) {
      paymentIntent =
        await stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId
        );
    } else {
      paymentIntent =
        await stripe.paymentIntents.create({
          amount: Math.round(
            order.totalAmount * 100
          ),

          currency: "inr",

          payment_method_types: ["card"],

          metadata: {
            orderId: order._id.toString(),
            userId: user._id.toString(),
            userEmail: session.user.email,
          },
        });

      order.stripePaymentIntentId =
        paymentIntent.id;

      await order.save();
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "Payment details fetched successfully.",

        orderId: order._id.toString(),

        amount: order.totalAmount,

        currency: "inr",

        paymentIntentId:
          paymentIntent.id,

        clientSecret:
          paymentIntent.client_secret,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET ONLINE PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to initialize payment.",
      },
      { status: 500 }
    );
  }
}