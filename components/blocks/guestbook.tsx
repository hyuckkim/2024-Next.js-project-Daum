"use client";

import { BlockSchemaWithBlock } from "@blocknote/core";
import { ReactSlashMenuItem, createReactBlockSpec } from "@blocknote/react";
import { Book, BookCopy, BookKey, Trash } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const guestbookBlockSpec = createReactBlockSpec(
  {
    type: "guestbook",
    propSchema: {
      id: {
        default: "",
      }
    },
    content: "none",
  },
  {
    render: ({ block, editor }) => {
      return <Guestbook
        id={block.props.id}
        onIdChanged={(id) => editor.updateBlock(block, {
          type: "guestbook",
          props: { id }
        })}
        preview={!editor.isEditable}
      />
    }
  }
);

const Guestbook = ({
  id,
  onIdChanged,
  preview,
} : {
  id: string,
  onIdChanged: (id: string) => void,
  preview?: boolean,
}) => {
  const book = useQuery(api.guestbooks.get, id === "" ? "skip"
    : {id: id as Id<"guestbooks">});
  const create = useMutation(api.guestbooks.create);
  const addComment = useMutation(api.guestbooks.addComment);
  const removeComment = useMutation(api.guestbooks.removeComment);

  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageTimeout, setErrorMessageTimeout] = useState<NodeJS.Timeout | undefined>(undefined);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");

  const onCreate = () => {
    create().then((book) => {
      onIdChanged?.(book);
    })
  };

  const onPushComment = () => {
    if (!name) {
      clearTimeout(errorMessageTimeout);
      setErrorMessage("nickname is required");
  
      setErrorMessageTimeout(setTimeout(() => {
        setErrorMessage("");
      }, 2000));
    }
    else if (!password) {
      clearTimeout(errorMessageTimeout);
      setErrorMessage("password is required");
  
      setErrorMessageTimeout(setTimeout(() => {
        setErrorMessage("");
      }, 2000));
    }
    else if (!content) {
      clearTimeout(errorMessageTimeout);
      setErrorMessage("comment is required");
  
      setErrorMessageTimeout(setTimeout(() => {
        setErrorMessage("");
      }, 2000));
    } else {
      addComment({
        id: id as Id<"guestbooks">,
        name, password, content
      });
      setName("");
      setPassword("");
      setContent("");
    }

    return () => {
      clearTimeout(errorMessageTimeout);
    }
  };

  const onRemove = (commentId: string, password?: string) => {
    try {
      if (preview) {
        removeComment({ id: id as Id<"guestbooks">, commentId: commentId, password: password });
      } else {
        removeComment({ id: id as Id<"guestbooks">, commentId: commentId });
      }
    } catch {

    }
  }

  if (!book) {
    return (
      <div
        className="flex flex-col w-full h-60 rounded-lg border-2 border-dashed text-muted-foreground border-neutral-200 dark:border-neutral-700 justify-center items-center"
        role="button"
        onClick={onCreate}
      >
        <BookKey className="w-8 h-8 mb-2"/>
        Add guestbook
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full p-4 space-y-4 bg-neutral-100 rounded-lg">
      <div>
        <span className="mr-1">{book.comments.length}</span>
        comments
      </div>
      {book.comments.map((b) => (
        <GuestbookComment
          key={b.id}
          name={b.name}
          content={b.content}
          time={b.time}
          onRemove={(password) => onRemove(b.id, password)}
          preview={preview}
        />
      ))}
      <div className=" flex flex-col space-y-2">
        <div className="flex space-x-2">
          <Input
            placeholder="nickname"
            value={name} onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="password"
            type="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Textarea
          placeholder=""
          value={content} onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end items-center space-x-4">
          <div className={cn(
            "text-muted-foreground transition-opacity",
            errorMessage ? "opacity-100" : "opacity-0"
          )}>
            {errorMessage}
          </div>
          <Button
            variant="outline"
            onClick={onPushComment}
          >
            leave a comment
          </Button>
        </div>
      </div>
    </div>
  )
}

const GuestbookComment = ({
  content,
  name,
  time,

  preview,
  onRemove,
}: {
  content: string,
  name: string,
  time: string,

  preview?: boolean,
  onRemove: (password?: string) => void,
}) => {
  const [pw, setPW] = useState(false);
  const [password, setPassword] = useState("");
  
  const date = new Date(time);

  const onTrashClick = () => {
    if (!!preview && !pw) {
      setPW(true);
    } else if (!!preview) {
      onRemove(password);
    } else {
      onRemove();
    }
  }

  return (
    <div className="flex justify-between items-start">
      <div className="flex flex-col py-2">
        <div className="flex space-x-4">
          <div className="text-foreground">
            {name}
          </div>
          <div className="text-muted-foreground">
            {`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}
          </div>
        </div>
        <div>
          {content}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {pw && (
          <Input className="w-32 h-8" placeholder="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
        )}
        <Trash
          className="w-5 h-5"
          onClick={onTrashClick}
          role="button"
        />
      </div>
    </div>
  );
}

export const insertGuestBookBlock: ReactSlashMenuItem<
  BlockSchemaWithBlock<"guestbook", typeof guestbookBlockSpec.config>
> = {
  name: "guestbook",
  execute: (editor) => {
    editor.updateBlock(
      editor.getTextCursorPosition().block, {
        type: "guestbook",
        props: { id: "" }
      }
    );
  },
  aliases: [
    "guestbook",
  ],
  group: "Work",
  icon: <Book width="14" height="14" />,
  hint: "Guestbook for visitor",
}