"use client";

import React, { ElementRef, useRef, useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { KanbanBoardProps } from "@/hooks/use-kanban-board";
import TextareaAutoSize from "react-textarea-autosize";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Plus, Search, Settings, Trash } from "lucide-react";
import { BoardDocument } from "./board-document";
import { Input } from "../ui/input";
import { KanbanBoardDocument, KanbanBoardElement } from "@/components/KanbanBoard/kanbanboard.types";
import { useTheme } from "next-themes";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
}: {
  editor: KanbanBoardProps,
  element: KanbanBoardElement,
  editable?: boolean,
  documents?: Doc<"documents">[] | undefined,
  onDragChange?: (status: ("before" | "after" | "none")) => void,
}) => {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef<ElementRef<"div">>(null);
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const create = useMutation(api.documents.create);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [dragSelected, setDragSelected] = useState<number | undefined>(undefined);

  const filteredDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase());
  })

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
              <div className="p-1 flex justify-around">
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
                    onClick={() => onElementSetAttribute(_id, { color: c })}
                  />
                ))}
              </div>
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
              <div className="p-1">
                <Button
                  variant="ghost"
                  className="flex p-2 w-full justify-start"
                  onClick={appendNewDocument}
                >
                  <Plus className="w-5 h-5 mr-2 text-muted-foreground"/>
                  Add a page
                </Button>
              </div>
              <div className="flex items-center gap-x-1 px-2">
                <Search className="h-4 w-4" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
                  placeholder="Filter by title..."
                />
              </div>
              <div className="m-2">
                <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
                  No documents found.
                </p>
                {filteredDocuments?.map((document) => (
                  <div
                    key={document._id}
                  >
                    <Button
                      variant="ghost"
                      className="flex w-full justify-start text-sm rounded-sm text-nowrap text-ellipsis overflow-hidden"
                      onClick={() => onAddDocument(_id, document._id)}
                    >
                    {document.icon && (
                      <div className="shrink-0 mr-2 text-[18px]">{document.icon}</div>
                    )}
                    {document.title}
                    </Button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-col min-h-64">
        {contentDocuments.length > 0 ? contentDocuments.map((document, i) => (
          <React.Fragment
            key={document.board._id}
          >
            <div 
              className={cn(
                "h-2 w-full rounded-md",
                dragSelected === i && "bg-blue-400/75"
              )}
              onDragOver={(e) => onDocumentIndexDragOver(e, i)}
            />
            <BoardDocument
              boardDocument={document.board}
              _id={_id}
              document={document.doc}
              editable={editable}
              editor={editor}
              onDragChange={(status) => onDocumentDragOver(status, i)}
            />
          </React.Fragment>
        )) : (
          <div className="flex flex-col items-center justify-center w-full text-muted-foreground">
            No documents.
          </div>
        )}
        <div 
          className={cn(
            "h-2 w-full rounded-md",
            dragSelected === contentDocuments.length && "bg-blue-400/75",
            contentDocuments.length === 0 && "hidden",
          )}
          onDragOver={(e) => onDocumentIndexDragOver(e, contentDocuments.length)}
        />
      </div>
    </div>
  )
}
