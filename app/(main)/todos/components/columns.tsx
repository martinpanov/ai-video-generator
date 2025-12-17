"use client";

import { deleteTodo } from "@/app/actions/todo";
import { DIALOG_IDS } from "@/app/constants";
import { dispatchEvent } from "@/app/utils/events";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Todos } from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical } from "lucide-react";
import { toast } from "sonner";

export const columns: ColumnDef<Todos>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "todo",
    header: "Todo",
    cell: ({ row }) => {
      const title = row.getValue("todo") as string;

      if (title.length > 100) {
        return `${title.slice(0, 100)}...`;
      }

      return title;
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const todo = row.original;

      const handleEdit = () => {
        dispatchEvent(DIALOG_IDS.TODO_DIALOG_OPEN, {
          id: todo.id,
          todo: todo.todo
        });
      };

      const handleDelete = async () => {
        const loadingToast = toast.loading("Deleting todo...");

        try {
          await deleteTodo(todo.id);
          toast.dismiss(loadingToast);
          toast.success("Todo deleted successfully");
        } catch {
          toast.dismiss(loadingToast);
          toast.error("Failed to delete todo");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleDelete} className="cursor-pointer">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];