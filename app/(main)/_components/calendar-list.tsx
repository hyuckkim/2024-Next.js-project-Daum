"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Item } from "./item";
import { CalendarItem } from "./calendar-item";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

interface CalendarListProps {
  calendarId?: Id<"calendars">;
  level?: number;
  data?: Doc<"calendars">[];
}

export const CalendarList = ({
  calendarId,
  data,
  level,
}: CalendarListProps) => {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onExpand = (calendarId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [calendarId]: !prevExpanded[calendarId],
    }));
  };

  //schema.ts에 정리되어있음
  const calendars = useQuery(api.calendars.getSidebar, {
    newCalendar: calendarId,
  });

  const onRedirect = (calendarId: string) => {
    router.push(`/calendars/${calendarId}`);
  };

  if (calendars === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      {calendars.map((calendar) => (
        <div key={calendar._id}>
          <CalendarItem
            id={calendar._id}
            onClick={() => onRedirect(calendar._id)}
            label={calendar.title}
            calendarIcon={calendar.icon}
            icon={FileIcon}
            active={params.calendarId === calendar._id}
          />
          {expanded[calendar._id] && (
            <CalendarList calendarId={calendar._id} level={level} />
          )}
        </div>
      ))}
    </>
  );
};
