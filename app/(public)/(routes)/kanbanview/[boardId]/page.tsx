"use client";

import { BoardToolbar } from "@/components/KanbanBoard/board-toolbar";
import BoardView from "@/components/KanbanBoard/board-view";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

interface BoardIdPageProps {
  params: {
    boardId: Id<"boards">;
  };
}

const BoardIdPage = ({ params }: BoardIdPageProps) => {
  const board = useQuery(api.boards.getById, {
    boardId: params.boardId,
  });

  if (board === undefined) {
    return (
      <div className="p-4">
        <Skeleton className="h-16 w-64" />
        <div className="flex space-x-2 pt-4 pl-2">
          <Skeleton className="h-80 w-64" />
          <Skeleton className="h-96 w-64" />
          <Skeleton className="h-80 w-64" />
        </div>
      </div>
    )
  }

  if (document === null) {
    return <div>Not found</div>;
  }

  return (
    <div>
      <BoardToolbar
        initialData={board}
        preview
      />
      <BoardView
        initialContent={board.content}
        editable={false}
      />
    </div>
  );
}

export default BoardIdPage;