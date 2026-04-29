"use client";

import { useState } from "react";
import { Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteCard } from "@/features/notes/components/note-card";
import { NoteEditor } from "@/features/notes/components/note-editor";
import { useNotes } from "@/features/notes/use-notes";
import { stripMarkdownForEditor } from "@/lib/strip-markdown-for-editor";

export function NotesDashboard() {
  const notes = useNotes();
  const [isEditorBusy, setIsEditorBusy] = useState(false);
  const [aiOutput, setAiOutput] = useState("");

  return (
    <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              value={notes.search}
              onChange={(e) => notes.setSearch(e.target.value)}
              className="pl-8"
              placeholder="Search notes..."
            />
          </div>
          <Button variant="outline" size="icon-sm" onClick={() => void notes.reload()}>
            <RefreshCw />
          </Button>
          <Button onClick={() => void notes.onCreate()}>
            <Plus />
            New
          </Button>
        </div>

        {notes.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {!notes.isLoading && notes.error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            <p>{notes.error}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => void notes.reload()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {!notes.isLoading && !notes.error && notes.notes.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No notes found. Create your first note to begin.
          </div>
        ) : null}

        <div className="space-y-3">
          {notes.notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={note.id === notes.selectedNoteId}
              onSelect={notes.setSelectedNoteId}
              onDelete={(id, isDraft) => void notes.onDelete(id, isDraft)}
            />
          ))}
        </div>
      </div>

      <NoteEditor
        note={notes.selectedNote}
        isBusy={isEditorBusy}
        aiOutput={aiOutput}
        onSave={async (id, values, isDraft) => {
          setIsEditorBusy(true);
          try {
            await notes.onSave(id, values, isDraft);
          } finally {
            setIsEditorBusy(false);
          }
        }}
        onAiAction={async (id, action) => {
          setIsEditorBusy(true);
          try {
            const result = await notes.onAiAction(id, action);
            let outputForPanel = result ?? "";
            if (action === "improve" && result) {
              outputForPanel = stripMarkdownForEditor(result);
            }
            setAiOutput(outputForPanel);
            if (
              result &&
              action === "improve" &&
              notes.selectedNote &&
              !notes.selectedNote.isDraft
            ) {
              await notes.onSave(
                notes.selectedNote.id,
                {
                  title: notes.selectedNote.title,
                  content: outputForPanel,
                },
                false
              );
            }
          } finally {
            setIsEditorBusy(false);
          }
        }}
      />
      {isEditorBusy ? (
        <div className="pointer-events-none fixed inset-0 z-40 grid place-items-center bg-background/40">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-lg">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
