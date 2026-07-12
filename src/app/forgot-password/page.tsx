"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft } from 'lucide-react';
import toast from "react-hot-toast";
import Link from "next/link";
import { useTransition } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);
    setIsLoading(true);

    if (!email) {
      setEmailError("Email address is required.");
      setIsLoading(false);
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        setIsLoading(false);

        if (!res.ok) {
          const errorMsgs = Array.isArray(data.message) ? data.message : [data.message || "Failed to process request"];
          let fieldErr: string | null = null;
          let genericErr: string | null = null;

          errorMsgs.forEach((msg: string) => {
            if (msg.toLowerCase().includes("email")) {
              fieldErr = msg;
            } else {
              genericErr = msg;
            }
          });

          if (fieldErr) {
            setEmailError(fieldErr);
          } else if (genericErr) {
            toast.error(genericErr);
          }
        } else {
          setIsSuccess(true);
          toast.success("Check your email for reset instructions.");
        }
      } catch (err: any) {
        setIsLoading(false);
        toast.error("Failed to connect to the server.");
      }
    });
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {isSuccess
              ? "We've sent a password reset link to your email."
              : "Enter your email address to receive a reset link."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-800 dark:text-white sm:text-sm sm:leading-6 ${emailError
                      ? "ring-red-300 focus:ring-red-500"
                      : "ring-slate-300 focus:ring-primary dark:ring-slate-700"
                    }`}
                  placeholder="admin@krps.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-655 mt-1" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isPending}
              className="flex w-full justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
            >
              {isLoading || isPending ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              className="flex w-full justify-center gap-2"
            >
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </button>
          </form>
        ) : (
          <div className="flex justify-center pt-4">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
