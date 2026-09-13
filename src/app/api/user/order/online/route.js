import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import Product from "@/model/product";
import Order from "@/model/order";
import stripe from "@/lib/stripe";

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

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid price for ${product.title}.`,
          },
          { status: 400 }
        );
      }

      subtotal += price * quantity;

      orderProducts.push({
        cartId: item.cartId || undefined,
        productId: product._id,
        quantity,
        price,
      });
    }

    const finalDeliveryCharge = Number(deliveryCharge) || 0;

    if (
      !Number.isFinite(finalDeliveryCharge) ||
      finalDeliveryCharge < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid delivery charge.",
        },
        { status: 400 }
      );
    }

    const totalAmount =
      subtotal + finalDeliveryCharge;

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order amount.",
        },
        { status: 400 }
      );
    }

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

      // Payment abhi nahi hua hai
      paymentStatus: "pending",

      // Order abhi confirm nahi hua
      orderStatus: "pending",

      stripePaymentIntentId: null,
    });

    let checkoutSession;

    try {
      checkoutSession =
        await stripe.checkout.sessions.create({
          mode: "payment",

          payment_method_types: ["card"],

          customer_email: session.user.email,
          line_items: [
            {
              price_data: {
                currency: "inr",

                product_data: {
                  name: "ShopMind Order",

                  description:
                    `Order ID: ${order._id.toString()}`,
                },

                unit_amount:
                  Math.round(totalAmount * 100),
              },

              quantity: 1,
            },
          ],

          success_url:
            `${process.env.CLIENT_URL}/payment-success` +
            `?session_id={CHECKOUT_SESSION_ID}` +
            `&orderId=${order._id.toString()}`,

        
          cancel_url:
            `${process.env.CLIENT_URL}/payment-failed` +
            `?orderId=${order._id.toString()}`,

         

          metadata: {
            orderId: order._id.toString(),

            userId: user._id.toString(),

            userEmail: session.user.email,
          },

      
          payment_intent_data: {
            metadata: {
              orderId: order._id.toString(),

              userId: user._id.toString(),

              userEmail: session.user.email,
            },
          },
        });
    } catch (stripeError) {
      console.error(
        "STRIPE CHECKOUT ERROR:",
        stripeError
      );

      await Order.findByIdAndDelete(order._id);

      return NextResponse.json(
        {
          success: false,

          message:
            stripeError?.message ||
            "Unable to initialize Stripe payment.",
        },
        { status: 500 }
      );
    }

    if (checkoutSession.payment_intent) {
      order.stripePaymentIntentId =
        checkoutSession.payment_intent;

      await order.save();
    }


    return NextResponse.json(
      {
        success: true,

        message:
          "Order created successfully.",

        orderId:
          order._id.toString(),

        checkoutSessionId:
          checkoutSession.id,

        url:
          checkoutSession.url,

        amount:
          totalAmount,

        currency:
          "inr",
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


export async function GET(req) {
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

    const order = await Order.findOne({
      _id: orderId,

      userId: user._id,
    }).select(
      "paymentStatus orderStatus totalAmount stripePaymentIntentId"
    );

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      paymentStatus:
        order.paymentStatus,

      orderStatus:
        order.orderStatus,

      amount:
        order.totalAmount,

      stripePaymentIntentId:
        order.stripePaymentIntentId || null,
    });
  } catch (error) {
    console.error(
      "GET ONLINE ORDER STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to check payment status.",
      },
      { status: 500 }
    );
  }
}
