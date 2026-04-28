"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  createNote,
  deleteNote,
  fetchNotes,
  runAiAction,
  updateNote,
} from "@/features/notes/api";
import type { Note, NoteInput } from "@/types/notes";

const AI_MOCK_MODE = process.env.NEXT_PUBLIC_AI_MOCK_MODE === "true";

function createMockAiResult(action: "summarize" | "improve" | "tags", note?: Note | null) {
  const title = note?.title?.trim() || "Untitled note";
  const content = note?.content?.trim() || "No content provided yet.";
  const shortContent = content.length > 280 ? `${content.slice(0, 280)}...` : content;

  if (action === "summarize") {
    return [
      `- Topic: ${title}`,
      `- Key points: ${shortContent}`,
      "- Next step: expand this into clear action items.",
    ].join("\n");
  }

  if (action === "improve") {
    return `Improved draft:\n\n${title}\n\n${shortContent}\n\nThis version is rewritten for clarity and flow while preserving intent.`;
  }

  return "notes,productivity,summary";
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );

  /** Fetch list — depends only on `search` so updating selection does not retrigger loads. */
  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotes(search.trim() ? search : undefined);
      let merged: Note[] = [];
      setNotes((prev) => {
        const drafts = prev.filter((n) => n.isDraft);
        merged = [...drafts, ...data];
        return merged;
      });
      setSelectedNoteId((prevSel) => {
        if (!prevSel && merged[0]) return merged[0].id;
        if (prevSel && !merged.some((note) => note.id === prevSel)) {
          return merged[0]?.id ?? null;
        }
        return prevSel;
      });
    } catch {
      setError("Failed to load notes. Please refresh and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotes();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [loadNotes]);

  /** New note exists only in the browser until the user clicks Save (then `POST /notes`). */
  const onCreate = useCallback(() => {
    const now = new Date().toISOString();
    const draft: Note = {
      id: `draft-${crypto.randomUUID()}`,
      title: "Untitled note",
      content: "",
      tags: [],
      createdAt: now,
      updatedAt: now,
      isDraft: true,
    };
    setNotes((prev) => [draft, ...prev]);
    setSelectedNoteId(draft.id);
  }, []);

  const onSave = useCallback(async (id: string, input: NoteInput, isDraft?: boolean) => {
    const payload = {
      title: input.title.trim() || "Untitled note",
      content: input.content,
    };
    try {
      if (isDraft) {
        const created = await createNote(payload);
        setNotes((prev) => prev.map((note) => (note.id === id ? created : note)));
        setSelectedNoteId(created.id);
        toast.success("Note saved");
        return;
      }
      const updated = await updateNote(id, input);
      setNotes((prev) => prev.map((note) => (note.id === id ? updated : note)));
      toast.success("Note saved");
    } catch {
      toast.error("Could not save note");
    }
  }, []);

  const onDelete = useCallback(async (id: string, isDraft?: boolean) => {
    if (isDraft) {
      setNotes((prev) => {
        const next = prev.filter((note) => note.id !== id);
        setSelectedNoteId((sel) => {
          if (sel !== id) return sel;
          return next[0]?.id ?? null;
        });
        return next;
      });
      return;
    }
    try {
      await deleteNote(id);
      setNotes((prev) => {
        const next = prev.filter((note) => note.id !== id);
        setSelectedNoteId((sel) => {
          if (sel !== id) return sel;
          return next[0]?.id ?? null;
        });
        return next;
      });
      toast.success("Note deleted");
    } catch {
      toast.error("Could not delete note");
    }
  }, []);

  const onAiAction = useCallback(
    async (id: string, action: "summarize" | "improve" | "tags") => {
      try {
        const result = await runAiAction(id, action);
        toast.success(`${action[0].toUpperCase()}${action.slice(1)} complete`);
        return result;
      } catch (error: unknown) {
        const note = notes.find((n) => n.id === id);
        if (isAxiosError(error)) {
          if (error.response?.status === 429) {
            const providerMessage =
              typeof error.response?.data?.message === "string"
                ? error.response.data.message
                : null;
            toast.error(
              providerMessage ??
                "AI quota or rate limit exceeded for the configured provider. Please check Gemini usage limits and try again."
            );
            if (AI_MOCK_MODE) {
              toast.info("Showing mock AI response (fallback mode).");
              return createMockAiResult(action, note);
            }
            return null;
          }
          const message =
            typeof error.response?.data?.message === "string"
              ? error.response.data.message
              : null;
          if (message) {
            toast.error(message);
            if (AI_MOCK_MODE) {
              toast.info("Showing mock AI response (fallback mode).");
              return createMockAiResult(action, note);
            }
            return null;
          }
        }
        toast.error(`AI ${action} failed`);
        if (AI_MOCK_MODE) {
          toast.info("Showing mock AI response (fallback mode).");
          return createMockAiResult(action, note);
        }
        return null;
      }
    },
    [notes]
  );

  return {
    notes,
    selectedNote,
    isLoading,
    error,
    search,
    setSearch,
    selectedNoteId,
    setSelectedNoteId,
    onCreate,
    onSave,
    onDelete,
    onAiAction,
    reload: loadNotes,
  };
}
