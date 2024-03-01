"use client";

import React, { ElementRef, useRef, useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { KanbanBoardProps } from "@/hooks/use-kanban-board";
import TextareaAutoSize from "react-textarea-autosize";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { useMutation } from "convex/react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Trash } from "lucide-react";
import { BoardDocument } from "@/components/KanbanBoard/board-document";
import { KanbanBoardDocument, KanbanBoardElement } from "@/components/KanbanBoard/kanbanboard.types";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { SearchOrCreateDocumentCommand } from "@/app/(main)/_components/KanbanBoard/search-or-create-document-command";
import { ArrayDragSpace } from "../array-drag-space";
import { BoardColorPicker } from "@/app/(main)/_components/KanbanBoard/board-color-picker";

export const BoardElement = ({
  editor,
  element: {
    name,
    _id,
    content,
    color
  },
  editable,
  documents,
  onDragChange,
  calendarData,
}: {
  editor: KanbanBoardProps,
  element: KanbanBoardElement,
  editable?: boolean,
  documents?: Doc<"documents">[] | undefined,
  onDragChange?: (status: ("before" | "after" | "none")) => void,
  calendarData?: {[document: Id<"documents">]: Date},
}) => {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef<ElementRef<"div">>(null);
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const create = useMutation(api.documents.create);
  const router = useRouter();

  const [dragSelected, setDragSelected] = useState<number | undefined>(undefined);

  const contentDocuments = content.map(c =>
    documents !== undefined ? { board: c, doc: documents.filter(d => d._id === c._id)[0]} : undefined
  ).filter((c): c is { board: KanbanBoardDocument, doc:  Doc<"documents">} => !!c);

  const {
    onRenameElement,
    onRemoveElement,
    onElementSetAttribute,

    onAddDocument,
    onMoveDocument: onAddDocumentIndex,
  } = editor;

  const colors = [
    { light: "#f5f5f5", dark: "#262626"},
    { light: "#fee2e2", dark: "#7f1d1d"},
    { light: "#ffedd5", dark: "#7c2d12"},
    { light: "#fef9c3", dark: "#713f12"},
    { light: "#dcfce7", dark: "#14532d"},
    { light: "#e0f2fe", dark: "#0c4a6e"},
    { light: "#dbeafe", dark: "#1e3a8a"},
    { light: "#f3e8ff", dark: "#581c87"},
  ];

  const enableInput = () => {
    if (!editable) return;

    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }


  const disableInput = () => setIsEditing(false);

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  }

  const onInput = (id: string, value: string) => {
    onRenameElement(id, value);
  }

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("elementid", _id);
    e.stopPropagation();
  }

  const onDocumentDragOver = (
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

  const onDocumentIndexDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    if (e.dataTransfer.types[0] === "documentid") {
      e.preventDefault();
      e.stopPropagation();

      setDragSelected(index);
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types[0] === "documentid") {
      e.preventDefault();
      setDragSelected(undefined);
    }
    if (e.dataTransfer.types[0] === "elementid" && rootRef.current) {
      const offsets = rootRef.current.getBoundingClientRect();
      const relativePosition = e.clientX - offsets.left;
      
      if (relativePosition < offsets.width / 2) {
        onDragChange?.("before");
      } else {
        onDragChange?.("after");
      }
      
      e.preventDefault();
    }
  }

  const onDragLeave = () => {
    onDragChange?.("none");
  }

  const onDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.types[0] === "documentid") {
      const documentId = e.dataTransfer.getData("documentid") as Id<"documents">;
      onAddDocumentIndex(_id, documentId, dragSelected ?? contentDocuments.length);

      setDragSelected(undefined);
      e.stopPropagation();
    }
  }

  const appendNewDocument = () => {
    const promise = create({ title: "Untitled" }).then((documentId) => {
      onAddDocument(_id, documentId as Id<"documents">);
      router.push(`/documents/${documentId}`);
    });

    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  }

  return (
    <div
      ref={rootRef}
      className="flex flex-col h-min w-64 min-w-48 p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 shrink-[0.5]"
      style={!!color ? {
          backgroundColor: resolvedTheme === "dark" ? color.dark : color.light
        }
      : {}
      }
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}

      draggable={editable}
      onDragStart={onDragStart}
    >
      <div className="mb-8 flex justify-between items-center">
        { isEditing && editable ? (
          <TextareaAutoSize
            ref={inputRef}
            onBlur={() => { disableInput(); }}
            onKeyDown={(e) => { onKeyDown(e); }}
            value={name}
            onChange={(e) => onInput(_id, e.target.value)}
            className="text-xl text-nowrap resize-none overflow-hidden"
            maxRows={1}
          />
        ) : (
          <div
            onClick={() => enableInput()}
            className="text-xl text-nowrap text-ellipsis overflow-hidden"
          >
            {name}
          </div>
        )}

        <div className={cn(
          "hidden",
          editable && "flex",
        )}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size='sm'
                variant="ghost"
                className="hover:bg-neutral-200 dark:hover:bg-neutral-600 flex-1"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-48"
              side="bottom"
            >
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="w-full flex justify-start"
                  onClick={() => onRemoveElement(_id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
              <BoardColorPicker
                colors={colors}
                currentColor={color}
                onChangeColor={(c) => onElementSetAttribute(_id, { color: c})}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size='sm'
                variant="ghost"
                className="hover:bg-neutral-200 dark:hover:bg-neutral-600 flex-1"
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-48"
              side="bottom"
            >
              <SearchOrCreateDocumentCommand
                documents={documents}
                createNewDocument={() => appendNewDocument()}
                selectDocument={id => onAddDocument(_id, id)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col min-h-64">
        {contentDocuments.length > 0 ? (
          <ArrayDragSpace
          index={dragSelected ?? -1}
          direction="y"
          onDragToIndex={(e, i) => onDocumentIndexDragOver(e, i)}
          onDragToLast={(e) => onDocumentIndexDragOver(e, contentDocuments.length)}
        >
          {contentDocuments.map((document, i) => (
            <BoardDocument
              key={document.board._id}
              boardDocument={document.board}
              document={document.doc}
              editable={editable}
              editor={editor}
              onDragChange={(status) => onDocumentDragOver(status, i)}
              date={calendarData?.[document.board._id]}
            />
          ))}
        </ArrayDragSpace>
        ) : (
          <div className="flex flex-col items-center justify-center w-full text-muted-foreground">
            No documents.
          </div>
        )}
      </div>
    </div>
  )
}
