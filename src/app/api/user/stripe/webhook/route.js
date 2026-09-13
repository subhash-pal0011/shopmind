import { NextResponse } from "next/server";
import Stripe from "stripe";

import connectDb from "@/lib/connectDb";
import Order from "@/model/order";
import Product from "@/model/product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.text();

  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("WEBHOOK SIGNATURE ERROR:", error.message);

    return new NextResponse(
      `Webhook Error: ${error.message}`,
      { status: 400 }
    );
  }

  try {
    await connectDb();

    switch (event.type) {
      // ============================================
      // PAYMENT SUCCESS
      // ============================================

      case "checkout.session.completed": {
        const checkoutSession = event.data.object;

        const orderId =
          checkoutSession.metadata?.orderId;

        if (!orderId) {
          console.error("Order ID missing in metadata");
          break;
        }

        const paymentIntentId =
          checkoutSession.payment_intent;

        const order = await Order.findById(orderId);

        if (!order) {
          console.error(
            "Order not found:",
            orderId
          );

          break;
        }

        // Prevent duplicate webhook processing
        if (order.paymentStatus === "paid") {
          console.log(
            "Order already paid:",
            orderId
          );

          break;
        }

        // ==========================================
        // UPDATE PAYMENT
        // ==========================================

        order.paymentStatus = "paid";

        order.orderStatus = "confirmed";

        order.stripePaymentIntentId =
          paymentIntentId || null;

        await order.save();

        // ==========================================
        // REDUCE STOCK
        // ==========================================

        for (const item of order.products) {
          const product = await Product.findById(
            item.productId
          );

          if (!product) {
            console.error(
              "Product not found:",
              item.productId
            );

            continue;
          }

          product.stock =
            Math.max(
              0,
              product.stock - item.quantity
            );

          if (product.stock === 0) {
            product.isStockAvailable = false;
          }

          await product.save();
        }

        console.log(
          "PAYMENT SUCCESS:",
          orderId
        );

        break;
      }

      // ============================================
      // PAYMENT FAILED
      // ============================================

      case "checkout.session.async_payment_failed": {
        const checkoutSession =
          event.data.object;

        const orderId =
          checkoutSession.metadata?.orderId;

        if (orderId) {
          await Order.findByIdAndUpdate(
            orderId,
            {
              paymentStatus: "failed",
              orderStatus: "cancelled",
            }
          );
        }

        break;
      }

      default:
        console.log(
          `Unhandled Stripe event: ${event.type}`
        );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "STRIPE WEBHOOK ERROR:",
      error
    );

    return new NextResponse(
      "Webhook processing failed",
      { status: 500 }
    );
  }
}