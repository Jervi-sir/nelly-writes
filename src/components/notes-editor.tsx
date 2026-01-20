"use client"

import { useEffect, useState } from "react"
import type { SerializedEditorState } from "lexical"
import { Editor } from "@/components/blocks/editor-00/editor"
import { Button } from "./ui/button"

interface NotesEditorProps {
  initialNotes: string | null | undefined
  onSave: (notes: string) => Promise<void>
}

export function NotesEditor({
  initialNotes,
  onSave,
}: NotesEditorProps) {
  const [editorState, setEditorState] =
    useState<SerializedEditorState | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!initialNotes) {
      setEditorState(undefined)
      setReady(true)
      return
    }

    try {
      const parsed = JSON.parse(initialNotes)
      if (parsed?.root) {
        setEditorState(parsed)
      }
    } catch {
      // fallback plain text
      setEditorState({
        root: {
          type: "root",
          version: 1,
          children: [
            {
              type: "paragraph",
              version: 1,
              children: [
                {
                  type: "text",
                  version: 1,
                  text: initialNotes,
                },
              ],
            },
          ],
        },
      } as any)
    }

    setReady(true)
  }, [initialNotes])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editorState ? JSON.stringify(editorState) : "")
    } finally {
      setTimeout(() => setIsSaving(false), 400)
    }
  }

  if (!ready) {
    return (
      <div className="h-[200px] animate-pulse rounded-lg border bg-muted/30" />
    )
  }

  return (
    <div className="space-y-2">
      <Editor
        editorSerializedState={editorState}
        onSerializedChange={setEditorState}
      />

      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving..." : "Save Notes"}
        </Button>
      </div>
    </div>
  )
}
