"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignInBtn from "@/components/auth/signinbtn";
import { toast } from "sonner";
export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
   const handlesubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch('/api/auth/user_auth/signup', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.success || "Signed up successfully:");
      router.push('/dashboard'); // redirect after success
    } else {
      console.log("Signup error:", data.error || "Something went wrong");
      toast.error(data.error || "Something went wrong")
      // You could show an error message in the UI here
      }
    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md md:max-w-5xl mx-auto rounded-2xl shadow-xl overflow-hidden 
        flex flex-col md:flex-row bg-white dark:bg-gray-800">

       {/* LEFT SECTION = BRAND / HERO - Hidden on small screens */}
  <div className="hidden md:flex relative w-full md:w-1/2 p-8 md:p-10 flex-col justify-center
     bg-black/90  text-white min-h-[260px]">
    {/* Dark overlay for better text readability */}
    <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900/80 to-black/80"></div>
    {/* Background image overlay - Only show on medium+ screens */}
    <div className="absolute inset-0 z-0 opacity-40">
      <Image
        src="/logos/luci.jpg"
        alt="BookHive background"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 0px, 50vw"
      />
    </div>


        {/* CONTENT */}
        <div className="relative z-10 space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
            BookHive
          </h1>

          <h2 className="text-3xl lg:text-[40px] font-bold leading-tight">
            Join Our Community
          </h2>

          <div className="w-14 h-1 bg-white/80 rounded-full"></div>

          <p className="text-sm opacity-90 max-w-sm leading-relaxed">
            Create your account and start exploring our vast digital library. 
            Your reading journey begins here.
          </p>
        </div>
      </div>

      {/* RIGHT SECTION = FORM - Full width on mobile */}
      <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-6 flex items-center justify-center">
        <form className="w-full max-w-xs md:max-w-sm space-y-5" onSubmit={handlesubmit}>
          
          {/* TITLE - Added mobile padding */}
          <h2 className="text-xl font-semibold text-center text-blue-600 dark:text-blue-400 px-2">
            Create Your Account
          </h2>

          {/* EMAIL INPUT */}
          <div>
            <Label htmlFor="email" className="text-sm text-gray-600 dark:text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 bg-gray-100 dark:bg-gray-900 border-none"
            />
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <Label htmlFor="password" className="text-sm text-gray-600 dark:text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create a password"
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11 bg-gray-100 dark:bg-gray-900 border-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 
                hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>


          {/* TERMS AND CONDITIONS */}
          <div className="flex items-start gap-2 text-sm">
            <input 
              type="checkbox" 
              className="w-4 h-4 accent-blue-600 mt-0.5" 
              required 
            />
            <label className="text-gray-600 dark:text-gray-300">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          
          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-9 rounded-lg bg-blue-600 hover:bg-blue-500 
            dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-medium shadow-md"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          {/* SOCIAL SIGNUP */}
          <SignInBtn provider="google" variant="google" />

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 px-2">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}