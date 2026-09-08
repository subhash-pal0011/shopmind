import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import Product from "@/model/product";
import Order from "@/model/order";

const getDateRange = (period) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();

  if (period === "30") {
    start.setDate(start.getDate() - 29);
  } else if (period === "90") {
    start.setDate(start.getDate() - 89);
  } else {
    start.setDate(start.getDate() - 6);
  }

  start.setHours(0, 0, 0, 0);

  return { start, end };
};

const getPreviousDateRange = (period) => {
  const days = period === "30" ? 30 : period === "90" ? 90 : 7;

  const end = new Date();
  end.setHours(23, 59, 59, 999);
  end.setDate(end.getDate() - days);

  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

const calculatePercentage = (current, previous) => {
  if (!previous) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const formatDateKey = (date) => {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export async function GET(request) {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }


    const vendor = await User.findOne({
      email: session.user.email,
    }).select("_id name email");

    if (!vendor) {
      return NextResponse.json(
        {
          success: false,
          message: "Vendor not found",
        },
        {
          status: 404,
        }
      );
    }

    const { searchParams } = new URL(request.url);

    const periodParam = searchParams.get("period") || "7";

    const period = ["7", "30", "90"].includes(periodParam)
      ? periodParam
      : "7";

    const { start, end } = getDateRange(period);

    const previousRange = getPreviousDateRange(period);

    // ==========================================
    // VENDOR PRODUCTS
    // ==========================================
    const products = await Product.find({
      vendorUser: vendor._id,
    })
      .select(
        "_id title price stock productImg category isActive verificationStatus reviews"
      )
      .lean();

    const productIds = products.map((product) => product._id);

    const productIdSet = new Set(
      productIds.map((id) => String(id))
    );

    const productMap = new Map();

    products.forEach((product) => {
      productMap.set(String(product._id), product);
    });

    // ==========================================
    // ORDERS CONTAINING VENDOR PRODUCTS
    // ==========================================

    const allOrders = await Order.find({
      "products.productId": {
        $in: productIds,
      },
    })
      .sort({
        createdAt: -1,
      })
    .lean();

    // ==========================================
    // BASIC PRODUCT STATS
    // ==========================================
    const totalProducts = products.length;

    const activeProducts = products.filter(
      (product) => product.isActive === true
    ).length;

    const pendingProducts = products.filter(
      (product) => product.verificationStatus === "pending"
    ).length;

    const lowStockProducts = products
      .filter((product) => Number(product.stock || 0) <= 5)
      .sort(
        (a, b) =>
          Number(a.stock || 0) -
          Number(b.stock || 0)
      )
      .slice(0, 6)
      .map((product) => ({
        id: product._id,
        name: product.title || "Product",
        stock: Number(product.stock || 0),
        image:
          Array.isArray(product.productImg) &&
          product.productImg.length
            ? product.productImg[0]
            : null,
      }));

    // ==========================================
    // ALL VENDOR ORDERS
    // ==========================================
    const vendorOrders = [];

    let totalRevenue = 0;
    let totalOrders = 0;

    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    const customers = new Set();

    const topProductMap = new Map();

    // ==========================================
    // PERIOD SALES
    // ==========================================
    const salesMap = new Map();

    const periodDays =
      period === "30" ? 30 : period === "90" ? 90 : 7;

    for (let i = 0; i < periodDays; i++) {
      const date = new Date(start);

      date.setDate(start.getDate() + i);

      salesMap.set(formatDateKey(date), {
        date: formatDateKey(date),
        value: 0,
        orders: 0,
      });
    }

    // ==========================================
    // PREVIOUS PERIOD REVENUE
    // ==========================================
    let previousRevenue = 0;

    let currentPeriodOrders = 0;
    let previousPeriodOrders = 0;

    // ==========================================
    // PROCESS ORDERS
    // ==========================================
    for (const order of allOrders) {
      const vendorItems = Array.isArray(order.products)
        ? order.products.filter((item) =>
            productIdSet.has(
              String(item.productId)
            )
          )
        : [];

      if (!vendorItems.length) {
        continue;
      }

      totalOrders++;

      if (order.userId) {
        customers.add(String(order.userId));
      }

      const vendorAmount = vendorItems.reduce(
        (sum, item) => {
          const quantity = Number(
            item.quantity || 1
          );

          const price = Number(
            item.price ||
              productMap.get(
                String(item.productId)
              )?.price ||
              0
          );

          return sum + price * quantity;
        },
        0
      );

      const status = order.orderStatus;

      // ========================================
      // ORDER STATUS
      // ========================================
      if (
        status === "pending" ||
        status === "confirmed"
      ) {
        processingOrders++;
      }

      if (status === "shipped") {
        shippedOrders++;
      }

      if (status === "delivered") {
        deliveredOrders++;

        totalRevenue += vendorAmount;
      }

      if (status === "cancelled") {
        cancelledOrders++;
      }

      // ========================================
      // TOP PRODUCTS
      // Only delivered orders
      // ========================================

      if (status === "delivered") {
        for (const item of vendorItems) {
          const productId = String(
            item.productId
          );

          const product =
            productMap.get(productId);

          if (!product) continue;

          const quantity = Number(
            item.quantity || 1
          );

          const price = Number(
            item.price || product.price || 0
          );

          const amount = price * quantity;

          if (!topProductMap.has(productId)) {
            topProductMap.set(productId, {
              id: product._id,
              name: product.title,
              category:
                product.category || "General",
              sales: 0,
              revenue: 0,
              rating: 0,
              stock: Number(
                product.stock || 0
              ),
              image:
                Array.isArray(
                  product.productImg
                ) &&
                product.productImg.length
                  ? product.productImg[0]
                  : null,
            });
          }

          const topProduct =
            topProductMap.get(productId);

          topProduct.sales += quantity;
          topProduct.revenue += amount;
        }
      }

      // ========================================
      // CURRENT PERIOD SALES
      // ========================================
      const orderDate = new Date(
        order.createdAt
      );

      if (
        orderDate >= start &&
        orderDate <= end
      ) {
        currentPeriodOrders++;

        if (status === "delivered") {
          const key =
            formatDateKey(orderDate);

          if (salesMap.has(key)) {
            const current =
              salesMap.get(key);

            current.value += vendorAmount;
            current.orders += 1;

            salesMap.set(key, current);
          }
        }
      }

      // ========================================
      // PREVIOUS PERIOD
      // ========================================
      if (
        orderDate >= previousRange.start &&
        orderDate <= previousRange.end
      ) {
        previousPeriodOrders++;

        if (status === "delivered") {
          previousRevenue += vendorAmount;
        }
      }

      // ========================================
      // RECENT ORDERS
      // ========================================
      if (vendorOrders.length < 10) {
        const firstItem = vendorItems[0];

        const firstProduct =
          productMap.get(
            String(firstItem.productId)
          );

        vendorOrders.push({
          id: order._id,
          orderNumber: `#ORD-${String(
            order._id
          ).slice(-8).toUpperCase()}`,

          customer:
            order.address?.fullName ||
            "Customer",

          product:
            firstProduct?.title ||
            "Product",

          productCount:
            vendorItems.length,

          amount: vendorAmount,

          status:
            order.orderStatus || "pending",

          paymentStatus:
            order.paymentStatus || "pending",

          date: order.createdAt,

          image:
            firstProduct &&
            Array.isArray(
              firstProduct.productImg
            ) &&
            firstProduct.productImg.length
              ? firstProduct.productImg[0]
              : null,
        });
      }
    }

    // ==========================================
    // TOP PRODUCT RATINGS
    // ==========================================
    const topProducts = Array.from(
      topProductMap.values()
    )
      .map((product) => {
        const originalProduct =
          productMap.get(
            String(product.id)
          );

        const reviews =
          Array.isArray(
            originalProduct?.reviews
          )
            ? originalProduct.reviews
            : [];

        const rating =
          reviews.length > 0
            ? reviews.reduce(
                (sum, review) =>
                  sum +
                  Number(
                    review?.rating || 0
                  ),
                0
              ) / reviews.length
            : 0;

        return {
          ...product,
          rating: Number(
            rating.toFixed(1)
          ),
        };
      })
      .sort(
        (a, b) =>
          b.sales - a.sales
      )
      .slice(0, 5);

    // ==========================================
    // STORE RATING
    // ==========================================
    let totalReviews = 0;
    let ratingSum = 0;

    for (const product of products) {
      const reviews =
        Array.isArray(product.reviews)
          ? product.reviews
          : [];

      totalReviews += reviews.length;

      ratingSum += reviews.reduce(
        (sum, review) =>
          sum +
          Number(
            review?.rating || 0
          ),
        0
      );
    }

    const averageRating =
      totalReviews > 0
        ? Number(
            (
              ratingSum /
              totalReviews
            ).toFixed(1)
          )
        : 0;

    // ==========================================
    // CURRENT PERIOD REVENUE
    // ==========================================
    const currentPeriodRevenue =
      Array.from(
        salesMap.values()
      ).reduce(
        (sum, item) =>
          sum + item.value,
        0
      );

    // ==========================================
    // SALES DATA
    // ==========================================
    let salesData = Array.from(
      salesMap.values()
    );

    if (period === "7") {
      salesData = salesData.map(
        (item) => ({
          ...item,
          day: new Date(
            `${item.date}T00:00:00`
          ).toLocaleDateString(
            "en-IN",
            {
              weekday: "short",
            }
          ),
        })
      );
    } else {
      salesData = salesData.map(
        (item) => ({
          ...item,
          day: new Date(
            `${item.date}T00:00:00`
          ).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short",
            }
          ),
        })
      );
    }

    // ==========================================
    // MAX SALES FOR CHART
    // ==========================================
    const maxSales = Math.max(
      ...salesData.map(
        (item) => item.value
      ),
      1
    );

    salesData = salesData.map(
      (item) => ({
        ...item,
        percentage: Math.max(
          (item.value / maxSales) *
            100,
          item.value > 0 ? 5 : 0
        ),
      })
    );

    // ==========================================
    // ORDER TOTAL
    // ==========================================
    const orderStatusTotal =
      processingOrders +
      shippedOrders +
      deliveredOrders +
      cancelledOrders;

    // ==========================================
    // RESPONSE
    // ==========================================
    return NextResponse.json(
      {
        success: true,

        message:
          "Vendor dashboard fetched successfully.",

        data: {
          vendor: {
            id: vendor._id,
            name:
              vendor.name ||
              "Vendor",
            email: vendor.email,
          },

          stats: {
            totalRevenue,
            totalOrders,
            totalProducts,
            activeProducts,
            pendingProducts,
            customers: customers.size,

            averageRating,
            totalReviews,

            lowStockCount:
              lowStockProducts.length,
          },

          period: {
            value: period,
            currentRevenue:
              currentPeriodRevenue,

            previousRevenue,

            revenueChange:
              calculatePercentage(
                currentPeriodRevenue,
                previousRevenue
              ),

            currentOrders:
              currentPeriodOrders,

            previousOrders:
              previousPeriodOrders,

            orderChange:
              calculatePercentage(
                currentPeriodOrders,
                previousPeriodOrders
              ),
          },

          orderSummary: {
            processing:
              processingOrders,

            shipped:
              shippedOrders,

            delivered:
              deliveredOrders,

            cancelled:
              cancelledOrders,

            total:
              orderStatusTotal,
          },

          salesData,

          recentOrders:
            vendorOrders,

          topProducts,

          lowStockProducts,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "VENDOR DASHBOARD API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch vendor dashboard.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}