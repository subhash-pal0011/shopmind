// import { auth } from "@/auth";
// import connectDb from "@/lib/connectDb";
// import User from "@/model/user";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await connectDb();

//     const session = await auth();

//     if (!session?.user?.email) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Unauthorized. Please login first.",
//         },
//         { status: 401 }
//       );
//     }

//     const user = await User.findOne({
//       email: session.user.email,
//     })
//       .populate({
//         path: "orders",
//         options: {
//           sort: {
//             createdAt: -1,
//           },
//         },
//         populate: {
//           path: "products.productId",
//         },
//       })
//       .lean();

//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "User not found.",
//         },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "User orders fetched successfully.",
//         count: user.orders?.length || 0,
//         data: user.orders || [],
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("GET USER ORDERS ERROR:", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to fetch user orders.",
//         error: error?.message,
//       },
//       { status: 500 }
//     );
//   }
// }


import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";

import User from "@/model/user";
import Order from "@/model/order";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ---------------------------------------------
    // DATABASE
    // ---------------------------------------------

    await connectDb();

    // ---------------------------------------------
    // AUTH
    // ---------------------------------------------

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------
    // USER
    // ---------------------------------------------

    const user = await User.findOne({
      email: session.user.email,
    }).select("_id name email");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------
    // GET ALL ORDERS
    // ---------------------------------------------

    const orders = await Order.find({
      userId: user._id,
    })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "products.productId",
      })
      .lean();

    // ---------------------------------------------
    // RESPONSE
    // ---------------------------------------------

    return NextResponse.json(
      {
        success: true,

        message:
          "User orders fetched successfully.",

        count: orders.length,

        data: orders,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET USER ORDERS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Failed to fetch user orders.",

        error: error?.message,
      },
      {
        status: 500,
      }
    );
  }
}