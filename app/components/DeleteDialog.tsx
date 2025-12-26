"use client";

import { useDialogState } from "@/app/hooks/useDialogState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogDescription, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTransition } from "react";
import { toast } from "sonner";

type DeleteDialogProps = {
  dialogId: string;
  deleteAction: (ids: string[]) => Promise<{ count: number; }>;
  itemName?: string;
};

export const DeleteDialog = ({ dialogId, deleteAction, itemName = "item" }: DeleteDialogProps) => {
  const { isOpen, setIsOpen, data } = useDialogState<{ ids: string[]; }>({ openId: dialogId });
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!data?.ids) {
      return;
    }

    const { ids } = data;

    startTransition(async () => {
      const loadingToast = toast.loading(`Deleting ${ids.length} ${itemName}(s)...`);

      try {
        const result = await deleteAction(ids);
        toast.dismiss(loadingToast);
        toast.success(`Successfully deleted ${result.count} ${itemName}(s)`);
      } catch {
        toast.dismiss(loadingToast);
        toast.error(`Failed to delete ${itemName}s`);
      } finally {
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex gap-3">
          <DialogTitle>
            Are you sure?
          </DialogTitle>
          <DialogDescription>
            Do you really want to delete these records? This process cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleDelete} disabled={isPending}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};