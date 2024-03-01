"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Calendar, Eye, MoreHorizontal, Trash, Unlink } from "lucide-react";

import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface MenuProps {
  documentId: Id<"boards">;
  calendar?: Doc<"calendars">;
}

export const BoardMiscMenu = ({ documentId, calendar }: MenuProps) => {
  const router = useRouter();
  const { user } = useUser();

  const board = useQuery(api.boards.getById, { boardId: documentId });

  const calendars = useQuery(api.calendars.getSidebar);
  const connectCalendar = useMutation(api.boards.connectCalendar);
  const unconnectCalendar = useMutation(api.boards.unconnectCalendar);

  const archive = useMutation(api.boards.archive);

  const onArchive = () => {
    const promise = archive({ id: documentId });

    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Note moved to trash!",
      error: "Failed to archive note.",
    });

    router.push("/documents");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        {!!calendar ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <span className="bold">{calendar.title}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem asChild>
                  <Link href={`/calendars/${calendar._id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    See
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { unconnectCalendar({ id: documentId }); }}>
                  <Unlink className="h-4 w-4 mr-2" />
                  Unconnect
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              Connect to Calendar...
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {!!calendars && calendars.map(c => (
                  <DropdownMenuItem key={c._id} onClick={() => connectCalendar({ id: documentId, calendar: c._id })}>
                    {c.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}

        <DropdownMenuItem onClick={onArchive}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.fullName}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

BoardMiscMenu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-10 w-10" />;
};
