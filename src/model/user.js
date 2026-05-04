import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
       {
              name: {
                     type: String,
                     required: true,
                     trim: true,
              },

              email: {
                     type: String,
                     required: true,
                     unique: true,
                     trim: true,
              },

              password: {
                     type: String,
                     required: true,
              },

              otp: {
                     type: String,
                     default: null,
              },

              userVerified: {
                     type: Boolean,
                     default: false,
              },

              userRole: {
                     type: String,
                     enum: ["user", "vendor", "admin"],
                     default: "user",
              },

              phone: String,
              image: String,

              // Vendor Details (only for vendor)
              shopName: {
                     type: String,
                     trim: true,
              },

              shopAddress: {
                     type: String,
                     trim: true,
              },

              gstNumber: {
                     type: String,
              },

              approvalStatus: {
                     type: String,
                     enum: ["pending", "approved", "rejected"],
                     default: "pending",
              },

              rejectionReason: String,

              requestSentAt: {
                     type: Date,
                     default: Date.now,
              },

              requestApprovedAt: Date,

              products: [
                     {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Product",
                     },
              ],

              orders: [
                     {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "Order",
                     },
              ],
              cart: [
                     {
                            product: {
                                   type: mongoose.Schema.Types.ObjectId,
                                   ref: "Product",
                            },
                            quantity: {
                                   type:Number,
                                   default:1
                            }
                     }
              ]
       },
       {
              timestamps: true,
       }
);

export default mongoose.models.User || mongoose.model("User", userSchema);