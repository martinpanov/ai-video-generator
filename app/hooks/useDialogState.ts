import { useEffect, useState } from "react";
import { subscribe, unsubscribe } from "../utils/events";

export function useDialogState<T = void>({ openId, closeId }: { openId: string; closeId: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    const showHandler = (event?: CustomEvent<T>) => {
      setIsOpen(true);
      setData(event?.detail);
    };
    const hideHandler = () => {
      setIsOpen(false);
      setData(undefined);
    };

    subscribe(openId, showHandler);
    subscribe(closeId, hideHandler);

    return () => {
      unsubscribe(openId, showHandler);
      unsubscribe(closeId, hideHandler);
    };
  }, [openId, closeId]);

  return { isOpen, setIsOpen, data };
}