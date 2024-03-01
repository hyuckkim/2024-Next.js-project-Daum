"use client";

import { ElementRef, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { useMutation } from "convex/react";
import TextareaAutoSize from "react-textarea-autosize";

import { IconPicker } from "../icon-picker";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "../ui/button";
import { api } from "@/convex/_generated/api";
import { PublishBoard } from "@/app/(main)/_components/KanbanBoard/board-publish";
import { BoardMiscMenu } from "@/app/(main)/_components/KanbanBoard/board-misc-menu";

interface BoardToolbarProps {
  initialData: Doc<"boards">;
  preview?: boolean;
  calendar?: Doc<"calendars">;
}

export const BoardToolbar = ({ initialData, preview, calendar }: BoardToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);

  const update = useMutation(api.boards.update);
  const removeIcon = useMutation(api.boards.removeIcon);

  const enableInput = () => {
    if (preview) return;

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (value: string) => {
    setValue(value);
    //onInput 함수 발동되고 데이터베이스랑 연결되며 update 시작
    update({
      id: initialData._id,
      title: value || "Untitled",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      //새로고침 방지
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    });
  };

  const onIconRemove = () => {
    removeIcon({
      id: initialData._id,
    });
  };

  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col w-full justify-between group">
        <div className="flex items-center">
          {!!initialData.icon && !preview ? (
            <IconPicker onChange={onIconSelect}>
              <p className="text-6xl hover:opacity-75 transition">
                {initialData.icon}
              </p>
            </IconPicker>
          ) : (
            <p className="text-6xl">{initialData.icon}</p>
          )}
          {isEditing && !preview ? (
            <TextareaAutoSize
              ref={inputRef}
              onBlur={disableInput}
              onKeyDown={onKeyDown}
              value={value}
              onChange={(e) => onInput(e.target.value)}
              className="text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none p-4"
            />
          ) : (
            <div
              onClick={enableInput}
              className="pb-[11.5px] text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] p-4 h-20"
            >
              {initialData.title}
            </div>
          )}
        </div>
        <div className="p-2 opacity-0 group-hover:opacity-100 transition">
          {!initialData.icon && !preview && (
            //image선택하는 창 여는걸 커스텀훅으로 개발
            <IconPicker asChild onChange={onIconSelect}>
              <Button
                className="text-muted-foreground text-xs"
                variant="outline"
                size="sm"
              >
                <Smile className="h-4 w-4 mr-2" />
                Add icon
              </Button>
            </IconPicker>
          )}
          {initialData.icon && !preview && (
            //image선택하는 창 여는걸 커스텀훅으로 개발
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
              onClick={() => onIconRemove()}
            >
              <Smile className="h-4 w-4 mr-2" />
              Remove Icon
            </Button>
          )}
        </div>
      </div>
      {!preview && (
        <div className="flex gap-x-2 m-2">
          <PublishBoard initialData={initialData} />
          <BoardMiscMenu documentId={initialData._id} calendar={calendar}/>
        </div>
      )}
    </div>
  );
};
