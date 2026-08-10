import User from "@/model/user";
import connectDb from "@/lib/connectDb";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function PUT(req) {
  try {
    await connectDb();

    const formData = await req.formData();

    const fullName = formData.get("fullName");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const profileImage = formData.get("profileImage");

    if (!fullName || !phone || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name, phone and email are required",
        },
        {
          status: 400,
        },
      );
    }

    const existUser = await User.findOne({ email });

    if (!existUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User doesn't exist",
        },
        {
          status: 404,
        },
      );
    }

    existUser.name = fullName.trim();
    existUser.phone = phone.trim();

    if (
      profileImage &&
      typeof profileImage !== "string" &&
      profileImage.size > 0
    ) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(profileImage.type)) {
        return NextResponse.json(
          {
            success: false,
            message: "Only JPG, JPEG, PNG and WEBP images are allowed",
          },
          { status: 400 },
        );
      }

      // 5MB maximum
      const maxSize = 5 * 1024 * 1024;

      if (profileImage.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            message: "Profile image must be less than 5MB",
          },
          {
            status: 400,
          },
        );
      }

      const bytes = await profileImage.arrayBuffer();

      const buffer = Buffer.from(bytes);

      // -----------------------------
      // Convert Buffer to Base64
      // -----------------------------

      const base64Image = `data:${profileImage.type};base64,${buffer.toString("base64",)}`;
        
      

      // -----------------------------
      // Delete Old Cloudinary Image
      // -----------------------------

      if (existUser.profileImagePublicId) {
        try {
          await cloudinary.uploader.destroy(existUser.profileImagePublicId);
        } catch (error) {
          console.error("Old profile image delete error:", error);
        }
      }

      // -----------------------------
      // Upload New Image
      // -----------------------------

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "bill-generator/profile-images",
        resource_type: "image",
      });

      // -----------------------------
      // Save Cloudinary Details
      // -----------------------------

      existUser.profileImage = uploadResponse.secure_url;

      existUser.profileImagePublicId = uploadResponse.public_id;
    }

    // -----------------------------
    // Save User
    // -----------------------------

    await existUser.save();

    // -----------------------------
    // Response
    // -----------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",

        user: {
          _id: existUser._id,
          name: existUser.name,
          email: existUser.email,
          phone: existUser.phone,
          userRole: existUser.userRole,
          profileImage: existUser.profileImage,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Update Profile Error:", error);

    return NextResponse.json(
      {success: false , message: "Something went wrong while updating profile"},
      {status: 500},
    );
  }
}
