"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { RxCross2 } from "react-icons/rx";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  Package,
  CheckCircle2,
  ShoppingBag,
  Lock,
  User,
  Phone,
  Mail,
  AlertCircle,
  Navigation,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
const MapView = dynamic(() => import("@/component/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 sm:h-100 md:h-125 rounded-2xl bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={40} className="animate-spin text-blue-600" />

        <p className="font-semibold text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

const page = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(true); // MAP HIDDEN KE LIYE

  const [paymentMethod, setPaymentMethod] = useState("online");

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [errors, setErrors] = useState({});

  const [position, setPosition] = useState(null);

  const [locationLoading, setLocationLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [addressLoading, setAddressLoading] = useState(false);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (error) {
      setError("");
    }
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      setAddressLoading(true);

      const url =
        `https://nominatim.openstreetmap.org/reverse` +
        `?format=jsonv2` +
        `&lat=${latitude}` +
        `&lon=${longitude}` +
        `&zoom=18` +
        `&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        throw new Error("Unable to fetch address");
      }

      const data = await response.json();

      const locationAddress = data?.address || {};

      const city =
        locationAddress.city ||
        locationAddress.town ||
        locationAddress.village ||
        locationAddress.municipality ||
        locationAddress.city_district ||
        "";

      const state =
        locationAddress.state || locationAddress.state_district || "";

      const pinCode = locationAddress.postcode || "";

      const completeAddress =
        data?.display_name ||
        [
          locationAddress.house_number,
          locationAddress.road,
          locationAddress.neighbourhood,
          locationAddress.suburb,
          locationAddress.residential,
        ]
          .filter(Boolean)
          .join(", ");

      setAddress((prev) => ({
        ...prev,
        address: completeAddress || prev.address,
        city: city || prev.city,
        state: state || prev.state,
        pinCode: pinCode || prev.pinCode,
      }));

      setErrors((prev) => ({
        ...prev,
        address: "",
        city: "",
        state: "",
        pinCode: "",
      }));

    } catch (error) {
      console.error("REVERSE GEOCODING ERROR:", error);
      toast.error("Could not get address. Please enter it manually.");
    } finally {
      setAddressLoading(false);
    }
  };

  // =====================================================
  // MAP LOCATION
  // =====================================================
  const handleMapLocationSelect = (newPosition) => {
    if (!newPosition) return;

    const latitude = Number(newPosition[0]);
    const longitude = Number(newPosition[1]);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return;
    }

    const newLocation = [latitude, longitude];

    setPosition(newLocation);

    getAddressFromCoordinates(latitude, longitude);
  };

  // =====================================================
  // CURRENT LOCATION
  // =====================================================
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const defaultPosition = [28.6139, 77.209];

      setPosition(defaultPosition);
      setLocationLoading(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const latitude = location.coords.latitude;

        const longitude = location.coords.longitude;

        const userPosition = [latitude, longitude];

        setPosition(userPosition);

        setLocationLoading(false);

        getAddressFromCoordinates(latitude, longitude);

        // toast.success("Your current location detected.");
      },

      (error) => {
        console.error("LOCATION ERROR:", error);

        const defaultPosition = [28.6139, 77.209];

        setPosition(defaultPosition);

        setLocationLoading(false);
        toast.info("Location permission denied. You can select location manually." );
          
       
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  // =====================================================
  // GET CART
  // =====================================================
  useEffect(() => {
    const getCart = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/user/card/getCartProduct");

        if (res?.data?.success) {
          const cartData = Array.isArray(res?.data?.data) ? res.data.data : [];

          setProducts(cartData);
        } else {
          setProducts([]);

          const message = res?.data?.message || "Unable to fetch cart.";

          setError(message);

          toast.error(message);
        }
      } catch (error) {
        console.error("GET CART ERROR:", error);

        setProducts([]);

        const message =
          error?.response?.data?.message ||
          "Something went wrong while fetching cart.";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    getCart();
  }, []);

  // =====================================================
  // COD
  // =====================================================
  const isCODAvailable = useMemo(() => {
    if (!products.length) {
      return false;
    }
    return products.every((item) => item?.product?.payOnDelivery === true);
  }, [products]);

  // =====================================================
  // PAYMENT DEFAULT
  // =====================================================
  useEffect(() => {
    if (!products.length) return;
    setPaymentMethod("online");
  }, [products, isCODAvailable]);

  // =====================================================
  // SUBTOTAL
  // =====================================================
  const subtotal = useMemo(() => {
    return products.reduce((total, item) => {
      const price = Number(item?.product?.price) || 0;

      const quantity = Number(item?.quantity) || 0;

      return total + price * quantity;
    }, 0);
  }, [products]);

  // =====================================================
  // TOTAL ITEMS
  // =====================================================
  const totalItems = useMemo(() => {
    return products.reduce((total, item) => {
      return total + (Number(item?.quantity) || 0);
    }, 0);
  }, [products]);

  // =====================================================
  // DELIVERY
  // =====================================================
  const deliveryCharge = useMemo(() => {
    if (!products.length) return 0;

    const hasPaidDelivery = products.some(
      (item) => item?.product?.freeDelivery === false,
    );

    return hasPaidDelivery ? 40 : 0;
  }, [products]);

  // =====================================================
  // GRAND TOTAL
  // =====================================================
  const grandTotal = subtotal + deliveryCharge;

  // =====================================================
  // PRICE FORMAT
  // =====================================================
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price) || 0);
  };

  // =====================================================
  // VALIDATE ADDRESS
  // =====================================================
  const validateAddress = () => {
    const newErrors = {};

    if (!address.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!address.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(address.phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

    if (address.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) {
        newErrors.email = "Enter a valid email";
      }
    }

    if (!address.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!address.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!address.pinCode.trim()) {
      newErrors.pinCode = "PIN code is required";
    } else if (!/^\d{6}$/.test(address.pinCode)) {
      newErrors.pinCode = "Enter a valid 6-digit PIN code";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================
  const handlePlaceOrder = async () => {
    if (!products?.length) {
      toast.error("Your cart is empty.");
      router.push("/addCard");
      return;
    }

    if (paymentMethod === "cod" && !isCODAvailable) {
      toast.error("Cash on Delivery is not available for this order.");
      setPaymentMethod("online");
      return;
    }

    const isValid = validateAddress();

    if (!isValid) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!position || position.length < 2) {
      toast.error("Please allow your location to continue.");
      return;
    }

    try {
      setPlacingOrder(true);
      const orderData = {
        products: products.map((item) => ({
          cartId: item?._id,
          productId: item?.product?._id,
          quantity: Number(item?.quantity) || 1,
          price: Number(item?.product?.price) || 0,
        })),

        address: {
          fullName: address?.fullName?.trim() || "",
          phone: address?.phone?.trim() || "",
          email: address?.email?.trim() || "",
          address: address?.address?.trim() || "",
          city: address?.city?.trim() || "",
          state: address?.state?.trim() || "",
          pinCode: address?.pinCode?.trim() || "",
        },

        location: {
          latitude: Number(position[0]),
          longitude: Number(position[1]),
        },

        paymentMethod: paymentMethod,

        subtotal: Number(subtotal) || 0,

        deliveryCharge: Number(deliveryCharge) || 0,

        totalAmount: Number(grandTotal) || 0,
      };

      if (paymentMethod === "cod") {
        const res = await axios.post("/api/user/order/cod", orderData);
        if (res.data?.success) {
          toast.success(res.data?.message || "");
          setOrderSuccess({
            orderId: res.data?.data?._id || res.data?.orderId,
            totalAmount: grandTotal,
            paymentMethod: "cod",
          });
        }
      }

      // =========================
      // ONLINE PAYMENT
      // =========================
      if (paymentMethod === "online") {
        // Abhi online payment ka API yaha call karna hai.
        // Example:
        //
        // const res = await axios.post(
        //   "/api/user/order/online",
        //   orderData
        // );
        //
        // Payment gateway open karna hai.

        console.log("ONLINE ORDER:", orderData);

        return;
      }
    } catch (error) {
      console.error("PLACE ORDER ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to place order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />

          <p className="font-medium text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md w-full text-center">
          <ShoppingBag size={50} className="mx-auto text-gray-400" />

          <h2 className="text-2xl font-bold mt-5">Your cart is empty</h2>

          <p className="text-gray-500 mt-2">
            Add some products before checkout.
          </p>

          <button
            type="button"
            onClick={() => router.push("/addCard")}
            className="w-full mt-6 bg-black text-white py-3.5 rounded-xl font-semibold cursor-pointer"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      
      {/* ORDER SUCCESS POPUP */}
      {orderSuccess && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-2">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 30,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 18,
            }}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Success Icon */}
            <div className="pt-8 flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 250,
                }}
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
              >
                <CheckCircle2 size={48} className="text-green-600" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="px-2 lg:px-5 pb-7 pt-5 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold text-gray-900"
              >
                Order Placed Successfully!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-gray-500 mt-2 text-sm sm:text-base"
              >
                Thank you for your order. Your order has been confirmed.
              </motion.p>

              {/* Order Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Order ID</span>

                  <span className="text-sm font-semibold text-gray-900 max-w-45 truncate">
                    {orderSuccess?.orderId}
                  </span>
                </div>

                <div className="border-t border-gray-200 my-3" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Payment</span>

                  <span className="text-sm font-semibold uppercase text-green-600">
                    {orderSuccess?.paymentMethod}
                  </span>
                </div>

                <div className="border-t border-gray-200 my-3" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Amount</span>

                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(orderSuccess?.totalAmount)}
                  </span>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-6 space-y-3"
              >
                {/* View Order */}
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/order/success/${orderSuccess.orderId}`);
                  }}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  View Order
                  <ArrowRight size={18} />
                </button>

                {/* Continue Shopping */}
                <button
                  type="button"
                  onClick={() => {
                    router.push("/");
                  }}
                  className="w-full py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 font-semibold transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/addCard")}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 cursor-pointer"
            >
              <ArrowLeft size={19} />

              <span className="font-medium">Back to Cart</span>
            </button>

            <div className="flex items-center gap-2">
              <Lock size={16} className="text-green-600" />

              <span className="text-sm font-medium text-gray-600">
                Secure Checkout
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-5 py-6 md:py-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-8">
          {/* LEFT */}

          <div className="lg:col-span-2 space-y-6">
            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-5 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <MapPin size={20} className="text-gray-700" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Delivery Address
                    </h2>

                    <p className="text-sm text-gray-500">
                      Your selected map location will automatically fill the
                      address.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* FULL NAME */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name
                    </label>

                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        name="fullName"
                        value={address.fullName}
                        onChange={handleAddressChange}
                        placeholder="Enter full name"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
                          errors.fullName
                            ? "border-red-400"
                            : "border-gray-200 focus:border-blue-500"
                        }`}
                      />
                    </div>

                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* PHONE */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={address.phone}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                          handleAddressChange({
                            target: {
                              name: "phone",
                              value,
                            },
                          });
                        }}
                        placeholder="10-digit mobile number"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
                          errors.phone
                            ? "border-red-400"
                            : "border-gray-200 focus:border-blue-500"
                        }`}
                      />
                    </div>

                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* EMAIL */}

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email{" "}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="email"
                        name="email"
                        value={address.email}
                        onChange={handleAddressChange}
                        placeholder="Enter email address"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none ${
                          errors.email
                            ? "border-red-400"
                            : "border-gray-200 focus:border-blue-500"
                        }`}
                      />
                    </div>

                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* ADDRESS */}

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Complete Address
                      </label>

                      {addressLoading && (
                        <div className="flex items-center gap-1.5 text-xs text-blue-600">
                          <Loader2 size={13} className="animate-spin" />
                          Getting address...
                        </div>
                      )}
                    </div>

                    <textarea
                      name="address"
                      value={address.address}
                      onChange={handleAddressChange}
                      rows={3}
                      placeholder="Select a location on map..."
                      className={`w-full px-4 py-3 rounded-xl border outline-none resize-none ${
                        errors.address
                          ? "border-red-400"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                    />

                    {errors.address && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  {/* CITY */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      placeholder="Enter city"
                      className={`w-full px-4 py-3 rounded-xl border outline-none ${
                        errors.city
                          ? "border-red-400"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                    />

                    {errors.city && (
                      <p className="text-xs text-red-500 mt-1">{errors.city}</p>
                    )}
                  </div>

                  {/* STATE */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      placeholder="Enter state"
                      className={`w-full px-4 py-3 rounded-xl border outline-none ${
                        errors.state
                          ? "border-red-400"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                    />

                    {errors.state && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  {/* PIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PIN Code
                    </label>

                    <input
                      type="tel"
                      name="pinCode"
                      value={address.pinCode}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);

                        handleAddressChange({
                          target: {
                            name: "pinCode",
                            value,
                          },
                        });
                      }}
                      placeholder="6-digit PIN"
                      className={`w-full px-4 py-3 rounded-xl border outline-none ${
                        errors.pinCode
                          ? "border-red-400"
                          : "border-gray-200 focus:border-blue-500"
                      }`}
                    />

                    {errors.pinCode && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.pinCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* PAYMENT */}
            <motion.section
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
              }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="p-5 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <CreditCard size={20} className="text-gray-700" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Payment Method
                    </h2>

                    <p className="text-sm text-gray-500">
                      Choose how you want to pay
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                {/* COD */}
                {isCODAvailable && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`cursor-pointer w-full p-4 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === "cod"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          paymentMethod === "cod"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Banknote size={20} />
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          Cash on Delivery
                        </p>

                        <p className="text-sm text-gray-500">
                          Pay when your order is delivered
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "cod"
                            ? "border-blue-600"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === "cod" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        )}
                      </div>
                    </div>
                  </button>
                )}

                {/* ONLINE */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("online")}
                  className={`cursor-pointer w-full p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "online"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        paymentMethod === "online"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <CreditCard size={20} />
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Online Payment
                      </p>

                      <p className="text-sm text-gray-500">
                        UPI, Credit Card, Debit Card & more
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === "online"
                          ? "border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === "online" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                </button>

                {/* COD UNAVAILABLE */}
                {!isCODAvailable && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertCircle size={18} className="text-amber-600 mt-0.5" />

                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Cash on Delivery unavailable
                      </p>

                      <p className="text-xs text-amber-700 mt-0.5">
                        Cash on Delivery is not available for one or more
                        products.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            {/* MAP */}
            {showMap ? (
              <button
                className="cursor-pointer w-full py-3.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-all"
                onClick={() => setShowMap(false)}
              >
                Show Map
              </button>
            ) : (
              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative z-1"
              >
                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <div className="flex  items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Navigation size={20} className="text-blue-600" />
                    </div>

                    <div className="flex justify-between w-full">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Select Delivery Location
                        </h2>

                        <p className="text-sm text-gray-500">
                          Drag the marker to change your delivery location.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowMap(true)}
                        className="cursor-pointer hover:text-red-500 transition-all duration-300"
                      >
                        <RxCross2 size={25} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* IMPORTANT MAP WRAPPER */}
                <div className="p-4 sm:p-6">
                  <div
                    className="
                    relative
                    w-full
                    h-[320px]
                    sm:h-[400px]
                    md:h-[500px]
                    rounded-2xl
                    overflow-hidden
                    isolate
                    touch-pan-x
                    touch-pan-y
                  "
                    style={{
                      zIndex: 1,
                    }}
                    onWheel={(e) => {
                      e.stopPropagation();
                    }}
                    onTouchMove={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <MapView
                      position={position}
                      setPosition={handleMapLocationSelect}
                    />
                  </div>
                </div>
              </motion.section>
            )}

            {/* SECURITY */}

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={22} className="text-green-600 shrink-0" />

                <div>
                  <p className="font-semibold text-green-800">
                    Safe & Secure Checkout
                  </p>

                  <p className="text-sm text-green-700 mt-1">
                    Your personal information and payment details are protected
                    with secure encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-5">
              <motion.section
                initial={{
                  opacity: 0,
                  x: 20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={19} />

                      <h2 className="font-bold text-gray-900">Order Summary</h2>
                    </div>

                    <span className="text-sm text-gray-500">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {products.map((item, index) => {
                      const product = item?.product;

                      const quantity = Number(item?.quantity) || 1;

                      const price = Number(product?.price) || 0;

                      const image = Array.isArray(product?.productImg)
                        ? product?.productImg?.[0]
                        : "";

                      return (
                        <div
                          key={item?._id || product?._id || index}
                          className="flex gap-3"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            {image ? (
                              <img
                                src={image}
                                alt={product?.title || "Product"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag
                                  size={22}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                              {product?.title || "Product"}
                            </h3>

                            {product?.category && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {product.category}
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                Qty: {quantity}
                              </span>

                              <span className="font-semibold text-sm text-gray-900">
                                {formatPrice(price * quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 my-5" />

                  {/* PRICE */}

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>

                      <span className="font-medium text-gray-900">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Delivery</span>

                        <Truck size={15} className="text-gray-400" />
                      </div>

                      <span
                        className={
                          deliveryCharge === 0
                            ? "font-medium text-green-600"
                            : "font-medium text-gray-900"
                        }
                      >
                        {deliveryCharge === 0
                          ? "FREE"
                          : formatPrice(deliveryCharge)}
                      </span>
                    </div>
                  </div>

                  {/* TOTAL */}

                  <div className="border-t border-gray-200 mt-5 pt-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-gray-900">
                          Total Amount
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          Inclusive of all charges
                        </p>
                      </div>

                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(grandTotal)}
                      </p>
                    </div>
                  </div>

                  {/* PLACE ORDER */}
                  <motion.button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {paymentMethod === "cod"
                          ? "Place Order"
                          : "Continue to Payment"}

                        <ArrowRight size={19} />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.section>

              {/* BENEFITS */}

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-gray-700" />

                    <div>
                      <p className="text-sm font-semibold">Secure Payment</p>

                      <p className="text-xs text-gray-500">
                        100% secure transaction
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-gray-700" />

                    <div>
                      <p className="text-sm font-semibold">Fast Delivery</p>

                      <p className="text-xs text-gray-500">
                        Delivered to your doorstep
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-gray-700" />

                    <div>
                      <p className="text-sm font-semibold">Quality Products</p>

                      <p className="text-xs text-gray-500">Verified products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default page;
