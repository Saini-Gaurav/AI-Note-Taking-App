import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Note } from "@/types/notes";

type NoteCardProps = {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string, isDraft?: boolean) => void;
};

export function NoteCard({ note, isActive, onSelect, onDelete }: NoteCardProps) {
  const updatedLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(note.updatedAt));

  return (
    <Card
      className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/30 ${
        isActive ? "ring-2 ring-primary/60" : ""
      }`}
      onClick={() => onSelect(note.id)}
    >
      <CardHeader>
        <CardTitle className="line-clamp-1 flex flex-wrap items-center gap-2">
          <span>{note.title || "Untitled note"}</span>
          {note.isDraft ? (
            <Badge variant="outline" className="shrink-0 font-normal">
              Draft
            </Badge>
          ) : null}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {note.content || "No content yet"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {note.tags?.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary">
            #{tag}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs text-muted-foreground">{updatedLabel}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(note.id, note.isDraft);
          }}
          aria-label="Delete note"
        >
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  );
}
