import { auth } from "@/auth";
import connectDb from "@/lib/connectDb";
import Order from "@/model/order";
import Product from "@/model/product";


export async function POST(req){
    try {
        await connectDb();

        const session = await auth();


    } catch (error) {
        
    }
}