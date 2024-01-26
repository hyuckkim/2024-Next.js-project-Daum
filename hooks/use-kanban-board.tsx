import { Id } from "@/convex/_generated/dataModel";
import { KanbanBoard, generateId, newKanbanBoard } from "@/types/kanbanboard"
import { useEffect, useState } from "react"

export interface KanbanBoardProps {
  content: KanbanBoard | undefined;
  onNewElement: () => void;
  onRemoveElement: (id: string) => void;
  onRenameElement: (id: string, name: string) => void;
  onMoveElement: (id: string, index: number) => void;
  onElementSetColor: (id: string, color: {light: string, dark: string}) => void;

  onAddDocument: (id: string, document: Id<"documents">) => void;
  onMoveDocument: (id: string, document: Id<"documents">, index: number) => void,
  onRemoveDocument: (document: Id<"documents">) => void;
  onDocumentSetColor: (Document: Id<"documents">, color: {light: string, dark: string} | undefined) => void;
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
    if (!content) {
      setContent(newKanbanBoard());
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

  const onElementSetColor = (id: string, color: {light: string, dark: string}) => {
    if (!content) return;

    setContent(
      content.map(a => a._id === id ? {...a, color} : a)
    );
  };

  const onAddDocument = (id: string, document: Id<"documents">) => {
    if (!content) return;

    const doc = getDocument(content, document);
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

    const doc = getDocument(content, document);
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

    const doc = getDocument(content, document);
    if (!doc) return;

    setContent(prev =>
      prev?.map(a => a.content.includes(doc) ? {...a, content: a.content.filter( b => b !== doc )} : a)
    )
  };

  const onDocumentSetColor = (document: Id<"documents">, color: {light: string, dark: string} | undefined) => {
    if (!content) return;

    const doc = getDocument(content, document);
    if (!doc) return;

    setContent(prev =>
      prev?.map(a => a.content.includes(doc) ? {...a, content: a.content.map( b => b === doc ? { ...b, color } : b)} : a)
    );
  };

  return {
    content,
    onNewElement,
    onRemoveElement,
    onRenameElement,
    onMoveElement,
    onElementSetColor,

    onAddDocument,
    onMoveDocument,
    onRemoveDocument,
    onDocumentSetColor,
  };
}

const getDocument = (content: KanbanBoard, document: Id<"documents">) => {
  for (let e of content) {
    for (let d of e.content) {
      if (d._id === document) {
        return d;
      }
    }
  }
  return undefined;
}
