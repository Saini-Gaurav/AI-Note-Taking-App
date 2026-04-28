import { api } from "@/lib/api-client";
import type { Note, NoteInput } from "@/types/notes";

export async function fetchNotes(query?: string) {
  const response = await api.get<Note[]>("/notes", {
    params: query ? { q: query } : undefined,
  });
  return response.data;
}

export async function createNote(input: NoteInput) {
  const response = await api.post<Note>("/notes", input);
  return response.data;
}

export async function updateNote(id: string, input: NoteInput) {
  const response = await api.put<Note>(`/notes/${id}`, input);
  return response.data;
}

export async function deleteNote(id: string) {
  await api.delete(`/notes/${id}`);
}

type AiAction = "summarize" | "improve" | "tags";

export async function runAiAction(id: string, action: AiAction) {
  const response = await api.post<{ result: string | string[] }>(`/notes/${id}/ai/${action}`);
  const { result } = response.data;
  return Array.isArray(result) ? result.join(", ") : result;
}
