"use client";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  ShoppingBag,
  MapPin,
  CircleCheck,
  Loader2,
  Heart,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
  Grid3X3,
  Clock3,
  Trash2,
  ArrowRight,
  BadgeCheck,
  Package,
  Zap,
  Percent,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ReviewPage from "./ReviewPage";

const ProductPage = () => {
  const allProductForUser = useSelector(
    (state) => state.vendorUser?.allProductForUser || [],
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // DELIVERY ADDRESS
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [position, setPosition] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showOrderPlace, setShowOrderPlace] = useState(false);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // GET CURRENT LOCATION
  const getCurrentLocation = () => {
    if (typeof window === "undefined") return;

    if (!navigator.geolocation) {
      toast.error("Location is not supported by your browser");
      return;
    }

    setAddressLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (location) => {
        try {
          const latitude = location.coords.latitude;
          const longitude = location.coords.longitude;

          // Save coordinates
          setPosition([latitude, longitude]);

          // Reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Unable to fetch address");
          }

          const data = await response.json();

          const locationAddress = data?.address || {};

          const fullAddress = data?.display_name || "";

          setAddress((prev) => ({
            ...prev,

            address: fullAddress || prev.address,

            city:
              locationAddress.city ||
              locationAddress.town ||
              locationAddress.village ||
              locationAddress.municipality ||
              prev.city,

            state: locationAddress.state || prev.state,

            pinCode: locationAddress.postcode || prev.pinCode,
          }));

          toast.success("Current location added successfully");
        } catch (error) {
          console.error("REVERSE LOCATION ERROR:", error);

          toast.error("Location mil gayi, lekin address fetch nahi ho saka");
        } finally {
          setAddressLoading(false);
        }
      },

      (error) => {
        console.error("LOCATION ERROR:", error);

        setAddressLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location permission denied. Please allow location access.",
            );
            break;

          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;

          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;

          default:
            toast.error("Unable to get your current location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [showCart, setShowCart] = useState(false);
  const [showOrderBox, setShowOrderBox] = useState(false);

  const [orderProduct, setOrderProduct] = useState(null);

  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  // =========================================================
  // FORMAT PRICE
  // =========================================================
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price || 0));
  };

  // =========================================================
  // IMAGE CLEANER
  // =========================================================
  const getImageUrl = (image) => {
    if (!image) return "";

    if (typeof image !== "string") return "";

    if (image.includes("](")) {
      const match = image.match(/\((.*?)\)/);

      if (match?.[1]) {
        return match[1];
      }
    }
    return image.trim();
  };

  // =========================================================
  // PRODUCT IMAGES
  // =========================================================
  const getProductImages = (product) => {
    if (!product?.productImg) return [];
    if (!Array.isArray(product.productImg)) return [];
    return product.productImg.map((img) => getImageUrl(img)).filter(Boolean);
  };

  // =========================================================
  // STOCK
  // =========================================================
  const isOutOfStock = (product) => {
    return (
      product?.isStockAvailable === false || Number(product?.stock || 0) <= 0
    );
  };

  // =========================================================
  // CATEGORIES
  // =========================================================
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        allProductForUser.map((item) => item?.category).filter(Boolean),
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [allProductForUser]);

  // =========================================================
  // FILTER + SEARCH + SORT
  // =========================================================
  const filteredProducts = useMemo(() => {
    const result = allProductForUser.filter((item) => {
      const title = String(item?.title || "").toLowerCase();
      const description = String(item?.description || "").toLowerCase();

      const searchValue = search.toLowerCase().trim();

      const searchMatch =
        !searchValue ||
        title.includes(searchValue) ||
        description.includes(searchValue);

      const categoryMatch =
        selectedCategory === "All" || item?.category === selectedCategory;

      return (
        searchMatch &&
        categoryMatch &&
        item?.isActive !== false &&
        item?.verificationStatus === "approved"
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a?.price || 0) - Number(b?.price || 0);
      }

      if (sortBy === "price-high") {
        return Number(b?.price || 0) - Number(a?.price || 0);
      }

      if (sortBy === "name") {
        return String(a?.title || "").localeCompare(String(b?.title || ""));
      }

      if (sortBy === "stock") {
        return Number(b?.stock || 0) - Number(a?.stock || 0);
      }

      return 0;
    });
  }, [allProductForUser, search, selectedCategory, sortBy]);

  // =========================================================
  // OPEN PRODUCT
  // =========================================================
  const openProduct = (product) => {
    setSelectedProduct(product);
    setSelectedImage(0);
    setQuantity(1);

    if (product?.size) {
      const firstSize = String(product.size)
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean)[0];

      setSelectedSize(firstSize || "");
    } else {
      setSelectedSize("");
    }
  };

  // =========================================================
  // CLOSE PRODUCT
  // =========================================================
  const closeProduct = () => {
    setSelectedProduct(null);
    setSelectedImage(0);
    setQuantity(1);
    setSelectedSize("");
  };

  // =========================================================
  // PRODUCT DISCOUNT
  // =========================================================
  const getDiscount = (product) => {
    const discount = Number(
      product?.discount || product?.discountPercentage || 0,
    );

    return discount > 0 ? discount : 0;
  };

  // =========================================================
  // WISHLIST
  // =========================================================
  const toggleWishlist = (product) => {
    if (!product?._id) return;

    const exists = wishlist.includes(product._id);

    if (exists) {
      setWishlist((prev) => prev.filter((id) => id !== product._id));

      toast.info("Removed from wishlist");
    } else {
      setWishlist((prev) => [...prev, product._id]);

      toast.success("Added to wishlist");
    }
  };

  // =========================================================
  // CART COUNT
  // =========================================================
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  }, [cart]);

  // =========================================================
  // CART TOTAL
  // =========================================================
  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [cart]);

  // =========================================================
  // ADD TO CART
  // =========================================================
  const addToCart = async (product, qty = quantity) => {
    try {
      if (!product) {
        toast.error("Product not found");
        return;
      }

      if (isOutOfStock(product)) {
        toast.info("This product is currently out of stock");
        return;
      }

      const selectedSize = typeof sizeValue !== "undefined" ? sizeValue : null;

      const stock = Number(product?.stock || 0);
      const addQuantity = Math.max(Number(qty) || 1, 1);

      const existingProduct = cart.find(
        (item) =>
          item.productId?.toString() === product._id?.toString() &&
          item.size === selectedSize,
      );

      const currentQuantity = Number(existingProduct?.quantity || 0);

      if (stock > 0 && currentQuantity + addQuantity > stock) {
        toast.info(
          `Only ${Math.max(stock - currentQuantity, 0)} item(s) available`,
        );
        return;
      }

      const res = await axios.post("/api/user/card/addProduct", {
        productId: product._id,
        quantity: addQuantity,
      });

      if (res.data.success) {
        toast.success(res.data.message);
      }

      closeProduct();
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while adding product to cart",
      );
    }
  };

  // =========================================================
  // REMOVE CART
  // =========================================================
  const removeFromCart = (productId, size) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size),
      ),
    );
    toast.info("Product removed from cart");
  };

  // =========================================================
  // CHANGE CART QUANTITY
  // =========================================================
  const changeCartQuantity = (productId, size, type) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId || item.size !== size) {
          return item;
        }

        let newQuantity = item.quantity;

        if (type === "plus") {
          newQuantity = Math.min(item.quantity + 1, item.stock || 999);
        }

        if (type === "minus") {
          newQuantity = Math.max(item.quantity - 1, 1);
        }

        return {
          ...item,
          quantity: newQuantity,
        };
      }),
    );
  };

  // =========================================================
  // BUY NOW
  // =========================================================
  const buyNow = (product) => {
    if (!product) return;

    if (isOutOfStock(product)) {
      toast.info("This product is currently out of stock", "error");
      return;
    }

    if (product?.size && !selectedSize) {
      toast.info("Please select a size");
      return;
    }

    setOrderProduct({
      productId: product._id,
      title: product.title,
      price: Number(product.price || 0),
      image: getProductImages(product)[0] || "",
      quantity,
      size: selectedSize || product.size || "",
      replaceDay: product.replaceDay,
      freeDelivery: product.freeDelivery,
      payOnDelivery: product.payOnDelivery,
      warranty: product.warranty,
    });

    setShowOrderBox(true);
  };

  // =========================================================
  // ORDER FROM CART
  // =========================================================
  const continueToOrder = () => {
    if (!cart.length) {
      toast.info("Your cart is empty");
      return;
    }

    setOrderProduct(null);
    setShowCart(false);
    setShowOrderBox(true);
  };

  // =========================================================
  // PLACE ORDER
  // =========================================================
  const placeOrder = async () => {
    const isSingleProduct = Boolean(orderProduct);

    if (!isSingleProduct && !cart.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!address.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!/^\d{10}$/.test(address.phone.trim())) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (
      address.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())
    ) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!address.address.trim()) {
      toast.error("Please enter your address");
      return;
    }

    if (!address.city.trim()) {
      toast.error("Please enter your city");
      return;
    }

    if (!address.state.trim()) {
      toast.error("Please enter your state");
      return;
    }

    if (!/^\d{6}$/.test(address.pinCode.trim())) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }

    if (!position) {
      toast.error("Please select your current location");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    try {
      setPlacingOrder(true);

      const products = isSingleProduct
        ? [
            {
              cartId: orderProduct?.cartId || undefined,
              productId: orderProduct?.productId,
              quantity: Number(orderProduct?.quantity) || 1,
              price: Number(orderProduct?.price) || 0,
            },
          ]
        : cart.map((item) => ({
            cartId: item?.cartId || item?._id || undefined,
            productId: item?.productId || item?.product?._id || item?._id,
            quantity: Number(item?.quantity) || 1,
            price: Number(item?.price || item?.product?.price || 0),
          }));

      const subtotal = products.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      );

      const deliveryCharge = isSingleProduct
        ? orderProduct?.freeDelivery
          ? 0
          : 40
        : cart.some((item) => item?.freeDelivery === false)
          ? 40
          : 0;

      const totalAmount = subtotal + deliveryCharge;

      const orderData = {
        products,

        address: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          email: address.email.trim(),
          address: address.address.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pinCode: address.pinCode.trim(),
        },

        location: {
          latitude: Number(position[0]),
          longitude: Number(position[1]),
        },

        paymentMethod,
        subtotal,
        deliveryCharge,
        totalAmount,
      };

      // =========================
      // COD
      // =========================
      if (paymentMethod === "cod") {
        const res = await axios.post("/api/user/order/cod", orderData);

        if (res.data?.success) {
          toast.success(res.data?.message || "Order placed successfully!");

          // Clear cart
          if (!isSingleProduct) {
            setCart([]);
          }

          setShowOrderBox(false);
          setOrderProduct(null);
          closeProduct();

          setShowOrderPlace(true);

          // 5 second baad hide
          setTimeout(() => {
            setShowOrderPlace(false);
          }, 5000);

          return;
        }

        toast.error(res.data?.message || "Unable to place COD order");

        return;
      }

      // =========================
      // ONLINE PAYMENT
      // =========================
      if (paymentMethod === "online") {
        const res = await axios.post("/api/user/order/online", orderData);

        console.log("ONLINE PAYMENT RESPONSE:", res.data);

        if (res.data?.success) {
          toast.success(res.data?.message || "Payment initiated successfully");

          if (res.data?.paymentUrl) {
            window.location.href = res.data.paymentUrl;
            return;
          }

          if (res.data?.orderId) {
            window.location.href = `/payment?orderId=${res.data.orderId}`;
            return;
          }

          return;
        }

        toast.error(res.data?.message || "Unable to initiate online payment");

        return;
      }
    } catch (error) {
      console.error("PLACE ORDER ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while placing order",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-[1600px] px-4 py-2 md:px-6">
        {/* ===================================================
            FILTER BAR
        ==================================================== */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* CATEGORY */}
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <div className="mr-1 flex h-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 px-3">
                <Grid3X3 size={15} />
              </div>

              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`cursor-pointer shrink-0 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                    selectedCategory === category
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* RIGHT */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="cursor-pointer flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black hover:bg-slate-50"
              >
                <SlidersHorizontal size={15} />
                Filter
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer  h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black outline-none"
              >
                <option value="featured">Featured</option>

                <option value="price-low">Price: Low to High</option>

                <option value="price-high">Price: High to Low</option>

                <option value="name">Name</option>

                <option value="stock">Stock Available</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                className="overflow-hidden"
              >
                <div className="mt-3 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Search
                    </p>
                    <p className="mt-1 text-xs font-bold">
                      {search ? `"${search}"` : "All products"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Category
                    </p>
                    <p className="mt-1 text-xs font-bold">{selectedCategory}</p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Results
                    </p>
                    <p className="mt-1 text-xs font-bold">
                      {filteredProducts.length} products
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>


        {/* ===================================================
            PRODUCT GRID
        ==================================================== */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="flex min-h-125 flex-col items-center justify-center rounded-[30px] border border-dashed border-slate-300 bg-white"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <Package size={40} className="text-slate-400" />
            </div>

            <h2 className="mt-5 text-xl font-black">No Products Found</h2>

            <p className="mt-2 text-center text-sm text-slate-500">
              We couldn't find anything matching your search.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-white"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((item, index) => {
              const images = getProductImages(item);
              const outOfStock = isOutOfStock(item);
              const discount = getDiscount(item);
              const isWishlisted = wishlist.includes(item?._id);

              return (
                <motion.article
                  key={item?._id || index}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(index * 0.04, 0.35),
                  }}
                  whileHover={{
                    y: -7,
                  }}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-2xl"
                >
                  {/* IMAGE */}
                  <div
                    onClick={() => openProduct(item)}
                    className="relative aspect-square cursor-pointer overflow-hidden bg-slate-100"
                  >
                    {images.length > 0 ? (
                      <motion.img
                        src={images[0]}
                        alt={item?.title || "Product"}
                        className="h-full w-full object-cover"
                        whileHover={{
                          scale: 1.07,
                        }}
                        transition={{
                          duration: 0.6,
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={45} className="text-slate-300" />
                      </div>
                    )}

                    {/* IMAGE OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                    {/* CATEGORY */}
                    {item?.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide shadow-lg">
                        {item.category}
                      </span>
                    )}

                    {/* DISCOUNT */}
                    {discount > 0 && (
                      <span className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-[9px] font-black text-white shadow-lg">
                        <Percent size={10} />
                        {discount}% OFF
                      </span>
                    )}

                    {/* WISHLIST */}
                    <motion.button
                      whileTap={{
                        scale: 0.85,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item);
                      }}
                      className={`cursor-pointer absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition ${
                        isWishlisted
                          ? "bg-red-500 text-white"
                          : "bg-white/95 text-slate-700 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        size={17}
                        fill={isWishlisted ? "currentColor" : "none"}
                      />
                    </motion.button>

                    {/* OUT OF STOCK */}
                    {outOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <span className="rounded-full bg-white px-5 py-2.5 text-[10px] font-black text-red-600 shadow-2xl">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    {/* RATING / DELIVERY */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-black text-amber-600">
                        <Star size={11} fill="currentColor" />
                        4.5
                      </span>

                      {item?.freeDelivery && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600">
                          <Truck size={12} />
                          FREE DELIVERY
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <h2
                      onClick={() => openProduct(item)}
                      className="line-clamp-2 min-h-[42px] cursor-pointer text-sm font-black leading-5 transition hover:text-blue-600"
                    >
                      {item?.title || "Untitled Product"}
                    </h2>

                    {/* DESCRIPTION */}
                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                      {item?.description || "Premium quality product."}
                    </p>

                    {/* PRICE */}
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <p className="text-xl font-black tracking-tight">
                          {formatPrice(item?.price)}
                        </p>

                        <p
                          className={`mt-1 text-[9px] font-black ${
                            outOfStock
                              ? "text-red-500"
                              : Number(item?.stock || 0) <= 5
                                ? "text-orange-500"
                                : "text-emerald-600"
                          }`}
                        >
                          {outOfStock
                            ? "Currently unavailable"
                            : Number(item?.stock || 0) <= 5
                              ? `Only ${item?.stock} left`
                              : `${item?.stock} items in stock`}
                        </p>
                      </div>

                      <button
                        disabled={outOfStock}
                        onClick={() => openProduct(item)}
                        className={`cursor-pointer flex h-11 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${
                          outOfStock
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : "bg-slate-900 text-white shadow-lg hover:scale-105 active:scale-95"
                        }`}
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </div>

                    {/* VERIFIED */}
                    <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[9px] font-bold text-slate-400">
                      <BadgeCheck size={13} className="text-emerald-500" />
                      Verified seller product
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      {/* =====================================================
          PRODUCT DETAIL MODAL
      ====================================================== */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={closeProduct}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-2 backdrop-blur-md sm:p-4"
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 50,
                scale: 0.94,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.96,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 25,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[96vh] w-full max-w-6xl overflow-y-auto rounded-[30px] bg-white shadow-2xl"
            >
              {/* CLOSE */}
              <button
                onClick={closeProduct}
                className="cursor-pointer absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-xl transition hover:scale-110"
              >
                <X size={19} />
              </button>

              <div className="grid lg:grid-cols-2">
                {/* ==========================================
                    IMAGE SECTION
                =========================================== */}

                <div className="bg-slate-100 p-4 md:p-7">
                  <div className="relative aspect-square overflow-hidden rounded-[25px] bg-white">
                    {getProductImages(selectedProduct).length > 0 ? (
                      <motion.img
                        key={selectedImage}
                        initial={{
                          opacity: 0,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        src={getProductImages(selectedProduct)[selectedImage]}
                        alt={selectedProduct?.title || "Product"}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={60} className="text-slate-300" />
                      </div>
                    )}

                    {/* ARROWS */}
                    {getProductImages(selectedProduct).length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImage((prev) =>
                              prev === 0
                                ? getProductImages(selectedProduct).length - 1
                                : prev - 1,
                            )
                          }
                          className="cursor-pointer absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl transition hover:scale-105"
                        >
                          <ChevronLeft size={19} />
                        </button>

                        <button
                          onClick={() =>
                            setSelectedImage((prev) =>
                              prev ===
                              getProductImages(selectedProduct).length - 1
                                ? 0
                                : prev + 1,
                            )
                          }
                          className=" cursor-pointer absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl transition hover:scale-105"
                        >
                          <ChevronRight size={19} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* THUMBNAILS */}

                  {getProductImages(selectedProduct).length > 1 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                      {getProductImages(selectedProduct).map((image, index) => (
                        <motion.button
                          whileTap={{
                            scale: 0.94,
                          }}
                          key={image + index}
                          onClick={() => setSelectedImage(index)}
                          className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${
                            selectedImage === index
                              ? "border-slate-900 shadow-lg"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover cursor-pointer"
                          />
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* IMAGE INFO */}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white p-3">
                      <Zap size={17} className="text-orange-500" />
                      <p className="mt-2 text-[10px] font-black">
                        Fast Processing
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-3">
                      <ShieldCheck size={17} className="text-emerald-500" />
                      <p className="mt-2 text-[10px] font-black">
                        Verified Product
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==========================================
                    DETAILS
                =========================================== */}

                <div className="p-5 md:p-8">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProduct?.category && (
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase text-blue-600">
                        {selectedProduct.category}
                      </span>
                    )}

                    {selectedProduct?.verificationStatus === "approved" && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-600">
                        <CheckCircle2 size={11} />
                        VERIFIED
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 pr-8 text-2xl font-black leading-tight md:text-3xl">
                    {selectedProduct?.title}
                  </h2>

                  {/* RATING */}

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-black text-white">
                      4.5
                      <Star size={11} fill="currentColor" />
                    </span>

                    <span className="text-xs text-slate-500">
                      {selectedProduct?.reviews?.length || 0} Reviews
                    </span>
                  </div>

                  {/* PRICE */}

                  <div className="mt-5 border-y border-slate-100 py-5">
                    <p className="text-3xl font-black">
                      {formatPrice(selectedProduct?.price)}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Inclusive of applicable taxes
                    </p>
                  </div>

                  {/* DESCRIPTION */}

                  <div className="mt-5">
                    <h3 className="text-sm font-black">About this product</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedProduct?.description ||
                        "Premium quality product designed for everyday use."}
                    </p>
                  </div>

                  {/* HIGHLIGHTS */}

                  {selectedProduct?.detailsPoint?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-black">Product Highlights</h3>

                      <div className="mt-3 grid gap-2">
                        {selectedProduct.detailsPoint.map((point, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-xs text-slate-600"
                          >
                            <CheckCircle2
                              size={15}
                              className="mt-0.5 shrink-0 text-emerald-500"
                            />

                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SIZE */}

                  {selectedProduct?.size && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black">Select Size</h3>

                        <span className="text-[10px] text-slate-400">
                          Choose your size
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {String(selectedProduct.size)
                          .split(",")
                          .map((size) => {
                            const cleanSize = size.trim();

                            if (!cleanSize) return null;

                            return (
                              <button
                                key={cleanSize}
                                onClick={() => setSelectedSize(cleanSize)}
                                className={`min-w-14 rounded-xl border px-4 py-2.5 text-xs font-black transition ${
                                  selectedSize === cleanSize
                                    ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                                    : "border-slate-200 bg-white hover:border-slate-500"
                                }`}
                              >
                                {cleanSize}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* QUANTITY */}

                  <div className="mt-6">
                    <h3 className="text-sm font-black">Quantity</h3>

                    <div className="mt-3 flex h-11 w-fit items-center overflow-hidden rounded-xl border border-slate-200">
                      <button
                        onClick={() =>
                          setQuantity((prev) => Math.max(prev - 1, 1))
                        }
                        className="cursor-pointer flex h-full w-11 items-center justify-center transition hover:bg-slate-100"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="flex w-12 justify-center text-sm font-black">
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          setQuantity((prev) =>
                            Math.min(
                              prev + 1,
                              Number(selectedProduct?.stock || 1),
                            ),
                          )
                        }
                        className="cursor-pointer flex h-full w-11 items-center justify-center transition hover:bg-slate-100"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <p className="mt-2 text-[10px] text-slate-400">
                      {selectedProduct?.stock || 0} items available
                    </p>
                  </div>

                  {/* BENEFITS */}

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <Truck size={18} className="text-emerald-600" />

                      <p className="mt-2 text-[10px] font-black">
                        {selectedProduct?.freeDelivery
                          ? "Free Delivery"
                          : "Delivery Available"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <RotateCcw size={18} className="text-blue-600" />

                      <p className="mt-2 text-[10px] font-black">
                        {selectedProduct?.replaceDay
                          ? `${selectedProduct.replaceDay} Days Replacement`
                          : "Easy Replacement"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <CreditCard size={18} className="text-purple-600" />

                      <p className="mt-2 text-[10px] font-black">
                        {selectedProduct?.payOnDelivery
                          ? "Pay on Delivery"
                          : "Online Payment"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-3">
                      <ShieldCheck size={18} className="text-orange-600" />

                      <p className="mt-2 text-[10px] font-black">
                        {selectedProduct?.warranty
                          ? `${selectedProduct.warranty} Warranty`
                          : "Quality Assured"}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <button
                      disabled={isOutOfStock(selectedProduct)}
                      onClick={() => addToCart(selectedProduct, quantity)}
                      className="cursor-pointer flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 text-xs font-black transition hover:bg-slate-900 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    >
                      <ShoppingCart size={18} />
                      Add To Cart
                    </button>

                    <button
                      disabled={isOutOfStock(selectedProduct)}
                      onClick={() => buyNow(selectedProduct)}
                      className="cursor-pointer flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black text-white shadow-xl transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <ShoppingBag size={18} />
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          CART DRAWER
      ====================================================== */}
      <AnimatePresence>
        {showCart && (
          <>
            {/* BACKDROP */}

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-sm"
            />

            {/* DRAWER */}

            <motion.aside
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 30,
              }}
              className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl"
            >
              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black">Your Cart</h2>

                    {cartCount > 0 && (
                      <span className="rounded-full bg-slate-900 px-2 py-1 text-[9px] font-black text-white">
                        {cartCount}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Review your selected products
                  </p>
                </div>

                <button
                  onClick={() => setShowCart(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* CART ITEMS */}

              <div className="flex-1 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                      <ShoppingCart size={38} className="text-slate-300" />
                    </div>

                    <h3 className="mt-5 text-lg font-black">
                      Your cart is empty
                    </h3>

                    <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                      Add products to your cart and they will appear here.
                    </p>

                    <button
                      onClick={() => setShowCart(false)}
                      className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-white"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <motion.div
                        layout
                        key={`${item.productId}-${item.size}-${index}`}
                        initial={{
                          opacity: 0,
                          x: 20,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <div className="flex gap-3">
                          {/* IMAGE */}

                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package size={25} className="text-slate-300" />
                              </div>
                            )}
                          </div>

                          {/* DETAILS */}

                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between gap-2">
                              <h3 className="line-clamp-2 text-xs font-black leading-5">
                                {item.title}
                              </h3>

                              <button
                                onClick={() =>
                                  removeFromCart(item.productId, item.size)
                                }
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {item.size && (
                              <p className="mt-1 text-[10px] text-slate-500">
                                Size: <b>{item.size}</b>
                              </p>
                            )}

                            <p className="mt-2 text-sm font-black">
                              {formatPrice(item.price)}
                            </p>

                            {/* QTY */}

                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex h-8 items-center overflow-hidden rounded-lg border border-slate-200">
                                <button
                                  onClick={() =>
                                    changeCartQuantity(
                                      item.productId,
                                      item.size,
                                      "minus",
                                    )
                                  }
                                  className="flex h-full w-8 items-center justify-center hover:bg-slate-100"
                                >
                                  <Minus size={12} />
                                </button>

                                <span className="flex w-8 justify-center text-[10px] font-black">
                                  {item.quantity}
                                </span>

                                <button
                                  onClick={() =>
                                    changeCartQuantity(
                                      item.productId,
                                      item.size,
                                      "plus",
                                    )
                                  }
                                  className="flex h-full w-8 items-center justify-center hover:bg-slate-100"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <span className="text-xs font-black">
                                {formatPrice(
                                  Number(item.price || 0) *
                                    Number(item.quantity || 0),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER */}

              {cart.length > 0 && (
                <div className="border-t border-slate-100 bg-white p-5">
                  <div className="mb-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        Items
                      </span>

                      <span className="text-xs font-black">{cartCount}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-500">
                        Total Amount
                      </span>

                      <span className="text-2xl font-black">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={continueToOrder}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black text-white shadow-xl transition hover:scale-[1.01] active:scale-95"
                  >
                    Continue To Order
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* =====================================================
          ORDER CONFIRMATION
      ====================================================== */}
      <AnimatePresence>
        {showOrderBox && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() => setShowOrderBox(false)}
            className="fixed inset-0 z-120 flex items-center justify-center bg-black/65 p-3 backdrop-blur-md sm:p-5"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-[30px] bg-white shadow-2xl"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5 md:p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>

                    <h2 className="text-lg font-black">Confirm Your Order</h2>
                  </div>

                  <p className="mt-2 text-[10px] text-slate-500">
                    Review everything before placing your order.
                  </p>
                </div>

                <button
                  onClick={() => setShowOrderBox(false)}
                  className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
                >
                  <X size={17} />
                </button>
              </div>

              {/* BODY */}

              <div className="max-h-[70vh] overflow-y-auto p-5 md:p-6">
                {/* SINGLE PRODUCT */}
                {orderProduct ? (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                        {orderProduct.image ? (
                          <img
                            src={orderProduct.image}
                            alt={orderProduct.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package size={25} className="text-slate-300" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-black">
                          {orderProduct.title}
                        </h3>

                        {orderProduct.size && (
                          <p className="mt-2 text-[10px] text-slate-500">
                            Size: <b>{orderProduct.size}</b>
                          </p>
                        )}

                        <p className="mt-1 text-[10px] text-slate-500">
                          Quantity: <b>{orderProduct.quantity}</b>
                        </p>

                        <p className="mt-2 text-lg font-black">
                          {formatPrice(
                            orderProduct.price * orderProduct.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CART CHECKOUT */
                  <div className="space-y-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-black">Order Items</h3>

                      <span className="text-[10px] text-slate-400">
                        {cartCount} items
                      </span>
                    </div>

                    {cart.map((item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package size={20} className="text-slate-300" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-xs font-black">
                            {item.title}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            Qty: {item.quantity}
                            {item.size ? ` • Size ${item.size}` : ""}
                          </p>
                        </div>

                        <p className="text-xs font-black">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* BENEFITS */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 p-3">
                    <Truck size={17} className="text-emerald-600" />

                    <p className="mt-2 text-[10px] font-black">Free Delivery</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-3">
                    <RotateCcw size={17} className="text-blue-600" />

                    <p className="mt-2 text-[10px] font-black">
                      Easy Replacement
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-3">
                    <ShieldCheck size={17} className="text-orange-600" />

                    <p className="mt-2 text-[10px] font-black">Secure Order</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 p-3">
                    <Clock3 size={17} className="text-purple-600" />

                    <p className="mt-2 text-[10px] font-black">
                      Fast Processing
                    </p>
                  </div>
                </div>

                {/* DELIVERY ADDRESS */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                        <MapPin size={18} className="text-red-500" />
                      </div>

                      <div>
                        <p className="text-xs font-black">Delivery Address</p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Where should we deliver your order?
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={addressLoading}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-[9px] font-black text-white transition hover:scale-105 disabled:opacity-50"
                    >
                      {addressLoading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <MapPin size={13} />
                          Use Current Location
                        </>
                      )}
                    </button>
                  </div>

                  {/* FORM */}

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* NAME */}
                    <div>
                      <input
                        type="text"
                        name="fullName"
                        value={address.fullName}
                        onChange={handleAddressChange}
                        placeholder="Full Name"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none transition focus:border-slate-900"
                      />
                    </div>

                    {/* PHONE */}
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        value={address.phone}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            phone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }))
                        }
                        placeholder="Mobile Number"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none transition focus:border-slate-900"
                      />
                    </div>

                    {/* EMAIL */}
                    <div className="sm:col-span-2">
                      <input
                        type="email"
                        name="email"
                        value={address.email}
                        onChange={handleAddressChange}
                        placeholder="Email Address (Optional)"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none transition focus:border-slate-900"
                      />
                    </div>

                    {/* ADDRESS */}
                    <div className="sm:col-span-2">
                      <textarea
                        name="address"
                        value={address.address}
                        onChange={handleAddressChange}
                        placeholder="House No, Street, Area, Locality"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold outline-none transition focus:border-slate-900"
                      />
                    </div>

                    {/* CITY */}
                    <div>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none transition focus:border-slate-900"
                      />
                    </div>

                    {/* STATE */}
                    <div>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none transition focus:border-slate-900"
                      />
                    </div>

                    {/* PIN */}
                    <div>
                      <input
                        type="text"
                        name="pinCode"
                        value={address.pinCode}
                        onChange={(e) =>
                          setAddress((prev) => ({
                            ...prev,
                            pinCode: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          }))
                        }
                        placeholder="PIN Code"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none transition focus:border-slate-900"
                      />
                    </div>
                  </div>

                  {/* LOCATION STATUS */}

                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                    <CircleCheck
                      size={15}
                      className={
                        position ? "text-emerald-500" : "text-slate-300"
                      }
                    />

                    <p className="text-[9px] font-semibold text-slate-500">
                      {position
                        ? "Delivery location selected"
                        : "Please select your current location"}
                    </p>
                  </div>
                </div>

                {/* PAYMENT */}
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-black">Payment Method</p>

                    <span className="text-[10px] text-slate-400">
                      Choose payment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                        paymentMethod === "cod"
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              paymentMethod === "cod"
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Truck size={19} />
                          </div>

                          <div>
                            <p className="text-xs font-black">
                              Cash on Delivery
                            </p>

                            <p className="mt-1 text-[10px] text-slate-500">
                              Pay when your order arrives
                            </p>
                          </div>
                        </div>

                        <div
                          className={`mt-1 h-4 w-4 rounded-full border-2 ${
                            paymentMethod === "cod"
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300"
                          }`}
                        >
                          {paymentMethod === "cod" && (
                            <div className="m-[3px] h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* ONLINE */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                        paymentMethod === "online"
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              paymentMethod === "online"
                                ? "bg-blue-500 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <CreditCard size={19} />
                          </div>

                          <div>
                            <p className="text-xs font-black">Online Payment</p>

                            <p className="mt-1 text-[10px] text-slate-500">
                              Pay securely online
                            </p>
                          </div>
                        </div>

                        <div
                          className={`mt-1 h-4 w-4 rounded-full border-2 ${
                            paymentMethod === "online"
                              ? "border-blue-500 bg-blue-500"
                              : "border-slate-300"
                          }`}
                        >
                          {paymentMethod === "online" && (
                            <div className="m-[3px] h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* TOTAL */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm font-bold text-slate-500">
                    Order Total
                  </span>

                  <span className="text-2xl font-black">
                    {formatPrice(
                      orderProduct
                        ? orderProduct.price * orderProduct.quantity
                        : cartTotal,
                    )}
                  </span>
                </div>

                {/* PLACE */}
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={placingOrder}
                  className="mt-5 flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-900 text-xs font-black text-white shadow-xl transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      {paymentMethod === "cod"
                        ? "Place Order"
                        : "Continue to Payment"}
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-[9px] text-slate-400">
                  By placing this order, you agree to the applicable purchase
                  terms.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOrderPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
              className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 250,
                }}
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.35 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white"
                >
                  ✓
                </motion.div>
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900 "
              >
                Order Successful
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-sm text-gray-500"
              >
                Your order has been placed successfully.
              </motion.p>

              {/* Order Status */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 rounded-2xl bg-green-50 p-4"
              >
                <p className="text-sm font-semibold text-green-700">
                  Thank you for your purchase!
                </p>

                <p className="mt-1 text-xs text-green-600">
                  We will notify you when your order is shipped.
                </p>
              </motion.div>
              <img
                src="/gift.gif"
                alt="Party Popper"
                className="inline-block w-50"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;
