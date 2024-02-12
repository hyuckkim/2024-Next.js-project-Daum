"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { Item } from "./item";
import { CalendarIcon } from "lucide-react";
import { CalendarItem } from "./calendar-item";

export const CalendarList = () => {
  const params = useParams();
  const router = useRouter();
  const calendars = useQuery(api.calendars.getSidebar, {});

  const onRedirect = (calendarId: string) => {
    router.push(`/calendars/${calendarId}`);
  };

  if (calendars === undefined) {
    return (
      <>
        <CalendarItem.Skeleton />
        <CalendarItem.Skeleton />
        <CalendarItem.Skeleton />
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
            icon={CalendarIcon}
            calendarIcon={calendar.icon}
            active={params.calendarId === calendar._id}
          />
        </div>
      ))}
    </>
  );
};
