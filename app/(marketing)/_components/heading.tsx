"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        <span className="text-orange-500">Y</span>our Ideas,
        <span className="text-orange-500"> D</span>ocuments, & Plans. Unified.
        Welcome to <span className="underline">Daum</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        Daum is the connected workspace where <br />
        better, faster work happens.
      </h3>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {isAuthenticated && !isLoading && (
        <Button asChild className="bg-orange-500 hover:bg-orange-500">
          <Link href="/documents">
            Enter Daum
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
      {!isAuthenticated && !isLoading && (
        <SignInButton mode="modal">
          <Button className="bg-orange-500 hover:bg-orange-500">
            Get Daum free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
};
