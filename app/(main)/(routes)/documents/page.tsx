"use client";

import Image from "next/image";
import { useUser } from "@clerk/clerk-react";

const DocumentsPage = () => {
  const { user } = useUser();

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      This is a protected DocumentsPage
      <Image
        src="/empty.png"
        height="300"
        width="300"
        alt="empty"
        className="dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        height="300"
        width="300"
        alt="empty"
        className="hidden dark:block"
      />
      <h2>Welcome to {user?.firstName}&apos;s tution</h2>
    </div>
  );
};

export default DocumentsPage;
