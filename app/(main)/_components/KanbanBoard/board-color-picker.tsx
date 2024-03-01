"use client";

import { useTheme } from "next-themes";
import { SquareSlash } from "lucide-react";
import { cn } from "@/lib/utils";


type Color = {light: string, dark: string} | undefined;

export const BoardColorPicker = ({
  colors,
  currentColor,
  onChangeColor,
} : {
  colors: Color[],
  currentColor: Color,
  onChangeColor: (color: Color) => void,
}) => {
  const { resolvedTheme } = useTheme();
  
  const EmptyColor = () => (
    <SquareSlash
      className="h-4 w-4"
      role="button"
      onClick={() => onChangeColor(undefined)}
    />
  );

  console.log(colors.map(c => c));
  return (
    <div className="p-1 flex justify-around">
      {colors.map(c => {
        if (!!c) {
          return (
            <div
            key={c.light}
            role="button"
            className={cn(
              "h-4 w-4 rounded-sm",
              currentColor?.light === c.light && "border-2 border-neutral-500 dark:border-neutral-400"
            )}
            style={{
              backgroundColor: resolvedTheme === "dark" ? c.dark : c.light
            }}
            onClick={() => onChangeColor(c)}
          />
          );
        } else {
          return <EmptyColor key={undefined} />
        }
      })}
    </div>
  )
}