"use client";

import styles from "./Calendar.module.scss";

import { format, getMonth, isSaturday, isSunday, set } from "date-fns";
import { MinusCircle, PlusCircle } from "lucide-react";
import { CalendarDocumentElement } from "@/types/calendar";
import { ElementRef, useRef, useState } from "react";
import { CalendarDocumentProps } from "@/hooks/use-calendar-document";
import TextareaAutoSize from "react-textarea-autosize";
import { Id } from "@/convex/_generated/dataModel";

export const CalendarDay = ({
  day: v,
  today: currentDate,
  index,
  onMouseEnter,
  onMouseLeave,
  highlighted,
  addDocument,
  initialContent,
  content,
  editor,
}: {
  day: Date;
  today: Date;
  index: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  highlighted?: boolean;
  addDocument: () => void;
  initialContent?: string;
  content?: CalendarDocumentElement[];
  editor: CalendarDocumentProps;
}) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  let style;
  const validation = getMonth(currentDate) === getMonth(v);
  const today = format(new Date(), "yyyyMMdd") === format(v, "yyyyMMdd");
  const [newValue, newSetValue] = useState<string>("");

  const { onRenameElement, onDeleteElement } = editor;

  const onInput = (id: string, value: string) => {
    onRenameElement(id, value);
  };

  const documentclick = (calendarId: string, calendarName: string) => {
    newSetValue(calendarName);
    if (newValue) {
      content?.map((v) => {
        if (calendarId === v._id) {
          onInput(v._id, calendarName);
        }
      });
    }
  };

  const documentDeleteclick = (calendarDocId: string) => {
    content?.map((v) => {
      if (calendarDocId === v._id) {
        onDeleteElement(calendarDocId);
      }
    });
  };

  if (validation && isSaturday(v)) {
    style = {
      color: "blue",
    };
  } else if (validation && isSunday(v)) {
    style = {
      color: "red",
    };
  }

  return (
    <div
      className={validation ? styles.currentMonth : styles.diffMonth}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.topLine}>
        <span className={styles.day}>{format(v, "d")}</span>
        {today && <span className={styles.today}>(오늘)</span>}
        {highlighted && (
          <div className="flex flex-row justify-end">
            <PlusCircle
              className="w-4 h-4 cursor-pointer"
              onClick={addDocument}
            />
          </div>
        )}
      </div>
      {content &&
        content.map(
          (v) =>
            index === v.calendarIndex && (
              <div
                key={v._id}
                className="w-80% h-6 hover:bg-gray-400 border-blue-500 border-1 bg-[#DDE5FF] rounded-md flex flex-row justify-center items-center mt-2 mx-5"
              >
                <TextareaAutoSize
                  ref={inputRef}
                  value={v.name}
                  className="w-full h-full bg-[#DDE5FF] text-center rounded-md"
                  onChange={(e) => documentclick(v._id, e.target.value)}
                >
                  {v.name}
                </TextareaAutoSize>
                <MinusCircle
                  className="cursor-pointer"
                  onClick={() => documentDeleteclick(v._id)}
                />
              </div>
            )
        )}
    </div>
  );
};
