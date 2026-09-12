"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import axios from "axios";

import { useRouter, useSearchParams } from "next/navigation";

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
  Lock,
  ShieldCheck,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

import { toast } from "sonner";

/* =========================================================
   STRIPE PUBLISHABLE KEY
========================================================= */

const publishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/*
  IMPORTANT:
  This key MUST start with pk_test_ or pk_live_
*/

const stripePromise = publishableKey
  ? loadStripe(publishableKey)
  : null;


/* =========================================================
   PAYMENT FORM
========================================================= */

function PaymentForm({
  orderId,
  amount,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [paymentElementError, setPaymentElementError] =
    useState("");

  /* =======================================================
     PAYMENT SUBMIT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!stripe) {
      setPaymentElementError(
        "Stripe is not loaded yet. Please wait a moment."
      );

      toast.error(
        "Stripe is still loading. Please wait."
      );

      return;
    }

    if (!elements) {
      setPaymentElementError(
        "Payment form is not ready."
      );

      toast.error(
        "Payment form is not ready."
      );

      return;
    }

    if (!paymentReady) {
      setPaymentElementError(
        "Please wait until the payment form is ready."
      );

      toast.error(
        "Payment form is still loading."
      );

      return;
    }

    try {
      setLoading(true);
      setPaymentElementError("");

      /*
        Stripe will process the payment.

        After successful payment Stripe redirects to:
        /payment/success?orderId=...
      */

      const result = await stripe.confirmPayment({
        elements,

        confirmParams: {
          return_url:
            `${window.location.origin}/payment/success?orderId=${encodeURIComponent(
              orderId
            )}`,
        },

        redirect: "if_required",
      });

      console.log(
        "STRIPE PAYMENT RESULT:",
        result
      );

      /*
        If Stripe returns an error
      */

      if (result?.error) {
        console.error(
          "STRIPE PAYMENT ERROR:",
          result.error
        );

        const message =
          result.error.message ||
          "Payment failed. Please try again.";

        setPaymentElementError(message);

        toast.error(message);

        setLoading(false);

        return;
      }

      /*
        Some payment methods may complete without
        a redirect.
      */

      if (
        result?.paymentIntent?.status ===
        "succeeded"
      ) {
        toast.success(
          "Payment successful!"
        );

        router.replace(
          `/payment/success?orderId=${encodeURIComponent(
            orderId
          )}`
        );

        return;
      }

      if (
        result?.paymentIntent?.status ===
        "processing"
      ) {
        toast.success(
          "Payment is processing..."
        );

        router.replace(
          `/payment/success?orderId=${encodeURIComponent(
            orderId
          )}`
        );

        return;
      }

      setLoading(false);

    } catch (error) {
      console.error(
        "PAYMENT SUBMIT ERROR:",
        error
      );

      const message =
        error?.message ||
        "Something went wrong while processing payment.";

      setPaymentElementError(message);

      toast.error(message);

      setLoading(false);
    }
  };


  /* =======================================================
     PAYMENT ELEMENT READY
  ======================================================= */

  const handlePaymentElementReady = () => {
    console.log(
      "STRIPE PAYMENT ELEMENT READY"
    );

    setPaymentReady(true);
    setPaymentElementError("");
  };


  /* =======================================================
     PAYMENT ELEMENT LOAD ERROR
  ======================================================= */

  const handlePaymentElementLoadError = (
    event
  ) => {
    console.error(
      "STRIPE PAYMENT ELEMENT LOAD ERROR:",
      event
    );

    const message =
      event?.error?.message ||
      "Unable to load Stripe payment form.";

    setPaymentElementError(message);
    setPaymentReady(false);
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ===============================================
          STRIPE PAYMENT ELEMENT
      =============================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
        }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        {/* Header */}

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
            <CreditCard
              className="text-blue-600"
              size={22}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Payment Details
            </h2>

            <p className="text-sm text-slate-500">
              Enter your payment information
            </p>
          </div>
        </div>


        {/* Payment Loading */}

        {!paymentReady &&
          !paymentElementError && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <Loader2
                size={20}
                className="animate-spin text-blue-600"
              />

              <div>
                <p className="text-sm font-semibold text-blue-800">
                  Loading payment form...
                </p>

                <p className="text-xs text-blue-600">
                  Please wait a moment.
                </p>
              </div>
            </div>
          )}


        {/* Stripe Element */}

        <div className="min-h-[180px]">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
            onReady={
              handlePaymentElementReady
            }
            onLoaderror={
              handlePaymentElementLoadError
            }
          />
        </div>


        {/* Payment Element Error */}

        <AnimatePresence>
          {paymentElementError && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              className="mt-5 overflow-hidden"
            >
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Payment Error
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {paymentElementError}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Security */}

        <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock
              size={15}
              className="text-green-600"
            />

            Secure payment
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck
              size={15}
              className="text-green-600"
            />

            SSL encrypted
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2
              size={15}
              className="text-green-600"
            />

            Stripe secured
          </div>
        </div>
      </motion.div>


      {/* ===============================================
          PAY BUTTON
      =============================================== */}

      <motion.button
        type="submit"
        disabled={
          loading ||
          !stripe ||
          !elements ||
          !paymentReady
        }
        whileHover={
          !loading &&
          paymentReady
            ? {
                scale: 1.01,
              }
            : {}
        }
        whileTap={
          !loading &&
          paymentReady
            ? {
                scale: 0.99,
              }
            : {}
        }
        className={`flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-bold text-white transition-all ${
          loading ||
          !stripe ||
          !elements ||
          !paymentReady
            ? "cursor-not-allowed bg-slate-400"
            : "cursor-pointer bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <>
            <Loader2
              size={21}
              className="animate-spin"
            />

            Processing Payment...
          </>
        ) : (
          <>
            <Lock size={20} />

            Pay ₹
            {Number(amount || 0).toLocaleString(
              "en-IN"
            )}
          </>
        )}
      </motion.button>


      {/* Bottom message */}

      <p className="text-center text-xs leading-5 text-slate-500">
        Your payment is securely processed by Stripe.
        <br />
        We do not store your card details.
      </p>
    </form>
  );
}


/* =========================================================
   MAIN PAYMENT PAGE
========================================================= */

export default function PaymentPage() {
  const searchParams =
    useSearchParams();

  const router = useRouter();

  const orderId =
    searchParams.get("orderId");


  const [clientSecret, setClientSecret] =
    useState("");

  const [amount, setAmount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =======================================================
     GET PAYMENT DETAILS
  ======================================================= */

  useEffect(() => {
    const getPaymentDetails =
      async () => {

        if (!orderId) {
          setError(
            "Order ID is missing."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          console.log(
            "GET PAYMENT DETAILS FOR ORDER:",
            orderId
          );

          const res =
            await axios.get(
              `/api/user/order/online?orderId=${encodeURIComponent(
                orderId
              )}`
            );

          console.log(
            "PAYMENT API RESPONSE:",
            res.data
          );

          if (
            !res.data?.success
          ) {
            throw new Error(
              res.data?.message ||
                "Unable to load payment."
            );
          }

          if (
            !res.data?.clientSecret
          ) {
            console.error(
              "CLIENT SECRET MISSING:",
              res.data
            );

            throw new Error(
              "Stripe client secret is missing."
            );
          }

          setClientSecret(
            res.data.clientSecret
          );

          setAmount(
            Number(
              res.data.amount || 0
            )
          );

        } catch (error) {
          console.error(
            "GET PAYMENT DETAILS ERROR:",
            error
          );

          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Unable to load payment.";

          setError(message);

        } finally {
          setLoading(false);
        }
      };


    getPaymentDetails();

  }, [orderId]);


  /* =======================================================
     RETRY
  ======================================================= */

  const handleRetry = () => {
    window.location.reload();
  };


  /* =======================================================
     STRIPE ELEMENT OPTIONS
  ======================================================= */

  const options = useMemo(() => {

    if (!clientSecret) {
      return undefined;
    }

    return {
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

            boxShadow:
              "0 0 0 1px #e2e8f0",
          },

          ".Input:focus": {
            boxShadow:
              "0 0 0 2px #2563eb",
          },

          ".Label": {
            fontWeight: "600",
          },
        },
      },
    };

  }, [clientSecret]);


  /* =======================================================
     MISSING ORDER ID
  ======================================================= */

  if (!orderId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertCircle
              size={28}
              className="text-red-600"
            />
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Invalid Payment Link
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Order ID is missing from the payment URL.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Go Home
          </button>

        </div>
      </main>
    );
  }


  /* =======================================================
     STRIPE KEY MISSING
  ======================================================= */

  if (!publishableKey) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-lg">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <AlertCircle
                size={25}
                className="text-red-600"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Stripe Configuration Error
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Stripe publishable key is missing.
              </p>

              <p className="mt-3 rounded-lg bg-slate-100 p-3 font-mono text-xs text-slate-700">
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Add the key to your .env.local file and
                restart the Next.js server.
              </p>
            </div>

          </div>

        </div>
      </main>
    );
  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">

              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-900">
              Loading Payment
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Preparing your secure payment...
            </p>

          </div>

        </div>

      </main>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 shadow-lg"
        >

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">

              <AlertCircle
                size={32}
                className="text-red-600"
              />

            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Unable to Load Payment
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {error}
            </p>


            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={handleRetry}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <RefreshCcw size={18} />

                Retry
              </button>

              <button
                type="button"
                onClick={() =>
                  router.back()
                }
                className="flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go Back
              </button>

            </div>

          </div>

        </motion.div>

      </main>
    );
  }


  /* =======================================================
     CLIENT SECRET MISSING
  ======================================================= */

  if (!clientSecret) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">

          <AlertCircle
            size={40}
            className="mx-auto text-red-600"
          />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Payment Session Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Stripe payment session could not be created.
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCcw size={18} />

            Try Again
          </button>

        </div>

      </main>
    );
  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =================================================
          TOP HEADER
      ================================================= */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />

            Back
          </button>


          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">

              <ShoppingBag
                size={18}
                className="text-white"
              />

            </div>

            <span className="text-lg font-bold text-slate-900">
              Secure Checkout
            </span>

          </div>


          <div className="flex items-center gap-2 text-xs font-semibold text-green-600">

            <Lock size={15} />

            Secure

          </div>

        </div>

      </header>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Checkout
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Complete Your Payment
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Your payment information is encrypted and securely
            processed by Stripe.
          </p>

        </motion.div>


        {/* Grid */}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* ============================================
              PAYMENT
          ============================================ */}

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


          {/* ============================================
              ORDER SUMMARY
          ============================================ */}

          <aside>

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >

              {/* Summary Header */}

              <div className="border-b border-slate-100 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                    <ShoppingBag
                      size={21}
                      className="text-blue-600"
                    />

                  </div>

                  <div>

                    <h2 className="font-bold text-slate-900">
                      Order Summary
                    </h2>

                    <p className="text-xs text-slate-500">
                      Order #{orderId}
                    </p>

                  </div>

                </div>

              </div>


              {/* Gift */}

              <div className="border-b border-slate-100 p-5">

                <div className="overflow-hidden rounded-xl bg-slate-50">

                  <Image
                    src="/gift.gif"
                    alt="Payment"
                    width={500}
                    height={200}
                    className="h-32 w-full object-contain"
                  />

                </div>

              </div>


              {/* Amount */}

              <div className="space-y-4 p-5">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Order Amount
                  </span>

                  <span className="font-semibold text-slate-900">
                    ₹
                    {Number(
                      amount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>


                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Delivery
                  </span>

                  <span className="font-semibold text-green-600">
                    Free
                  </span>

                </div>


                <div className="border-t border-dashed border-slate-200 pt-4">

                  <div className="flex items-end justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Total Amount
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Inclusive of applicable charges
                      </p>

                    </div>

                    <p className="text-2xl font-extrabold text-slate-900">

                      ₹
                      {Number(
                        amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </p>

                  </div>

                </div>

              </div>

            </motion.div>


            {/* =========================================
                SECURITY CARD
            ========================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
              className="mt-5 rounded-2xl border border-green-100 bg-green-50 p-5"
            >

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">

                  <ShieldCheck
                    size={21}
                    className="text-green-600"
                  />

                </div>

                <div>

                  <h3 className="text-sm font-bold text-green-900">
                    Safe & Secure Payment
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-green-700">
                    Your card information is securely handled
                    by Stripe. We never store your complete
                    card details.
                  </p>

                </div>

              </div>

            </motion.div>

          </aside>

        </div>

      </div>

    </main>
  );
}
