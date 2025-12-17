"use client";

import { handleTodoSubmit } from "@/app/actions/todo";
import { DIALOG_IDS } from "@/app/constants";
import { useDialogState } from "@/app/hooks/useDialogState";
import { debounce } from "@/app/utils/debounce";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useActionState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

export type TodoSubmitState = {
  success: boolean;
  message?: string;
  todo?: string;
  [key: string]: string | boolean | undefined;
} | undefined;

type TodoDialogData = {
  id: string;
  todo: string;
};

export function TodoDialog() {
  const { isOpen, setIsOpen, data } = useDialogState<TodoDialogData>({
    openId: DIALOG_IDS.TODO_DIALOG_OPEN,
    closeId: DIALOG_IDS.TODO_DIALOG_CLOSE
  });
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState<TodoSubmitState, FormData>(handleTodoSubmit, undefined);
  const previousStateRef = useRef(state);

  const isEditMode = !!data?.id;

  useEffect(() => {
    if (!state || state === previousStateRef.current) return;
    previousStateRef.current = state;

    if (state.success) {
      toast.success(isEditMode ? "Todo updated successfully" : "Todo added successfully");
      setIsOpen(false);
      formRef.current?.reset();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, isEditMode, setIsOpen]);

  const handleSubmit = useCallback(
    debounce(action, 1000),
    [action]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Todo' : 'Add Todo'}</DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={handleSubmit}>
          <div className="space-y-4 pt-2 pb-4">
            <Field>
              <FieldLabel htmlFor="todo">Todo:</FieldLabel>
              <Input
                id="todo"
                name="todo"
                type="text"
                defaultValue={data?.todo || ''}
              />
            </Field>

            {isEditMode && (
              <input type="hidden" name="id" value={data.id} />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}