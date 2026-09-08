import { NextResponse } from "next/server";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import Product from "@/model/product";
import Order from "@/model/order";

export async function GET() {
  try {
    await connectDb();

    // Saare vendors
    const vendors = await User.find({
      userRole: "vendor",
    })
      .select(
        "name email phone image profileImage shopName shopAddress gstNumber approvalStatus rejectionReason requestSentAt requestApprovedAt createdAt updatedAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    if (!vendors.length) {
      return NextResponse.json({
        success: true,
        message: "No vendors found",
        count: 0,
        data: [],
      });
    }

    const vendorIds = vendors.map(
      (vendor) => vendor._id
    );

    // Saare vendors ke products
    const products = await Product.find({
      vendorUser: {
        $in: vendorIds,
      },
    })
      .select(
        "title price stock productImg category verificationStatus isActive vendorUser reviews createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Product IDs
    const productIds = products.map(
      (product) => product._id
    );

    // Saare orders jinke andar vendor ke products hain
    const orders = await Order.find({
      "products.productId": {
        $in: productIds,
      },
    })
      .select(
        "userId products subtotal deliveryCharge totalAmount orderStatus paymentStatus paymentMethod createdAt updatedAt address"
      )
      .populate({
        path: "userId",
        select: "name email phone image profileImage",
      })
      .populate({
        path: "products.productId",
        select:
          "title price vendorUser productImg category",
      })
      .sort({ createdAt: -1 })
      .lean();

    // -------------------------------
    // Vendor-wise data
    // -------------------------------

    const vendorData = vendors.map((vendor) => {
      const vendorId =
        vendor._id.toString();

      // Vendor products
      const vendorProducts =
        products.filter(
          (product) =>
            product.vendorUser?.toString() ===
            vendorId
        );

      const vendorProductIds =
        new Set(
          vendorProducts.map((product) =>
            product._id.toString()
          )
        );

      // Vendor orders
      const vendorOrders = [];

      let totalRevenue = 0;
      let totalItemsSold = 0;

      const customerIds = new Set();

      orders.forEach((order) => {
        const vendorOrderProducts =
          order.products.filter((item) => {
            if (!item.productId) {
              return false;
            }

            return vendorProductIds.has(
              item.productId._id.toString()
            );
          });

        if (
          vendorOrderProducts.length === 0
        ) {
          return;
        }

        let vendorOrderAmount = 0;

        vendorOrderProducts.forEach(
          (item) => {
            const amount =
              Number(item.price || 0) *
              Number(item.quantity || 0);

            vendorOrderAmount += amount;

            totalRevenue += amount;

            totalItemsSold += Number(
              item.quantity || 0
            );
          }
        );

        if (order.userId?._id) {
          customerIds.add(
            order.userId._id.toString()
          );
        }

        vendorOrders.push({
          _id: order._id,

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

          products:
            vendorOrderProducts.map(
              (item) => ({
                product:
                  item.productId
                    ? {
                        _id:
                          item.productId._id,
                        title:
                          item.productId.title,
                        image:
                          item.productId
                            .productImg?.[0] ||
                          null,
                        category:
                          item.productId
                            .category,
                      }
                    : null,

                quantity:
                  item.quantity,

                price:
                  item.price,

                total:
                  Number(
                    item.price || 0
                  ) *
                  Number(
                    item.quantity || 0
                  ),
              })
            ),

          orderStatus:
            order.orderStatus,

          paymentStatus:
            order.paymentStatus,

          paymentMethod:
            order.paymentMethod,

          vendorAmount:
            vendorOrderAmount,

          createdAt:
            order.createdAt,
        });
      });

      // -------------------------------
      // Reviews
      // -------------------------------

      let totalReviews = 0;
      let ratingTotal = 0;

      vendorProducts.forEach(
        (product) => {
          if (
            Array.isArray(
              product.reviews
            )
          ) {
            product.reviews.forEach(
              (review) => {
                totalReviews++;

                ratingTotal += Number(
                  review.rating || 0
                );
              }
            );
          }
        }
      );

      const averageRating =
        totalReviews > 0
          ? Number(
              (
                ratingTotal /
                totalReviews
              ).toFixed(1)
            )
          : 0;

      // -------------------------------
      // Product status
      // -------------------------------

      const activeProducts =
        vendorProducts.filter(
          (product) =>
            product.isActive === true
        ).length;

      const pendingProducts =
        vendorProducts.filter(
          (product) =>
            product.verificationStatus ===
            "pending"
        ).length;

      const approvedProducts =
        vendorProducts.filter(
          (product) =>
            product.verificationStatus ===
            "approved"
        ).length;

      const rejectedProducts =
        vendorProducts.filter(
          (product) =>
            product.verificationStatus ===
            "rejected"
        ).length;

      // -------------------------------
      // Order status
      // -------------------------------

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

      // -------------------------------
      // Return vendor
      // -------------------------------

      return {
        vendor: {
          ...vendor,
        },

        stats: {
          totalProducts:
            vendorProducts.length,

          activeProducts,

          pendingProducts,

          approvedProducts,

          rejectedProducts,

          totalOrders:
            vendorOrders.length,

          totalCustomers:
            customerIds.size,

          totalItemsSold,

          totalRevenue,

          totalReviews,

          averageRating,
        },

        orderStatus,

        products:
          vendorProducts,

        orders:
          vendorOrders.slice(0, 10),
      };
    });

    // -------------------------------
    // Overall admin stats
    // -------------------------------

    const totalVendors =
      vendorData.length;

    const approvedVendors =
      vendors.filter(
        (vendor) =>
          vendor.approvalStatus ===
          "approved"
      ).length;

    const pendingVendors =
      vendors.filter(
        (vendor) =>
          vendor.approvalStatus ===
          "pending"
      ).length;

    const rejectedVendors =
      vendors.filter(
        (vendor) =>
          vendor.approvalStatus ===
          "rejected"
      ).length;

    const totalRevenue =
      vendorData.reduce(
        (sum, vendor) =>
          sum +
          Number(
            vendor.stats.totalRevenue || 0
          ),
        0
      );

    const totalOrders =
      vendorData.reduce(
        (sum, vendor) =>
          sum +
          Number(
            vendor.stats.totalOrders || 0
          ),
        0
      );

    const totalProducts =
      vendorData.reduce(
        (sum, vendor) =>
          sum +
          Number(
            vendor.stats.totalProducts ||
              0
          ),
        0
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "All vendors fetched successfully",

        count: totalVendors,

        summary: {
          totalVendors,
          approvedVendors,
          pendingVendors,
          rejectedVendors,
          totalRevenue,
          totalOrders,
          totalProducts,
        },

        data: vendorData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET ALL VENDORS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch vendors",
      },
      { status: 500 }
    );
  }
}