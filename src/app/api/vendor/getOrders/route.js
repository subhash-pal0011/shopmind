import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Order from "@/model/order";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // ==========================================
    // DATABASE CONNECTION
    // ==========================================

    await connectDb();

    // ==========================================
    // GET SESSION
    // ==========================================

    const session = await auth();

    console.log("SESSION:", session);

    // ==========================================
    // AUTH CHECK
    // ==========================================

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // VENDOR CHECK
    // ==========================================

    if (session.user.role !== "vendor") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Only vendors can view orders.",
        },
        {
          status: 403,
        }
      );
    }

    const vendorId = session.user.id;

    console.log("VENDOR ID:", vendorId);

    // ==========================================
    // GET VENDOR ORDERS
    // ==========================================
    //
    // Product model:
    // vendorUser -> User ID
    //
    // Order model:
    // products.productId -> Product ID
    //
    // Therefore we first populate productId
    // and then filter products by vendorUser.
    //
    // ==========================================

    const orders = await Order.find({
      orderStatus: {
        $in: [
          "pending",
          "confirmed",
          "shipped",
          "delivered",
          "cancelled",
        ],
      },
    })
      .populate({
        path: "products.productId",
        select: `
          title
          description
          price
          stock
          isStockAvailable
          vendorUser
          productImg
          category
          size
          verificationStatus
          approvedAt
          isActive
          replaceDay
          freeDelivery
          payOnDelivery
          warranty
          detailsPoint
        `,
      })
      .populate({
        path: "userId",
        select: "name email phone",
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    // ==========================================
    // FILTER ONLY THIS VENDOR'S PRODUCTS
    // ==========================================

    const vendorOrders = orders
      .map((order) => {
        const vendorProducts = (order.products || []).filter((item) => {
          if (!item.productId) {
            return false;
          }

          const productVendorId = item.productId.vendorUser;

          return (
            productVendorId &&
            productVendorId.toString() === vendorId.toString()
          );
        });

        // If this order has no product
        // belonging to this vendor, remove it.
        if (vendorProducts.length === 0) {
          return null;
        }

        return {
          ...order,

          // Only this vendor's products
          products: vendorProducts,

          // Optional vendor-specific subtotal
          vendorSubtotal: vendorProducts.reduce((total, item) => {
            return total + item.price * item.quantity;
          }, 0),
        };
      })
      .filter(Boolean);

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message: "Vendor orders fetched successfully.",
        count: vendorOrders.length,
        data: vendorOrders,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // ==========================================
    // ERROR
    // ==========================================

    console.error("GET VENDOR ORDERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch vendor orders.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}
