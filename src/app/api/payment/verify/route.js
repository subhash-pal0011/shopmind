import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import Order from "@/model/order";
import stripe from "@/lib/stripe";

export async function GET(req) {
  try {
    const session = await auth();
    await connectDb();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    const sessionId =searchParams.get("session_id");
      

    const orderId = searchParams.get("orderId");
      

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Stripe session ID is required.",
        },
        { status: 400 }
      );
    }

  
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    const stripeOrderId = checkoutSession.metadata?.orderId;
      

    const finalOrderId = orderId || stripeOrderId;
      

    if (!finalOrderId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order ID not found in Stripe session.",
        },
        { status: 400 }
      );
    }

  
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
      _id: finalOrderId,
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

  
    if (checkoutSession.status === "complete" && checkoutSession.payment_status === "paid") {
      
      order.paymentStatus = "paid";

      order.orderStatus = "confirmed";

    
      if (checkoutSession.payment_intent) {
        order.stripePaymentIntentId = checkoutSession.payment_intent;
      }

      await order.save();

     

      return NextResponse.json({
        success: true,

        paid: true,

        paymentStatus: "paid",

        orderStatus: "confirmed",

        orderId: order._id.toString(),
          

        message: "Payment verified successfully.",
          
      });
    }

    if (checkoutSession.payment_status === "unpaid") {
    
      return NextResponse.json({
        success: true,

        paid: false,

        paymentStatus:order.paymentStatus,
          

        orderStatus: order.orderStatus,
          

        orderId: order._id.toString(),
          

        message: "Payment is not completed.",
          
      });
    }

 
    return NextResponse.json({
      success: true,

      paid: false,

      paymentStatus:
        order.paymentStatus,

      orderStatus:
        order.orderStatus,

      orderId:
        order._id.toString(),

      message:
        "Payment is still being processed.",
    });
    } catch (error) {
    console.error(
      "PAYMENT VERIFY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:  error?.message || "Unable to verify payment.",
      },
      { status: 500 }
    );

  }
}