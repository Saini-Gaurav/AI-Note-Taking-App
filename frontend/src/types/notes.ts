export type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
  createdAt: string;
  /** Local-only until first successful save (no `POST /notes` yet) */
  isDraft?: boolean;
};

export type NoteInput = {
  title: string;
  content: string;
};
