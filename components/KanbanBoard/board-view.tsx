"use client";

import React, { useEffect, useState } from "react";
import { useKanbanBoard } from "@/hooks/use-kanban-board";
import { PlusCircle } from "lucide-react";

import { BoardElement } from "./board-element";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrayDragSpace } from "../array-drag-space";
import { cn } from "@/lib/utils";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Calendar, parseDateByIndex } from "@/types/calendar";

const BoardView = ({
  onChange,
  initialContent,
  editable,
  connectedCalendar,
}: {
  onChange?: (value: string) => void,
  initialContent?: string,
  connectedCalendar?: Doc<"calendars">,
  editable?: boolean,
}) => {
  const documents = useQuery(api.documents.getSearch, {});
  const [dragSelected, setDragSelected] = useState<number | undefined>(undefined);

  const editor = useKanbanBoard({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onBoardChanged: (board) => {
      onChange?.(JSON.stringify(board, null, 2));
    }
  });

  const [orientedData, setOrientedData] = useState<{[document: Id<"documents">]: Date}>({});
  useEffect(() => {
    const newData: {[document: Id<"documents">]: Date} = {};
    if (connectedCalendar?.content) {
      const calendarData: Calendar = JSON.parse(connectedCalendar.content);
      calendarData.forEach(e => {
        const parsedDate = parseDateByIndex(e.calendarMonth, e.calendarIndex);
        e.content.forEach(d => {
          if (false) { // Todo: calendarDocument가 문서를 포함하고 있다면! (아래에 있는 as 문법도 수정하기)
            newData[(d as unknown as {doc: Id<"documents">}).doc] = parsedDate;
          }
        });
      });
      setOrientedData(newData);
    }
  }, [connectedCalendar]);

  const onDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types[0] === "elementid") {
      e.preventDefault();
    }
  }

  const onDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.types[0] === "elementid") {
      const elementId = e.dataTransfer.getData("elementid");
      editor.onMoveElement(elementId, dragSelected ?? editor?.content?.length ?? 0);

      setDragSelected(undefined);
      e.stopPropagation();

    }
  }

  const onElementDragOver = (
    status: ("before" | "after" | "none"), 
    index: number
  ) => {
    switch (status) {
      case "none":
        setDragSelected(undefined);
        break;
      case "before":
        setDragSelected(index);
        break;
      case "after":
        setDragSelected(index + 1);
        break;
    }
  }

  const onElementIndexDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    if (e.dataTransfer.types[0] === "elementid") {
      e.preventDefault();
      e.stopPropagation();

      setDragSelected(index);
    }
  }

  return (
    <div 
      className="flex overflow-x-auto m-4 min-h-80"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ArrayDragSpace
        index={dragSelected ?? -1}
        direction="x"
        onDragToIndex={(e, i) => onElementIndexDragOver(e, i)}
        onDragToLast={(e) => onElementIndexDragOver(e, editor?.content?.length ?? 0)}
      >
        {editor.content && editor.content.map((v, i) => (
          <BoardElement
            key={v._id}
            element={v}
            editor={editor}
            editable={editable}
            documents={documents}
            onDragChange={(e) => onElementDragOver(e, i)}
            calendarData={orientedData}
          />
        ))}
      </ArrayDragSpace>
      
      {editable && (
        <div
          className="flex flex-col h-min w-64 p-2 rounded-md border-2 border-dashed text-muted-foreground border-neutral-200 dark:border-neutral-700 justify-center items-center shrink-[3]"
          role="button"
          onClick={editor.onNewElement}
        >
          <div className="h-80 flex justify-center items-center">
            <PlusCircle className="w-8 h-8"/>
          </div>
        </div>
      )}
    </div>
  )
}

export default BoardView;
