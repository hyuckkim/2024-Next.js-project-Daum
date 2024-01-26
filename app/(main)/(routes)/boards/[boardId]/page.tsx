"use client";

import { BoardToolbar } from "@/components/board-toolbar";
import BoardView from "@/components/board-view";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

interface BoardIdPageProps {
  params: {
    boardId: Id<"boards">;
  };
}

const BoardIdPage = ({ params }: BoardIdPageProps) => {
  const board = useQuery(api.boards.getById, {
    boardId: params.boardId
  });
  const update = useMutation(api.boards.update);

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

  if (board === null) {
    return <div>Not found</div>;
  }

  const onUpdate = (value: string) => {
    update({
      id: params.boardId,
      content: value
    });
  };

  return (
    <div>
      <BoardToolbar initialData={board}/>
      <BoardView
        onChange={onUpdate}
        initialContent={board.content}
        editable={true}
      />
    </div>
  )
}

export default BoardIdPage;
