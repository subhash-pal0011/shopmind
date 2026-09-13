"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Home,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react";


function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Payment session not found.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await axios.get(
          `/api/payment/verify?session_id=${encodeURIComponent(
            sessionId
          )}&orderId=${encodeURIComponent(orderId || "")}`
        );


        if (response.data.success && response.data.paid) {
          setPaymentStatus("paid");

          setOrderStatus(
            response.data.orderStatus || "confirmed"
          );

          if (response.data.amount !== undefined) {
            setAmount(response.data.amount);
          }

          setLoading(false);
          return;
        }

        setPaymentStatus(
          response.data.paymentStatus || "pending"
        );

        setOrderStatus(
          response.data.orderStatus || "pending"
        );

        setError(
          response.data.message ||
            "Payment is not completed."
        );

        setLoading(false);
      } catch (error) {
        console.error(
          "VERIFY ERROR:",
          error.response?.data || error.message
        );

        setError(
          error.response?.data?.message ||
            "Unable to verify payment."
        );

        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">

            <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Verifying your payment
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Please wait while we confirm your
              payment and order details.
            </p>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-blue-600 animate-pulse" />
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Please do not close or refresh this page.
            </p>
          </div>
        </div>
      </main>
    );
  }


  if (paymentStatus === "paid") {
    return (
      <main className="min-h-screen bg-gray-200 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-lg">

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

            {/* Success Header */}
            <div className="px-6 sm:px-10 pt-10 pb-8 text-center">

              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">

                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />

                <div className="relative w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2
                    className="w-12 h-12 text-green-600"
                    strokeWidth={2}
                  />
                </div>

              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-green-600">
                Payment Confirmed
              </p>

              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">
                Payment Successful!
              </h1>

              <p className="mt-3 text-slate-500 leading-6">
                Thank you for your purchase. Your
                payment has been successfully received
                and your order is now confirmed.
              </p>
            </div>

            {/* Order Details */}
            <div className="px-6 sm:px-10 pb-8">

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">

                {/* Order ID */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Order ID
                      </p>

                      <p className="text-sm font-semibold text-slate-900 break-all">
                        {orderId || "N/A"}
                      </p>
                    </div>

                  </div>

                </div>

                {/* Payment Status */}
                <div className="flex items-center justify-between py-4 border-b border-slate-200">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Payment Status
                      </p>

                      <p className="text-sm font-semibold text-green-600 capitalize">
                        {paymentStatus}
                      </p>
                    </div>

                  </div>

                  <CheckCircle2 className="w-5 h-5 text-green-500" />

                </div>

                {/* Order Status */}
                <div className="flex items-center justify-between pt-4">

                  <div>
                    <p className="text-xs text-slate-500">
                      Order Status
                    </p>

                    <p className="text-sm font-semibold text-slate-900 capitalize">
                      {orderStatus}
                    </p>
                  </div>

                  <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold capitalize">
                    {orderStatus}
                  </span>

                </div>

                {/* Amount */}
                {amount !== null && (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Amount Paid
                    </span>

                    <span className="text-lg font-bold text-slate-900">
                      ₹{Number(amount).toLocaleString("en-IN")}
                    </span>

                  </div>
                )}

              </div>

              {/* Info */}
              <div className="mt-5 flex gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">

                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />

                <p className="text-sm leading-5 text-blue-800">
                  Your order has been confirmed. You
                  can track your order and view all
                  details from your orders section.
                </p>

              </div>

              {/* Buttons */}
              <div className="mt-7 flex w-full gap-5">

                <button
                  type="button"
                  onClick={() => router.push("/products")}
                  className="cursor-pointer group w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-blue-600/20 px-4 py-3.5"
                >
                  <ShoppingBag className="w-5 h-5" />

                  <p className="text-xs">
                    View My Orders
                  </p>

                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3.5 transition-all duration-200"
                >
                  <Home className="w-5 h-5" />

                  <p className="text-xs">
                    Continue Shopping
                  </p>
                </button>

              </div>

            </div>

          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Thank you for shopping with ShopMind ❤️
          </p>

        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-white to-red-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 sm:p-10 text-center">

          {/* Error Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-11 h-11 text-red-500" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-red-500">
            Payment Not Confirmed
          </p>

          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
            Payment Verification Failed
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ||
              "We could not confirm your payment at this time."}
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-4">

              <p className="text-xs text-slate-500">
                Order ID
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800 break-all">
                {orderId}
              </p>

            </div>
          )}

          {/* Status */}
          {paymentStatus && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">

              <span className="text-sm text-slate-500">
                Payment Status
              </span>

              <span className="text-sm font-semibold capitalize text-slate-800">
                {paymentStatus}
              </span>

            </div>
          )}

          {/* Buttons */}
          <div className="mt-7 space-y-3 w-full">

            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3.5 transition-all"
            >
              <Home className="w-5 h-5" />

              <p className="text-xs">
                Continue Shopping
              </p>
            </button>

            {orderId && (
              <button
                type="button"
                onClick={() => router.push("/orders")}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-3.5 transition-all"
              >
                <ShoppingBag className="w-5 h-5" />

                <p className="text-xs">
                  View Orders
                </p>
              </button>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}


export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">

              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Loading payment details
              </h1>

              <p className="mt-3 text-sm text-slate-500">
                Please wait...
              </p>

            </div>
          </div>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
