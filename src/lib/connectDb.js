import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
       throw new Error("Please define MONGO_URL in .env.local");
}

let cached = global.mongoose;

if (!cached) {
       cached = global.mongoose = { conn: null, promise: null, };

}

async function connectDb() {
       if (cached.conn) {
              console.log("Already connected to MongoDB");
              return cached.conn;
       }

       if (!cached.promise) {
              cached.promise = mongoose.connect(MONGO_URL, {
                     bufferCommands: false, // kyu false krte hii >>> “bufferCommands:false use kiya taki database disconnected hone par mongoose queries ko memory me buffer na kare aur direct error throw kare.”.

                     // Short Yaad Karne Wali Line
                     // bufferCommands: false.
                     //        = wait mat karo
                     //        = direct error do
              });
       }

       try {
              cached.conn = await cached.promise;
              console.log("MongoDB Connected Successfully");
              return cached.conn;
       } catch (error) {
              cached.promise = null;
              console.error("MongoDB Connection Failed:", error);
              throw error;
       }
}

export default connectDb;