"use client";

import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toolbar } from "@/components/toolbar";
import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import MakeCalendar from "@/components/make-calendar";
import { usePathname } from "next/navigation";

interface CalendarIdPageProps {
  params: {
    calendarId: Id<"calendars">;
  };
}

const CalendarIdPage = ({ params }: CalendarIdPageProps) => {
  const update = useMutation(api.calendars.update);

  const onUpdate = (content: string) => {
    update({
      id: params.calendarId,
      content,
    });
  };

  const pathname = usePathname();
  const finalUrl = pathname.split("/");
  const resultUrl = finalUrl[finalUrl.length - 1];
  //인자로 calendar.id 넘김 -> Query로 작성한 getById 호출
  const calendar = useQuery(api.calendars.getById, {
    calendarId: params.calendarId,
  });

  if (calendar === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (calendar === null) {
    return <div>Not found</div>;
  }

  return (
    <MakeCalendar
      initialContent={calendar.content}
      calendarId={calendar._id}
      editable={true}
      onChange={onUpdate}
    />
  );
};

export default CalendarIdPage;
