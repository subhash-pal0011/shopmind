import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/connectDb";
import eventHandler from "@/lib/eventHandlor";
import Product from "@/model/product";
import { NextResponse } from "next/server";


export async function POST(request) {
  try {
    await connectDb();

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Please login first" },
        { status: 401 },
      );
    }

    if (session.user.role !== "vendor") {
      return NextResponse.json(
        { success: false, message: "Only vendors can add products" },
        { status: 403 },
      );
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
      console.error("Cloudinary environment variables are missing");
      return NextResponse.json(
        {success: false, message: "Cloudinary configuration is missing"},
        { status: 500 },
      );
    }

    const formData = await request.formData();

    const ProductTitle =
      formData.get("ProductTitle")?.toString().trim() || "";

    const Price = Number(formData.get("Price"));

    const StockQuantity = Number(formData.get("StockQuantity"));

    const Category =
      formData.get("Category")?.toString().trim() || "";

    const Size =
      formData.get("Size")?.toString().trim() || "";

    const Description =
      formData.get("Description")?.toString().trim() || "";

    const ReplaceDay =
      Number(formData.get("ReplaceDay") || 0);

    const Warranty =
      formData.get("Warranty")?.toString().trim() || "";

    const freeDelivery =
      formData.get("freeDelivery")?.toString() === "true";

    const payOnDelivery =
      formData.get("payOnDelivery")?.toString() === "true";

    const detailsPoint = [];

    for (let i = 1; i <= 5; i++) {
      const point = formData
        .get(`Point${i}`)
        ?.toString()
        .trim();
      if (point) {
        detailsPoint.push(point);
      }
    }

    if (ProductTitle.length < 3 || ProductTitle.length > 100) {
      return NextResponse.json(
        {success: false, message:"Product title must be between 3 and 100 characters"},
        { status: 400 },
      );
    }

    if (!Number.isFinite(Price) || Price < 1) {
      return NextResponse.json(
        {success: false, message: "Product price must be at least 1"},
        { status: 400 },
      );
    }

    if (!Number.isFinite(StockQuantity) || StockQuantity < 0) {
      return NextResponse.json(
        {success: false, message: "Invalid stock quantity"},
        { status: 400 },
      );
    }

    if (!Category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 },
      );
    }

    if (!Description || Description.length < 10 || Description.length > 1000){
      return NextResponse.json(
        {
          success: false,
          message:
            "Description must be between 10 and 1000 characters",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(ReplaceDay) || ReplaceDay < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid replacement days",
        },
        { status: 400 },
      );
    }

    if (Warranty.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Warranty cannot exceed 100 characters",
        },
        { status: 400 },
      );
    }

    if ((Category === "Clothing" || Category === "Shoes") && !Size) {
      return NextResponse.json(
        {
          success: false,
          message: "Size is required for clothing and shoes",
        },
        { status: 400 },
      );
    }

    const imageFiles = formData
      .getAll("images")
      .filter(
        (file) =>
          file &&
          typeof file === "object" &&
          typeof file.arrayBuffer === "function" &&
          file.size > 0,
      );

    if (imageFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one product image is required",
        },
        { status: 400 },
      );
    }

    if (imageFiles.length > 4) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum 4 images are allowed",
        },
        { status: 400 },
      );
    }

    const uploadedImages = [];

    for (const file of imageFiles) {
      try {
        const bytes = await file.arrayBuffer();

        const buffer = Buffer.from(bytes);

        const uploadedImage = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
                return;
              }

              resolve(result);
            },
          );

          uploadStream.end(buffer);
        });

        if (!uploadedImage?.secure_url) {
          throw new Error("Cloudinary did not return secure_url");
        }

        uploadedImages.push(uploadedImage.secure_url);
      } catch (cloudinaryError) {
        console.error(
          "CLOUDINARY UPLOAD ERROR:",
          cloudinaryError,
        );

        return NextResponse.json(
          {success: false, message:"Image upload failed. Please check Cloudinary configuration.",
            error:process.env.NODE_ENV === "development" ? cloudinaryError?.message : undefined,
          },
          { status: 502 },
        );
      }
    }

    const product = await Product.create({
      title: ProductTitle,

      description: Description,

      price: Price,

      stock: StockQuantity,

      isStockAvailable: StockQuantity > 0,

      vendorUser: session.user.id,

      productImg: uploadedImages,

      category: Category,

      size: Size,

      replaceDay: ReplaceDay,

      warranty: Warranty,

      freeDelivery: freeDelivery,

      payOnDelivery: payOnDelivery,

      detailsPoint,

      verificationStatus: "pending",

      isActive: false,

      requestAt: new Date(),
    });

    // REAL TIME
    eventHandler("product:created", product)

    return NextResponse.json(
      {
        success: true,
        message:"Product added successfully and sent for verification",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    return NextResponse.json(
      {success: false, message: "Failed to add product",
       error:process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 },
    );
  }
}

