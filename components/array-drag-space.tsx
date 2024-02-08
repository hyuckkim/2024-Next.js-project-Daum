"use client";

import { cn } from "@/lib/utils";

export const ArrayDragSpace = ({
  children,
  index,
  direction,
  onDragToIndex,
  onDragToLast,
} : {
  children: JSX.Element[] | undefined,
  index: number,
  direction: "x" | "y",
  onDragToIndex?: (event: React.DragEvent<HTMLDivElement>, index: number) => void,
  onDragToLast?: (event: React.DragEvent<HTMLDivElement>) => void,
}) => {
  const Space = ({
    onDragOver, 
    enabled
  } : { 
    onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void,
    enabled?: boolean
  }) => (
    <div 
      className={cn(
        "rounded-md shrink-0",
        enabled && "bg-blue-400/75",
        direction === "x" ? "w-2" : "h-2"
      )}
      onDragOver={onDragOver}
    />
  );

  if (!children) return null;

  return (<>
    {children.map((v, i) => (<>
        <Space onDragOver={(e) => onDragToIndex?.(e, i)} enabled={index === i} />
        {v}
    </>)
    )}
    <Space onDragOver={(e) => onDragToLast?.(e)} enabled={index === children.length} />
  </>)
};