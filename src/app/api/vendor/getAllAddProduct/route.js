import connectDb from "@/lib/connectDb";
import Product from "@/model/product";

export async function GET() {
  try {
    await connectDb();
    const products = await Product.find().sort({createdAt : -1});
    return Response.json(
      {success: true, data:products},
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      {success: false, message: "Failed to fetch products"},
      { status: 500 },
    );
  }
}
