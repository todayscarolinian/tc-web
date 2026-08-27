"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import { toast } from "sonner";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { Tag } from "@/src/entities/tag/core/tag.domain";
import { findOrCreateTagAction, getTagsAction } from "@/actions/tag.action";

export function TagInput({
  tags,      
  onChange,  
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const anchor = useComboboxAnchor();
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const selectedTags = useMemo(
    () => allTags.filter((t) => tags.includes(t.slug)),
    [allTags, tags]
  );

  // options shown = filtered by what's typed, capped to first 5 per your spec
  const visibleOptions = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    const filtered = q
      ? allTags.filter((t) => t.name.toLowerCase().includes(q))
      : allTags;
    return filtered.slice(0, 5);
  }, [allTags, inputValue]);

  const exactMatch = allTags.some(
    (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
  );
  const showCreateOption = inputValue.trim().length > 0 && !exactMatch;

  function toggleTag(tag: Tag) {
    const exists = tags.includes(tag.slug);
    onChange(exists ? tags.filter((s) => s !== tag.slug) : [...tags, tag.slug]);
  }

  async function handleCreate() {
    const name = inputValue.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const tag = await findOrCreateTagAction(name);
      setAllTags((prev) =>
        prev.some((t) => t.slug === tag.slug) ? prev : [...prev, tag]
      );
      onChange(tags.includes(tag.slug) ? tags : [...tags, tag.slug]);
      setInputValue("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create tag";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    getTagsAction()
      .then(setAllTags)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Combobox
      multiple
      autoHighlight
      items={visibleOptions}
      value={selectedTags}
      onValueChange={(newSelected: Tag[]) =>
        onChange(newSelected.map((t) => t.slug))  // translate back to slugs on the way out
      }
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <ComboboxChips ref={anchor} className="w-full max-w-xs">
        <ComboboxValue>
          {(values: Tag[]) => (
            <Fragment>
              {values.map((tag) => (
                <ComboboxChip key={tag.slug} className="bg-destructive text-white rounded-full">
                  {tag.name}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>
          {loading ? "Loading tags…" : "No tags found."}
        </ComboboxEmpty>
        <ComboboxList>
          {(item: Tag) => (
            <ComboboxItem key={item.slug} value={item} onClick={() => toggleTag(item)}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
        {showCreateOption && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left text-sm font-medium text-brand hover:bg-brand/10 rounded-sm transition-colors"
          >
            {creating ? "Creating…" : `Create tag "${inputValue.trim()}"`}
          </button>
        )}
      </ComboboxContent>
    </Combobox>
  );
}