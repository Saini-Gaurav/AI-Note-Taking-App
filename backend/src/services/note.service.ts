import { AppError } from "../utils/errors";
import { NoteRepository } from "../repositories/note.repository";

export class NoteService {
  constructor(private readonly noteRepository = new NoteRepository()) {}

  create(userId: string, input: { title: string; content: string; tags?: string[] }) {
    return this.noteRepository.create({ userId, ...input });
  }

  list(userId: string, search?: string) {
    return this.noteRepository.listByUser(userId, search);
  }

  async getById(userId: string, noteId: string) {
    const note = await this.noteRepository.findByIdForUser(noteId, userId);
    if (!note) throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    return note;
  }

  async update(userId: string, noteId: string, input: { title?: string; content?: string; tags?: string[] }) {
    const note = await this.noteRepository.updateByIdForUser(noteId, userId, input);
    if (!note) throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    return note;
  }

  async remove(userId: string, noteId: string) {
    const note = await this.noteRepository.deleteByIdForUser(noteId, userId);
    if (!note) throw new AppError("Note not found", 404, "NOTE_NOT_FOUND");
    return { deleted: true };
  }
}
