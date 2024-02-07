"use client";

import { useTheme } from "next-themes";
import { defaultBlockSpecs } from "@blocknote/core";
import {
  BlockNoteView,
  getDefaultReactSlashMenuItems,
  useBlockNote,
} from "@blocknote/react";
import "@blocknote/core/style.css";

import { useEdgeStore } from "@/lib/edgestore";
import { CheckBoxBlockSpec, insertCheckBoxBlock } from "@/blocks/checkbox";
import { chartBlock, insertChartBlock } from "./blocks/chart";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({
      file,
    });

    return response.url;
  };

  const editor = useBlockNote({
    editable,
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    uploadFile: handleUpload,

    blockSpecs: {
      ...defaultBlockSpecs,
      checkboxListItem: CheckBoxBlockSpec,
      chart: chartBlock,
    },
    slashMenuItems: [
      ...getDefaultReactSlashMenuItems(),
      insertCheckBoxBlock,
      insertChartBlock,
    ],
  });

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
};

export default Editor;
