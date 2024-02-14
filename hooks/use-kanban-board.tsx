import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";
import {
  KanbanBoard,
  KanbanBoardDocument,
  KanbanBoardElement,
  generateId,
  newKanbanBoard
} from "@/components/KanbanBoard/kanbanboard.types";

export interface KanbanBoardProps {
  content: KanbanBoard | undefined;
  onNewElement: () => void;
  onRemoveElement: (id: string) => void;
  onRenameElement: (id: string, name: string) => void;
  onMoveElement: (id: string, index: number) => void;
  onElementSetAttribute: (id: string, attributes: Partial<KanbanBoardElement>) => void;

  onAddDocument: (id: string, document: Id<"documents">) => void;
  onMoveDocument: (id: string, document: Id<"documents">, index: number) => void,
  onRemoveDocument: (document: Id<"documents">) => void;
  onDocumentSetAttribute: (Document: Id<"documents">, attributes: Partial<KanbanBoardDocument>) => void;
}

export const useKanbanBoard = ({
  initialContent,
  onBoardChanged
}: {
  initialContent?: KanbanBoard | undefined
  onBoardChanged: (value: KanbanBoard) => void
}): KanbanBoardProps => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (!!content) {
      onBoardChanged(content);
    }
  }, [content, onBoardChanged]);

  const onNewElement = () => {
    const oldContent = content ?? createNewKanbanBoard();

    setContent([
      ...oldContent,
      {
        _id: generateId(),
        name: "untitled",
        content: []
      }
    ]);
  };

  const onRemoveElement = (id: string) => {
    setContent(
      content?.filter(a => a._id !== id)
    );
  };

  const onRenameElement = (id: string, name: string) => {
    setContent(
      content?.map(a => a._id === id ? {...a, name} : a)
    );
  };

  const onMoveElement = (id: string, index: number) => {
    if (!content) return;

    const element = content.filter(a => a._id === id)[0];
    const elementIndex = content.indexOf(element);

    if (index > elementIndex) index--;

    const newContent = content.filter(a => a._id !== id);

    setContent([
      ...newContent.slice(0, index),
      element,
      ...newContent.slice(index)
    ]);
  };

  const onElementSetAttribute = (id: string, attributes: {}) => {
    if (!content) return;

    setContent(
      content.map(a => a._id === id ? {...a, ...attributes} : a)
    );
  };

  const onAddDocument = (id: string, document: Id<"documents">) => {
    if (!content) return;

    const doc = getDocument(document);
    if (!doc) {
      setContent(
        content.map(a => a._id === id ? {...a, content: [...a.content, { _id: document}]} : a)
      );
    }
    else {
      const newContent = content.map(a => a.content.includes(doc) ? { ...a, content: a.content.filter( b => b !== doc )} : a);
      setContent(
        newContent.map(a => a._id === id ? {...a, content: [...a.content, doc]} : a)
      );
    }
  };

  const onMoveDocument = (id: string, document: Id<"documents">, index: number) => {
    if (!content) return;

    const doc = getDocument(document);
    if (!doc) return;

    const docIndex = content.filter(a => a.content.includes(doc))[0].content.indexOf(doc);
    if (index > docIndex) index--;

    const newContent = content.map(a => a.content.includes(doc) ? {...a, content: a.content.filter( b => b !== doc )} : a);

    setContent(
      newContent?.map(a => a._id === id ? {...a, content: [
        ...a.content.slice(0, index),
        doc,
        ...a.content.slice(index)
      ]} : a));
  };

  const onRemoveDocument = (document: Id<"documents">) => {
    if (!content) return;

    const doc = getDocument(document);
    if (!doc) return;

    setContent(prev =>
      prev?.map(a => 
        a.content.includes(doc) 
        ? {...a, content: a.content.filter( b => b !== doc )} 
        : a
      )
    )
  };

  const onDocumentSetAttribute = (document: Id<"documents">, attributes: {}) => {
    if (!content) return;

    const doc = getDocument(document);
    if (!doc) return;

    setContent(prev =>
      prev?.map(a => a.content.includes(doc) ? {...a, content: a.content.map( b => b === doc ? { ...b, ...attributes } : b)} : a)
    );
  };

  const getDocument = (document: Id<"documents">) => {
    if (content === undefined) return undefined;

    for (let e of content) {
      for (let d of e.content) {
        if (d._id === document) {
          return d;
        }
      }
    }
    return undefined;
  }
  
  return {
    content,
    onNewElement,
    onRemoveElement,
    onRenameElement,
    onMoveElement,
    onElementSetAttribute,

    onAddDocument,
    onMoveDocument,
    onRemoveDocument,
    onDocumentSetAttribute,
  };
}
