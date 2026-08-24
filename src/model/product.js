import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    isStockAvailable: {
      type: Boolean,
      default: true,
    },

    vendorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productImg: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    requestAt: {
      type: Date,
      default: Date.now,
    },

    rejectedReason: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    replaceDay: {
      type: Number,
      default: 0,
      min: 0,
    },

    freeDelivery: {
      type: Boolean,
      default: false,
    },

    warranty: {
      type: Boolean,
      default: false,
    },

    payOnDelivery: {
      type: Boolean,
      default: false,
    },

    detailsPoint: {
      type: [String],
      default: [],
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },

        message: {
          type: String,
          trim: true,
          default: "",
        },

        createdDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;