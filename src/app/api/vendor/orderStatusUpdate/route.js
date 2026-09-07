import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import eventHandler from "@/lib/eventHandlor";
import Order from "@/model/order";

export async function PUT(req) {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 },
      );
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return Response.json(
        {
          success: false,
          message: "orderId and status are required.",
        },
        { status: 400 },
      );
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return Response.json(
        {
          success: false,
          message: `Invalid order status. Allowed statuses: ${validStatuses.join(
            ", ",
          )}`,
        },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return Response.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 },
      );
    }

    // Update status
    order.orderStatus = status;

    await order.save();

    // Real-time event emit
    eventHandler("orderStatusUpdated", {
      orderId: order._id.toString(),
      status: order.orderStatus,
    });

    // Delivered hone par data return nahi hoga
    if (status === "delivered") {
      return Response.json(
        {
          success: true,
          message: "Order delivered successfully.",
        },
        { status: 200 },
      );
    }

    // Baaki statuses par data return hoga
    return Response.json(
      {
        success: true,
        message: "Order status updated successfully.",
        data: order,
      },
      { status: 200 },
    );

    eventHandler("orderStatusUpdated");
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update order status.",
        error: error?.message,
      },
      { status: 500 },
    );
  }
}
