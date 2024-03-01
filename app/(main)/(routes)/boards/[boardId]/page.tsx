"use client";

import { BoardToolbar } from "@/components/KanbanBoard/board-toolbar";
import BoardView from "@/components/KanbanBoard/board-view";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useConvex, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

interface BoardIdPageProps {
  params: {
    boardId: Id<"boards">;
  };
}

const BoardIdPage = ({ params }: BoardIdPageProps) => {
  const board = useQuery(api.boards.getById, {
    boardId: params.boardId
  });
  const convex = useConvex();

  const [calendar, setCalendar] = useState<Doc<"calendars"> | undefined>(undefined);
  
  const update = useMutation(api.boards.update);
  const removeCalendar = useMutation(api.boards.unconnectCalendar);

  useEffect(() => {
    const onUnconnectCalendar = () => {
      removeCalendar({
        id: params.boardId,
      })
    }
    console.log("???");

    if (!(board?.connectedCalendar)) setCalendar(undefined);
    else {
      convex.query(api.calendars.getById, {
        calendarId: board.connectedCalendar
      }).then(v => {
        setCalendar(v);
      }).catch(_ => {
        onUnconnectCalendar();
      });
    }
  }, [board?.connectedCalendar, convex, params.boardId, removeCalendar]);


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
      <BoardToolbar
        initialData={board}
        calendar={calendar}
      />
      <BoardView
        onChange={onUpdate}
        initialContent={board.content}
        editable={true}
        connectedCalendar={calendar}
      />
    </div>
  )
}

export default BoardIdPage;
