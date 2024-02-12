import Link from "next/link";
import { File } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

export const BoardDocumentTitle = ({
  document,
  preview
}: {
  document: Doc<"documents">,
  preview?: boolean
}) => {
  if (!preview) {
    return (
      <Link href={`/documents/${document._id}`}>
          {document.icon ? (
            <p className="mr-2 text-[18px]">{document.icon}</p>
          ) : (
            <File className="mr-2 h-4 w-4" />
          )}
      </Link>
    );
  }

  if (document.isPublished) {
    return (
      <Link href={`/publish/${document._id}`}>
          {document.icon ? (
            <p className="mr-2 text-[18px]">{document.icon}</p>
          ) : (
            <File className="mr-2 h-4 w-4" />
          )}
      </Link>
    );
  }

  return (
    <div>
        {document.icon ? (
          <p className="mr-2 text-[18px]">{document.icon}</p>
        ) : (
          <File className="mr-2 h-4 w-4" />
        )}
    </div>
  );
}
