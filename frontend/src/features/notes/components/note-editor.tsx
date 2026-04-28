"use client";

import { useEffect } from "react";
import { Loader2, Sparkles, Tags, Wand2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { rhfTextInputProps } from "@/lib/rhf-text-field";
import type { Note } from "@/types/notes";

type EditorValues = {
  title: string;
  content: string;
};

type NoteEditorProps = {
  note: Note | null;
  isBusy: boolean;
  aiOutput: string;
  onSave: (id: string, values: EditorValues, isDraft?: boolean) => Promise<void>;
  onAiAction: (id: string, action: "summarize" | "improve" | "tags") => Promise<void>;
};

export function NoteEditor({
  note,
  isBusy,
  aiOutput,
  onSave,
  onAiAction,
}: NoteEditorProps) {
  const form = useForm<EditorValues>({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    form.reset({
      title: note?.title ?? "",
      content: note?.content ?? "",
    });
  }, [form, note]);

  if (!note) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full min-h-[320px] items-center justify-center text-muted-foreground">
          Select a note to edit, or create a new one.
        </CardContent>
      </Card>
    );
  }

  const isDraft = Boolean(note.isDraft);
  const aiDisabled = isBusy || isDraft;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Editor</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onAiAction(note.id, "summarize")}
            disabled={aiDisabled}
            title={isDraft ? "Save the note first to use AI" : undefined}
          >
            <Sparkles />
            Summarize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onAiAction(note.id, "improve")}
            disabled={aiDisabled}
            title={isDraft ? "Save the note first to use AI" : undefined}
          >
            <Wand2 />
            Improve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void onAiAction(note.id, "tags")}
            disabled={aiDisabled}
            title={isDraft ? "Save the note first to use AI" : undefined}
          >
            <Tags />
            Tags
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Input
              placeholder="Note title"
              {...rhfTextInputProps(field)}
            />
          )}
        />
        <Controller
          name="content"
          control={form.control}
          render={({ field }) => (
            <Textarea
              className="min-h-[280px]"
              placeholder="Write your note content..."
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value ?? ""}
            />
          )}
        />
        <div className="flex items-center justify-between gap-3">
          <Button
            onClick={form.handleSubmit(async (values) => {
              await onSave(note.id, values, note.isDraft);
            })}
            disabled={isBusy}
          >
            {isBusy && <Loader2 className="animate-spin" />}
            {isDraft ? "Save note" : "Save changes"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </p>
        </div>
        {aiOutput ? (
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <p className="mb-1 font-medium">AI output</p>
            <p className="text-muted-foreground">{aiOutput}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
