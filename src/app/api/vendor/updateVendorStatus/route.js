// import { auth } from "@/auth";
// import connectDb from "@/lib/connectDb";
// import User from "@/model/user";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//        try {
//               await connectDb();

//               // admin check
//               const session = await auth();

//               const admin = await User.findOne({ email: session?.user?.email });

//               if (!admin || admin.userRole !== "admin") {
//                      return NextResponse.json(
//                             {
//                                    success: false,
//                                    message: "Unauthorized: Admin access only",
//                             },
//                             { status: 403 }
//                      );
//               }

//               // request body
//               const { vendorId, status, rejectionReason } = await req.json();

//               if (!vendorId || !status) {
//                      return NextResponse.json(
//                             {
//                                    success: false,
//                                    message: "vendorId and status required",
//                             },
//                             { status: 400 }
//                      );
//               }

//               // 🔥 find vendor
//               const vendor = await User.findById(vendorId);

//               if (!vendor) {
//                      return NextResponse.json(
//                             {
//                                    success: false,
//                                    message: "Vendor not found",
//                             },
//                             { status: 404 }
//                      );
//               }

//               // 🔥 APPROVE
//               if (status === "approved") {
//                      vendor.approvalStatus = "approved";
//                      vendor.requestApprovedAt = new Date();
//                      vendor.rejectionReason = null;

//                      await vendor.save();

//                      return NextResponse.json({
//                             success: true,
//                             message: "Vendor approved successfully",
//                      });
//               }

//               // 🔥 REJECT
//               if (status === "rejected") {
//                      vendor.approvalStatus = "rejected";
//                      vendor.rejectionReason = rejectionReason || "Not specified";
//                      vendor.requestApprovedAt = new Date();

//                      await vendor.save();

//                      return NextResponse.json({
//                             success: true,
//                             message: "Vendor rejected successfully",
//                      });
//               }

//               return NextResponse.json(
//                      {
//                             success: false,
//                             message: "Invalid status",
//                      },
//                      { status: 400 }
//               );
//        } catch (error) {
//               console.error("Vendor approval error:", error);

//               return NextResponse.json(
//                      {
//                             success: false,
//                             message: "Internal Server Error",
//                      },
//                      { status: 500 }
//               );
//        }
// }




import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import eventHandler from "@/lib/eventHandlor";
import User from "@/model/user";
import { NextResponse } from "next/server";
export async function POST(req) {
       try {
              await connectDb();

              // admin check
              const session = await auth();

              const admin = await User.findOne({ email: session?.user?.email });

              if (!admin || admin.userRole !== "admin") {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "Unauthorized: Admin access only",
                            },
                            { status: 403 }
                     );
              }

              // request body
              const { vendorId, status, rejectionReason } = await req.json();

              if (!vendorId || !status) {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "vendorId and status required",
                            },
                            { status: 400 }
                     );
              }

              // 🔥 find vendor
              const vendor = await User.findById(vendorId);

              if (!vendor) {
                     return NextResponse.json(
                            {
                                   success: false,
                                   message: "Vendor not found",
                            },
                            { status: 404 }
                     );
              }

              // 🔥 APPROVE
              // updateVendorStatus API

              if (status === "approved") {
                     vendor.approvalStatus = "approved";
                     vendor.requestApprovedAt = new Date();
                     vendor.rejectionReason = null;

                     await vendor.save();

                     // Latest Pending Vendors
                     const pendingVendors = await User.find({
                            userRole: "vendor",
                            approvalStatus: "pending",
                     }).sort({ createdAt: -1 }).lean();

                     await eventHandler(
                            "new-approvel-for-notification",
                            pendingVendors
                     );

                     return NextResponse.json({
                            success: true,
                            message: "Vendor approved successfully",
                     });
              }

              // 🔥 REJECT
              if (status === "rejected") {
                     vendor.approvalStatus = "rejected";
                     vendor.rejectionReason = rejectionReason || "Not specified";
                     vendor.requestApprovedAt = new Date();

                     await vendor.save();

                     const pendingVendors = await User.find({
                            userRole: "vendor",
                            approvalStatus: "pending",
                     }).sort({ createdAt: -1 }).lean();

                     await eventHandler(
                            "new-approvel-for-notification",
                            pendingVendors
                     );

                     return NextResponse.json({
                            success: true,
                            message: "Vendor rejected successfully",
                     });
              }

              return NextResponse.json(
                     {
                            success: false,
                            message: "Invalid status",
                     },
                     { status: 400 }
              );
       } catch (error) {
              console.error("Vendor approval error:", error);

              return NextResponse.json(
                     {
                            success: false,
                            message: "Internal Server Error",
                     },
                     { status: 500 }
              );
       }
}