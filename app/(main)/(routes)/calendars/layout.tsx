"use client";

import { Toaster } from "sonner";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";

import { Spinner } from "@/components/spinner";

import { SearchCommand } from "@/components/search-command";

const CalendarLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return redirect("/");
  }

  return (
    <div className="h-full flex dark:bg-[#1F1F1F]">
      <main className="flex-1 justify-center items-center h-full w-full overflow-y-auto">
        <SearchCommand />
        {children}
      </main>
    </div>
  );
};

export default CalendarLayout;
