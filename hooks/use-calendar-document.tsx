import { Id } from "@/convex/_generated/dataModel";
import { Calendar, generateId, newCalendarDocument } from "@/types/calendar";
import { useEffect, useState } from "react";

export interface CalendarDocumentProps {
  onNewElement: (calendarId: number, calendarMonth: number) => void;
  onDeleteElement: (calendarDocId: string) => void;
  content: Calendar | undefined;
  onRenameElement: (id: string, name: string) => void;
  onAddDocument: (id: string, calendar: Id<"calendars">) => void;
}

export const useCalendarDocument = ({
  initialContent,
  onBoardChanged,
}: {
  initialContent?: Calendar | undefined;
  onBoardChanged: (value: Calendar) => void;
}): CalendarDocumentProps => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (!content) {
      setContent(newCalendarDocument());
    }
  }, [content]);

  useEffect(() => {
    if (!!content) {
      onBoardChanged(content);
    }
  }, [content, onBoardChanged]);

  const onNewElement = (calendarId: number, calendarMonth: number) => {
    if (!content) return;
    if (calendarId) {
      setContent([
        ...content,
        {
          _id: generateId(),
          name: "untitled",
          content: [],
          calendarIndex: calendarId,
          calendarMonth: calendarMonth,
        },
      ]);
    }
  };

  const onDeleteElement = (calendarDocId: string) => {
    setContent(content?.filter((a) => a._id !== calendarDocId));
  };

  const onRenameElement = (id: string, name: string) => {
    setContent(content?.map((a) => (a._id === id ? { ...a, name } : a)));
  };

  const onAddDocument = (id: string, calendar: Id<"calendars">) => {
    if (!content) return;

    const doc = getDocument(content, calendar);
    if (!doc) {
      setContent(
        content.map((a) =>
          a._id === id
            ? { ...a, content: [...a.content, { _id: calendar }] }
            : a
        )
      );
    } else {
      const newContent = content.map((a) =>
        a.content.includes(doc)
          ? { ...a, content: a.content.filter((b) => b !== doc) }
          : a
      );
      setContent(
        newContent.map((a) =>
          a._id === id ? { ...a, content: [...a.content, doc] } : a
        )
      );
    }
  };

  return {
    content,
    onAddDocument,
    onNewElement,
    onRenameElement,
    onDeleteElement,
  };
};

const getDocument = (content: Calendar, calendar: Id<"calendars">) => {
  for (let e of content) {
    for (let d of e.content) {
      if (d._id === calendar) {
        return d;
      }
    }
  }
  return undefined;
};
