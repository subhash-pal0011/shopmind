"use client";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Truck,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Package,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { IoArrowBackOutline } from "react-icons/io5";
import CheckoutPage from "../checkout/page";

const Page = () => {
  const [product, setProduct] = useState([]);

  const [loading, setLoading] = useState(true);

  const [removingId, setRemovingId] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const getCart = async () => {
      try {
        setLoading(true);

        const res = await axios.get("/api/user/card/getCartProduct");

        if (res.data.success) {
          setProduct(res.data.data || []);
        } else {
          setProduct([]);
        }
      } catch (error) {
        console.error("Get Cart Error:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
    getCart();
  }, []);

  // =====================================================
  // INCREASE / DECREASE QUANTITY
  // =====================================================
  const incressDecries = async (productId, action) => {
    try {
      if (!productId) {
        console.error("Product ID missing");
        return;
      }

      setUpdatingId(productId);

      const res = await axios.put("/api/user/card/upadateCard", {
        productId,
        action,
      });

      if (res.data.success) {
        // API se updated cart
        setProduct(res.data.data || []);
      } else {
        console.error("Quantity update failed:", res.data.message);
      }
    } catch (error) {
      console.error(
        "Quantity Update Error:",
        error.response?.data || error.message,
      );
    } finally {
      setUpdatingId(null);
    }
  };
  const increaseQuantity = (productId) => {
    incressDecries(productId, "increase");
  };
  const decreaseQuantity = (productId) => {
    incressDecries(productId, "decrease");
  };

  const removeProduct = async (cartId) => {
    try {
      if (!cartId) return;

      setRemovingId(cartId);
      const res = await axios.delete("/api/user/card/deleteAddProduct", {
        data: {
          cartId,
        },
      });

      if (res.data.success) {
        setProduct(res.data.data || []);
      }
    } catch (error) {
      console.error(
        "Remove Product Error:",
        error.response?.data || error.message,
      );
    } finally {
      setRemovingId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price || 0));
  };

  // =====================================================
  // SUBTOTAL
  // =====================================================
  const subtotal = useMemo(() => {
    return product.reduce((total, item) => {
      const price = Number(item.product?.price || 0);
      const quantity = Number(item.quantity || 0);

      return total + price * quantity;
    }, 0);
  }, [product]);

  // =====================================================
  // TOTAL ITEMS
  // =====================================================
  const totalItems = useMemo(() => {
    return product.reduce((total, item) => {
      return total + Number(item.quantity || 0);
    }, 0);
  }, [product]);

  // =====================================================
  // DELIVERY
  // =====================================================
  const deliveryCharge = useMemo(() => {
    if (!product?.length) return 0;

    const hasPaidDeliveryProduct = product.some((item) => {
      const freeDelivery = item?.product?.freeDelivery;

      return freeDelivery === false;
    });

    return hasPaidDeliveryProduct ? 40 : 0;
  }, [product]);

  // =====================================================
  // GRAND TOTAL
  // =====================================================
  const grandTotal = subtotal + deliveryCharge;

  // =====================================================
  // PAGE ANIMATION
  // =====================================================
  const pageVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,

      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
      },
    },
  };

  // =====================================================
  // ITEM ANIMATION
  // =====================================================
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },

    exit: {
      opacity: 0,
      x: -80,
      scale: 0.95,

      transition: {
        duration: 0.3,
      },
    },
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="flex flex-col items-center"
        >
          <div className="relative w-16 h-16">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 border-4 border-gray-200 border-t-blue-600 rounded-full"
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart size={22} className="text-blue-600" />
            </div>
          </div>

          <motion.p
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="mt-5 text-gray-600 font-medium"
          >
            Loading your cart...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // =====================================================
  // EMPTY CART
  // =====================================================
  if (product.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center"
        >
          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center"
          >
            <ShoppingBag size={42} className="text-blue-600" />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mt-3 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Start
            shopping and add your favorite products.
          </p>

          <motion.button
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() => router.push("/")}
            className="mt-7 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-200"
          >
            Continue Shopping
            <ArrowRight size={19} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 py-6 sm:py-5 px-3 sm:px-5 lg:px-8"
    >
      <div className="max-w-[1600px] mx-auto">
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 text-sm text-gray-500 mb-5"
        >
          <button
            onClick={() => router.push("/")}
            className="hover:text-blue-600 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <IoArrowBackOutline size={20} />
            <span>Home</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* =================================================
              LEFT PRODUCTS
          ================================================= */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {product.map((item) => {
                const itemProduct = item.product;
                if (!itemProduct) {
                  return null;
                }

                const isRemoving = removingId === item._id;

                const isUpdating = updatingId === itemProduct._id;

                const currentQuantity = Number(item.quantity || 1);

                const stock = Number(itemProduct.stock || 0);

                return (
                  <motion.div
                    key={item._id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{
                      y: -3,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                    className={`
                      bg-white
                      rounded-2xl
                      border
                      border-gray-200
                      shadow-sm
                      hover:shadow-xl
                      transition-shadow
                      p-4
                      sm:p-5
                      ${isRemoving ? "opacity-50" : ""}
                    `}
                  >
                    {/* =================================================
                        PRODUCT MAIN
                    ================================================= */}

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full">
                      {/* IMAGE */}

                      <motion.div
                        whileHover={{
                          scale: 1.03,
                        }}
                        className="
                          w-full
                          h-52
                          sm:w-32
                          sm:h-36
                          md:w-36
                          md:h-40
                          lg:w-40
                          lg:h-44
                          bg-gray-50
                          rounded-2xl
                          overflow-hidden
                          shrink-0
                          border
                          border-gray-100
                        "
                      >
                        <motion.img
                          whileHover={{
                            scale: 1.08,
                          }}
                          transition={{
                            duration: 0.4,
                          }}
                          src={itemProduct.productImg?.[0]}
                          alt={itemProduct.title || "Product"}
                          className="
                            w-full
                            h-full
                            object-contain
                            p-3
                            sm:p-2
                          "
                        />
                      </motion.div>

                      {/* DETAILS */}

                      <div className="flex-1 min-w-0 w-full">
                        {/* TITLE + DELETE */}

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h2
                              className="
                                font-bold
                                text-gray-900
                                text-base
                                sm:text-lg
                                md:text-xl
                                leading-snug
                                line-clamp-2
                                wrap-break-word
                              "
                            >
                              {itemProduct.title}
                            </h2>

                            <p
                              className="
                                text-xs
                                sm:text-sm
                                text-gray-500
                                mt-1
                                truncate
                              "
                            >
                              {itemProduct.category}
                            </p>
                          </div>

                          {/* DELETE */}

                          <motion.button
                            whileHover={{
                              scale: 1.1,
                              rotate: 5,
                            }}
                            whileTap={{
                              scale: 0.85,
                            }}
                            disabled={isRemoving}
                            onClick={() => removeProduct(item._id)}
                            className="
                              cursor-pointer
                              w-8
                              h-8
                              sm:w-9
                              sm:h-9
                              rounded-full
                              flex
                              items-center
                              justify-center
                              text-gray-400
                              hover:text-red-500
                              hover:bg-red-50
                              transition
                              shrink-0
                              disabled:opacity-40
                              disabled:cursor-not-allowed
                            "
                          >
                            <Trash2 size={17} />
                          </motion.button>
                        </div>

                        {/* PRICE */}

                        <motion.div layout className="mt-2 sm:mt-3">
                          <span
                            className="
                              text-lg
                              sm:text-xl
                              md:text-2xl
                              font-bold
                              text-gray-900
                            "
                          >
                            {formatPrice(itemProduct.price)}
                          </span>
                        </motion.div>

                        {/* SIZE + STOCK */}

                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                            mt-3
                          "
                        >
                          <span
                            className="
                              text-xs
                              sm:text-sm
                              bg-gray-100
                              px-2.5
                              sm:px-3
                              py-1.5
                              rounded-lg
                              text-gray-700
                              whitespace-nowrap
                            "
                          >
                            Size: <b>{itemProduct.size || "N/A"}</b>
                          </span>

                          <span
                            className={`
                              text-[11px]
                              sm:text-xs
                              font-medium
                              px-2.5
                              sm:px-3
                              py-1.5
                              rounded-lg
                              whitespace-nowrap

                              ${
                                itemProduct.isStockAvailable
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-600"
                              }
                            `}
                          >
                            {itemProduct.isStockAvailable
                              ? `${stock} in stock`
                              : "Out of stock"}
                          </span>
                        </div>

                        {/* =================================================
                            QUANTITY + TOTAL
                        ================================================= */}

                        <div
                          className="
                            flex
                            flex-col
                            sm:flex-row
                            items-start
                            sm:items-center
                            justify-between
                            gap-4
                            mt-4
                            pt-3
                            border-t
                            border-gray-100
                          "
                        >
                          {/* QUANTITY */}

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 sm:hidden">
                              Quantity
                            </span>

                            <div
                              className="
                                flex
                                items-center
                                border
                                border-gray-200
                                rounded-xl
                                overflow-hidden
                                bg-white
                                shadow-sm
                              "
                            >
                              {/* MINUS */}

                              <motion.button
                                whileHover={{
                                  backgroundColor: "#f3f4f6",
                                }}
                                whileTap={{
                                  scale: 0.85,
                                }}
                                disabled={currentQuantity <= 1 || isUpdating}
                                onClick={() =>
                                  decreaseQuantity(itemProduct._id)
                                }
                                className="
                                  w-8
                                  h-8
                                  sm:w-9
                                  sm:h-9
                                  flex
                                  items-center
                                  justify-center
                                  transition
                                  cursor-pointer
                                  disabled:opacity-30
                                  disabled:cursor-not-allowed
                                "
                              >
                                <Minus size={15} />
                              </motion.button>

                              {/* QUANTITY */}

                              <motion.span
                                key={currentQuantity}
                                initial={{
                                  opacity: 0,
                                  y: -5,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                className="
                                  w-9
                                  sm:w-10
                                  text-center
                                  font-bold
                                  text-gray-800
                                  text-sm
                                  sm:text-base
                                "
                              >
                                {isUpdating ? (
                                  <motion.span
                                    animate={{
                                      opacity: [0.3, 1, 0.3],
                                    }}
                                    transition={{
                                      duration: 1,
                                      repeat: Infinity,
                                    }}
                                  >
                                    {currentQuantity}
                                  </motion.span>
                                ) : (
                                  currentQuantity
                                )}
                              </motion.span>

                              {/* PLUS */}

                              <motion.button
                                whileHover={{
                                  backgroundColor: "#f3f4f6",
                                }}
                                whileTap={{
                                  scale: 0.85,
                                }}
                                disabled={
                                  currentQuantity >= stock ||
                                  isUpdating ||
                                  !itemProduct.isStockAvailable
                                }
                                onClick={() =>
                                  increaseQuantity(itemProduct._id)
                                }
                                className="
                                  cursor-pointer
                                  w-8
                                  h-8
                                  sm:w-9
                                  sm:h-9
                                  flex
                                  items-center
                                  justify-center
                                  transition
                                  disabled:opacity-30
                                  disabled:cursor-not-allowed
                                "
                              >
                                <Plus size={15} />
                              </motion.button>
                            </div>
                          </div>

                          {/* ITEM TOTAL */}

                          <motion.div
                            layout
                            className="
                              w-full
                              sm:w-auto
                              text-left
                              sm:text-right
                            "
                          >
                            <p className="text-xs text-gray-400">Item Total</p>

                            <motion.p
                              key={Number(itemProduct.price) * currentQuantity}
                              initial={{
                                opacity: 0,
                                scale: 0.8,
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                              }}
                              className="
                                font-bold
                                text-gray-900
                                text-base
                                sm:text-lg
                                md:text-xl
                              "
                            >
                              {formatPrice(
                                Number(itemProduct.price) * currentQuantity,
                              )}
                            </motion.p>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        BENEFITS
                    ================================================= */}

                    <div className="border-t border-gray-100 mt-5 pt-4 flex flex-wrap gap-x-5 gap-y-3">
                      {itemProduct.freeDelivery && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            x: -10,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          className="flex items-center gap-2 text-sm text-green-600"
                        >
                          <Truck size={16} />
                          Free Delivery
                        </motion.div>
                      )}

                      {itemProduct.payOnDelivery && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CreditCard size={16} />
                          Pay on Delivery
                        </div>
                      )}

                      {itemProduct.warranty && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ShieldCheck size={16} />
                          {itemProduct.warranty} Warranty
                        </div>
                      )}

                      {itemProduct.replaceDay && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package size={16} />
                          {itemProduct.replaceDay} Days Replacement
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* =================================================
              RIGHT PRICE SUMMARY
          ================================================= */}

          <motion.div variants={itemVariants} className="lg:col-span-1">
            <motion.div
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
              }}
              className="
                bg-white
                rounded-2xl
                border
                border-gray-200
                shadow-sm
                p-5
                lg:sticky
                lg:top-5
              "
            >
              {/* TITLE */}

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Price Details
                </h2>

                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <CreditCard size={20} className="text-blue-600" />
                </div>
              </div>

              <div className="border-t border-gray-100 my-5" />

              {/* SUBTOTAL */}

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Subtotal</span>

                <motion.span
                  key={subtotal}
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="font-semibold text-gray-900"
                >
                  {formatPrice(subtotal)}
                </motion.span>
              </div>

              {/* ITEMS */}

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Total Items</span>

                <span className="font-semibold text-gray-900">
                  {totalItems}
                </span>
              </div>

              {/* DELIVERY */}

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Delivery</span>

                {deliveryCharge === 0 ? (
                  <span className="font-bold text-green-600">FREE</span>
                ) : (
                  <span className="font-semibold text-gray-900">
                    {formatPrice(deliveryCharge)}
                  </span>
                )}
              </div>

              {/* DISCOUNT */}

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Discount</span>

                <span className="font-bold text-green-600">₹0</span>
              </div>

              <div className="border-t border-dashed border-gray-300 my-5" />

              {/* GRAND TOTAL */}

              <div className="flex justify-between items-center gap-3">
                <span className="text-lg font-bold text-gray-900">
                  Total Amount
                </span>

                <motion.span
                  key={grandTotal}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="text-xl font-bold text-blue-600"
                >
                  {formatPrice(grandTotal)}
                </motion.span>
              </div>

              {/* FREE DELIVERY */}

              {deliveryCharge === 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-4 bg-green-50 text-green-700 rounded-xl p-3 text-sm"
                >
                  🎉 You are getting free delivery on this order.
                </motion.div>
              )}

              {/* CHECKOUT */}
              <motion.button onClick={() => router.push("/checkout")}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="cursor-pointer
                  group
                  w-full
                  mt-5
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  py-4
                  rounded-xl
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                  transition
                  shadow-lg
                  shadow-blue-100
                "
              >
                Proceed to Checkout
                <motion.span
                  animate={{
                    x: [0, 4, 0],
                  }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                  }}
                >
                  <ArrowRight size={19} />
                </motion.span>
              </motion.button>

              {/* CONTINUE SHOPPING */}

              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={() => router.push("/")}
                className="
                  cursor-pointer
                  w-full
                  mt-3
                  border
                  border-gray-200
                  hover:bg-gray-50
                  text-gray-700
                  py-3.5
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                Continue Shopping
              </motion.button>

              {/* SECURE */}

              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.08, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-green-50
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <ShieldCheck size={20} className="text-green-600" />
                  </motion.div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Safe & Secure Checkout
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Your payment information is protected
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* =================================================
            FEATURES
        ================================================= */}

        <motion.div
          variants={itemVariants}
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-4
            mt-6
          "
        >
          {/* DELIVERY */}

          <motion.div
            whileHover={{
              y: -5,
            }}
            className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              p-4
              flex
              items-center
              gap-3
              shadow-sm
              hover:shadow-md
              transition
            "
          >
            <motion.div
              whileHover={{
                rotate: -8,
                scale: 1.1,
              }}
              className="
                w-11
                h-11
                rounded-full
                bg-blue-50
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Truck size={19} className="text-blue-600" />
            </motion.div>

            <div>
              <p className="font-semibold text-gray-800">Fast Delivery</p>

              <p className="text-xs text-gray-500 mt-0.5">
                Quick & reliable delivery
              </p>
            </div>
          </motion.div>

          {/* PAYMENT */}

          <motion.div
            whileHover={{
              y: -5,
            }}
            className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              p-4
              flex
              items-center
              gap-3
              shadow-sm
              hover:shadow-md
              transition
            "
          >
            <motion.div
              whileHover={{
                rotate: 8,
                scale: 1.1,
              }}
              className="
                w-11
                h-11
                rounded-full
                bg-green-50
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <ShieldCheck size={19} className="text-green-600" />
            </motion.div>

            <div>
              <p className="font-semibold text-gray-800">Secure Payment</p>

              <p className="text-xs text-gray-500 mt-0.5">
                100% secure payment
              </p>
            </div>
          </motion.div>

          {/* QUALITY */}

          <motion.div
            whileHover={{
              y: -5,
            }}
            className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              p-4
              flex
              items-center
              gap-3
              shadow-sm
              hover:shadow-md
              transition
            "
          >
            <motion.div
              whileHover={{
                scale: 1.15,
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="
                w-11
                h-11
                rounded-full
                bg-red-50
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <Heart size={19} className="text-red-500" />
            </motion.div>

            <div>
              <p className="font-semibold text-gray-800">Quality Products</p>

              <p className="text-xs text-gray-500 mt-0.5">
                Carefully selected products
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

    </motion.main>
  );
};

export default Page;
