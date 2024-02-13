"use client";

import { useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export const SearchOrCreateDocumentCommand = ({
  documents,

  createNewDocument,
  selectDocument,
}: {
  documents: Doc<"documents">[] | undefined,

  createNewDocument: () => void,
  selectDocument: (id: Id<"documents">) => void,
}) => {
  const [search, setSearch] = useState("");
  const filteredDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLowerCase());
  });

  return (<>
    <div className="p-1">
      <Button
        variant="ghost"
        className="flex p-2 w-full justify-start"
        onClick={() => createNewDocument()}
      >
        <Plus className="w-5 h-5 mr-2 text-muted-foreground"/>
        Add a page
      </Button>
    </div>
    <div className="flex items-center gap-x-1 px-2">
      <Search className="h-4 w-4" />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
        placeholder="Filter by title..."
      />
    </div>
    <div className="m-2">
      <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
        No documents found.
      </p>
      {filteredDocuments?.map((document) => (
        <div
          key={document._id}
        >
          <Button
            variant="ghost"
            className="flex w-full justify-start text-sm rounded-sm text-nowrap text-ellipsis overflow-hidden"
            onClick={() => selectDocument(document._id)}
          >
          {document.icon && (
            <div className="shrink-0 mr-2 text-[18px]">{document.icon}</div>
          )}
          {document.title}
          </Button>
        </div>
      ))}
    </div>
  </>)
}