"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { Item } from "./item";
import { FileIcon } from "lucide-react";
import { BoardItem } from "./board-item";

export const BoardList = () => {
  const params = useParams();
  const router = useRouter();
  const boards = useQuery(api.boards.getSidebar, {});

  const onRedirect = (boardId: string) => {
    router.push(`/boards/${boardId}`)
  }

  if (boards === undefined) {
    return (
      <>
        <BoardItem.Skeleton />
        <BoardItem.Skeleton />
        <BoardItem.Skeleton />
      </>
    );
  }

  return (
    <>
    {boards.map((board) => (
      <div key={board._id}>
        <BoardItem
          id={board._id}
          onClick={() => onRedirect(board._id)}
          label={board.title}
          icon={FileIcon}
          boardIcon={board.icon}
          active={params.boardId === board._id}
        />
      </div>
    ))}
    </>
  );
}
