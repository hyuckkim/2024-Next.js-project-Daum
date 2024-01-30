import { Id } from "@/convex/_generated/dataModel"

export type KanbanBoard = KanbanBoardElement[];

export type KanbanBoardElement = {
  _id: string,
  name: string,
  content: KanbanBoardDocument[],

  color?: { light: string, dark: string },
};

export type KanbanBoardDocument = {
  _id: Id<"documents">,

  color?: { light: string, dark: string },
  priority?: 1 | 2 | 3,
};


export const newKanbanBoard = (
  ...names: string[]
):
KanbanBoard => {
  return names.map(v => {
    return {
      _id: generateId(),
      name: v,
      content: []
    }
  });
}

export function generateId() {
  var S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (`${S4()}${S4()}${S4()}${S4()}`);
}
