"use client";

import { Doc, Id } from "@/convex/_generated/dataModel"
import { Skeleton } from "../ui/skeleton"
import { File, MoreHorizontal, Trash, SquareSlash, CheckSquare, Flag, TextIcon, ListChecks } from "lucide-react"
import Link from "next/link"
import { KanbanBoardProps } from "@/hooks/use-kanban-board"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { KanbanBoardDocument } from "@/types/kanbanboard";
import { ElementRef, useRef } from "react";
import { toast } from "sonner";
import { BoardDocumentTitle } from "./board-document-title";

export const BoardDocument = ({
  _id,
  boardDocument: {
    _id: id,
    color,
    priority,
    memo,
  },
  document,
  editable,
  editor: {
    onRemoveDocument,
    onDocumentSetAttribute,
  },
  onDragChange,
}: {
  _id: string,
  boardDocument: KanbanBoardDocument
  document: Doc<"documents">,
  editable?: boolean,
  editor: KanbanBoardProps
  onDragChange?: (status: ("before" | "after" | "none")) => void,
}) => {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef<ElementRef<"div">>(null);

  if (document === undefined) {
    onRemoveDocument(id);

    toast('Some documents were unreadable and were removed from the board.');
    return null;
  }

  const priorityColors = [
    "#d1453b",
    "#eb8909",
    "#246fe0",
  ];

  const colors = [
    { light: "#fecaca", dark: "#b91c1c" },
    { light: "#fed7aa", dark: "#c2410c" },
    { light: "#fef08a", dark: "#a16207" },
    { light: "#bbf7d0", dark: "#15803d" },
    { light: "#bae6fd", dark: "#0369a1" },
    { light: "#bfdbfe", dark: "#1d4ed8" },
    { light: "#e9d5ff", dark: "#7e22ce" },
  ];

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("documentid", document._id);
    e.stopPropagation();
  }

  const onDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types[0] === "documentid" && rootRef.current) {
      const offsets = rootRef.current.getBoundingClientRect();
      const relativePosition = e.clientY - offsets.top;

      if (relativePosition < offsets.height / 2) {
        onDragChange?.("before");
      } else {
        onDragChange?.("after");
      }
      
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const onDragLeave = () => {
    onDragChange?.("none");
  }

  const checks = (() => {
    if (document.content === undefined) return undefined;

    const all = JSON.parse(document.content)
      .filter((n: {type: string}) => n.type === "checkbox");
    if (all.length === 0) return undefined;
    
    const completed = all
      .filter((n: {props: { checked: boolean }}) => n.props.checked === true);

    return `${completed.length}/${all.length}`;
  })();

  return (
    <div
      ref={rootRef}
      className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex flex-col"
      draggable={editable}
      onDragStart={onDragStart}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      style={{
        backgroundColor: resolvedTheme === "dark" ? color?.dark : color?.light,
        outlineStyle: priority && "solid",
        outlineColor: priority && priorityColors[priority - 1],
      }}
    >
      <div className="flex justify-between">
        <div className="m-2 flex">
          <BoardDocumentTitle
            document={document}
            preview={!editable}
          />
          <div className="text-foreground">
            {document.title}
          </div>
        </div>
        <div className={cn(
          "m-2",
          !editable && "hidden"
        )}>
          <Popover>
            <PopoverTrigger asChild>
              <div role="button">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground"/>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-48"
              side="bottom"
            >
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="w-full flex justify-start"
                  onClick={() => onRemoveDocument(document._id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              <div className="p-1 flex justify-around">
                <SquareSlash
                  className="h-4 w-4"
                  role="button"
                  onClick={() => onDocumentSetAttribute(document._id, {color: undefined})}
                />
                {colors.map(c => (
                  <div
                    key={c.light}
                    role="button"
                    className={cn(
                      "h-4 w-4 rounded-sm",
                      color?.light === c.light && "border-2 border-neutral-500 dark:border-neutral-400"
                    )}
                    style={{
                      backgroundColor: resolvedTheme === "dark" ? c.dark : c.light
                    }}
                    onClick={() => onDocumentSetAttribute(document._id, {color: c})}
                  />
                ))}
              </div>
              <div className="p-1 flex">
                {priorityColors.map((c, i) => (
                  <div
                    key={c}
                    title={`priority: ${i + 1}`}
                  >
                    <Flag 
                      className="w-5 h-5 p-0.5"
                      color={c}
                      strokeWidth={(priority === i + 1) ? 4 : 2.5}
                      role="button"
                      onClick={() => onDocumentSetAttribute(document._id, {priority: i + 1})}
                    />
                  </div>
                ))
                }
                <Flag 
                  className="w-5 h-5 p-0.5"
                  strokeWidth={2.5}
                  role="button"
                  onClick={() => onDocumentSetAttribute(document._id, {priority: undefined})}
                />
              </div>
              <div className="p-1 flex items-center">
                <ListChecks className="w-4 h-4 mr-2"/>
                <input
                  className="w-full h-full text-sm p-1 bg-neutral-100 dark:bg-neutral-900"
                  value={memo}
                  onChange={e => onDocumentSetAttribute(document._id, {memo: e.target.value})}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="mx-1 text-xs text-muted-foreground overflow-hidden flex items-center space-x-4">
        {checks && (
          <div className="flex">
            <CheckSquare className="w-4 h-4 mr-2" strokeWidth={1.5} />
            {checks}
          </div>
        )}
        {memo && (
          <div className="flex">
            <ListChecks className="w-4 h-4 mr-2" />
            <div className="text-nowrap overflow-hidden text-ellipsis max-w-16">
              {memo}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
