"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import IsLoading from "@/components/loading/loading";

const SignInBtn = ({
  provider,
  variant = "default",
}) => {
  const [loading, setLoading] = useState(false);

  const handleOAuthSignIn = async () => {
    setLoading(true);
    try {
      // ✅ Clear custom JWT cookies before OAuth
      await fetch('/api/auth/clear_cookies', { method: 'POST' });
      
      // Then proceed with OAuth
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("OAuth sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IsLoading loadstate={loading} />
      
      <Button
        variant={variant}
        className="w-full p-4 bg-gray-100 dark:text-black"
        onClick={handleOAuthSignIn}
        disabled={loading}
      >
        {loading && (
          <div className="mr-2">
            <Image
              src="/video/spinAnimation.gif"
              alt="loading"
              width={16}
              height={16}
              className="inline-block"
            />
          </div>
        )}
        <Image
          src={`/logos/${provider.toLowerCase()}.svg`}
          alt={`${provider} logo`}
          width={20}
          height={20}
          className="mr-2 inline-block"
        />
        {loading ? "Signing in..." : `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
      </Button>
    </>
  );
};

export default SignInBtn;