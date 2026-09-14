import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDb();

    const { phone, role } = await req.json();

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    if (!phone || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone-Number and Role are required",
        },
        { status: 400 },
      );
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid 10-digit mobile number",
        },
        { status: 400 },
      );
    }

    if (!["user", "vendor", "admin"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role selected",
        },
        { status: 400 },
      );
    }

    const findUser = await User.findOne({
      email: session.user.email.toLowerCase(),
    });

    if (!findUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }

    if (findUser.userRole === "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "You are already an admin.",
        },
        { status: 403 },
      );
    }

    if (role === "admin") {
      const existingAdmin = await User.findOne({
        userRole: "admin",
      });

      if (existingAdmin) {
        return NextResponse.json(
          {
            success: false,
            message: "Admin already exists. You cannot become an admin.",
          },
          { status: 403 },
        );
      }
    }

    findUser.phone = phone;
    findUser.userRole = role;

    await findUser.save();

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: {
          id: findUser._id,
          name: findUser.name,
          email: findUser.email,
          phone: findUser.phone,
          userRole: findUser.userRole,
          approvalStatus: findUser.approvalStatus,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Edit Role And Phone Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
