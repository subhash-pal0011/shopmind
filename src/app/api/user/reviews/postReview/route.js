import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Product from "@/model/product";
import Order from "@/model/order";
import User from "@/model/user";

export async function POST(req) {
  try {
 
    await connectDb();


    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }


    const formData = await req.formData();

    const orderId = formData.get("orderId");
    const productId = formData.get("productId");
    const rating = Number(formData.get("rating"));
    const review = formData.get("review")?.toString().trim() || "";


    if (!orderId || !productId) {
      return Response.json(
        {
          success: false,
          message: "Order ID and Product ID are required",
        },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return Response.json(
        {
          success: false,
          message: "Rating must be between 1 and 5",
        },
        { status: 400 }
      );
    }

    if (!review) {
      return Response.json(
        {
          success: false,
          message: "Please write your review",
        },
        { status: 400 }
      );
    }

    if (review.length > 500) {
      return Response.json(
        {
          success: false,
          message: "Review cannot exceed 500 characters",
        },
        { status: 400 }
      );
    }


    const order = await Order.findOne({
      _id: orderId,
      userId: user._id,
    });

    if (!order) {
      return Response.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }


    if (order.orderStatus !== "delivered") {
      return Response.json(
        {
          success: false,
          message: "You can review only delivered products",
        },
        { status: 403 }
      );
    }

    const orderedProduct = order.products.find((item) => String(item.productId) === String(productId));
      
    if (!orderedProduct) {
      return Response.json(
        {
          success: false,
          message: "This product does not belong to this order",
        },
        { status: 403 }
      );
    }

  
    const product = await Product.findById(productId);

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    const alreadyReviewed = product.reviews?.some(
      (item) =>
        String(item.user) === String(user._id)
    );

    if (alreadyReviewed) {
      return Response.json(
        {
          success: false,
          message: "You have already reviewed this product",
        },
        { status: 409 }
      );
    }

    const imageFiles = formData.getAll("images");

    const validImages = imageFiles.filter(
      (file) =>
        file &&
        typeof file === "object" &&
        file.size > 0
    );

    product.reviews.push({
      user: user._id,
      rating,
      message: review,
      createdDate: new Date(),
    });

 
    await product.save();

    return Response.json(
      {
        success: true,
        message: "Review submitted successfully",
        data: {
          productId: product._id,
          orderId: order._id,
          rating,
          review,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST REVIEW API ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Something went wrong while submitting review",
      },
      { status: 500 }
    );
  }
}