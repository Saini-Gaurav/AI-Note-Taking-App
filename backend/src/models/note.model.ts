import { Schema, model } from "mongoose";

const noteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    /** Empty string is valid for new notes; `required: true` rejects `""` in Mongoose */
    content: { type: String, default: "", trim: true },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1, title: "text", content: "text" });

noteSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.userId;
    return ret;
  },
});

export const NoteModel = model("Note", noteSchema);
