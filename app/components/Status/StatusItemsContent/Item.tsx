import { STATUS } from "@/app/constants";
import { Status } from "@/app/types";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Check, LoaderCircle, X } from "lucide-react";

type Props = {
  status: Status;
  label: string;
};

export const JobStatusItem = ({ status, label }: Props) => {
  return (
    <Item size="sm">
      <ItemMedia>
        {status === STATUS.COMPLETED && <Check className="size-5 text-green-600" />}
        {status === STATUS.PROCESSING && <LoaderCircle className="size-5 animate-spin" />}
        {status === STATUS.PENDING && <div className="size-5 rounded-full border-2" />}
        {status === STATUS.FAILED && <X className="size-5 text-red-600" />}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
      </ItemContent>
    </Item>
  );
};