"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { loadStripe } from "@stripe/stripe-js";

import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Gift,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

// ======================================================
// STRIPE
// ======================================================

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

// ======================================================
// PAYMENT FORM
// ======================================================

const PaymentForm = ({ orderId, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ====================================================
  // SUBMIT PAYMENT
  // ====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system is still loading.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url: `${window.location.origin}/payment/success?orderId=${orderId}`,
        },
      });

      if (result.error) {
        console.error("STRIPE PAYMENT ERROR:", result.error);

        setError(
          result.error.message ||
            "Payment failed. Please try again."
        );

        setLoading(false);
        return;
      }

      // Stripe normally redirects using return_url.
      setLoading(false);
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong during payment."
      );

      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      >
        {/* CARD HEADER */}

        <div className="border-b border-slate-100 bg-linear-to-r from-slate-50 to-white p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
              <CreditCard className="h-6 w-6 text-white" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Payment Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your details to complete the payment
              </p>
            </div>
          </div>
        </div>

        {/* PAYMENT ELEMENT */}

        <div className="p-5 sm:p-7">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </motion.div>

      {/* ================================================
          ERROR
      ================================================= */}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Payment Failed
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================
          PAY BUTTON
      ================================================= */}

      <motion.button
        whileHover={!loading ? { scale: 1.01 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        type="submit"
        disabled={!stripe || !elements || loading}
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-6 py-4.5 text-base font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {/* SHINE */}

        {!loading && (
          <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}

        <span className="relative flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <LockKeyhole className="h-5 w-5" />
              Pay ₹
              {Number(amount || 0).toLocaleString("en-IN")}
            </>
          )}
        </span>
      </motion.button>

      {/* ================================================
          SECURITY
      ================================================= */}

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Secure Payment
        </div>

        <div className="flex items-center gap-1.5">
          <LockKeyhole className="h-4 w-4 text-blue-600" />
          SSL Encrypted
        </div>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Stripe Protected
        </div>
      </div>
    </form>
  );
};

// ======================================================
// PAYMENT PAGE
// ======================================================

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");

  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // GET PAYMENT DETAILS
  // ====================================================

  useEffect(() => {
    const getPaymentDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `/api/user/order/online?orderId=${encodeURIComponent(
            orderId
          )}`
        );


        if (!res.data?.success) {
          setError(
            res.data?.message ||
              "Unable to initialize payment."
          );

          return;
        }

        if (!res.data?.clientSecret) {
          setError(
            "Stripe payment could not be initialized."
          );

          return;
        }

        setClientSecret(res.data.clientSecret);

        setAmount(Number(res.data.amount || 0));
      } catch (error) {
        console.error(
          "GET PAYMENT DETAILS ERROR:",
          error
        );

        setError(
          error?.response?.data?.message ||
            "Unable to load payment. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    getPaymentDetails();
  }, [orderId]);

  // ====================================================
  // FORMAT AMOUNT
  // ====================================================

  const formattedAmount = useMemo(() => {
    return Number(amount || 0).toLocaleString("en-IN");
  }, [amount]);

  // ====================================================
  // NO ORDER ID
  // ====================================================

  if (!orderId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Invalid Order
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Order ID is missing. Please go back and try
            placing the order again.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-7 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go Home
          </button>
        </motion.div>
      </main>
    );
  }

  // ====================================================
  // LOADING
  // ====================================================
  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
            <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
          </div>

          <h2 className="mt-6 text-xl font-bold text-slate-900">
            Preparing your payment
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we securely connect to Stripe...
          </p>

          <div className="mx-auto mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              animate={{ x: [-192, 192] }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: "easeInOut",
              }}
              className="h-full w-1/2 rounded-full bg-blue-600"
            />
          </div>
        </motion.div>
      </main>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Payment Error
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

            <button
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ====================================================
  // NO CLIENT SECRET
  // ====================================================
  if (!clientSecret) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <XCircle className="mx-auto h-14 w-14 text-red-500" />

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Payment Unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Unable to initialize Stripe payment.
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // STRIPE OPTIONS
  // ====================================================

  const options = {
    clientSecret,

    appearance: {
      theme: "stripe",

      variables: {
        colorPrimary: "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#0f172a",
        colorDanger: "#dc2626",
        borderRadius: "12px",
        fontFamily:
          '"Inter", "Segoe UI", system-ui, sans-serif',
      },

      rules: {
        ".Input": {
          padding: "13px 14px",
          boxShadow: "0 0 0 1px #e2e8f0",
        },

        ".Input:focus": {
          boxShadow: "0 0 0 2px #2563eb",
        },

        ".Label": {
          fontWeight: "600",
        },
      },
    },
  };

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -right-45 top-[20%] h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />

        <div className="absolute -bottom-45 left-[20%] h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex items-center justify-between"
        >
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-600 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform " />
            Back
          </button>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm">
            <LockKeyhole className="h-4 w-4 text-emerald-600" />
            Secure Checkout
          </div>
        </motion.div>

        {/* =================================================
            HERO
        ================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 shadow-xl shadow-blue-100"
        >
          <div className="relative flex min-h-[180px] items-center justify-between overflow-hidden px-6 py-7 sm:px-10 sm:py-8">
            {/* DECORATION */}

            <Sparkles className="absolute right-24 top-7 h-5 w-5 text-white/40" />
            <Sparkles className="absolute bottom-7 right-1/3 h-4 w-4 text-white/30" />

            <div className="relative z-10 max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" />
                Safe & Secure Payment
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Complete Your Payment
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100 sm:text-base">
                Your order is almost ready! Complete the secure
                payment below and we&apos;ll take care of the rest.
              </p>
            </div>

            {/* GIFT GIF */}

            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative z-10 hidden h-32 w-32 shrink-0 items-center justify-center sm:flex lg:h-40 lg:w-40"
            >
              <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl" />

              <Image
                src="/gift.gif"
                alt="Gift"
                width={150}
                height={150}
                unoptimized
                className="relative h-28 w-28 object-contain drop-shadow-2xl lg:h-36 lg:w-36"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              LEFT - PAYMENT
          ================================================= */}

          <div>
            <Elements
              stripe={stripePromise}
              options={options}
            >
              <PaymentForm
                orderId={orderId}
                amount={amount}
              />
            </Elements>
          </div>

          {/* =================================================
              RIGHT - ORDER SUMMARY
          ================================================= */}

          <motion.aside
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="h-fit lg:sticky lg:top-6"
          >
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* SUMMARY HEADER */}

              <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100">
                    <Gift className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Order Summary
                    </h2>

                    <p className="text-xs text-slate-500">
                      Review your order
                    </p>
                  </div>
                </div>
              </div>

              {/* SUMMARY BODY */}

              <div className="p-6">
                {/* ORDER ID */}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Order ID
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {orderId}
                  </p>
                </div>

                {/* PAYMENT METHOD */}

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Online Payment
                      </p>

                      <p className="text-xs text-slate-500">
                        Powered by Stripe
                      </p>
                    </div>
                  </div>

                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>

                {/* DIVIDER */}

                <div className="my-5 h-px bg-slate-100" />

                {/* TOTAL */}

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Amount
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Inclusive of applicable charges
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-blue-600">
                      ₹{formattedAmount}
                    </p>
                  </div>
                </div>

                {/* GIFT MESSAGE */}

                <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Almost there! 🎁
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        Complete your payment and your order
                        will be ready to process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECURITY CARD */}

            <div className="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-emerald-900">
                    Your payment is secure
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    We never store your card details. Payment
                    information is securely handled by Stripe.
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col items-center justify-center gap-2 text-center"
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <LockKeyhole className="h-3.5 w-3.5" />
            256-bit encrypted secure checkout
          </div>

          <p className="text-[11px] text-slate-400">
            By completing the payment, you agree to the applicable
            terms and conditions.
          </p>
        </motion.div>
      </div>
    </main>
  );
};

export default PaymentPage;
