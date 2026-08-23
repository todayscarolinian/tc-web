"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { UserProfile } from "@/src/lib/herald/types"

type AuthorSelectProps = {
  authors: UserProfile[]
  value: string | null
  onChange: (authorId: string) => void
}

export function AuthorSelect({ authors, value, onChange }: AuthorSelectProps) {
  const selected = authors.find((a) => a.id === value)

  return (
    <Combobox items={authors} value={selected?.name ?? ""} onValueChange={(name) => {
        const match = authors.find((a) => a.name === name)
        if (match) onChange(match.id)
      }}>
      <ComboboxInput placeholder="Select an author" />
      <ComboboxContent>
        <ComboboxEmpty>No authors found.</ComboboxEmpty>
        <ComboboxList className="max-h-[170px] overflow-y-auto">
          {(user) => (
            <ComboboxItem key={user.id} value={user.name}>
              {user.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
