"use client";

import Image from "next/image";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const BoardPage = () => {
  const router = useRouter();
  const create = useMutation(api.boards.create);

  const onCreate = () => {
    const promise = create({ title: "Untitled"}).then((boardId) =>
      router.push(`/boards/${boardId}`)
    );

    toast.promise(promise, {
      loading: "Creating a new board...",
      success: "New board a created",
      error: "Failed to create a new board",
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        height="300"
        width="300"
        alt="empty"
        className="dark:hidden scale-x-[-1]"
      />
      <Image
        src="/empty-dark.png"
        height="300"
        width="300"
        alt="empty"
        className="hidden dark:block scale-x-[-1]"
      />
      <h2 className="text-lg font-medium">
        Use boards to manage your schedule
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a board
      </Button>
    </div>
  )
}

export default BoardPage;
