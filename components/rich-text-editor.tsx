"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

function ToolButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
        active && "text-foreground",
      )}
    >
      {label === "Bold" ? <Bold className="size-4" /> : null}
      {label === "Italic" ? <Italic className="size-4" /> : null}
      {label === "Bullet list" ? <List className="size-4" /> : null}
      {label === "Numbered list" ? <ListOrdered className="size-4" /> : null}
    </button>
  );
}

export function RichTextEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string;
}) {
  const [html, setHtml] = useState(defaultValue || "");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
      }),
    ],
    content: defaultValue || "<p></p>",
    immediatelyRender: false,
    onCreate: ({ editor: instance }) => {
      setHtml(instance.getHTML());
    },
    onUpdate: ({ editor: instance }) => {
      setHtml(instance.getHTML());
    },
  });

  return (
    <div className="border border-border bg-surface">
      {editor ? (
        <div className="flex gap-1 border-b border-border px-2 py-1">
          <ToolButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolButton
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
        </div>
      ) : null}
      <EditorContent
        editor={editor}
        className="px-4 py-3 [&_.tiptap]:min-h-40 [&_.tiptap]:bg-transparent [&_.tiptap]:text-sm [&_.tiptap]:outline-none [&_.tiptap_p]:mb-3 [&_.tiptap_ul]:mb-3 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:mb-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5"
      />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
