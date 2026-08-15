import { generateText } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";

const extensions = [StarterKit, TextStyleKit, Image];

export function extractPlainText(content: JSONContent): string {
  return generateText(content, extensions);
}
