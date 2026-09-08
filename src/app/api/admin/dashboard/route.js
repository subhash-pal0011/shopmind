import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import Product from "@/model/product";
import Order from "@/model/order";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        {
          status: 401,
        },
      );
    }

    await connectDb();

    const admin = await User.findOne({
      email: session.user.email,
    })
      .select("_id name email userRole shopName approvalStatus")
    .lean();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Logged-in user was not found in database.",
        },
        {
          status: 404,
        },
      );
    }


    if (admin.userRole !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Only admin can view dashboard.",

          currentRole: admin.userRole,

          requiredRole: "admin",
        },
        {
          status: 403,
        },
      );
    }

    // GET ALL VENDORS
    const vendors = await User.find({
      userRole: "vendor",
    })
      .select(
        "_id name email phone image profileImage shopName shopAddress gstNumber approvalStatus rejectionReason requestSentAt requestApprovedAt createdAt updatedAt",
      )
      .sort({
        createdAt: -1,
      })
    .lean();

    // GET ALL PRODUCTS
    const products = await Product.find({})
      .select(
        "_id title description price stock isStockAvailable vendorUser productImg category verificationStatus isActive reviews createdAt updatedAt",
      )
      .sort({
        createdAt: -1,
      })
    .lean();

    // GET ALL ORDERS
    const orders = await Order.find({})
      .select(
        "_id userId products subtotal deliveryCharge totalAmount orderStatus paymentStatus paymentMethod address createdAt updatedAt",
      )
      .populate({
        path: "userId",
        select: "_id name email phone image profileImage",
      })
      .populate({
        path: "products.productId",
        select: "_id title price productImg category vendorUser",
      })
      .sort({
        createdAt: -1,
      })
    .lean();

    // SUMMARY
    const totalVendors = vendors.length;

    const approvedVendors = vendors.filter(
      (vendor) => vendor.approvalStatus === "approved",
    ).length;

    const pendingVendors = vendors.filter(
      (vendor) => vendor.approvalStatus === "pending",
    ).length;

    const rejectedVendors = vendors.filter(
      (vendor) => vendor.approvalStatus === "rejected",
    ).length;

    const totalProducts = products.length;

    const activeProducts = products.filter(
      (product) => product.isActive === true,
    ).length;

    const pendingProducts = products.filter(
      (product) => product.verificationStatus === "pending",
    ).length;

    const approvedProducts = products.filter(
      (product) => product.verificationStatus === "approved",
    ).length;

    const rejectedProducts = products.filter(
      (product) => product.verificationStatus === "rejected",
    ).length;

    const totalOrders = orders.length;

    // TOTAL REVENUE
    let totalRevenue = 0;

    orders.forEach((order) => {
      if (order.orderStatus === "cancelled") {
        return;
      }

      if (order.paymentStatus === "failed") {
        return;
      }

      totalRevenue += Number(order.totalAmount || 0);
    });

    // TOTAL ITEMS SOLD
    let totalItemsSold = 0;

    orders.forEach((order) => {
      if (order.orderStatus === "cancelled") {
        return;
      }

      (order.products || []).forEach((item) => {
        totalItemsSold += Number(item.quantity || 0);
      });
    });

    // TOTAL CUSTOMERS
    const customerIds = new Set();

    orders.forEach((order) => {
      if (order.userId?._id) {
        customerIds.add(order.userId._id.toString());
      }
    });

    const totalCustomers = customerIds.size;


    let totalReviews = 0;
    let ratingTotal = 0;

    products.forEach((product) => {
      if (!Array.isArray(product.reviews)) {
        return;
      }

      product.reviews.forEach((review) => {
        totalReviews++;

        ratingTotal += Number(review.rating || 0);
      });
    });

    const averageRating =
    totalReviews > 0 ? Number((ratingTotal / totalReviews).toFixed(1)) : 0;

    const orderStatus = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const status = order.orderStatus;

      if (Object.prototype.hasOwnProperty.call(orderStatus, status)) {
        orderStatus[status]++;
      }
    });

    const paymentStatus = {
      pending: 0,
      paid: 0,
      failed: 0,
    };

    orders.forEach((order) => {
      const status = order.paymentStatus;

      if (Object.prototype.hasOwnProperty.call(paymentStatus, status)) {
        paymentStatus[status]++;
      }
    });

    const paymentMethod = {
      online: 0,
      cod: 0,
    };

    orders.forEach((order) => {
      const method = order.paymentMethod;

      if (Object.prototype.hasOwnProperty.call(paymentMethod, method)) {
        paymentMethod[method]++;
      }
    });

    const vendorData = vendors.map((vendor) => {
      const vendorId = vendor._id.toString();
      const vendorProducts = products.filter(
        (product) => product.vendorUser?.toString() === vendorId,
      );

      const vendorProductIds = new Set(
        vendorProducts.map((product) => product._id.toString()),
      );

      const vendorOrders = [];

      let vendorRevenue = 0;
      let vendorItemsSold = 0;

      const vendorCustomerIds = new Set();

      orders.forEach((order) => {
        const vendorOrderProducts = (order.products || []).filter((item) => {
          if (!item.productId?._id) {
            return false;
          }

          return vendorProductIds.has(item.productId._id.toString());
        });

        if (vendorOrderProducts.length === 0) {
          return;
        }

        let vendorOrderAmount = 0;

        vendorOrderProducts.forEach((item) => {
          const price = Number(item.price || 0);

          const quantity = Number(item.quantity || 0);

          vendorOrderAmount += price * quantity;

          vendorItemsSold += quantity;
        });

        if (
          order.orderStatus !== "cancelled" &&
          order.paymentStatus !== "failed"
        ) {
          vendorRevenue += vendorOrderAmount;
        }

        if (order.userId?._id) {
          vendorCustomerIds.add(order.userId._id.toString());
        }

        vendorOrders.push({
          _id: order._id,

          customer: order.userId
            ? {
                _id: order.userId._id,
                name: order.userId.name,
                email: order.userId.email,
                phone: order.userId.phone,
                image: order.userId.profileImage || order.userId.image || null,
              }
            : null,

          products: vendorOrderProducts.map((item) => ({
            product: item.productId
              ? {
                  _id: item.productId._id,

                  title: item.productId.title,

                  price: item.productId.price,

                  image: item.productId.productImg?.[0] || null,

                  category: item.productId.category,
                }
              : null,

            quantity: item.quantity,

            price: item.price,

            total: Number(item.price || 0) * Number(item.quantity || 0),
          })),

          orderStatus: order.orderStatus,

          paymentStatus: order.paymentStatus,

          paymentMethod: order.paymentMethod,

          vendorAmount: vendorOrderAmount,

          createdAt: order.createdAt,
        });
      });

      // VENDOR REVIEWS
      let vendorReviews = 0;
      let vendorRatingTotal = 0;

      vendorProducts.forEach((product) => {
        if (!Array.isArray(product.reviews)) {
          return;
        }

        product.reviews.forEach((review) => {
          vendorReviews++;

          vendorRatingTotal += Number(review.rating || 0);
        });
      });

      const vendorAverageRating =
        vendorReviews > 0
          ? Number((vendorRatingTotal / vendorReviews).toFixed(1))
        : 0;

      // PRODUCT STATUS
      const vendorActiveProducts = vendorProducts.filter(
        (product) => product.isActive === true,
      ).length;

      const vendorPendingProducts = vendorProducts.filter(
        (product) => product.verificationStatus === "pending",
      ).length;

      const vendorApprovedProducts = vendorProducts.filter(
        (product) => product.verificationStatus === "approved",
      ).length;

      const vendorRejectedProducts = vendorProducts.filter(
        (product) => product.verificationStatus === "rejected",
      ).length;

      const vendorOrderStatus = {
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      vendorOrders.forEach((order) => {
        const status = order.orderStatus;

        if (Object.prototype.hasOwnProperty.call(vendorOrderStatus, status)) {
          vendorOrderStatus[status]++;
        }
      });

      return {
        vendor,

        stats: {
          totalProducts: vendorProducts.length,

          activeProducts: vendorActiveProducts,

          pendingProducts: vendorPendingProducts,

          approvedProducts: vendorApprovedProducts,

          rejectedProducts: vendorRejectedProducts,

          totalOrders: vendorOrders.length,

          totalCustomers: vendorCustomerIds.size,

          totalItemsSold: vendorItemsSold,

          totalRevenue: vendorRevenue,

          totalReviews: vendorReviews,

          averageRating: vendorAverageRating,
        },

        orderStatus: vendorOrderStatus,

        products: vendorProducts,

        orders: vendorOrders.slice(0, 10),
      };
    });

    const recentOrders = orders.slice(0, 10).map((order) => ({
      _id: order._id,

      customer: order.userId
        ? {
            _id: order.userId._id,
            name: order.userId.name,
            email: order.userId.email,
            phone: order.userId.phone,
            image: order.userId.profileImage || order.userId.image || null,
          }
        : null,

      totalAmount: Number(order.totalAmount || 0),

      subtotal: Number(order.subtotal || 0),

      deliveryCharge: Number(order.deliveryCharge || 0),

      orderStatus: order.orderStatus,

      paymentStatus: order.paymentStatus,

      paymentMethod: order.paymentMethod,

      createdAt: order.createdAt,
    }));

    const topVendors = [...vendorData]
      .sort(
        (a, b) =>
          Number(b.stats.totalRevenue || 0) - Number(a.stats.totalRevenue || 0),
      )
      .slice(0, 5)
      .map((item) => ({
        vendor: item.vendor,

        stats: {
          totalRevenue: item.stats.totalRevenue,

          totalOrders: item.stats.totalOrders,

          totalProducts: item.stats.totalProducts,

          totalCustomers: item.stats.totalCustomers,

          averageRating: item.stats.averageRating,
        },
      }));

    const categoryMap = new Map();

    products.forEach((product) => {
      const category = product.category?.trim() || "Uncategorized";

      const existing = categoryMap.get(category) || {
        category,
        products: 0,
        stock: 0,
      };

      existing.products += 1;

      existing.stock += Number(product.stock || 0);

      categoryMap.set(category, existing);
    });

    const categories = Array.from(categoryMap.values()).sort(
      (a, b) => b.products - a.products,
    );

    return NextResponse.json(
      {
        success: true,

        message: "Admin dashboard data fetched successfully.",

        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          userRole: admin.userRole,
        },

        summary: {
          totalVendors,

          approvedVendors,

          pendingVendors,

          rejectedVendors,

          totalProducts,

          activeProducts,

          pendingProducts,

          approvedProducts,

          rejectedProducts,

          totalOrders,

          totalCustomers,

          totalItemsSold,

          totalRevenue,

          totalReviews,

          averageRating,
        },

        orderStatus,

        paymentStatus,

        paymentMethod,

        topVendors,

        recentOrders,

        categories,

        vendors: vendorData,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("ADMIN DASHBOARD API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin dashboard data.",
      },
      {
        status: 500,
      },
    );
  }
}
