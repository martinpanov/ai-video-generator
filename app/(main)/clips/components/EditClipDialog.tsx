"use client";

import { handleClipSubmit } from "@/app/actions/clips";
import { DIALOG_IDS } from "@/app/constants";
import { useDialogState } from "@/app/hooks/useDialogState";
import { debounce } from "@/app/utils/debounce";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

export type ClipSubmitState = {
  success: boolean;
  message?: string;
  title?: string;
  originalVideoUrl?: string;
  [key: string]: string | boolean | undefined;
} | undefined;

type ClipDialogData = {
  id: string;
  title: string;
  originalVideoUrl: string;
};

export function EditClipDialog() {
  const { isOpen, setIsOpen, data } = useDialogState<ClipDialogData>({ openId: DIALOG_IDS.EDIT_CLIP_DIALOG, });
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState<ClipSubmitState, FormData>(handleClipSubmit, undefined);
  const previousStateRef = useRef(state);

  useEffect(() => {
    if (!state || state === previousStateRef.current) return;
    previousStateRef.current = state;

    if (state.success) {
      toast.success("Clip updated successfully");
      setIsOpen(false);
      formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, setIsOpen]);

  const handleSubmit = useCallback(
    debounce(action, 1000),
    [action]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Clip</DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={handleSubmit}>
          <div className="space-y-4 pt-2 pb-4">
            <Field>
              <FieldLabel htmlFor="title">Title:</FieldLabel>
              <Input
                id="title"
                name="title"
                type="text"
                defaultValue={data?.title || ''}
              />
              {state?.title && (
                <p className="text-sm text-red-500 mt-1">{state.title}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="originalVideoUrl">Original Video URL:</FieldLabel>
              <Input
                id="originalVideoUrl"
                name="originalVideoUrl"
                type="text"
                defaultValue={data?.originalVideoUrl || ''}
              />
              {state?.originalVideoUrl && (
                <p className="text-sm text-red-500 mt-1">{state.originalVideoUrl}</p>
              )}
            </Field>
            <input type="hidden" name="id" value={data?.id} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}