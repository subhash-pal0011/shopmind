import connectDb from "@/lib/connectDb";

export async function POST(){
       try {
              await connectDb()

              
       } catch (error) {
              
       }
}