"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";

import { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link2,
  Unlink2,
  Quote,
  List,
  Image as ImageIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import Image from "@tiptap/extension-image";

import {
  EditorToolbarStateSelector,
  type EditorToolbarState,
  emptyMenuBarState,
} from "./editor-toolbar-state";

type Config = {
  key: string;
  label: string | null;
  icon: typeof Bold | typeof List | null;
  title: string;
  action: (editor: Editor) => void;
  isActiveKey?: keyof EditorToolbarState;
  canKey?: keyof EditorToolbarState;
};

const setLink = (editor: Editor) => {
  const previousUrl = editor.getAttributes("link").href;
  const url = window.prompt("Set URL", previousUrl ?? "");

  if (url === null) {
    return;
  }

  if (url === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
};

const handleImageUpload = (editor: Editor) => {
  const input = document.createElement("input");

  input.type = "file";
  input.accept = "image/*";

  input.onchange = () => {
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const src = URL.createObjectURL(file);

    editor.chain().focus().setImage({ src }).run();
  };

  input.click();
};

const TOGGLES: Config[] = [
  {
    key: "h",
    label: "H",
    icon: null,
    title: "Heading",
    action: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
    isActiveKey: "isHeading1",
  },
  {
    key: "b",
    label: null,
    icon: Bold,
    title: "Bold",
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActiveKey: "isBold",
    canKey: "canBold",
  },
  {
    key: "i",
    label: null,
    icon: Italic,
    title: "Italic",
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActiveKey: "isItalic",
    canKey: "canItalic",
  },
  {
    key: "u",
    label: null,
    icon: Underline,
    title: "Underline",
    action: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActiveKey: "isUnderline",
    canKey: "canUnderline",
  },
];

const ACTIONS: Config[] = [
  {
    key: "link",
    label: null,
    icon: Link2,
    title: "Link",
    action: (editor) => setLink(editor),
    isActiveKey: "isLink",
  },
  {
    key: "quote",
    label: null,
    icon: Quote,
    title: "Quote",
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActiveKey: "isBlockquote",
  },
  {
    key: "list",
    label: null,
    icon: List,
    title: "List",
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActiveKey: "isBulletList",
  },
  {
    key: "image",
    label: null,
    icon: ImageIcon,
    title: "Insert image",
    action: (editor) => handleImageUpload(editor),
  },
];

const MISC: Config[] = [
  {
    key: "undo",
    label: null,
    icon: Undo2,
    title: "Undo",
    action: (editor) => editor.chain().focus().undo().run(),
    canKey: "canUndo",
  },
  {
    key: "redo",
    label: null,
    icon: Redo2,
    title: "Redo",
    action: (editor) => editor.chain().focus().redo().run(),
    canKey: "canRedo",
  },
];

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const editorState =
    useEditorState({
      editor,
      selector: EditorToolbarStateSelector,
    }) ?? emptyMenuBarState;

  if (!editor) {
    return null;
  }

  return (
    <div className="sticky top-0 z-1 mb-6 flex items-center gap-0.5 rounded-sm bg-card p-1.5 ring-1 ring-border">
      {TOGGLES.map((t) => {
        const isActive = t.isActiveKey ? editorState[t.isActiveKey] : false;

        const isDisabled = t.canKey ? !editorState[t.canKey] : false;

        return (
          <button
            key={t.key}
            type="button"
            title={t.title}
            aria-pressed={isActive}
            disabled={isDisabled}
            onClick={() => t.action(editor)}
            className={cn(
              "flex size-8 items-center justify-center rounded-xs text-text-secondary hover:bg-muted hover:text-foreground",
              isActive && "bg-foreground text-background",
              isDisabled &&
                "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-text-secondary",
            )}
          >
            {t.icon ? (
              <t.icon size={16} />
            ) : (
              <span className="font-display text-sm font-extrabold">
                {t.label}
              </span>
            )}
          </button>
        );
      })}
      <span className="mx-1.5 h-5 w-px bg-border" />

      {ACTIONS.map((a) => {
        const isActive = a.isActiveKey ? editorState[a.isActiveKey] : false;

        const isDisabled = a.canKey ? !editorState[a.canKey] : false;

        return (
          <button
            key={a.key}
            type="button"
            title={a.title}
            aria-pressed={isActive}
            disabled={isDisabled}
            onClick={() => a.action(editor)}
            className={cn(
              "flex size-8 items-center justify-center rounded-xs text-text-secondary hover:bg-muted hover:text-foreground",
              isActive && "bg-foreground text-background",
              isDisabled &&
                "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-text-secondary",
            )}
          >
            {a.icon ? (
              <a.icon size={16} />
            ) : (
              <span className="font-display text-sm font-extrabold">
                {a.label}
              </span>
            )}
          </button>
        );
      })}

      <span className="mx-1.5 h-5 w-px bg-border" />
      {MISC.map((m) => {
        const isDisabled = m.canKey ? !editorState[m.canKey] : false;

        return (
          <button
            key={m.key}
            type="button"
            title={m.title}
            disabled={isDisabled}
            onClick={() => m.action(editor)}
            className={cn(
              "flex size-8 items-center justify-center rounded-xs text-text-secondary hover:bg-muted hover:text-foreground",
              isDisabled &&
                "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-text-secondary",
            )}
          >
            {m.icon && <m.icon size={15} />}
          </button>
        );
      })}
    </div>
  );
}
