import { useEffect, useState } from "react";
import { subscribe, unsubscribe } from "../utils/events";

export function useDialogState<T>({ openId }: { openId: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    const showHandler = (event?: CustomEvent<T>) => {
      setIsOpen(true);
      setData(event?.detail);
    };

    subscribe(openId, showHandler);

    return () => {
      unsubscribe(openId, showHandler);
    };
  }, [openId]);

  return { isOpen, setIsOpen, data };
}