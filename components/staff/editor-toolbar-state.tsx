import type { Editor } from "@tiptap/core";
import type { EditorStateSnapshot } from "@tiptap/react";

export const emptyMenuBarState = {
  isHeading1: false,

  isBold: false,
  canBold: false,

  isItalic: false,
  canItalic: false,

  isUnderline: false,
  canUnderline: false,

  isBulletList: false,
  isBlockquote: false,
  isLink: false,

  canUndo: false,
  canRedo: false,
};

export function EditorToolbarStateSelector(
  ctx: EditorStateSnapshot<Editor | null>,
) {
  if (!ctx.editor) {
    return emptyMenuBarState;
  }

  return {
    // Text formatting
    isBold: ctx.editor.isActive("bold") ?? false,
    canBold: ctx.editor.can().chain().toggleBold().run() ?? false,

    isItalic: ctx.editor.isActive("italic") ?? false,
    canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,

    isUnderline: ctx.editor.isActive("underline") ?? false,
    canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,

    isHeading1: ctx.editor.isActive("heading", { level: 1 }) ?? false,

    isBulletList: ctx.editor.isActive("bulletList") ?? false,
    isBlockquote: ctx.editor.isActive("blockquote") ?? false,
    isLink: ctx.editor.isActive("link") ?? false,

    canUndo: ctx.editor.can().chain().undo().run() ?? false,
    canRedo: ctx.editor.can().chain().redo().run() ?? false,
  };
}

export type EditorToolbarState = ReturnType<typeof EditorToolbarStateSelector>;
