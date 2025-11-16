"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { BadgeCheckIcon, Check, ChevronRightIcon, LoaderCircle } from "lucide-react";
import { useDialogState } from "../hooks/useDialogState";

export const StatusDialog = () => {
  const { isOpen, setIsOpen } = useDialogState();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ai Video Generation Progress</DialogTitle>
            <Item size="sm">
              <ItemMedia>
                <LoaderCircle className="animate-spin" />
                {/* <Check className="size-5 text-green-600" /> */}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Your profile has been verified.</ItemTitle>
              </ItemContent>
            </Item>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};