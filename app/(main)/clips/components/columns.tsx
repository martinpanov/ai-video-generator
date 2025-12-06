"use client";

import { deleteClip } from "@/app/actions/clips";
import { STATUS } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Clip } from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export const columns: ColumnDef<Clip>[] = [
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
    accessorKey: "thumbnailUrl",
    header: "Thumbnail",
    cell: ({ row }) => {
      const thumbnailUrl = row.getValue("thumbnailUrl") as string;
      const clipId = row.original.id;

      return (
        <Link
          href={`/clips/${clipId}`}
          rel="noopener noreferrer"
          className="relative block w-16 h-16 group cursor-pointer"
        >
          <Image
            src={thumbnailUrl}
            alt={`Thumbnail for ${row.getValue("title")}`}
            fill
            className="object-cover rounded"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;

      if (title.length > 100) {
        return `${title.slice(0, 100)}...`;
      }

      return title;
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => column.setFilterValue(undefined)}
            >
              All
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.values(STATUS).map(status => (
              <DropdownMenuItem
                key={status}
                className="cursor-pointer"
                onClick={() => column.setFilterValue(status)}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    filterFn: (row, id, value) => {
      return value === undefined || row.getValue(id) === value;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dateString = row.getValue("updatedAt") as string;
      const date = new Date(dateString);

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year}, ${hours}:${minutes}`;
    },
  },
  {
    accessorKey: "originalVideoUrl",
    header: "Original Video URL",
    cell: ({ row }) => row.getValue("originalVideoUrl")
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const clipUrl = row.original.clipUrl;
      const clipId = row.original.id;

      const handleDelete = async () => {
        const loadingToast = toast.loading("Deleting clip...");

        try {
          await deleteClip(clipId);
          toast.dismiss(loadingToast);
          toast.success("Clip deleted successfully");
        } catch (error) {
          toast.dismiss(loadingToast);
          toast.error("Failed to delete clip");
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
            <DropdownMenuItem asChild className="cursor-pointer">
              <a href={clipUrl || '#'} download target="_blank" rel="noopener noreferrer">
                Download
              </a>
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