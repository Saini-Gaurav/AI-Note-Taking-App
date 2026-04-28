import { Types } from "mongoose";
import { NoteModel } from "../models/note.model";

export class NoteRepository {
  create(data: { userId: string; title: string; content: string; tags?: string[] }) {
    return NoteModel.create({ ...data, userId: new Types.ObjectId(data.userId) });
  }

  listByUser(userId: string, search?: string) {
    const query = search
      ? {
          userId: new Types.ObjectId(userId),
          $or: [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
        }
      : { userId: new Types.ObjectId(userId) };
    return NoteModel.find(query).sort({ updatedAt: -1 });
  }

  findByIdForUser(noteId: string, userId: string) {
    return NoteModel.findOne({ _id: noteId, userId: new Types.ObjectId(userId) });
  }

  updateByIdForUser(noteId: string, userId: string, data: { title?: string; content?: string; tags?: string[] }) {
    return NoteModel.findOneAndUpdate(
      { _id: noteId, userId: new Types.ObjectId(userId) },
      data,
      { returnDocument: "after" }
    );
  }

  deleteByIdForUser(noteId: string, userId: string) {
    return NoteModel.findOneAndDelete({ _id: noteId, userId: new Types.ObjectId(userId) });
  }
}
