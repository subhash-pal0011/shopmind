import { NextResponse } from "next/server";

import stripe from "@/lib/stripe";
import connectDb from "@/lib/connectDb";
import Order from "@/model/order";

export const runtime = "nodejs";


export async function POST(req) {

  const signature =
    req.headers.get("stripe-signature");


  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Missing Stripe signature",
      },
      {
        status: 400,
      }
    );
  }


  try {

    /*
      IMPORTANT:
      Stripe webhook ke liye req.text()
      use karna hai.

      req.json() mat use karna.
    */

    const rawBody =
      await req.text();


    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;


    if (!webhookSecret) {

      console.error(
        "STRIPE_WEBHOOK_SECRET is missing"
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Webhook secret is missing",
        },
        {
          status: 500,
        }
      );
    }


    const event =
      stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret
      );


    await connectDb();


    console.log(
      "================================="
    );

    console.log(
      "STRIPE WEBHOOK EVENT:",
      event.type
    );

    console.log(
      "EVENT ID:",
      event.id
    );

    console.log(
      "================================="
    );


    /* =====================================================
       PAYMENT SUCCESS
    ===================================================== */

    if (
      event.type ===
      "payment_intent.succeeded"
    ) {

      const paymentIntent =
        event.data.object;


      const orderId =
        paymentIntent.metadata?.orderId;


      if (!orderId) {

        console.error(
          "Order ID missing in Stripe metadata"
        );

        return NextResponse.json({
          success: true,
          message:
            "Order ID missing",
        });
      }


      const order =
        await Order.findById(
          orderId
        );


      if (!order) {

        console.error(
          "Order not found:",
          orderId
        );

        return NextResponse.json({
          success: true,
          message:
            "Order not found",
        });
      }


      /*
        Already paid hai to dobara process
        nahi karenge.
      */

      if (
        order.paymentStatus ===
        "paid"
      ) {

        return NextResponse.json({
          success: true,
          message:
            "Order already processed",
        });
      }


      /*
        PaymentIntent match check
      */

      if (
        order.stripePaymentIntentId &&
        order.stripePaymentIntentId !==
          paymentIntent.id
      ) {

        console.error(
          "PaymentIntent mismatch"
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "PaymentIntent does not match order",
          },
          {
            status: 400,
          }
        );
      }


      order.paymentStatus =
        "paid";

      order.orderStatus =
        "confirmed";

      order.stripePaymentIntentId =
        paymentIntent.id;


      await order.save();


      console.log(
        "ORDER PAYMENT MARKED PAID:",
        orderId
      );
    }


    /* =====================================================
       PAYMENT FAILED
    ===================================================== */

    else if (
      event.type ===
      "payment_intent.payment_failed"
    ) {

      const paymentIntent =
        event.data.object;


      const orderId =
        paymentIntent.metadata?.orderId;


      if (!orderId) {

        return NextResponse.json({
          success: true,
          message:
            "No order ID in metadata",
        });
      }


      const order =
        await Order.findById(
          orderId
        );


      if (!order) {

        return NextResponse.json({
          success: true,
          message:
            "Order not found",
        });
      }


      order.paymentStatus =
        "failed";


      if (
        order.orderStatus ===
        "pending"
      ) {

        order.orderStatus =
          "cancelled";
      }


      order.stripePaymentIntentId =
        paymentIntent.id;


      await order.save();


      console.log(
        "ORDER PAYMENT FAILED:",
        orderId
      );
    }


    /* =====================================================
       PAYMENT CANCELED
    ===================================================== */

    else if (
      event.type ===
      "payment_intent.canceled"
    ) {

      const paymentIntent =
        event.data.object;


      const orderId =
        paymentIntent.metadata?.orderId;


      if (orderId) {

        const order =
          await Order.findById(
            orderId
          );


        if (order) {

          order.paymentStatus =
            "failed";


          if (
            order.orderStatus ===
            "pending"
          ) {

            order.orderStatus =
              "cancelled";
          }


          order.stripePaymentIntentId =
            paymentIntent.id;


          await order.save();


          console.log(
            "ORDER PAYMENT CANCELLED:",
            orderId
          );
        }
      }
    }


    /* =====================================================
       OTHER EVENTS
    ===================================================== */

    else {

      console.log(
        `Unhandled Stripe event: ${event.type}`
      );
    }


    return NextResponse.json({
      success: true,
      received: true,
    });


  } catch (error) {

    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          "Webhook error",
      },
      {
        status: 400,
      }
    );
  }
}
