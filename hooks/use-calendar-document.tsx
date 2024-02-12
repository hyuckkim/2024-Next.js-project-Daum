import { Id } from "@/convex/_generated/dataModel";
import { Calendar, generateId, newCalendarDocument } from "@/types/calendar";
import { useEffect, useState } from "react";

export interface CalendarDocumentProps {
  onNewElement: () => void;
  content: Calendar | undefined;

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

  const onNewElement = () => {
    if (!content) return;
    setContent([
      ...content,
      {
        _id: generateId(),
        name: "untitled",
        content: [],
      },
    ]);
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
