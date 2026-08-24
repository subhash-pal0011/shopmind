// import mongoose from "mongoose";

// const productSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 3,
//       maxlength: 100,
//     },

//     description: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 10,
//       maxlength: 1000,
//     },

//     price: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     stock: {
//       type: Number,
//       required: true,
//       min: 1,
//     },

//     isStockAvailable: {
//       type: Boolean,
//       default: true,
//     },

//     vendorUser: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // Multiple product images
//     productImg: {
//       type: [String],
//       required: true,
//       validate: {
//         validator: function (images) {
//           return images.length >= 1 && images.length <= 4;
//         },
//         message: "Product must have 1 to 4 images",
//       },
//     },

//     category: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     size: {
//       type: String,
//       default: "",
//       trim: true,
//     },

//     verificationStatus: {
//       type: String,
//       enum: ["pending", "approved", "rejected"],
//       default: "pending",
//     },

//     approvedAt: {
//       type: Date,
//       default: null,
//     },

//     requestAt: {
//       type: Date,
//       default: Date.now,
//     },

//     rejectedReason: {
//       type: String,
//       trim: true,
//       default: null,
//     },

//     isActive: {
//       type: Boolean,
//       default: false,
//     },

//     replaceDay: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     freeDelivery: {
//       type: Boolean,
//       default: false,
//     },

//     warranty: {
//       type: String,
//       default: "",
//       trim: true,
//       maxlength: 100,
//     },

//     payOnDelivery: {
//       type: Boolean,
//       default: false,
//     },

//     detailsPoint: {
//       type: [String],
//       default: [],
//     },

//     reviews: [
//       {
//         user: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//           required: true,
//         },

//         rating: {
//           type: Number,
//           required: true,
//           min: 1,
//           max: 5,
//         },

//         message: {
//           type: String,
//           trim: true,
//           default: "",
//         },

//         createdDate: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   },
// );

// const Product =
//   mongoose.models.Product || mongoose.model("Product", productSchema);
// export default Product;

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
      type: [String],
      required: true,
      validate: {
        validator: function (images) {
          return (
            Array.isArray(images) && images.length >= 1 && images.length <= 4
          );
        },
        message: "Product must have 1 to 4 images",
      },
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    size: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30,
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
      default: null,
      trim: true,
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
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    payOnDelivery: {
      type: Boolean,
      default: false,
    },

    detailsPoint: {
      type: [String],
      default: [],
      validate: {
        validator: function (points) {
          return points.length <= 5;
        },
        message: "Maximum 5 highlights are allowed",
      },
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
          default: "",
          trim: true,
          maxlength: 500,
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
  },
);
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
