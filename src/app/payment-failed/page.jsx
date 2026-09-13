"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";

import {
  XCircle,
  RefreshCcw,
  Home,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

export default function PaymentFailedPage() {
  const router = useRouter();

  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    setOrderId(
      new URLSearchParams(window.location.search).get(
        "orderId",
      ),
    );
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle
            size={50}
            className="text-red-600"
          />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Payment Failed
        </h1>

        <p className="mt-3 text-gray-500">
          Your payment was not completed.
          Please try again.
        </p>

        {orderId && (
          <div className="mt-6 rounded-2xl bg-gray-50 p-4 text-left">
            <p className="text-xs text-gray-500">
              Order ID
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-gray-800">
              {orderId}
            </p>
          </div>
        )}

        <button
          onClick={() =>
            router.push("/")
          }
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white"
        >
          <Home size={19} />

          Continue Shopping
        </button>

        <button
          onClick={() =>
            router.back()
          }
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 font-medium text-gray-700"
        >
          <RefreshCcw size={18} />

          Try Again
        </button>
      </div>
    </main>
  );
}
