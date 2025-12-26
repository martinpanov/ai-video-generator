import { STATUS } from "@/app/constants";
import { Status } from "@/app/types";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { Check, X } from "lucide-react";

type Props = {
  status: Status;
  label: string;
};

export const JobStatusItem = ({ status, label }: Props) => {
  return (
    <Item size="sm">
      <ItemMedia>
        {status === STATUS.COMPLETED && <Check role="status" className="size-5 text-green-600" />}
        {status === STATUS.PROCESSING && <Spinner className="size-5" />}
        {status === STATUS.PENDING && <div role="status" className="size-5 rounded-full border-2" />}
        {status === STATUS.FAILED && <X role="status" className="size-5 text-red-600" />}
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
      </ItemContent>
    </Item>
  );
};