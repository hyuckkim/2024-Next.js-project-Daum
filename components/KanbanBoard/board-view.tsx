"use client";

import React, { useState } from "react";
import { useKanbanBoard } from "@/hooks/use-kanban-board";
import { PlusCircle } from "lucide-react";

import { BoardElement } from "./board-element";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrayDragSpace } from "../array-drag-space";

const BoardView = ({
  onChange,
  initialContent,
  editable,
}: {
  onChange?: (value: string) => void,
  initialContent?: string,
  editable?: boolean
}) => {
  const documents = useQuery(api.documents.getSearch, {});
  const [dragSelected, setDragSelected] = useState<number | undefined>(undefined);

  const editor = useKanbanBoard({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onBoardChanged: (board) => {
      onChange?.(JSON.stringify(board, null, 2));
    }
  });

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
