import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Order from "@/model/order";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
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

    const vendor = await User.findOne({
      email: session.user.email,
    })
      .select(
        "_id name email phone userRole shopName shopAddress approvalStatus"
      )
    .lean();


    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "User account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (vendor.userRole !== "vendor") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Only vendors can view orders.",
          role: vendor.userRole,
        },
        {
          status: 403,
        }
      );
    }

    const vendorId = vendor._id.toString();

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
        select: "name email phone image profileImage",
      })

      .sort({
        createdAt: -1,
      })

    .lean();

    const vendorOrders = orders
      .map((order) => {
        const vendorProducts = (order.products || []).filter(
          (item) => {
            if (!item.productId) {
              return false;
            }
            const productVendorId =
            item.productId.vendorUser;

            if (!productVendorId) {
              return false;
            }

            return (
              productVendorId.toString() ===
              vendorId
            );
          }
        );

        if (vendorProducts.length === 0) {
          return null;
        }
        const vendorSubtotal =
          vendorProducts.reduce(
            (total, item) => {
              const price = Number(
                item.price || 0
              );

              const quantity = Number(
                item.quantity || 0
              );

              return (
                total +
                price * quantity
              );
            },
            0
          );

        const vendorTotalItems =
          vendorProducts.reduce(
            (total, item) => {
              return (
                total +
                Number(item.quantity || 0)
              );
            },
            0
          );

        return {
          _id: order._id,

          userId: order.userId,

          customer: order.userId
            ? {
                _id: order.userId._id,
                name: order.userId.name,
                email: order.userId.email,
                phone: order.userId.phone,
                image:
                  order.userId.profileImage ||
                  order.userId.image ||
                  null,
              }
            : null,

          address: order.address,

          location: order.location,

          paymentMethod:
            order.paymentMethod,

          paymentStatus:
            order.paymentStatus,

          orderStatus:
            order.orderStatus,

          products: vendorProducts,

          vendorSubtotal,

          vendorTotalItems,

          createdAt:
            order.createdAt,

          updatedAt:
            order.updatedAt,
        };
      })
      .filter(Boolean);

   
    const totalOrders =
      vendorOrders.length;

    const totalItems = vendorOrders.reduce(
      (total, order) => {
        return (
          total +
          Number(
            order.vendorTotalItems || 0
          )
        );
      },
      0
    );

    const totalRevenue = vendorOrders.reduce(
      (total, order) => {
        return (
          total +
          Number(
            order.vendorSubtotal || 0
          )
        );
      },
      0
    );

    // ==========================================
    // ORDER STATUS COUNT
    // ==========================================

    const orderStatus = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    vendorOrders.forEach((order) => {
      if (
        orderStatus[
          order.orderStatus
        ] !== undefined
      ) {
        orderStatus[
          order.orderStatus
        ]++;
      }
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Vendor orders fetched successfully.",

        vendor: {
          _id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
          shopName: vendor.shopName,
          shopAddress: vendor.shopAddress,
          approvalStatus:
            vendor.approvalStatus,
        },

        count: totalOrders,

        summary: {
          totalOrders,
          totalItems,
          totalRevenue,
        },

        orderStatus,

        data: vendorOrders,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET VENDOR ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch vendor orders.",
      },
      {
        status: 500,
      }
    );
  }
}
